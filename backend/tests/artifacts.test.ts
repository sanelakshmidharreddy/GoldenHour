import { describe, it } from 'node:test';
import assert from 'node:assert';
import { createApp } from '../src/app';
import { startTestServer } from './helper';

describe('Artifacts Generation API', () => {
  const app = createApp({ nodeEnv: 'test', isTest: true });

  it('GET /api/v1/incident/artifacts should generate 1930 script, NCRP payload, and formal FIR complaint', async () => {
    const server = await startTestServer(app);
    try {
      // 1. Submit incident intake
      await server.fetch('/api/v1/incident/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fraudType: 'upi_scam',
          incidentOccurredAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 mins ago
          description: 'Victim was tricked into clicking a UPI collect request link on SMS claiming electricity bill overdue.',
          victim: {
            name: 'Priya Sharma',
            phone: '9845012345',
            district: 'Cyberabad',
            stateOrCity: 'Telangana',
            policeStationJurisdiction: 'Cyber Crime Police Station, Cyberabad',
          },
          transactions: [
            {
              transactionRef: 'UPI/409812739182',
              amount: 50000,
              debitedBankOrApp: 'HDFC Bank / PhonePe',
              beneficiaryDetails: 'electricity.desk@paytm',
            },
          ],
          suspect: {
            phoneNumbers: ['9876500000'],
            upiIds: ['electricity.desk@paytm'],
          },
        }),
      });

      // 2. Fetch generated artifacts
      const res = await server.fetch('/api/v1/incident/artifacts');
      assert.strictEqual(res.status, 200);

      const data = (await res.json()) as any;
      assert.ok(data.artifacts);

      // Verify 1930 Helpline Call Script
      const script = data.artifacts.helplineCallScript;
      assert.ok(script);
      assert.ok(script.targetHelplines.some((h: string) => h.includes('1930')));
      assert.ok(script.scriptBullets.some((b: string) => b.includes('50,000')));
      assert.ok(script.scriptBullets.some((b: string) => b.includes('UPI/409812739182')));

      // Verify NCRP Reference Payload
      const ncrp = data.artifacts.ncrpPayloadReference;
      assert.ok(ncrp);
      assert.strictEqual(ncrp.categoryCode, 'Financial Fraud');
      assert.strictEqual(ncrp.subCategoryCode, 'UPI Fraud');
      assert.strictEqual(ncrp.totalAmount, 50000);
      assert.strictEqual(ncrp.transactionDetails.length, 1);

      // Verify Formal FIR Draft
      const fir = data.artifacts.firDraft;
      assert.ok(fir);
      assert.ok(fir.bodyMarkdown.includes('FORMAL COMPLAINT OF CYBER FRAUD'));
      assert.ok(fir.bodyMarkdown.includes('Priya Sharma'));
      assert.ok(fir.bodyMarkdown.includes('UPI/409812739182'));
      assert.ok(fir.bodyMarkdown.includes('66C, 66D'));
      assert.ok(fir.evidenceChecklist.length >= 4);
    } finally {
      await server.close();
    }
  });
});
