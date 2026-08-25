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
  transactionRef?: string; // UTR or Reference Number
  amount: number;
  currency?: string;
  debitedBankOrApp?: string;
  debitedAccountNumberOrVpa?: string;
  beneficiaryDetails?: string; // Suspect UPI handle / account
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
  isWithinGoldenHour: boolean; // < 120 minutes (2 hours)
  urgencyLevel: 'HIGH_URGENCY' | 'MEDIUM_URGENCY' | 'STANDARD';
  freezeProbabilityDescription: string;
  recommendedImmediateAction: string;
}

export interface GeneratedArtifacts {
  incidentId: string;
  generatedAt: string;
  helplineCallScript: {
    title: string;
    targetHelplines: string[];
    scriptBullets: string[];
    quickReferenceData: Record<string, unknown>;
  };
  ncrpPayloadReference: {
    categoryCode: string;
    subCategoryCode: string;
    incidentDate: string;
    totalAmount: number;
    transactionDetails: FinancialTransaction[];
    suspectDetails: SuspectInfo;
    briefFacts: string;
  };
  firDraft: {
    title: string;
    recipientAuthority: string;
    subject: string;
    bodyMarkdown: string;
    evidenceChecklist: string[];
  };
}
