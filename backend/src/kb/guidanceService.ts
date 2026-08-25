import { config } from '../config';
import { loadKnowledgeBase } from './loader';
import { KnowledgeBaseData, FraudPlaybook, ContactRecord } from './types';
import { IncidentState, GoldenHourAssessment } from '../incident/types';
import { incidentService } from '../incident/incidentService';

export interface IncidentGuidance {
  fraudType: string;
  goldenHour: GoldenHourAssessment;
  playbook: FraudPlaybook | null;
  immediateActions: string[];
  recommendedHelplines: Array<{ name: string; number: string; description: string }>;
  evidenceToCollect: string[];
}

export class GuidanceService {
  private kbData: KnowledgeBaseData;

  constructor() {
    const result = loadKnowledgeBase(config.knowledgeBaseDir);
    this.kbData = result.data;
  }

  public reloadKnowledgeBase(): void {
    const result = loadKnowledgeBase(config.knowledgeBaseDir);
    this.kbData = result.data;
  }

  public getKnowledgeBaseData(): KnowledgeBaseData {
    return this.kbData;
  }

  public getPlaybooks(): Record<string, FraudPlaybook> {
    return this.kbData.playbooks;
  }

  public getPlaybook(playbookId: string): FraudPlaybook | null {
    return this.kbData.playbooks[playbookId] || null;
  }

  public getContacts(): Record<string, ContactRecord> | ContactRecord[] {
    return this.kbData.contacts;
  }

  public getGuidanceForIncident(incident: IncidentState): IncidentGuidance {
    const goldenHour = incidentService.assessGoldenHour(incident);
    const playbook = this.getPlaybook(incident.fraudType);

    // Verified default baseline emergency actions
    const defaultEmergencyActions = [
      'Immediately dial 1930 (National Cyber Crime Helpline) to report transaction details for rapid inter-bank freeze.',
      'Note down the exact 12-digit UTR (Unique Transaction Reference) number or Txn ID from your SMS/bank alert.',
      'Call your debited bank customer care to report unauthorized debit and request a hotlisting / freeze on netbanking/UPI.',
      'Take clear screenshots of transaction debit messages, UPI app transaction history, and suspect chat history.',
      'Do not click any further links or share any subsequent SMS/OTP codes sent to your phone.',
    ];

    // Standard verified helplines for cyber fraud in India
    const recommendedHelplines = [
      {
        name: 'National Cyber Crime Helpline',
        number: '1930',
        description: 'Toll-free national citizen helpline for immediate reporting and fund freezing.',
      },
      {
        name: 'NCRP Web Portal',
        number: 'cybercrime.gov.in',
        description: 'Official Ministry of Home Affairs portal for lodging cyber crime complaints.',
      },
      {
        name: 'Emergency Response Support System',
        number: '112',
        description: 'All-India emergency number for immediate police assistance.',
      },
    ];

    const immediateActions =
      playbook?.initialActionChecklist && playbook.initialActionChecklist.length > 0
        ? playbook.initialActionChecklist
        : defaultEmergencyActions;

    const evidenceToCollect =
      playbook?.evidenceRequired && playbook.evidenceRequired.length > 0
        ? playbook.evidenceRequired
        : [
            'Transaction SMS and email alerts with timestamp and amount',
            'Bank account statement / passbook copy showing debited amount',
            'Screenshot of UPI app transaction screen showing UTR / reference number',
            'Suspect phone number, UPI handle, or website link',
            'Screenshots of WhatsApp / Telegram / SMS conversation with suspect',
          ];

    return {
      fraudType: incident.fraudType,
      goldenHour,
      playbook,
      immediateActions,
      recommendedHelplines,
      evidenceToCollect,
    };
  }
}

export const guidanceService = new GuidanceService();
