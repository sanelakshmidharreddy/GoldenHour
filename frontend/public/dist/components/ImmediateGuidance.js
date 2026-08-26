export function renderImmediateGuidance(guidance) {
    if (!guidance) {
        return '';
    }
    const { immediateActions, recommendedHelplines, evidenceToCollect } = guidance;
    return `
    <section class="guidance-section" aria-label="Prioritized Emergency Actions">
      <div class="guidance-grid">
        <!-- Checklist Column -->
        <div class="guidance-card actions-card">
          <div class="card-header">
            <span class="card-icon">⚡</span>
            <h4>Prioritized Immediate Actions</h4>
          </div>
          <ol class="action-steps-list">
            ${immediateActions
        .map((step, i) => `
              <li class="action-step-item">
                <span class="step-badge">${i + 1}</span>
                <div class="step-text">${step}</div>
              </li>
            `)
        .join('')}
          </ol>
        </div>

        <!-- Helplines & Evidence Column -->
        <div class="guidance-side-column">
          <div class="guidance-card helplines-card">
            <div class="card-header">
              <span class="card-icon">📞</span>
              <h4>Official Emergency Helplines</h4>
            </div>
            <div class="helpline-list">
              ${recommendedHelplines
        .map((h) => `
                <div class="helpline-item">
                  <div class="helpline-info">
                    <strong>${h.name}</strong>
                    <span class="helpline-desc">${h.description}</span>
                  </div>
                  <a href="${h.number.startsWith('http') ? h.number : `tel:${h.number}`}" class="helpline-dial-btn" target="_blank" rel="noopener">
                    ${h.number.startsWith('http') ? 'Visit Portal ↗' : `Call ${h.number}`}
                  </a>
                </div>
              `)
        .join('')}
            </div>
          </div>

          <div class="guidance-card evidence-card">
            <div class="card-header">
              <span class="card-icon">📸</span>
              <h4>Preserve This Evidence</h4>
            </div>
            <ul class="evidence-list">
              ${evidenceToCollect
        .map((item) => `
                <li>
                  <span class="bullet">✓</span>
                  <span>${item}</span>
                </li>
              `)
        .join('')}
            </ul>
          </div>
        </div>
      </div>
    </section>
  `;
}
