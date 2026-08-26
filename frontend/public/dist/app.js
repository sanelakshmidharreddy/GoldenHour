import { store } from './context/index.js';
import { renderHeader, renderLandingScreen, renderIncidentForm, renderResultsScreen, renderFooter, } from './components/index.js';
export class App {
    constructor(container) {
        this.container = container;
        store.subscribe((state) => this.render(state));
    }
    init() {
        store.fetchActiveIncident();
    }
    render(state) {
        let mainContent = '';
        if (state.loading) {
            mainContent = `
        <main class="loading-wrapper container" role="main" aria-live="polite">
          <div class="spinner"></div>
          <p class="loading-text">Analyzing incident timing and generating emergency action plan...</p>
        </main>
      `;
        }
        else if (state.step === 'LANDING') {
            mainContent = renderLandingScreen();
        }
        else if (state.step === 'INTAKE') {
            mainContent = renderIncidentForm(state.error);
        }
        else if (state.step === 'RESULTS') {
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
    attachEventListeners(state) {
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
        const presetButtons = document.querySelectorAll('.btn-preset');
        presetButtons.forEach((btn) => {
            btn.addEventListener('click', () => {
                const mins = parseInt(btn.getAttribute('data-minutes') || '15', 10);
                const targetDate = new Date(Date.now() - mins * 60 * 1000);
                const timeInput = document.getElementById('incidentOccurredAt');
                if (timeInput) {
                    timeInput.value = targetDate.toISOString().slice(0, 16);
                }
            });
        });
        const incidentForm = document.getElementById('incident-form');
        if (incidentForm) {
            incidentForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = new FormData(incidentForm);
                const fraudType = formData.get('fraudType') || 'unknown';
                const amountRaw = formData.get('amount');
                const amount = parseFloat(amountRaw) || 0;
                const transactionRef = (formData.get('transactionRef') || '').trim();
                const debitedBankOrApp = (formData.get('debitedBankOrApp') || '').trim();
                const beneficiaryDetails = (formData.get('beneficiaryDetails') || '').trim();
                const occurredAtRaw = formData.get('incidentOccurredAt') || new Date().toISOString();
                const occurredAt = new Date(occurredAtRaw).toISOString();
                const suspectPhone = (formData.get('suspectPhone') || '').trim();
                const suspectUrlOrApp = (formData.get('suspectUrlOrApp') || '').trim();
                const description = (formData.get('description') || '').trim();
                const victimName = (formData.get('victimName') || '').trim();
                const victimPhone = (formData.get('victimPhone') || '').trim();
                const victimState = (formData.get('victimState') || '').trim();
                const policeStation = (formData.get('policeStation') || '').trim();
                const payload = {
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
                }
                catch {
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
        const tabButtons = document.querySelectorAll('[role="tab"]');
        tabButtons.forEach((tabBtn) => {
            tabBtn.addEventListener('click', () => {
                tabButtons.forEach((b) => {
                    b.classList.remove('active');
                    b.setAttribute('aria-selected', 'false');
                });
                const tabPanels = document.querySelectorAll('[role="tabpanel"]');
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
        const copyButtons = document.querySelectorAll('.btn-copy');
        copyButtons.forEach((copyBtn) => {
            copyBtn.addEventListener('click', async () => {
                const targetId = copyBtn.getAttribute('data-target');
                if (!targetId)
                    return;
                const targetEl = document.getElementById(targetId);
                if (!targetEl)
                    return;
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
                }
                catch {
                    alert('Unable to copy text automatically. Please select and copy manually.');
                }
            });
        });
        // 6. Download 1930 Script and FIR Draft as Text Files
        const btnDownloadScript = document.getElementById('btn-download-script');
        if (btnDownloadScript && state.artifacts?.helplineCallScript) {
            btnDownloadScript.addEventListener('click', () => {
                const script = state.artifacts.helplineCallScript;
                const textLines = [
                    `==================================================`,
                    `GOLDENHOUR — 1930 / BANK EMERGENCY CALL SCRIPT`,
                    `==================================================`,
                    `Generated: ${new Date().toLocaleString('en-IN')}`,
                    `Target Helplines: ${script.targetHelplines.join(' | ')}`,
                    ``,
                    `QUICK REFERENCE:`,
                    `- Total Loss: ${script.quickReferenceData.totalAmountLost}`,
                    `- Primary UTR / Ref: ${script.quickReferenceData.primaryTransactionRef}`,
                    `- Suspect Target: ${script.quickReferenceData.beneficiaryTarget}`,
                    `- Complainant: ${script.quickReferenceData.victimName}`,
                    ``,
                    `VERBAL SCRIPT TO READ TO OPERATOR:`,
                    ...script.scriptBullets.map((b, i) => `${i + 1}. "${b}"`),
                    ``,
                    `==================================================`,
                    `Notice: Prepared preparation template — Review before official submission.`,
                ].join('\n');
                const blob = new Blob([textLines], { type: 'text/plain;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `GoldenHour_1930_CallScript_${state.incident?.id.slice(0, 8) || 'Draft'}.txt`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            });
        }
        const btnDownloadFir = document.getElementById('btn-download-fir');
        if (btnDownloadFir && state.artifacts?.firDraft) {
            btnDownloadFir.addEventListener('click', () => {
                const content = state.artifacts.firDraft.bodyMarkdown;
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
