import { describe, it } from 'node:test';
import assert from 'node:assert';
import { createApp } from '../src/app';
import { startTestServer } from './helper';

describe('API Routing & 404 Handling', () => {
  it('GET /api/v1 should return API v1 metadata', async () => {
    const app = createApp({ nodeEnv: 'test', isTest: true });
    const server = await startTestServer(app);

    try {
      const res = await server.fetch('/api/v1');
      assert.strictEqual(res.status, 200);

      const body = await res.json() as any;
      assert.deepStrictEqual(body, {
        name: 'GoldenHour API',
        version: 'v1',
        status: 'active',
        environment: 'test',
        endpoints: {
          health: '/health',
          apiV1: '/api/v1',
        },
      });
    } finally {
      await server.close();
    }
  });

  it('Unknown API route should return structured 404 JSON', async () => {
    const app = createApp({ nodeEnv: 'test', isTest: true });
    const server = await startTestServer(app);

    try {
      const res = await server.fetch('/api/v1/unknown-endpoint');
      assert.strictEqual(res.status, 404);

      const body = await res.json() as any;
      assert.deepStrictEqual(body, {
        error: {
          code: 'NOT_FOUND',
          message: 'Cannot GET /api/v1/unknown-endpoint',
        },
      });
    } finally {
      await server.close();
    }
  });

  it('Unknown root route should return structured 404 JSON', async () => {
    const app = createApp({ nodeEnv: 'test', isTest: true });
    const server = await startTestServer(app);

    try {
      const res = await server.fetch('/invalid-post', { method: 'POST' });
      assert.strictEqual(res.status, 404);

      const body = await res.json() as any;
      assert.deepStrictEqual(body, {
        error: {
          code: 'NOT_FOUND',
          message: 'Cannot POST /invalid-post',
        },
      });
    } finally {
      await server.close();
    }
  });
});
