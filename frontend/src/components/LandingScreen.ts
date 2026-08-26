export function renderLandingScreen(): string {
  return `
    <main class="landing-hero container" role="main">
      <div class="hero-alert">
        <div class="hero-alert-icon">⏱️</div>
        <div class="hero-alert-body">
          <h2>The "Golden Hour" of Cyber Fraud</h2>
          <p>
            When financial cyber fraud occurs in India, reporting the incident to <strong>1930</strong> and your bank within the <strong>first 2 hours</strong> maximizes the probability of freezing stolen funds across intermediary bank accounts before money is withdrawn at ATMs or converted.
          </p>
        </div>
      </div>

      <div class="action-card-grid">
        <div class="action-card primary-card">
          <div class="card-tag">Citizen Triage</div>
          <h3>Report an Active Incident</h3>
          <p>
            Quickly organize key details (UTR numbers, debit bank, suspect details) and get instant verbal call scripts and police complaint drafts.
          </p>
          <button id="btn-start-intake" class="btn btn-primary btn-large">
            <span>🚨 Start Emergency Intake</span>
          </button>
        </div>

        <div class="action-card demo-card">
          <div class="card-tag">Evaluation / Judge Fast-Path</div>
          <h3>Simulated Incident (Judge Demo)</h3>
          <p>
            Instantly load a realistic synthetic UPI scam scenario (Electricity Bill Scam, Rs. 45,000 lost) to review the complete GoldenHour response, urgency assessment, and generated artifacts.
          </p>
          <button id="btn-load-demo" class="btn btn-secondary btn-large">
            <span>⚡ Load Judge Demo (UPI Scam)</span>
          </button>
        </div>
      </div>

      <div class="judge-hint-callout">
        <span class="icon">💡</span>
        <span><strong>Judges & Evaluators:</strong> Click <strong>"Load Judge Demo"</strong> to test the 2-hour Golden Hour calculation, 1930 emergency verbal script, and FIR complaint draft in under 5 seconds.</span>
      </div>

      <section class="how-it-works" aria-label="How GoldenHour Works">
        <h4>How GoldenHour Works</h4>
        <div class="steps-row">
          <div class="step-box">
            <span class="step-num">1</span>
            <strong>Rapid Intake</strong>
            <p>Capture critical transaction references and suspect identifiers in under 2 minutes.</p>
          </div>
          <div class="step-box">
            <span class="step-num">2</span>
            <strong>Golden Hour Triage</strong>
            <p>Assess urgency window and receive step-by-step verified emergency actions.</p>
          </div>
          <div class="step-box">
            <span class="step-num">3</span>
            <strong>Ready Artifacts</strong>
            <p>Get ready-to-read 1930 scripts, NCRP JSON payloads, and formal FIR complaint drafts.</p>
          </div>
        </div>
      </section>
    </main>
  `;
}
