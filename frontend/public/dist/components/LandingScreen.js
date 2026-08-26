export function renderLandingScreen() {
    return `
    <main class="landing-hero container" role="main">
      <div class="hero-alert">
        <div class="hero-alert-icon">⏱️</div>
        <div class="hero-alert-body">
          <h2>The "Golden Hour" of Cyber Fraud Response</h2>
          <p>
            When financial cyber fraud strikes, citizens often lose critical time to panic, scattered instructions, and uncertainty over what to do first.
            <strong>GoldenHour</strong> reimagines the citizen first-response into one guided emergency workflow — calculating urgency, prioritizing immediate actions, and preparing structured reporting artifacts for India's official public-service ecosystem.
          </p>
        </div>
      </div>

      <div class="action-card-grid">
        <div class="action-card primary-card">
          <div class="card-tag">Citizen Triage</div>
          <h3>Report an Active Incident</h3>
          <p>
            Quickly organize key incident details (UTR numbers, debited bank, suspect details) and generate verbal 1930 scripts and formal police complaint drafts in under 2 minutes.
          </p>
          <button id="btn-start-intake" class="btn btn-primary btn-large">
            <span>🚨 Start Emergency Intake</span>
          </button>
        </div>

        <div class="action-card demo-card">
          <div class="card-tag">Evaluation / Judge Fast-Path</div>
          <h3>Simulated Incident (Judge Demo)</h3>
          <p>
            Instantly load a realistic synthetic UPI scam scenario (Electricity Bill Scam, Rs. 45,000 lost) to review the complete GoldenHour response, urgency assessment, and generated artifacts in 5 seconds.
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

      <!-- Public Service Reimagination Comparison -->
      <section class="reimagined-section" aria-label="Public-Service Reimagination">
        <div class="section-title-wrap">
          <h4>Reimagining the Citizen Response Experience</h4>
          <p class="section-subtitle">Comparing the current first-response friction with GoldenHour's guided emergency workflow</p>
        </div>

        <div class="comparison-grid">
          <div class="comparison-card pain-points-card">
            <div class="comparison-header">
              <span class="comp-icon">⚠️</span>
              <h5>Today's Citizen Friction</h5>
            </div>
            <ul class="comp-list">
              <li><span class="cross">✕</span> Disorientation & panic in the first critical minutes</li>
              <li><span class="cross">✕</span> Searching across disconnected websites and helpline numbers</li>
              <li><span class="cross">✕</span> Uncertainty over which details (UTRs, timestamps) authorities need</li>
              <li><span class="cross">✕</span> Struggle to articulate facts clearly during fast-paced 1930 / bank calls</li>
              <li><span class="cross">✕</span> Repetitive manual typing across multiple bank and police complaint forms</li>
            </ul>
          </div>

          <div class="comparison-card solution-card">
            <div class="comparison-header">
              <span class="comp-icon">⚡</span>
              <h5>GoldenHour's Reimagined Journey</h5>
            </div>
            <ul class="comp-list">
              <li><span class="check">✓</span> <strong>Instant Urgency Triage</strong>: Computes Golden Hour (<120m) freeze window</li>
              <li><span class="check">✓</span> <strong>Tailored Guidance</strong>: Action checklist specific to fraud category</li>
              <li><span class="check">✓</span> <strong>1930 Call Script</strong>: Ready-to-read verbal script with UTRs and amounts</li>
              <li><span class="check">✓</span> <strong>Formal FIR Complaint</strong>: Pre-formatted markdown draft citing IT Act 66C/66D</li>
              <li><span class="check">✓</span> <strong>NCRP Reference</strong>: Structured JSON payload mapped to official cybercrime portal</li>
            </ul>
          </div>
        </div>
      </section>

      <!-- Official Public-Service Ecosystem -->
      <section class="ecosystem-section" aria-label="Official Public-Service Ecosystem">
        <div class="section-title-wrap">
          <h4>Designed Around India's Official Reporting Channels</h4>
          <p class="section-subtitle">GoldenHour prepares and guides the citizen. Official reports are submitted directly to authorized agencies:</p>
        </div>

        <div class="ecosystem-grid">
          <div class="ecosystem-card">
            <div class="eco-badge">1930 Helpline</div>
            <strong>MHA / I4C National Helpline</strong>
            <p>Immediate financial cyber fraud reporting & inter-bank freeze via CFCFRMS.</p>
          </div>
          <div class="ecosystem-card">
            <div class="eco-badge">cybercrime.gov.in</div>
            <strong>National Cybercrime Portal</strong>
            <p>Standardized national reporting for cyber financial fraud and cybercrimes.</p>
          </div>
          <div class="ecosystem-card">
            <div class="eco-badge">Bank / Payment App</div>
            <strong>RBI Zero Liability Window</strong>
            <p>Immediate account lock, card hotlisting, and dispute filing under RBI guidelines.</p>
          </div>
          <div class="ecosystem-card">
            <div class="eco-badge">Police Station</div>
            <strong>Jurisdictional Police FIR</strong>
            <p>Formal complaint registration under IT Act Sections 66C (Identity Theft) & 66D.</p>
          </div>
        </div>
      </section>

      <!-- How It Works -->
      <section class="how-it-works" aria-label="How GoldenHour Works">
        <div class="section-title-wrap">
          <h4>How GoldenHour Operates</h4>
        </div>
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

      <div class="prototype-disclosure-box">
        <p>
          <small>
            🛡️ <strong>Public-Service Prototype Notice:</strong> GoldenHour is an independent emergency triage and artifact preparation assistant. It does not directly freeze accounts or submit filings automatically. Citizens submit the prepared materials through official government and banking channels.
          </small>
        </p>
      </div>
    </main>
  `;
}
