import { describe, it } from 'node:test';
import assert from 'node:assert';
import { createApp } from '../src/app';
import { startTestServer } from './helper';

describe('Incident Intake & State API', () => {
  const app = createApp({ nodeEnv: 'test', isTest: true });

  it('POST /api/v1/incident/intake should record incident details and return Golden Hour status', async () => {
    const server = await startTestServer(app);
    try {
      const payload = {
        fraudType: 'upi_scam',
        incidentOccurredAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 mins ago
        description: 'Received a fake QR code to receive payment on OLX, which deducted money instead.',
        victim: {
          name: 'Ramesh Kumar',
          phone: '9876543210',
          district: 'Bengaluru Urban',
          stateOrCity: 'Karnataka',
        },
        transactions: [
          {
            transactionRef: 'UPI/324512984512',
            amount: 25000,
            debitedBankOrApp: 'State Bank of India / Google Pay',
            beneficiaryDetails: 'fraudster@upi',
          },
        ],
        suspect: {
          phoneNumbers: ['9811122233'],
          upiIds: ['fraudster@upi'],
        },
        completedEmergencySteps: ['Bank notified via SMS'],
      };

      const res = await server.fetch('/api/v1/incident/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      assert.strictEqual(res.status, 200);
      const data = (await res.json()) as any;

      assert.ok(data.incident);
      assert.strictEqual(data.incident.fraudType, 'upi_scam');
      assert.strictEqual(data.incident.totalAmountLost, 25000);
      assert.strictEqual(data.incident.victim.name, 'Ramesh Kumar');
      assert.strictEqual(data.incident.transactions.length, 1);

      // Verify Golden Hour calculation
      assert.ok(data.goldenHour);
      assert.strictEqual(data.goldenHour.urgencyWindow, 'GOLDEN_HOUR');
      assert.strictEqual(data.goldenHour.isWithinGoldenHour, true);
      assert.strictEqual(data.goldenHour.urgencyLevel, 'HIGH_URGENCY');
    } finally {
      await server.close();
    }
  });

  it('POST /api/v1/incident/intake should reject invalid payloads with 400 BAD_REQUEST', async () => {
    const server = await startTestServer(app);
    try {
      const invalidPayload = {
        fraudType: 'invalid_type_does_not_exist',
        transactions: [
          {
            amount: -500, // Negative amount
          },
        ],
      };

      const res = await server.fetch('/api/v1/incident/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidPayload),
      });

      assert.strictEqual(res.status, 400);
      const data = (await res.json()) as any;

      assert.ok(data.error);
      assert.strictEqual(data.error.code, 'VALIDATION_ERROR');
      assert.ok(data.error.details.issues.length > 0);
    } finally {
      await server.close();
    }
  });

  it('GET /api/v1/incident/current should return active state', async () => {
    const server = await startTestServer(app);
    try {
      const res = await server.fetch('/api/v1/incident/current');
      assert.strictEqual(res.status, 200);

      const data = (await res.json()) as any;
      assert.ok(data.incident);
      assert.ok(data.goldenHour);
    } finally {
      await server.close();
    }
  });

  it('POST /api/v1/incident/reset should clear active incident state', async () => {
    const server = await startTestServer(app);
    try {
      const res = await server.fetch('/api/v1/incident/reset', { method: 'POST' });
      assert.strictEqual(res.status, 200);

      const data = (await res.json()) as any;
      assert.strictEqual(data.status, 'reset_successful');
    } finally {
      await server.close();
    }
  });
});
