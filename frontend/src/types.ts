export type FraudType =
  | 'upi_scam'
  | 'otp_fraud'
  | 'phishing'
  | 'fake_loan_app'
  | 'investment_scam'
  | 'sim_swap'
  | 'unknown';

export type UrgencyWindow = 'GOLDEN_HOUR' | 'CRITICAL_24H' | 'EXTENDED';

export interface FinancialTransaction {
  id?: string;
  transactionRef?: string;
  amount: number;
  currency?: string;
  debitedBankOrApp?: string;
  debitedAccountNumberOrVpa?: string;
  beneficiaryDetails?: string;
  timestamp?: string;
}

export interface SuspectInfo {
  phoneNumbers?: string[];
  emailAddresses?: string[];
  upiIds?: string[];
  bankAccounts?: string[];
  urlsOrWebsites?: string[];
  appNames?: string[];
  socialMediaHandles?: string[];
  additionalNotes?: string;
}

export interface VictimInfo {
  name?: string;
  phone?: string;
  email?: string;
  stateOrCity?: string;
  district?: string;
  policeStationJurisdiction?: string;
}

export interface IncidentState {
  id: string;
  createdAt: string;
  updatedAt: string;
  fraudType: FraudType;
  incidentOccurredAt: string;
  incidentDiscoveredAt?: string;
  description: string;
  victim: VictimInfo;
  transactions: FinancialTransaction[];
  totalAmountLost: number;
  suspect: SuspectInfo;
  completedEmergencySteps: string[];
}

export interface GoldenHourAssessment {
  urgencyWindow: UrgencyWindow;
  minutesElapsedSinceIncident: number;
  isWithinGoldenHour: boolean;
  urgencyLevel: 'HIGH_URGENCY' | 'MEDIUM_URGENCY' | 'STANDARD';
  freezeProbabilityDescription: string;
  recommendedImmediateAction: string;
}

export interface HelplineScript {
  title: string;
  targetHelplines: string[];
  scriptBullets: string[];
  quickReferenceData: Record<string, unknown>;
}

export interface NcrpPayloadReference {
  categoryCode: string;
  subCategoryCode: string;
  incidentDate: string;
  totalAmount: number;
  transactionDetails: FinancialTransaction[];
  suspectDetails: SuspectInfo;
  briefFacts: string;
}

export interface FirDraft {
  title: string;
  recipientAuthority: string;
  subject: string;
  bodyMarkdown: string;
  evidenceChecklist: string[];
}

export interface GeneratedArtifacts {
  incidentId: string;
  generatedAt: string;
  helplineCallScript: HelplineScript;
  ncrpPayloadReference: NcrpPayloadReference;
  firDraft: FirDraft;
}

export interface IncidentGuidance {
  fraudType: string;
  goldenHour: GoldenHourAssessment;
  playbook: any;
  immediateActions: string[];
  recommendedHelplines: Array<{ name: string; number: string; description: string }>;
  evidenceToCollect: string[];
}

export interface IncidentIntakePayload {
  fraudType: FraudType;
  incidentOccurredAt?: string;
  incidentDiscoveredAt?: string;
  description?: string;
  victim?: VictimInfo;
  transactions?: FinancialTransaction[];
  suspect?: SuspectInfo;
  completedEmergencySteps?: string[];
}
