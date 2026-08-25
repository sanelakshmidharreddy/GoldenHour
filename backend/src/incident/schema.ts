import { z } from 'zod';

export const FraudTypeEnum = z.enum([
  'upi_scam',
  'otp_fraud',
  'phishing',
  'fake_loan_app',
  'investment_scam',
  'sim_swap',
  'unknown',
]);

export const FinancialTransactionSchema = z.object({
  id: z.string().optional(),
  transactionRef: z.string().trim().optional(),
  amount: z.number().min(0, 'Amount must be non-negative'),
  currency: z.string().default('INR'),
  debitedBankOrApp: z.string().trim().optional(),
  debitedAccountNumberOrVpa: z.string().trim().optional(),
  beneficiaryDetails: z.string().trim().optional(),
  timestamp: z.string().datetime({ offset: true }).optional().or(z.string().datetime()).or(z.string().optional()),
});

export const VictimInfoSchema = z.object({
  name: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  email: z.string().email().optional().or(z.literal('')),
  stateOrCity: z.string().trim().optional(),
  district: z.string().trim().optional(),
  policeStationJurisdiction: z.string().trim().optional(),
});

export const SuspectInfoSchema = z.object({
  phoneNumbers: z.array(z.string().trim()).optional().default([]),
  emailAddresses: z.array(z.string().trim()).optional().default([]),
  upiIds: z.array(z.string().trim()).optional().default([]),
  bankAccounts: z.array(z.string().trim()).optional().default([]),
  urlsOrWebsites: z.array(z.string().trim()).optional().default([]),
  appNames: z.array(z.string().trim()).optional().default([]),
  socialMediaHandles: z.array(z.string().trim()).optional().default([]),
  additionalNotes: z.string().trim().optional(),
});

export const IncidentIntakeSchema = z.object({
  fraudType: FraudTypeEnum.default('unknown'),
  incidentOccurredAt: z.string().optional(),
  incidentDiscoveredAt: z.string().optional(),
  description: z.string().trim().default(''),
  victim: VictimInfoSchema.optional().default({}),
  transactions: z.array(FinancialTransactionSchema).optional().default([]),
  suspect: SuspectInfoSchema.optional().default({}),
  completedEmergencySteps: z.array(z.string().trim()).optional().default([]),
});

export type IncidentIntakeInput = z.infer<typeof IncidentIntakeSchema>;
