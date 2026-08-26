import { describe, it } from 'node:test';
import assert from 'node:assert';
import { createApp } from '../src/app';
import { startTestServer } from './helper';

describe('Production Smoke & Release Readiness Tests (Ticket 06)', () => {
  const app = createApp({ nodeEnv: 'test', isTest: true });

  it('GET /health returns machine-readable JSON health metadata', async () => {
    const server = await startTestServer(app);
    try {
      const res = await server.fetch('/health');
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.headers.get('content-type')?.includes('application/json'), true);

      const body = (await res.json()) as any;
      assert.strictEqual(body.status, 'ok');
      assert.strictEqual(body.environment, 'test');
      assert.strictEqual(body.version, '0.1.0');
      assert.ok(typeof body.timestamp === 'string');
      assert.ok(!isNaN(Date.parse(body.timestamp)));
    } finally {
      await server.close();
    }
  });

  it('GET / serves frontend application HTML entrypoint', async () => {
    const server = await startTestServer(app);
    try {
      const res = await server.fetch('/');
      assert.strictEqual(res.status, 200);
      const html = await res.text();
      assert.ok(html.includes('GoldenHour'));
      assert.ok(html.includes('id="app"'));
      assert.ok(html.includes('/styles.css'));
      assert.ok(html.includes('/dist/app.js'));
    } finally {
      await server.close();
    }
  });

  it('GET /styles.css serves complete high-contrast emergency stylesheets', async () => {
    const server = await startTestServer(app);
    try {
      const res = await server.fetch('/styles.css');
      assert.strictEqual(res.status, 200);
      const css = await res.text();
      assert.ok(css.includes('--bg-main'));
      assert.ok(css.includes('.emergency-header'));
      assert.ok(css.includes('.btn-emergency'));
      assert.ok(css.includes('.judge-hint-callout'));
      assert.ok(css.includes('.reimagined-section'));
      assert.ok(css.includes('.ecosystem-grid'));
    } finally {
      await server.close();
    }
  });

  it('GET /dist/app.js serves compiled ES2020 application modules', async () => {
    const server = await startTestServer(app);
    try {
      const res = await server.fetch('/dist/app.js');
      assert.strictEqual(res.status, 200);
      const js = await res.text();
      assert.ok(js.includes('App'));
      assert.ok(js.includes('btn-start-intake') || js.includes('btn-load-demo'));
      assert.ok(js.includes('renderLandingScreen'));

      // Also verify component module serving
      const compRes = await server.fetch('/dist/components/LandingScreen.js');
      assert.strictEqual(compRes.status, 200);
      const compJs = await compRes.text();
      assert.ok(compJs.includes('reimagined-section') || compJs.includes('Reimagining the Citizen Response Experience'));
    } finally {
      await server.close();
    }
  });

  it('GET /api/v1 returns structured API directory', async () => {
    const server = await startTestServer(app);
    try {
      const res = await server.fetch('/api/v1');
      assert.strictEqual(res.status, 200);
      const body = (await res.json()) as any;
      assert.strictEqual(body.status, 'active');
      assert.strictEqual(body.version, 'v1');
      assert.ok(body.endpoints !== undefined);
    } finally {
      await server.close();
    }
  });

  it('Full Judge Demo Journey: Load -> Assess -> Guidance -> Artifacts -> Copy/Download -> Reset', async () => {
    const server = await startTestServer(app);
    try {
      // 1. Initial State Check
      const initialCurrentRes = await server.fetch('/api/v1/incident/current');
      assert.strictEqual(initialCurrentRes.status, 200);
      const initialData = (await initialCurrentRes.json()) as any;
      assert.strictEqual(initialData.incident.totalAmountLost, 0);

      // 2. Judge Demo Intake (Electricity bill UPI fraud, 45 min ago, Rs. 45,000 lost)
      const demoOccurredAt = new Date(Date.now() - 45 * 60 * 1000).toISOString();
      const demoPayload = {
        fraudType: 'upi_scam',
        incidentOccurredAt: demoOccurredAt,
        description: 'Demo UPI fraud simulation: power disconnection notice with collect request.',
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
        completedEmergencySteps: ['Reported on GoldenHour citizen portal'],
      };

      const intakeRes = await server.fetch('/api/v1/incident/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(demoPayload),
      });
      assert.strictEqual(intakeRes.status, 200);
      const intakeData = (await intakeRes.json()) as any;
      assert.strictEqual(intakeData.goldenHour.urgencyWindow, 'GOLDEN_HOUR');
      assert.strictEqual(intakeData.goldenHour.isWithinGoldenHour, true);
      assert.strictEqual(intakeData.incident.totalAmountLost, 45000);

      // 3. Guidance Verification
      const guidanceRes = await server.fetch('/api/v1/incident/guidance');
      assert.strictEqual(guidanceRes.status, 200);
      const guidanceData = (await guidanceRes.json()) as any;
      assert.strictEqual(guidanceData.guidance.playbook?.id, 'upi_scam');
      assert.ok(guidanceData.guidance.immediateActions.length >= 3);
      assert.ok(guidanceData.guidance.recommendedHelplines.some((h: any) => h.number === '1930'));

      // 4. Artifacts Verification
      const artifactsRes = await server.fetch('/api/v1/incident/artifacts');
      assert.strictEqual(artifactsRes.status, 200);
      const artifactsData = (await artifactsRes.json()) as any;

      // 1930 Call Script
      assert.ok(artifactsData.artifacts.helplineCallScript.scriptBullets.length > 0);
      assert.ok(
        artifactsData.artifacts.helplineCallScript.scriptBullets.some((b: string) => b.includes('45,000'))
      );

      // FIR Complaint Draft
      assert.ok(artifactsData.artifacts.firDraft.bodyMarkdown.includes('Pooja Varma'));
      assert.ok(artifactsData.artifacts.firDraft.bodyMarkdown.includes('UPI/409812739182'));
      assert.ok(artifactsData.artifacts.firDraft.bodyMarkdown.includes('Bandra Cyber Police Station'));

      // NCRP Reference Payload
      assert.strictEqual(artifactsData.artifacts.ncrpPayloadReference.categoryCode, 'Financial Fraud');
      assert.strictEqual(artifactsData.artifacts.ncrpPayloadReference.totalAmount, 45000);

      // 5. Clean Reset
      const resetRes = await server.fetch('/api/v1/incident/reset', { method: 'POST' });
      assert.strictEqual(resetRes.status, 200);

      // 6. Confirm Reset State
      const postResetRes = await server.fetch('/api/v1/incident/current');
      assert.strictEqual(postResetRes.status, 200);
      const postResetData = (await postResetRes.json()) as any;
      assert.strictEqual(postResetData.incident.totalAmountLost, 0);
      assert.strictEqual(postResetData.incident.transactions.length, 0);
    } finally {
      await server.close();
    }
  });
});
