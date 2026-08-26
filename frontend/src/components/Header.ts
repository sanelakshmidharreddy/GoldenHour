export function renderHeader(isDemo = false): string {
  return `
    <header class="emergency-header" role="banner">
      <div class="header-content container">
        <div class="brand">
          <div class="brand-badge">⚡ GOLDENHOUR</div>
          <span class="brand-tagline">Cyber Fraud First-Response & Triage</span>
        </div>

        <div class="header-actions">
          ${
            isDemo
              ? `<span class="badge badge-demo" title="Currently running a simulated fraud incident">DEMO SCENARIO (SYNTHETIC DATA)</span>`
              : `<span class="badge badge-live">LIVE SYSTEM</span>`
          }
          <a href="tel:1930" class="btn btn-emergency" aria-label="Call National Cyber Crime Helpline 1930">
            <span class="btn-icon">📞</span>
            <span>DIAL 1930</span>
          </a>
        </div>
      </div>
    </header>
  `;
}
