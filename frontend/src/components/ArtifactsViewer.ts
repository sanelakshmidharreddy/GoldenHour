import { GeneratedArtifacts } from '../types.js';

export function renderArtifactsViewer(artifacts: GeneratedArtifacts | null): string {
  if (!artifacts) {
    return '';
  }

  const { helplineCallScript, ncrpPayloadReference, firDraft } = artifacts;

  return `
    <section class="artifacts-section" aria-label="Generated Response Artifacts">
      <div class="section-header-row">
        <div>
          <h3>Generated Response Artifacts</h3>
          <p class="section-subtitle">
            Pre-formatted, verified text drafts and payload references ready to read on calls or submit to cyber portals.
          </p>
        </div>
      </div>

      <div class="tabs-container" role="tablist">
        <button role="tab" class="tab-btn active" id="tab-btn-script" aria-selected="true" aria-controls="tab-script">
          📞 1930 Call Script
        </button>
        <button role="tab" class="tab-btn" id="tab-btn-fir" aria-selected="false" aria-controls="tab-fir">
          📄 Formal FIR / Police Complaint
        </button>
        <button role="tab" class="tab-btn" id="tab-btn-ncrp" aria-selected="false" aria-controls="tab-ncrp">
          📋 NCRP Portal Reference
        </button>
      </div>

      <!-- Tab 1: 1930 Call Script -->
      <div class="tab-panel active" id="tab-script" role="tabpanel" aria-labelledby="tab-btn-script">
        <div class="artifact-card">
          <div class="artifact-card-header">
            <div>
              <h4>${helplineCallScript.title}</h4>
              <span class="artifact-badge badge-real">Ready for verbal reporting to 1930 operator</span>
            </div>
            <button class="btn btn-outline btn-copy" data-target="script-content">
              <span>📋 Copy Script</span>
            </button>
          </div>

          <div class="script-box" id="script-content">
            <p class="script-intro"><em>Read these points directly to the 1930 helpline / bank executive:</em></p>
            <ul class="script-bullets">
              ${helplineCallScript.scriptBullets
                .map((b) => `<li><span class="quote">“</span>${escapeHtml(b)}<span class="quote">”</span></li>`)
                .join('')}
            </ul>

            <div class="quick-ref-table">
              <strong>Quick Reference for Operator Questions:</strong>
              <div class="ref-grid">
                <div><span>Total Loss:</span> <strong>${helplineCallScript.quickReferenceData.totalAmountLost}</strong></div>
                <div><span>Primary UTR / Ref:</span> <code>${helplineCallScript.quickReferenceData.primaryTransactionRef}</code></div>
                <div><span>Suspect Target:</span> <code>${helplineCallScript.quickReferenceData.beneficiaryTarget}</code></div>
                <div><span>Complainant:</span> <strong>${helplineCallScript.quickReferenceData.victimName}</strong></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab 2: Formal FIR Draft -->
      <div class="tab-panel" id="tab-fir" role="tabpanel" aria-labelledby="tab-btn-fir" hidden>
        <div class="artifact-card">
          <div class="artifact-card-header">
            <div>
              <h4>${firDraft.title}</h4>
              <span class="artifact-badge badge-draft">Draft Template — Review before submitting to Police</span>
            </div>
            <div class="artifact-actions">
              <button class="btn btn-outline btn-copy" data-target="fir-content">
                <span>📋 Copy Complaint Draft</span>
              </button>
              <button class="btn btn-outline" id="btn-download-fir">
                <span>💾 Download as .txt</span>
              </button>
            </div>
          </div>

          <div class="disclaimer-callout">
            <span class="icon">ℹ️</span>
            <span><strong>Notice:</strong> This draft is prepared for submission to the Station House Officer (SHO) of your local Cyber Crime Police Station. Verify and sign before handing over physically or emailing.</span>
          </div>

          <pre class="fir-preview" id="fir-content">${escapeHtml(firDraft.bodyMarkdown)}</pre>
        </div>
      </div>

      <!-- Tab 3: NCRP Reference -->
      <div class="tab-panel" id="tab-ncrp" role="tabpanel" aria-labelledby="tab-btn-ncrp" hidden>
        <div class="artifact-card">
          <div class="artifact-card-header">
            <div>
              <h4>National Cybercrime Reporting Portal (cybercrime.gov.in) Reference</h4>
              <span class="artifact-badge badge-ref">Reference format for online filing</span>
            </div>
            <button class="btn btn-outline btn-copy" data-target="ncrp-content">
              <span>📋 Copy JSON Payload</span>
            </button>
          </div>

          <div class="ncrp-summary-box">
            <div class="ncrp-meta-grid">
              <div><span>Recommended Category:</span> <strong>${ncrpPayloadReference.categoryCode}</strong></div>
              <div><span>Recommended Sub-Category:</span> <strong>${ncrpPayloadReference.subCategoryCode}</strong></div>
              <div><span>Incident Date/Time:</span> <code>${ncrpPayloadReference.incidentDate}</code></div>
              <div><span>Total Amount:</span> <strong>Rs. ${ncrpPayloadReference.totalAmount.toLocaleString('en-IN')}</strong></div>
            </div>
          </div>

          <pre class="code-preview" id="ncrp-content">${escapeHtml(JSON.stringify(ncrpPayloadReference, null, 2))}</pre>
        </div>
      </div>
    </section>
  `;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
