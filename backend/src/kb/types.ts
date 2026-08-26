/**
 * Type definitions for GoldenHour Knowledge Base schema.
 * Represents verified static facts (helplines, fraud playbooks, NCRP mappings, contacts, sources).
 */

export interface ContactRecord {
  id?: string;
  name?: string;
  category?: string;
  phone?: string;
  email?: string;
  website?: string;
  operatingHours?: string;
  description?: string;
  [key: string]: unknown;
}

export interface ExpectationRecord {
  authority?: string;
  requiredFields?: string[];
  recommendedEvidence?: string[];
  filingWindowHours?: number;
  notes?: string;
  [key: string]: unknown;
}

export interface NCRPMapping {
  categoryCode?: string;
  categoryName?: string;
  subCategory?: string;
  triggers?: string[];
  [key: string]: unknown;
}

export interface SourceRecord {
  id?: string;
  title?: string;
  authority?: string;
  url?: string;
  lastVerifiedDate?: string;
  [key: string]: unknown;
}

export interface FraudPlaybook {
  id?: string;
  name?: string;
  category?: string;
  urgencyLevel?: 'critical' | 'high' | 'medium' | 'low' | string;
  initialActionChecklist?: string[];
  evidenceRequired?: string[];
  helplineToCall?: string;
  ncrpCategory?: string;
  firDraftTemplate?: string;
  summary?: string;
  rules?: string[];
  source?: string;
  sourceUrl?: string;
  sourceTitle?: string;
  authority?: string;
  verifiedAt?: string;
  [key: string]: unknown;
}

export interface KnowledgeBaseMetadata {
  version?: string;
  lastUpdated?: string;
  description?: string;
  [key: string]: unknown;
}

export interface KnowledgeBaseData {
  contacts: Record<string, ContactRecord> | ContactRecord[];
  expectations: Record<string, ExpectationRecord> | ExpectationRecord[];
  ncrpMapping: Record<string, NCRPMapping> | NCRPMapping[];
  sources: Record<string, SourceRecord> | SourceRecord[];
  kbMeta: KnowledgeBaseMetadata;
  playbooks: Record<string, FraudPlaybook>;
}

export interface KnowledgeBaseLoadResult {
  data: KnowledgeBaseData;
  isLoaded: boolean;
  baseDir: string;
  loadedFiles: string[];
  missingFiles: string[];
  warnings: string[];
}
