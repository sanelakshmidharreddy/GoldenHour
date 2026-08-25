import { Request, Response, NextFunction, RequestHandler } from 'express';
import helmet from 'helmet';
import { AppConfig } from '../config';

export const JSON_BODY_LIMIT = '1mb';
export const URLENCODED_BODY_LIMIT = '1mb';

export function createSecurityHeadersMiddleware(config: AppConfig): RequestHandler {
  return helmet({
    contentSecurityPolicy: config.isProduction ? undefined : false,
    crossOriginEmbedderPolicy: false,
  });
}

export function createCorsMiddleware(config: AppConfig): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    const origin = req.headers.origin;

    let isAllowed = false;
    if (!origin) {
      // Allow requests with no origin (mobile clients, curl, server-to-server)
      isAllowed = true;
    } else if (
      origin === config.publicBackendOrigin ||
      (!config.isProduction &&
        (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')))
    ) {
      isAllowed = true;
    }

    if (isAllowed && origin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    }

    if (req.method === 'OPTIONS') {
      if (!isAllowed && origin) {
        res.status(403).json({ error: { code: 'CORS_ERROR', message: `CORS origin not allowed: ${origin}` } });
        return;
      }
      res.sendStatus(204);
      return;
    }

    if (!isAllowed && origin) {
      res.status(403).json({ error: { code: 'CORS_ERROR', message: `CORS origin not allowed: ${origin}` } });
      return;
    }

    next();
  };
}
