import http from 'http';
import { Express } from 'express';

export interface TestServer {
  port: number;
  origin: string;
  fetch(path: string, init?: RequestInit): Promise<Response>;
  close(): Promise<void>;
  resetCookies(): void;
}

export function startTestServer(app: Express): Promise<TestServer> {
  return new Promise((resolve, reject) => {
    const server = http.createServer(app);
    server.listen(0, '127.0.0.1', () => {
      const addr = server.address();
      if (!addr || typeof addr === 'string') {
        return reject(new Error('Failed to get server address'));
      }
      const port = addr.port;
      const origin = `http://127.0.0.1:${port}`;

      let cookieJar = '';

      const testServer: TestServer = {
        port,
        origin,
        async fetch(path: string, init?: RequestInit) {
          const url = path.startsWith('http') ? path : `${origin}${path}`;
          const headers = new Headers(init?.headers);

          if (!headers.has('Cookie') && cookieJar) {
            headers.set('Cookie', cookieJar);
          }

          const res = await fetch(url, {
            ...init,
            headers,
          });

          const setCookie = res.headers.get('set-cookie');
          if (setCookie) {
            // Save sid cookie
            const firstPart = setCookie.split(';')[0];
            cookieJar = firstPart;
          }

          return res;
        },
        resetCookies() {
          cookieJar = '';
        },
        close() {
          return new Promise<void>((res, rej) => {
            server.close((err) => (err ? rej(err) : res()));
          });
        },
      };

      resolve(testServer);
    });
  });
}
