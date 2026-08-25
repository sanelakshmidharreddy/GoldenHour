import crypto from 'crypto';
import { IncidentState, GoldenHourAssessment, GeneratedArtifacts } from './types';
import { IncidentIntakeInput } from './schema';
import { generateArtifacts } from './artifactGenerator';

export class IncidentService {
  private incidentStore = new Map<string, IncidentState>();

  public getOrCreateIncident(sessionId: string): IncidentState {
    const existing = this.incidentStore.get(sessionId);
    if (existing) {
      return existing;
    }

    const nowIso = new Date().toISOString();
    const newIncident: IncidentState = {
      id: crypto.randomUUID(),
      createdAt: nowIso,
      updatedAt: nowIso,
      fraudType: 'unknown',
      incidentOccurredAt: nowIso,
      description: '',
      victim: {},
      transactions: [],
      totalAmountLost: 0,
      suspect: {},
      completedEmergencySteps: [],
    };

    this.incidentStore.set(sessionId, newIncident);
    return newIncident;
  }

  public updateIncident(sessionId: string, input: IncidentIntakeInput): IncidentState {
    const current = this.getOrCreateIncident(sessionId);
    const nowIso = new Date().toISOString();

    const transactions = input.transactions || current.transactions;
    const totalAmountLost = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);

    const updated: IncidentState = {
      ...current,
      updatedAt: nowIso,
      fraudType: input.fraudType || current.fraudType,
      incidentOccurredAt: input.incidentOccurredAt || current.incidentOccurredAt,
      incidentDiscoveredAt: input.incidentDiscoveredAt || current.incidentDiscoveredAt,
      description: input.description !== undefined ? input.description : current.description,
      victim: {
        ...current.victim,
        ...(input.victim || {}),
      },
      transactions,
      totalAmountLost,
      suspect: {
        ...current.suspect,
        ...(input.suspect || {}),
      },
      completedEmergencySteps: input.completedEmergencySteps || current.completedEmergencySteps,
    };

    this.incidentStore.set(sessionId, updated);
    return updated;
  }

  public assessGoldenHour(incident: IncidentState): GoldenHourAssessment {
    const occurredTime = new Date(incident.incidentOccurredAt).getTime();
    const nowTime = Date.now();
    const diffMs = Math.max(0, nowTime - occurredTime);
    const minutesElapsed = Math.floor(diffMs / (60 * 1000));

    if (minutesElapsed <= 120) {
      return {
        urgencyWindow: 'GOLDEN_HOUR',
        minutesElapsedSinceIncident: minutesElapsed,
        isWithinGoldenHour: true,
        urgencyLevel: 'HIGH_URGENCY',
        freezeProbabilityDescription:
          'High probability of beneficiary account freeze via 1930 / I4C CFCFRMS network if reported immediately.',
        recommendedImmediateAction:
          'Call 1930 immediately or notify your bank fraud desk within the 2-hour window.',
      };
    } else if (minutesElapsed <= 1440) {
      return {
        urgencyWindow: 'CRITICAL_24H',
        minutesElapsedSinceIncident: minutesElapsed,
        isWithinGoldenHour: false,
        urgencyLevel: 'MEDIUM_URGENCY',
        freezeProbabilityDescription:
          'Moderate probability of fund recovery. Rapid reporting is still essential before subsequent layer transfers.',
        recommendedImmediateAction:
          'File report on cybercrime.gov.in (NCRP) and notify debited bank with UTR number.',
      };
    } else {
      return {
        urgencyWindow: 'EXTENDED',
        minutesElapsedSinceIncident: minutesElapsed,
        isWithinGoldenHour: false,
        urgencyLevel: 'STANDARD',
        freezeProbabilityDescription:
          'Funds may have moved across multiple mule accounts. Focus on formal FIR, bank grievance redressal, and cyber police complaint.',
        recommendedImmediateAction:
          'Submit formal police complaint and NCRP ticket with full transaction trail.',
      };
    }
  }

  public getArtifacts(sessionId: string): GeneratedArtifacts {
    const incident = this.getOrCreateIncident(sessionId);
    return generateArtifacts(incident);
  }

  public clear(sessionId: string): void {
    this.incidentStore.delete(sessionId);
  }
}

export const incidentService = new IncidentService();
