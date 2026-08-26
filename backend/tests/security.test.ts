import { describe, it } from 'node:test';
import assert from 'node:assert';
import { createApp } from '../src/app';
import { startTestServer } from './helper';

describe('Security Middleware', () => {
  const app = createApp({
    nodeEnv: 'test',
    isTest: true,
    publicBackendOrigin: 'http://localhost:3000',
  });

  describe('Helmet Headers', () => {
    it('should set baseline security headers', async () => {
      const server = await startTestServer(app);
      try {
        const res = await server.fetch('/health');
        assert.strictEqual(res.headers.get('x-dns-prefetch-control'), 'off');
        assert.strictEqual(res.headers.get('x-content-type-options'), 'nosniff');
        assert.strictEqual(res.headers.get('x-download-options'), 'noopen');
        assert.strictEqual(res.headers.get('x-frame-options'), 'SAMEORIGIN');
      } finally {
        await server.close();
      }
    });
  });

  describe('CORS Handling', () => {
    it('should allow requests from the configured public backend origin', async () => {
      const server = await startTestServer(app);
      try {
        const res = await server.fetch('/health', {
          headers: { Origin: 'http://localhost:3000' },
        });
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.headers.get('access-control-allow-origin'), 'http://localhost:3000');
        assert.strictEqual(res.headers.get('access-control-allow-credentials'), 'true');
      } finally {
        await server.close();
      }
    });

    it('should allow requests from the same-origin host', async () => {
      const server = await startTestServer(app);
      try {
        const host = server.origin.replace(/^http:\/\//, '');
        const res = await server.fetch('/health', {
          headers: {
            Origin: server.origin,
            Host: host,
          },
        });
        assert.strictEqual(res.status, 200);
      } finally {
        await server.close();
      }
    });

    it('should allow requests without an Origin header', async () => {
      const server = await startTestServer(app);
      try {
        const res = await server.fetch('/health');
        assert.strictEqual(res.status, 200);
      } finally {
        await server.close();
      }
    });
  });

  describe('Body Parser Limits', () => {
    it('should accept reasonable JSON body payloads', async () => {
      const server = await startTestServer(app);
      try {
        const res = await server.fetch('/api/v1/test-body', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: 'Cyber fraud report', amount: 50000 }),
        });
        assert.strictEqual(res.status, 404); // reached route handler
      } finally {
        await server.close();
      }
    });

    it('should reject JSON payloads exceeding the 1MB limit with 413 Payload Too Large', async () => {
      const server = await startTestServer(app);
      try {
        const largePayload = JSON.stringify({
          data: 'A'.repeat(1.5 * 1024 * 1024), // 1.5MB
        });
        const res = await server.fetch('/api/v1/test-body', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: largePayload,
        });
        assert.strictEqual(res.status, 413);
      } finally {
        await server.close();
      }
    });
  });
});
