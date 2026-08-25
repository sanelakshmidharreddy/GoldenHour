import { describe, it } from 'node:test';
import assert from 'node:assert';
import path from 'path';
import fs from 'fs';
import { loadKnowledgeBase } from '../src/kb/loader';

describe('Knowledge Base Loader', () => {
  const actualKbDir =
    [
      path.resolve(process.cwd(), '../knowledge-base'),
      path.resolve(process.cwd(), 'knowledge-base'),
      path.resolve(__dirname, '../../../knowledge-base'),
      path.resolve(__dirname, '../../knowledge-base'),
    ].find((p) => fs.existsSync(p)) || path.resolve(process.cwd(), '../knowledge-base');

  it('should load actual knowledge-base directory with placeholder JSON files without crashing', () => {
    const result = loadKnowledgeBase(actualKbDir);

    assert.strictEqual(result.isLoaded, true);
    assert.strictEqual(result.baseDir, actualKbDir);
    assert.ok(result.loadedFiles.length > 0);

    // Verify presence of core files
    assert.ok(result.loadedFiles.includes('contacts.json'));
    assert.ok(result.loadedFiles.includes('expectations.json'));
    assert.ok(result.loadedFiles.includes('ncrp_mapping.json'));
    assert.ok(result.loadedFiles.includes('sources.json'));
    assert.ok(result.loadedFiles.includes('kb_meta.json'));

    // Verify presence of fraud playbooks
    assert.ok(result.loadedFiles.includes('fraud_playbooks/upi_scam.json'));
    assert.ok(result.loadedFiles.includes('fraud_playbooks/otp_fraud.json'));
    assert.ok(result.loadedFiles.includes('fraud_playbooks/phishing.json'));
    assert.ok(result.loadedFiles.includes('fraud_playbooks/fake_loan_app.json'));
    assert.ok(result.loadedFiles.includes('fraud_playbooks/investment_scam.json'));
    assert.ok(result.loadedFiles.includes('fraud_playbooks/sim_swap.json'));
    assert.ok(result.loadedFiles.includes('fraud_playbooks/unknown.json'));

    // Verify playbooks collection
    assert.ok(result.data.playbooks.upi_scam !== undefined);
    assert.ok(result.data.playbooks.otp_fraud !== undefined);
  });

  it('should handle non-existent directory gracefully without throwing', () => {
    const fakeDir = path.resolve(__dirname, '../non_existent_kb_dir_12345');
    const result = loadKnowledgeBase(fakeDir);

    assert.strictEqual(result.isLoaded, false);
    assert.strictEqual(result.loadedFiles.length, 0);
    assert.ok(result.warnings.length > 0);
    assert.ok(result.warnings[0].includes('does not exist'));
  });

  it('should handle empty directory gracefully', () => {
    const tempEmptyDir = path.resolve(__dirname, '../temp_test_empty_kb');
    if (!fs.existsSync(tempEmptyDir)) {
      fs.mkdirSync(tempEmptyDir, { recursive: true });
    }

    try {
      const result = loadKnowledgeBase(tempEmptyDir);
      assert.strictEqual(result.isLoaded, false);
      assert.strictEqual(result.loadedFiles.length, 0);
      assert.ok(result.missingFiles.includes('contacts.json'));
      assert.ok(result.missingFiles.includes('fraud_playbooks/'));
    } finally {
      if (fs.existsSync(tempEmptyDir)) {
        fs.rmdirSync(tempEmptyDir);
      }
    }
  });
});
