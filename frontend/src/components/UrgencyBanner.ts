import { GoldenHourAssessment } from '../types.js';

export function renderUrgencyBanner(goldenHour: GoldenHourAssessment | null): string {
  if (!goldenHour) {
    return '';
  }

  const { urgencyWindow, minutesElapsedSinceIncident, freezeProbabilityDescription, recommendedImmediateAction } = goldenHour;

  const isGoldenHour = urgencyWindow === 'GOLDEN_HOUR';
  const bannerClass = isGoldenHour
    ? 'urgency-banner banner-golden-hour'
    : urgencyWindow === 'CRITICAL_24H'
    ? 'urgency-banner banner-24h'
    : 'urgency-banner banner-extended';

  const title = isGoldenHour
    ? '🚨 CRITICAL GOLDEN HOUR WINDOW ACTIVE'
    : urgencyWindow === 'CRITICAL_24H'
    ? '⚡ URGENT 24-HOUR INTERVENTION WINDOW'
    : '📋 EXTENDED RECOVERY & COMPLAINT WINDOW';

  return `
    <section class="${bannerClass}" role="region" aria-label="Incident Urgency Assessment">
      <div class="urgency-header-row">
        <div class="urgency-title-group">
          <span class="urgency-icon">${isGoldenHour ? '⏱️' : '⚠️'}</span>
          <h3>${title}</h3>
        </div>
        <div class="urgency-time-badge">
          <span>Incident reported approx. <strong>${minutesElapsedSinceIncident} min</strong> ago</span>
        </div>
      </div>

      <div class="urgency-details">
        <p class="urgency-prob"><strong>Freeze Window Assessment:</strong> ${freezeProbabilityDescription}</p>
        <div class="urgency-action-box">
          <span class="action-label">IMMEDIATE MANDATORY ACTION:</span>
          <strong>${recommendedImmediateAction}</strong>
        </div>
        <p class="urgency-disclaimer-note">
          <small><em>* Operational triage heuristic based on 1930 / CFCFRMS inter-bank response windows. Not a government classification or freeze guarantee.</em></small>
        </p>
      </div>
    </section>
  `;
}
