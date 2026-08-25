import http from 'http';
import { Express } from 'express';

export interface TestServer {
  port: number;
  origin: string;
  fetch(path: string, init?: RequestInit): Promise<Response>;
  close(): Promise<void>;
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

      const testServer: TestServer = {
        port,
        origin,
        fetch(path: string, init?: RequestInit) {
          const url = path.startsWith('http') ? path : `${origin}${path}`;
          return fetch(url, init);
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
