import {
  IncidentState,
  GoldenHourAssessment,
  IncidentGuidance,
  GeneratedArtifacts,
  IncidentIntakePayload,
} from '../types.js';
import { api, ApiError } from '../api/index.js';

export type AppStep = 'LANDING' | 'INTAKE' | 'RESULTS';

export interface IncidentContextState {
  step: AppStep;
  incident: IncidentState | null;
  goldenHour: GoldenHourAssessment | null;
  guidance: IncidentGuidance | null;
  artifacts: GeneratedArtifacts | null;
  loading: boolean;
  error: string | null;
  isDemo: boolean;
}

export type Listener = (state: IncidentContextState) => void;

export class IncidentStore {
  private state: IncidentContextState = {
    step: 'LANDING',
    incident: null,
    goldenHour: null,
    guidance: null,
    artifacts: null,
    loading: false,
    error: null,
    isDemo: false,
  };

  private listeners: Set<Listener> = new Set();

  public getState(): IncidentContextState {
    return this.state;
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  private setState(partial: Partial<IncidentContextState>): void {
    this.state = { ...this.state, ...partial };
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }

  public setStep(step: AppStep): void {
    this.setState({ step, error: null });
  }

  public clearError(): void {
    this.setState({ error: null });
  }

  public async fetchActiveIncident(): Promise<void> {
    this.setState({ loading: true, error: null });
    try {
      const current = await api.getCurrentIncident();
      if (current && current.incident && current.incident.totalAmountLost > 0) {
        const [guidanceRes, artifactsRes] = await Promise.all([
          api.getGuidance(),
          api.getArtifacts(),
        ]);
        this.setState({
          incident: current.incident,
          goldenHour: current.goldenHour,
          guidance: guidanceRes.guidance,
          artifacts: artifactsRes.artifacts,
          step: 'RESULTS',
          loading: false,
        });
      } else {
        this.setState({
          incident: current.incident,
          goldenHour: current.goldenHour,
          loading: false,
        });
      }
    } catch (err: any) {
      this.setState({ loading: false, error: err.message || 'Failed to fetch incident status' });
    }
  }

  public async submitIntake(payload: IncidentIntakePayload, isDemo = false): Promise<void> {
    this.setState({ loading: true, error: null, isDemo });
    try {
      const intakeRes = await api.submitIntake(payload);
      const [guidanceRes, artifactsRes] = await Promise.all([
        api.getGuidance(),
        api.getArtifacts(),
      ]);

      this.setState({
        incident: intakeRes.incident,
        goldenHour: intakeRes.goldenHour,
        guidance: guidanceRes.guidance,
        artifacts: artifactsRes.artifacts,
        step: 'RESULTS',
        loading: false,
        isDemo,
      });
    } catch (err: any) {
      const message =
        err instanceof ApiError && err.details?.issues
          ? `Validation Error: ${err.details.issues.map((i: any) => `${i.path}: ${i.message}`).join(', ')}`
          : err.message || 'Submission failed';

      this.setState({ loading: false, error: message });
      throw err;
    }
  }

  public async loadDemoScenario(): Promise<void> {
    const fortyFiveMinsAgo = new Date(Date.now() - 45 * 60 * 1000).toISOString();

    const demoPayload: IncidentIntakePayload = {
      fraudType: 'upi_scam',
      incidentOccurredAt: fortyFiveMinsAgo,
      description:
        'Victim received an urgent SMS claiming power disconnection for unpaid electricity bill. Called number provided, and was tricked into accepting a UPI collect request on PhonePe.',
      victim: {
        name: 'Pooja Varma',
        phone: '9845012345',
        stateOrCity: 'Maharashtra',
        district: 'Mumbai Suburban',
        policeStationJurisdiction: 'Bandra Cyber Police Station',
      },
      transactions: [
        {
          transactionRef: 'UPI/409812739182',
          amount: 45000,
          currency: 'INR',
          debitedBankOrApp: 'HDFC Bank / PhonePe',
          debitedAccountNumberOrVpa: 'pooja.varma@okhdfcbank',
          beneficiaryDetails: 'electricity.desk@icici',
          timestamp: fortyFiveMinsAgo,
        },
      ],
      suspect: {
        phoneNumbers: ['9819922334'],
        upiIds: ['electricity.desk@icici'],
        additionalNotes: 'Impersonated official power board billing officer on phone call.',
      },
      completedEmergencySteps: ['Called Bank Customer Care to report unauthorized debit'],
    };

    await this.submitIntake(demoPayload, true);
  }

  public async reset(): Promise<void> {
    this.setState({ loading: true, error: null });
    try {
      await api.resetIncident();
      this.setState({
        step: 'LANDING',
        incident: null,
        goldenHour: null,
        guidance: null,
        artifacts: null,
        loading: false,
        error: null,
        isDemo: false,
      });
    } catch (err: any) {
      this.setState({ loading: false, error: err.message || 'Failed to reset session' });
    }
  }
}

export const store = new IncidentStore();
