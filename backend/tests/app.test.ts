import { describe, it } from 'node:test';
import assert from 'node:assert';
import { Request, Response, NextFunction } from 'express';
import { createApp } from '../src/app';
import { AppError } from '../src/middleware/errorHandler';
import { startTestServer } from './helper';

describe('App & Centralized Error Handling', () => {
  it('should format AppError correctly in JSON response', async () => {
    const app = createApp({
      config: { nodeEnv: 'test', isTest: true },
      configureRoutes: (testApp) => {
        testApp.get('/test-custom-error', (_req: Request, _res: Response, _next: NextFunction) => {
          throw new AppError('Invalid incident payload provided', 400, 'INVALID_INCIDENT_PAYLOAD', { field: 'incidentType' });
        });
      },
    });

    const server = await startTestServer(app);
    try {
      const res = await server.fetch('/test-custom-error');
      assert.strictEqual(res.status, 400);

      const body = await res.json() as any;
      assert.strictEqual(body.error.code, 'INVALID_INCIDENT_PAYLOAD');
      assert.strictEqual(body.error.message, 'Invalid incident payload provided');
      assert.deepStrictEqual(body.error.details, { field: 'incidentType' });
    } finally {
      await server.close();
    }
  });

  it('should mask 500 error messages and stack traces in production mode', async () => {
    const prodApp = createApp({
      config: {
        nodeEnv: 'production',
        isProduction: true,
        isTest: false,
        sessionSecret: 'long-enough-super-secret-for-production-test',
      },
      configureRoutes: (testApp) => {
        testApp.get('/test-server-crash', () => {
          throw new Error('Database connection failed with secret credentials!');
        });
      },
    });

    const server = await startTestServer(prodApp);
    try {
      const res = await server.fetch('/test-server-crash');
      assert.strictEqual(res.status, 500);

      const body = await res.json() as any;
      assert.strictEqual(body.error.code, 'INTERNAL_SERVER_ERROR');
      assert.strictEqual(body.error.message, 'An unexpected error occurred. Please try again later.');
      assert.strictEqual(body.error.stack, undefined);
      assert.strictEqual(body.error.details, undefined);
    } finally {
      await server.close();
    }
  });
});
