import { Request, Response, NextFunction, RequestHandler } from 'express';
import crypto from 'crypto';
import { AppConfig } from '../config';

export interface SessionData {
  [key: string]: unknown;
}

export interface SessionInstance {
  id: string;
  data: SessionData;
  isNew: boolean;
  createdAt: number;
  get<T = unknown>(key: string): T | undefined;
  set(key: string, value: unknown): void;
  destroy(): void;
}

declare global {
  namespace Express {
    interface Request {
      session?: SessionInstance;
    }
  }
}

export interface SessionStore {
  get(sessionId: string): SessionData | null;
  set(sessionId: string, data: SessionData, ttlMs: number): void;
  destroy(sessionId: string): void;
}

/**
 * In-Memory Session Store
 * Suitable for local development and test suites.
 * In a distributed production cluster, replace with Redis/PostgreSQL store.
 */
export class MemorySessionStore implements SessionStore {
  private sessions = new Map<string, { data: SessionData; expiresAt: number }>();

  get(sessionId: string): SessionData | null {
    const entry = this.sessions.get(sessionId);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.sessions.delete(sessionId);
      return null;
    }
    return entry.data;
  }

  set(sessionId: string, data: SessionData, ttlMs: number): void {
    this.sessions.set(sessionId, {
      data,
      expiresAt: Date.now() + ttlMs,
    });
  }

  destroy(sessionId: string): void {
    this.sessions.delete(sessionId);
  }

  clear(): void {
    this.sessions.clear();
  }
}

const defaultStore = new MemorySessionStore();

function signSessionId(id: string, secret: string): string {
  const signature = crypto.createHmac('sha256', secret).update(id).digest('base64url');
  return `s:${id}.${signature}`;
}

function verifySessionId(signedValue: string, secret: string): string | null {
  if (!signedValue.startsWith('s:')) return null;
  const dotIndex = signedValue.lastIndexOf('.');
  if (dotIndex === -1) return null;

  const id = signedValue.slice(2, dotIndex);
  const providedSignature = signedValue.slice(dotIndex + 1);
  const expectedSignature = crypto.createHmac('sha256', secret).update(id).digest('base64url');

  if (crypto.timingSafeEqual(Buffer.from(providedSignature), Buffer.from(expectedSignature))) {
    return id;
  }
  return null;
}

function parseCookie(cookieHeader: string | undefined, name: string): string | null {
  if (!cookieHeader) return null;
  const cookies = cookieHeader.split(';').map((c) => c.trim());
  for (const cookie of cookies) {
    const [key, ...rest] = cookie.split('=');
    if (key === name) {
      return decodeURIComponent(rest.join('='));
    }
  }
  return null;
}

export function createSessionMiddleware(
  config: AppConfig,
  store: SessionStore = defaultStore
): RequestHandler {
  const cookieName = 'goldenhour.sid';
  const ttlMs = 24 * 60 * 60 * 1000; // 24 hours

  return (req: Request, res: Response, next: NextFunction): void => {
    const rawCookie = parseCookie(req.headers.cookie, cookieName);
    let sessionId: string | null = null;

    if (rawCookie) {
      sessionId = verifySessionId(rawCookie, config.sessionSecret);
    }

    let isNew = false;
    let sessionData: SessionData = {};

    if (sessionId) {
      const stored = store.get(sessionId);
      if (stored) {
        sessionData = stored;
      } else {
        // Session expired or not found; issue new session ID
        sessionId = crypto.randomUUID();
        isNew = true;
      }
    } else {
      sessionId = crypto.randomUUID();
      isNew = true;
    }

    let isDestroyed = false;

    const session: SessionInstance = {
      id: sessionId,
      data: sessionData,
      isNew,
      createdAt: Date.now(),
      get<T = unknown>(key: string): T | undefined {
        return sessionData[key] as T | undefined;
      },
      set(key: string, value: unknown): void {
        sessionData[key] = value;
      },
      destroy(): void {
        isDestroyed = true;
        store.destroy(sessionId!);
      },
    };

    req.session = session;

    // Attach response listener to persist session and set cookie
    const originalEnd = res.end.bind(res);
    res.end = function (...args: any[]): any {
      if (!isDestroyed) {
        store.set(sessionId!, sessionData, ttlMs);
      }

      if (!res.headersSent) {
        if (isDestroyed) {
          res.setHeader(
            'Set-Cookie',
            `${cookieName}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax${
              config.isProduction ? '; Secure' : ''
            }`
          );
        } else if (isNew) {
          const signed = signSessionId(sessionId!, config.sessionSecret);
          const maxAgeSec = Math.floor(ttlMs / 1000);
          res.setHeader(
            'Set-Cookie',
            `${cookieName}=${encodeURIComponent(signed)}; Path=/; Max-Age=${maxAgeSec}; HttpOnly; SameSite=Lax${
              config.isProduction ? '; Secure' : ''
            }`
          );
        }
      }
      return originalEnd(...args);
    };

    next();
  };
}
