import { renderUrgencyBanner } from './UrgencyBanner.js';
import { renderImmediateGuidance } from './ImmediateGuidance.js';
import { renderArtifactsViewer } from './ArtifactsViewer.js';
export function renderResultsScreen(state) {
    const { incident, goldenHour, guidance, artifacts, isDemo } = state;
    return `
    <main class="results-container container" role="main">
      <div class="results-top-bar">
        <div class="results-title-group">
          <h2>Emergency Response Plan & Drafts</h2>
          <p class="subtitle">Generated specifically for your reported incident.</p>
        </div>

        <div class="results-top-actions">
          <button id="btn-edit-intake" class="btn btn-outline">
            <span>✏️ Edit Incident Details</span>
          </button>
          <button id="btn-reset-session" class="btn btn-secondary">
            <span>🔄 Start New Report</span>
          </button>
        </div>
      </div>

      ${isDemo
        ? `
        <div class="demo-banner" role="status">
          <span class="badge badge-demo">DEMO SCENARIO</span>
          <span>You are viewing a simulated UPI electricity bill fraud scenario. Use <strong>Start New Report</strong> to report a real incident.</span>
        </div>
      `
        : ''}

      <!-- 1. Urgency Banner -->
      ${renderUrgencyBanner(goldenHour)}

      <!-- 2. Immediate Guidance & Helplines -->
      ${renderImmediateGuidance(guidance)}

      <!-- 3. Generated Artifacts (1930 Call Script, FIR Draft, NCRP) -->
      ${renderArtifactsViewer(artifacts)}
    </main>
  `;
}
