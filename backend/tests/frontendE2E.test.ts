import { describe, it } from 'node:test';
import assert from 'node:assert';
import { createApp } from '../src/app';
import { startTestServer } from './helper';

describe('Frontend & End-to-End User Journey', () => {
  const app = createApp({ nodeEnv: 'test', isTest: true });

  it('GET / should serve the frontend HTML entrypoint', async () => {
    const server = await startTestServer(app);
    try {
      const res = await server.fetch('/');
      assert.strictEqual(res.status, 200);

      const html = await res.text();
      assert.ok(html.includes('GoldenHour'));
      assert.ok(html.includes('id="app"'));
      assert.ok(html.includes('/dist/app.js'));
      assert.ok(html.includes('/styles.css'));
    } finally {
      await server.close();
    }
  });

  it('GET /styles.css should serve frontend emergency stylesheets', async () => {
    const server = await startTestServer(app);
    try {
      const res = await server.fetch('/styles.css');
      assert.strictEqual(res.status, 200);

      const css = await res.text();
      assert.ok(css.includes('--bg-main'));
      assert.ok(css.includes('.emergency-header'));
      assert.ok(css.includes('.btn-emergency'));
      assert.ok(css.includes('.banner-golden-hour'));
    } finally {
      await server.close();
    }
  });

  it('GET /dist/app.js should serve compiled frontend application code', async () => {
    const server = await startTestServer(app);
    try {
      const res = await server.fetch('/dist/app.js');
      assert.strictEqual(res.status, 200);

      const js = await res.text();
      assert.ok(js.includes('App'));
      assert.ok(js.includes('incident-form') || js.includes('btn-start-intake'));
    } finally {
      await server.close();
    }
  });

  it('Complete End-to-End Incident Response Journey (Demo & Real Flow)', async () => {
    const server = await startTestServer(app);
    try {
      // 1. User arrives on landing page
      const landingRes = await server.fetch('/');
      assert.strictEqual(landingRes.status, 200);

      // 2. User submits incident intake (45 mins ago, UPI fraud, Rs. 45,000 lost)
      const occurredTime = new Date(Date.now() - 45 * 60 * 1000).toISOString();
      const intakePayload = {
        fraudType: 'upi_scam',
        incidentOccurredAt: occurredTime,
        description: 'Phishing collect request received on SMS for pending power bill.',
        victim: {
          name: 'Pooja Varma',
          phone: '9845012345',
          stateOrCity: 'Maharashtra',
          district: 'Mumbai Suburban',
          policeStationJurisdiction: 'Bandra Cyber Police Station',
        },
        transactions: [
          {
            transactionRef: 'UPI/409812739182',
            amount: 45000,
            currency: 'INR',
            debitedBankOrApp: 'HDFC Bank / PhonePe',
            beneficiaryDetails: 'electricity.desk@icici',
          },
        ],
        suspect: {
          phoneNumbers: ['9819922334'],
          upiIds: ['electricity.desk@icici'],
        },
      };

      const intakeRes = await server.fetch('/api/v1/incident/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(intakePayload),
      });
      assert.strictEqual(intakeRes.status, 200);
      const intakeData = (await intakeRes.json()) as any;

      assert.strictEqual(intakeData.goldenHour.urgencyWindow, 'GOLDEN_HOUR');
      assert.strictEqual(intakeData.goldenHour.isWithinGoldenHour, true);
      assert.strictEqual(intakeData.incident.totalAmountLost, 45000);

      // 3. User views immediate guidance and official helplines
      const guidanceRes = await server.fetch('/api/v1/incident/guidance');
      assert.strictEqual(guidanceRes.status, 200);
      const guidanceData = (await guidanceRes.json()) as any;

      assert.ok(guidanceData.guidance.immediateActions.length >= 3);
      assert.ok(guidanceData.guidance.recommendedHelplines.some((h: any) => h.number === '1930'));

      // 4. User views generated response artifacts
      const artifactsRes = await server.fetch('/api/v1/incident/artifacts');
      assert.strictEqual(artifactsRes.status, 200);
      const artifactsData = (await artifactsRes.json()) as any;

      // 1930 Verbal Script
      assert.ok(artifactsData.artifacts.helplineCallScript.scriptBullets.length > 0);
      assert.ok(
        artifactsData.artifacts.helplineCallScript.scriptBullets.some((b: string) =>
          b.includes('45,000')
        )
      );

      // Police Complaint Draft
      assert.ok(
        artifactsData.artifacts.firDraft.bodyMarkdown.includes('FORMAL COMPLAINT OF CYBER FRAUD')
      );
      assert.ok(artifactsData.artifacts.firDraft.bodyMarkdown.includes('Pooja Varma'));
      assert.ok(artifactsData.artifacts.firDraft.bodyMarkdown.includes('UPI/409812739182'));

      // NCRP Reference Payload
      assert.strictEqual(
        artifactsData.artifacts.ncrpPayloadReference.categoryCode,
        'Financial Fraud'
      );
      assert.strictEqual(artifactsData.artifacts.ncrpPayloadReference.totalAmount, 45000);

      // 5. User resets session to start fresh
      const resetRes = await server.fetch('/api/v1/incident/reset', { method: 'POST' });
      assert.strictEqual(resetRes.status, 200);
    } finally {
      await server.close();
    }
  });
});
