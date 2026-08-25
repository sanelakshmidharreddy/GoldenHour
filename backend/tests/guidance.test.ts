import { describe, it } from 'node:test';
import assert from 'node:assert';
import { createApp } from '../src/app';
import { startTestServer } from './helper';

describe('Guidance & Knowledge Base API', () => {
  const app = createApp({ nodeEnv: 'test', isTest: true });

  it('GET /api/v1/incident/guidance should return tailored actions and helplines', async () => {
    const server = await startTestServer(app);
    try {
      // First, set incident to upi_scam
      await server.fetch('/api/v1/incident/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fraudType: 'upi_scam',
          description: 'Fraudulent payment link on SMS',
        }),
      });

      const res = await server.fetch('/api/v1/incident/guidance');
      assert.strictEqual(res.status, 200);

      const data = (await res.json()) as any;
      assert.ok(data.guidance);
      assert.strictEqual(data.guidance.fraudType, 'upi_scam');
      assert.ok(Array.isArray(data.guidance.immediateActions));
      assert.ok(data.guidance.immediateActions.length > 0);
      assert.ok(Array.isArray(data.guidance.recommendedHelplines));
      assert.ok(data.guidance.recommendedHelplines.some((h: any) => h.number === '1930'));
      assert.ok(Array.isArray(data.guidance.evidenceToCollect));
    } finally {
      await server.close();
    }
  });

  it('GET /api/v1/kb/playbooks should list available playbooks', async () => {
    const server = await startTestServer(app);
    try {
      const res = await server.fetch('/api/v1/kb/playbooks');
      assert.strictEqual(res.status, 200);

      const data = (await res.json()) as any;
      assert.ok(data.playbooks);
      assert.ok(data.count >= 0);
    } finally {
      await server.close();
    }
  });

  it('GET /api/v1/kb/playbooks/:id should return 404 for non-existent playbook', async () => {
    const server = await startTestServer(app);
    try {
      const res = await server.fetch('/api/v1/kb/playbooks/non_existent_scam_xyz_999');
      assert.strictEqual(res.status, 404);

      const data = (await res.json()) as any;
      assert.strictEqual(data.error.code, 'PLAYBOOK_NOT_FOUND');
    } finally {
      await server.close();
    }
  });

  it('GET /api/v1/kb/contacts should return contact data', async () => {
    const server = await startTestServer(app);
    try {
      const res = await server.fetch('/api/v1/kb/contacts');
      assert.strictEqual(res.status, 200);

      const data = (await res.json()) as any;
      assert.ok(data.contacts);
    } finally {
      await server.close();
    }
  });
});
