import { describe, it } from 'node:test';
import assert from 'node:assert';
import { createApp } from '../src/app';
import { startTestServer } from './helper';

describe('GET /health', () => {
  it('should return HTTP 200 with status ok and valid metadata', async () => {
    const app = createApp({ nodeEnv: 'test', isTest: true });
    const server = await startTestServer(app);

    try {
      const res = await server.fetch('/health');
      assert.strictEqual(res.status, 200);

      const body = await res.json() as any;
      assert.strictEqual(body.status, 'ok');
      assert.strictEqual(body.version, '0.1.0');
      assert.strictEqual(body.environment, 'test');
      assert.ok(body.timestamp, 'timestamp should be present');

      // Verify timestamp is a valid ISO date
      const date = new Date(body.timestamp);
      assert.strictEqual(date.toISOString(), body.timestamp);
    } finally {
      await server.close();
    }
  });
});
