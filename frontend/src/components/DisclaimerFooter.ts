export function renderFooter(): string {
  return `
    <footer class="app-footer" role="contentinfo">
      <div class="container footer-content">
        <div class="footer-notice">
          <strong>Important Citizen Notice & Disclaimers:</strong>
          <p>
            GoldenHour is an independent open-source triage and emergency intake tool designed to help victims organize information quickly in the critical first minutes of cyber fraud.
          </p>
          <ul>
            <li>GoldenHour is <strong>not</strong> a government agency and cannot directly freeze bank accounts or guarantee fund recovery.</li>
            <li>Generated FIR drafts and call scripts are structured reference templates and must be verified by the complainant before submission to police authorities.</li>
            <li>Always dial <strong>1930</strong> and file official complaints on <a href="https://cybercrime.gov.in" target="_blank" rel="noopener">cybercrime.gov.in</a>.</li>
          </ul>
        </div>
        <div class="footer-meta">
          <span>GoldenHour • India Cyber Fraud Rapid Response Triage</span>
        </div>
      </div>
    </footer>
  `;
}
