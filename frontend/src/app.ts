import { store, IncidentContextState } from './context/index.js';
import {
  renderHeader,
  renderLandingScreen,
  renderIncidentForm,
  renderResultsScreen,
  renderFooter,
} from './components/index.js';
import { FraudType, IncidentIntakePayload } from './types.js';

export class App {
  private container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
    store.subscribe((state) => this.render(state));
  }

  public init(): void {
    store.fetchActiveIncident();
  }

  private render(state: IncidentContextState): void {
    let mainContent = '';

    if (state.loading) {
      mainContent = `
        <main class="loading-wrapper container" role="main" aria-live="polite">
          <div class="spinner"></div>
          <p class="loading-text">Analyzing incident timing and generating emergency action plan...</p>
        </main>
      `;
    } else if (state.step === 'LANDING') {
      mainContent = renderLandingScreen();
    } else if (state.step === 'INTAKE') {
      mainContent = renderIncidentForm(state.error);
    } else if (state.step === 'RESULTS') {
      mainContent = renderResultsScreen(state);
    }

    this.container.innerHTML = `
      <div class="app-layout">
        ${renderHeader(state.isDemo)}
        ${mainContent}
        ${renderFooter()}
      </div>
    `;

    this.attachEventListeners(state);
  }

  private attachEventListeners(state: IncidentContextState): void {
    // 1. Landing Screen Events
    const btnStartIntake = document.getElementById('btn-start-intake');
    if (btnStartIntake) {
      btnStartIntake.addEventListener('click', () => store.setStep('INTAKE'));
    }

    const btnLoadDemo = document.getElementById('btn-load-demo');
    if (btnLoadDemo) {
      btnLoadDemo.addEventListener('click', () => store.loadDemoScenario());
    }

    // 2. Intake Form Events
    const btnBackHome = document.getElementById('btn-back-home');
    if (btnBackHome) {
      btnBackHome.addEventListener('click', () => store.setStep('LANDING'));
    }

    const presetButtons = document.querySelectorAll<HTMLButtonElement>('.btn-preset');
    presetButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const mins = parseInt(btn.getAttribute('data-minutes') || '15', 10);
        const targetDate = new Date(Date.now() - mins * 60 * 1000);
        const timeInput = document.getElementById('incidentOccurredAt') as HTMLInputElement;
        if (timeInput) {
          timeInput.value = targetDate.toISOString().slice(0, 16);
        }
      });
    });

    const incidentForm = document.getElementById('incident-form') as HTMLFormElement;
    if (incidentForm) {
      incidentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(incidentForm);

        const fraudType = (formData.get('fraudType') as FraudType) || 'unknown';
        const amountRaw = formData.get('amount') as string;
        const amount = parseFloat(amountRaw) || 0;
        const transactionRef = ((formData.get('transactionRef') as string) || '').trim();
        const debitedBankOrApp = ((formData.get('debitedBankOrApp') as string) || '').trim();
        const beneficiaryDetails = ((formData.get('beneficiaryDetails') as string) || '').trim();
        const occurredAtRaw = (formData.get('incidentOccurredAt') as string) || new Date().toISOString();
        const occurredAt = new Date(occurredAtRaw).toISOString();

        const suspectPhone = ((formData.get('suspectPhone') as string) || '').trim();
        const suspectUrlOrApp = ((formData.get('suspectUrlOrApp') as string) || '').trim();
        const description = ((formData.get('description') as string) || '').trim();

        const victimName = ((formData.get('victimName') as string) || '').trim();
        const victimPhone = ((formData.get('victimPhone') as string) || '').trim();
        const victimState = ((formData.get('victimState') as string) || '').trim();
        const policeStation = ((formData.get('policeStation') as string) || '').trim();

        const payload: IncidentIntakePayload = {
          fraudType,
          incidentOccurredAt: occurredAt,
          description,
          victim: {
            name: victimName,
            phone: victimPhone,
            stateOrCity: victimState,
            policeStationJurisdiction: policeStation,
          },
          transactions: [
            {
              amount,
              transactionRef,
              debitedBankOrApp,
              beneficiaryDetails,
              timestamp: occurredAt,
            },
          ],
          suspect: {
            phoneNumbers: suspectPhone ? [suspectPhone] : [],
            urlsOrWebsites: suspectUrlOrApp && suspectUrlOrApp.startsWith('http') ? [suspectUrlOrApp] : [],
            appNames: suspectUrlOrApp && !suspectUrlOrApp.startsWith('http') ? [suspectUrlOrApp] : [],
          },
          completedEmergencySteps: ['Reported on GoldenHour citizen portal'],
        };

        try {
          await store.submitIntake(payload, false);
        } catch {
          // Error is handled in store state
        }
      });
    }

    // 3. Results Screen Events
    const btnEdit = document.getElementById('btn-edit-intake');
    if (btnEdit) {
      btnEdit.addEventListener('click', () => store.setStep('INTAKE'));
    }

    const btnReset = document.getElementById('btn-reset-session');
    if (btnReset) {
      btnReset.addEventListener('click', () => store.reset());
    }

    // 4. Tab Navigation in Artifacts
    const tabButtons = document.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    tabButtons.forEach((tabBtn) => {
      tabBtn.addEventListener('click', () => {
        tabButtons.forEach((b) => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        const tabPanels = document.querySelectorAll<HTMLElement>('[role="tabpanel"]');
        tabPanels.forEach((p) => {
          p.classList.remove('active');
          p.hidden = true;
        });

        tabBtn.classList.add('active');
        tabBtn.setAttribute('aria-selected', 'true');
        const targetPanelId = tabBtn.getAttribute('aria-controls');
        if (targetPanelId) {
          const targetPanel = document.getElementById(targetPanelId);
          if (targetPanel) {
            targetPanel.classList.add('active');
            targetPanel.hidden = false;
          }
        }
      });
    });

    // 5. Copy to Clipboard Buttons
    const copyButtons = document.querySelectorAll<HTMLButtonElement>('.btn-copy');
    copyButtons.forEach((copyBtn) => {
      copyBtn.addEventListener('click', async () => {
        const targetId = copyBtn.getAttribute('data-target');
        if (!targetId) return;

        const targetEl = document.getElementById(targetId);
        if (!targetEl) return;

        const textToCopy = targetEl.innerText || targetEl.textContent || '';
        try {
          await navigator.clipboard.writeText(textToCopy);
          const originalHtml = copyBtn.innerHTML;
          copyBtn.innerHTML = '<span>✓ Copied!</span>';
          copyBtn.classList.add('copied');
          setTimeout(() => {
            copyBtn.innerHTML = originalHtml;
            copyBtn.classList.remove('copied');
          }, 2000);
        } catch {
          alert('Unable to copy text automatically. Please select and copy manually.');
        }
      });
    });

    // 6. Download FIR Draft as Text File
    const btnDownloadFir = document.getElementById('btn-download-fir');
    if (btnDownloadFir && state.artifacts?.firDraft) {
      btnDownloadFir.addEventListener('click', () => {
        const content = state.artifacts!.firDraft.bodyMarkdown;
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `GoldenHour_FIR_Complaint_${state.incident?.id.slice(0, 8) || 'Draft'}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      });
    }
  }
}

// Auto-boot if running in browser
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    const appEl = document.getElementById('app');
    if (appEl) {
      const app = new App(appEl);
      app.init();
    }
  });
}
