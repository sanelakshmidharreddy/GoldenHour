import { describe, it } from 'node:test';
import assert from 'node:assert';
import path from 'path';
import fs from 'fs';
import { createApp } from '../src/app';
import { startTestServer } from './helper';
import { guidanceService } from '../src/kb/guidanceService';
import { loadKnowledgeBase } from '../src/kb/loader';
import { IncidentState } from '../src/incident/types';

describe('Scenario Acceptance Tests (Ticket 05)', () => {
  const app = createApp({ nodeEnv: 'test', isTest: true });

  const scenariosDir =
    [
      path.resolve(process.cwd(), '../tests/scenarios'),
      path.resolve(process.cwd(), 'tests/scenarios'),
      path.resolve(__dirname, '../../../tests/scenarios'),
      path.resolve(__dirname, '../../tests/scenarios'),
    ].find((p) => fs.existsSync(p)) || path.resolve(process.cwd(), '../tests/scenarios');

  function loadScenario(fileName: string): any {
    const fullPath = path.join(scenariosDir, fileName);
    assert.ok(fs.existsSync(fullPath), `Scenario fixture missing: ${fileName}`);
    return JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
  }

  it('Scenario 01: UPI / QR Code Scam (within 15 minutes) - Intake, Guidance, and Artifacts', async () => {
    const scenario = loadScenario('scenario01_upi_scam.json');
    const server = await startTestServer(app);

    try {
      const offsetMs = scenario.intakePayload.incidentOccurredAtOffsetMinutes * 60 * 1000;
      const occurredTime = new Date(Date.now() - offsetMs).toISOString();

      const payload = {
        ...scenario.intakePayload,
        incidentOccurredAt: occurredTime,
      };
      delete (payload as any).incidentOccurredAtOffsetMinutes;

      // 1. Submit Intake
      const intakeRes = await server.fetch('/api/v1/incident/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      assert.strictEqual(intakeRes.status, 200);
      const intakeData = (await intakeRes.json()) as any;

      assert.strictEqual(intakeData.goldenHour.urgencyWindow, scenario.expectedResults.urgencyWindow);
      assert.strictEqual(intakeData.goldenHour.isWithinGoldenHour, scenario.expectedResults.isWithinGoldenHour);
      assert.strictEqual(intakeData.incident.totalAmountLost, scenario.expectedResults.totalAmount);

      // 2. Verify Tailored Guidance
      const guidanceRes = await server.fetch('/api/v1/incident/guidance');
      assert.strictEqual(guidanceRes.status, 200);
      const guidanceData = (await guidanceRes.json()) as any;

      assert.strictEqual(guidanceData.guidance.playbook?.id, scenario.expectedResults.expectedPlaybookId);
      assert.ok(guidanceData.guidance.immediateActions.some((action: string) => action.includes('1930')));
      assert.ok(guidanceData.guidance.immediateActions.some((action: string) => action.includes('UTR')));
      assert.ok(guidanceData.guidance.evidenceToCollect.some((e: string) => e.includes('VPA') || e.includes('UTR')));

      // 3. Verify Generated Response Artifacts
      const artifactsRes = await server.fetch('/api/v1/incident/artifacts');
      assert.strictEqual(artifactsRes.status, 200);
      const artifactsData = (await artifactsRes.json()) as any;

      for (const expectedText of scenario.expectedResults.firDraftContains) {
        assert.ok(
          artifactsData.artifacts.firDraft.bodyMarkdown.includes(expectedText),
          `FIR draft should contain: ${expectedText}`
        );
      }
      assert.ok(artifactsData.artifacts.helplineCallScript.scriptBullets.some((b: string) => b.includes('25,000')));
    } finally {
      await server.close();
    }
  });

  it('Scenario 02: OTP / Vishing Fraud (30 mins ago) - Card Hotlisting & Chakshu Guidance', async () => {
    const scenario = loadScenario('scenario02_otp_fraud.json');
    const server = await startTestServer(app);

    try {
      const offsetMs = scenario.intakePayload.incidentOccurredAtOffsetMinutes * 60 * 1000;
      const occurredTime = new Date(Date.now() - offsetMs).toISOString();

      const payload = {
        ...scenario.intakePayload,
        incidentOccurredAt: occurredTime,
      };
      delete (payload as any).incidentOccurredAtOffsetMinutes;

      const intakeRes = await server.fetch('/api/v1/incident/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      assert.strictEqual(intakeRes.status, 200);

      const guidanceRes = await server.fetch('/api/v1/incident/guidance');
      const guidanceData = (await guidanceRes.json()) as any;

      assert.strictEqual(guidanceData.guidance.playbook?.id, scenario.expectedResults.expectedPlaybookId);
      assert.ok(guidanceData.guidance.immediateActions.some((a: string) => a.includes('hotlist') || a.includes('block')));
      assert.ok(guidanceData.guidance.immediateActions.some((a: string) => a.includes('Chakshu')));

      const artifactsRes = await server.fetch('/api/v1/incident/artifacts');
      const artifactsData = (await artifactsRes.json()) as any;
      assert.ok(artifactsData.artifacts.firDraft.bodyMarkdown.includes('Sunita Rao'));
      assert.ok(artifactsData.artifacts.firDraft.bodyMarkdown.includes('50,000'));
    } finally {
      await server.close();
    }
  });

  it('Scenario 03: Phishing Link / Utility Scam - Malicious URL Preservation', async () => {
    const scenario = loadScenario('scenario03_phishing_link.json');
    const server = await startTestServer(app);

    try {
      const offsetMs = scenario.intakePayload.incidentOccurredAtOffsetMinutes * 60 * 1000;
      const occurredTime = new Date(Date.now() - offsetMs).toISOString();

      const payload = {
        ...scenario.intakePayload,
        incidentOccurredAt: occurredTime,
      };
      delete (payload as any).incidentOccurredAtOffsetMinutes;

      const intakeRes = await server.fetch('/api/v1/incident/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      assert.strictEqual(intakeRes.status, 200);

      const guidanceRes = await server.fetch('/api/v1/incident/guidance');
      const guidanceData = (await guidanceRes.json()) as any;

      assert.strictEqual(guidanceData.guidance.playbook?.id, scenario.expectedResults.expectedPlaybookId);
      assert.ok(guidanceData.guidance.immediateActions.some((a: string) => a.includes('antivirus') || a.includes('passwords')));

      const artifactsRes = await server.fetch('/api/v1/incident/artifacts');
      const artifactsData = (await artifactsRes.json()) as any;
      assert.ok(artifactsData.artifacts.firDraft.bodyMarkdown.includes('electricity-bill-update-state.com'));
      assert.strictEqual(artifactsData.artifacts.ncrpPayloadReference.categoryCode, 'Online Financial Fraud');
    } finally {
      await server.close();
    }
  });

  it('Scenario 04: Fake Loan App Extortion - Device Permission & Sachet Guidance', async () => {
    const scenario = loadScenario('scenario04_fake_loan_app.json');
    const server = await startTestServer(app);

    try {
      const offsetMs = scenario.intakePayload.incidentOccurredAtOffsetMinutes * 60 * 1000;
      const occurredTime = new Date(Date.now() - offsetMs).toISOString();

      const payload = {
        ...scenario.intakePayload,
        incidentOccurredAt: occurredTime,
      };
      delete (payload as any).incidentOccurredAtOffsetMinutes;

      const intakeRes = await server.fetch('/api/v1/incident/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      assert.strictEqual(intakeRes.status, 200);

      const guidanceRes = await server.fetch('/api/v1/incident/guidance');
      const guidanceData = (await guidanceRes.json()) as any;

      assert.strictEqual(guidanceData.guidance.playbook?.id, scenario.expectedResults.expectedPlaybookId);
      assert.ok(guidanceData.guidance.immediateActions.some((a: string) => a.includes('uninstall') && a.includes('permissions')));
      assert.ok(guidanceData.guidance.immediateActions.some((a: string) => a.includes('Sachet')));

      const artifactsRes = await server.fetch('/api/v1/incident/artifacts');
      const artifactsData = (await artifactsRes.json()) as any;
      assert.ok(artifactsData.artifacts.firDraft.bodyMarkdown.includes('InstantCashFast7Days.apk'));
    } finally {
      await server.close();
    }
  });

  it('Scenario 05: Investment / Task Scam - Multi-Transaction Ledger & Telegram Evidence', async () => {
    const scenario = loadScenario('scenario05_investment_scam.json');
    const server = await startTestServer(app);

    try {
      const offsetMs = scenario.intakePayload.incidentOccurredAtOffsetMinutes * 60 * 1000;
      const occurredTime = new Date(Date.now() - offsetMs).toISOString();

      const payload = {
        ...scenario.intakePayload,
        incidentOccurredAt: occurredTime,
      };
      delete (payload as any).incidentOccurredAtOffsetMinutes;

      const intakeRes = await server.fetch('/api/v1/incident/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      assert.strictEqual(intakeRes.status, 200);
      const intakeData = (await intakeRes.json()) as any;
      assert.strictEqual(intakeData.incident.totalAmountLost, 120000);

      const guidanceRes = await server.fetch('/api/v1/incident/guidance');
      const guidanceData = (await guidanceRes.json()) as any;

      assert.strictEqual(guidanceData.guidance.playbook?.id, scenario.expectedResults.expectedPlaybookId);
      assert.ok(guidanceData.guidance.immediateActions.some((a: string) => a.includes('Stop all further transfers')));
      assert.ok(guidanceData.guidance.immediateActions.some((a: string) => a.includes('Telegram')));

      const artifactsRes = await server.fetch('/api/v1/incident/artifacts');
      const artifactsData = (await artifactsRes.json()) as any;
      assert.ok(artifactsData.artifacts.firDraft.bodyMarkdown.includes('1,20,000'));
      assert.ok(artifactsData.artifacts.firDraft.bodyMarkdown.includes('NEFT/N089123849182'));
      assert.ok(artifactsData.artifacts.firDraft.bodyMarkdown.includes('IMPS/409819283719'));
    } finally {
      await server.close();
    }
  });

  it('Scenario 06: SIM Swap / eSIM Fraud - Telecom & Bank Security Response', async () => {
    const scenario = loadScenario('scenario06_sim_swap.json');
    const server = await startTestServer(app);

    try {
      const offsetMs = scenario.intakePayload.incidentOccurredAtOffsetMinutes * 60 * 1000;
      const occurredTime = new Date(Date.now() - offsetMs).toISOString();

      const payload = {
        ...scenario.intakePayload,
        incidentOccurredAt: occurredTime,
      };
      delete (payload as any).incidentOccurredAtOffsetMinutes;

      const intakeRes = await server.fetch('/api/v1/incident/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      assert.strictEqual(intakeRes.status, 200);

      const guidanceRes = await server.fetch('/api/v1/incident/guidance');
      const guidanceData = (await guidanceRes.json()) as any;

      assert.strictEqual(guidanceData.guidance.playbook?.id, scenario.expectedResults.expectedPlaybookId);
      assert.ok(guidanceData.guidance.immediateActions.some((a: string) => a.includes('telecom')));
      assert.ok(guidanceData.guidance.immediateActions.some((a: string) => a.includes('freeze Netbanking')));

      const artifactsRes = await server.fetch('/api/v1/incident/artifacts');
      const artifactsData = (await artifactsRes.json()) as any;
      assert.ok(artifactsData.artifacts.firDraft.bodyMarkdown.includes('Vikram Malhotra'));
      assert.ok(artifactsData.artifacts.firDraft.bodyMarkdown.includes('75,000'));
    } finally {
      await server.close();
    }
  });

  it('Scenario 07: Older Financial Fraud (> 24 Hours) - EXTENDED Urgency without Defeatist Claims', async () => {
    const scenario = loadScenario('scenario07_older_financial_fraud.json');
    const server = await startTestServer(app);

    try {
      const offsetMs = scenario.intakePayload.incidentOccurredAtOffsetMinutes * 60 * 1000;
      const occurredTime = new Date(Date.now() - offsetMs).toISOString();

      const payload = {
        ...scenario.intakePayload,
        incidentOccurredAt: occurredTime,
      };
      delete (payload as any).incidentOccurredAtOffsetMinutes;

      const intakeRes = await server.fetch('/api/v1/incident/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      assert.strictEqual(intakeRes.status, 200);
      const intakeData = (await intakeRes.json()) as any;

      assert.strictEqual(intakeData.goldenHour.urgencyWindow, 'EXTENDED');
      assert.strictEqual(intakeData.goldenHour.isWithinGoldenHour, false);

      // Verify guidance still provides helpful steps and does NOT say recovery is impossible
      const guidanceRes = await server.fetch('/api/v1/incident/guidance');
      const guidanceData = (await guidanceRes.json()) as any;
      assert.ok(guidanceData.guidance.immediateActions.length > 0);
      assert.ok(guidanceData.guidance.recommendedHelplines.some((h: any) => h.number === '1930'));

      const artifactsRes = await server.fetch('/api/v1/incident/artifacts');
      const artifactsData = (await artifactsRes.json()) as any;
      assert.ok(artifactsData.artifacts.firDraft.bodyMarkdown.includes('Ananya Sen'));
      assert.ok(artifactsData.artifacts.firDraft.bodyMarkdown.includes('30,000'));
    } finally {
      await server.close();
    }
  });

  it('Scenario 08: Validation Failure - Rejection of Invalid / Corrupted Input', async () => {
    const scenario = loadScenario('scenario08_validation_failure.json');
    const server = await startTestServer(app);

    try {
      const intakeRes = await server.fetch('/api/v1/incident/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scenario.invalidPayload),
      });
      assert.strictEqual(intakeRes.status, 400);

      const errData = (await intakeRes.json()) as any;
      assert.strictEqual(errData.error.code, 'VALIDATION_ERROR');

      // Verify session state was not corrupted
      const currentRes = await server.fetch('/api/v1/incident/current');
      assert.strictEqual(currentRes.status, 200);
      const currentData = (await currentRes.json()) as any;
      assert.strictEqual(currentData.incident.totalAmountLost, 0);
      assert.strictEqual(currentData.incident.transactions.length, 0);
    } finally {
      await server.close();
    }
  });

  it('Scenario 09: Unknown / Unclassified Fraud - Safe Generic Guidance', async () => {
    const scenario = loadScenario('scenario09_unknown_fraud.json');
    const server = await startTestServer(app);

    try {
      const offsetMs = scenario.intakePayload.incidentOccurredAtOffsetMinutes * 60 * 1000;
      const occurredTime = new Date(Date.now() - offsetMs).toISOString();

      const payload = {
        ...scenario.intakePayload,
        incidentOccurredAt: occurredTime,
      };
      delete (payload as any).incidentOccurredAtOffsetMinutes;

      const intakeRes = await server.fetch('/api/v1/incident/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      assert.strictEqual(intakeRes.status, 200);

      const guidanceRes = await server.fetch('/api/v1/incident/guidance');
      const guidanceData = (await guidanceRes.json()) as any;

      assert.strictEqual(guidanceData.guidance.playbook?.id, 'unknown');
      assert.ok(guidanceData.guidance.immediateActions.some((a: string) => a.includes('1930')));

      const artifactsRes = await server.fetch('/api/v1/incident/artifacts');
      const artifactsData = (await artifactsRes.json()) as any;
      assert.ok(artifactsData.artifacts.firDraft.bodyMarkdown.includes('Kavita Nair'));
      assert.ok(artifactsData.artifacts.firDraft.bodyMarkdown.includes('18,000'));
    } finally {
      await server.close();
    }
  });

  it('Scenario 10: Resilient Fallback - Graceful Degradation on Empty KB Directory', () => {
    const tempEmptyDir = path.resolve(__dirname, '../temp_empty_kb_scenario10');
    if (!fs.existsSync(tempEmptyDir)) {
      fs.mkdirSync(tempEmptyDir, { recursive: true });
    }

    try {
      const result = loadKnowledgeBase(tempEmptyDir);
      assert.strictEqual(result.isLoaded, false);
      assert.strictEqual(Object.keys(result.data.playbooks).length, 0);

      // Verify guidance fallback logic handles empty playbooks safely
      const incident: IncidentState = {
        id: 'test-fallback-incident',
        fraudType: 'upi_scam',
        incidentOccurredAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
        description: 'Testing empty KB condition',
        victim: { name: 'Fallback User' },
        transactions: [{ amount: 10000, transactionRef: 'UPI/TEST' }],
        totalAmountLost: 10000,
        suspect: {},
        completedEmergencySteps: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const guidance = guidanceService.getGuidanceForIncident(incident);
      assert.ok(guidance.immediateActions.length > 0);
      assert.ok(guidance.immediateActions.some((a) => a.includes('1930')));
      assert.ok(guidance.recommendedHelplines.some((h) => h.number === '1930'));
    } finally {
      if (fs.existsSync(tempEmptyDir)) {
        fs.rmdirSync(tempEmptyDir);
      }
    }
  });

  it('Knowledge Base Content Verification - Verified Indian Sources & Playbooks Count', () => {
    const playbooks = guidanceService.getPlaybooks();
    const playbookKeys = Object.keys(playbooks);

    assert.ok(playbookKeys.includes('upi_scam'));
    assert.ok(playbookKeys.includes('otp_fraud'));
    assert.ok(playbookKeys.includes('phishing'));
    assert.ok(playbookKeys.includes('fake_loan_app'));
    assert.ok(playbookKeys.includes('investment_scam'));
    assert.ok(playbookKeys.includes('sim_swap'));
    assert.ok(playbookKeys.includes('unknown'));
    assert.strictEqual(playbookKeys.length, 7);

    // Verify source metadata is present in playbooks
    assert.ok(String(playbooks.upi_scam?.source || '').includes('NPCI'));
    assert.ok(String(playbooks.otp_fraud?.source || '').includes('RBI'));
    assert.ok(String(playbooks.fake_loan_app?.source || '').includes('RBI Sachet'));
    assert.ok(String(playbooks.investment_scam?.source || '').includes('MHA I4C'));
    assert.ok(
      String(playbooks.sim_swap?.source || '').includes('DoT') ||
        String(playbooks.sim_swap?.source || '').includes('Telecommunications')
    );

    // Verify contacts contain verified official helplines
    const contacts = guidanceService.getContacts() as Record<string, any>;
    assert.ok(contacts.helpline_1930 !== undefined);
    assert.strictEqual(contacts.helpline_1930.phone, '1930');
    assert.ok(contacts.ncrp_portal !== undefined);
    assert.ok(contacts.emergency_112 !== undefined);
    assert.ok(contacts.rbi_sachet !== undefined);
    assert.ok(contacts.rbi_cms !== undefined);
    assert.ok(contacts.dot_chakshu !== undefined);
  });
});
