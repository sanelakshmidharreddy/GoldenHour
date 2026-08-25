import {
  IncidentIntakePayload,
  IncidentState,
  GoldenHourAssessment,
  IncidentGuidance,
  GeneratedArtifacts,
} from '../types.js';

export interface IntakeResponse {
  incident: IncidentState;
  goldenHour: GoldenHourAssessment;
}

export interface CurrentResponse {
  incident: IncidentState;
  goldenHour: GoldenHourAssessment;
}

export interface GuidanceResponse {
  guidance: IncidentGuidance;
}

export interface ArtifactsResponse {
  artifacts: GeneratedArtifacts;
}

export class ApiError extends Error {
  public code: string;
  public status: number;
  public details?: any;

  constructor(message: string, status: number, code = 'API_ERROR', details?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export class IncidentApiClient {
  private baseUrl: string;

  constructor(baseUrl = '') {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'same-origin',
      });

      if (!response.ok) {
        let errorData: any = {};
        try {
          errorData = await response.json();
        } catch {
          // Response was not JSON
        }
        const message = errorData.error?.message || `Request failed with status ${response.status}`;
        const code = errorData.error?.code || 'HTTP_ERROR';
        const details = errorData.error?.details;
        throw new ApiError(message, response.status, code, details);
      }

      return (await response.json()) as T;
    } catch (err: any) {
      if (err instanceof ApiError) {
        throw err;
      }
      throw new ApiError(
        err.message || 'Network connection to GoldenHour backend failed',
        0,
        'NETWORK_ERROR'
      );
    }
  }

  public async submitIntake(payload: IncidentIntakePayload): Promise<IntakeResponse> {
    return this.request<IntakeResponse>('/api/v1/incident/intake', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async getCurrentIncident(): Promise<CurrentResponse> {
    return this.request<CurrentResponse>('/api/v1/incident/current');
  }

  public async getGuidance(): Promise<GuidanceResponse> {
    return this.request<GuidanceResponse>('/api/v1/incident/guidance');
  }

  public async getArtifacts(): Promise<ArtifactsResponse> {
    return this.request<ArtifactsResponse>('/api/v1/incident/artifacts');
  }

  public async resetIncident(): Promise<{ status: string; message: string }> {
    return this.request<{ status: string; message: string }>('/api/v1/incident/reset', {
      method: 'POST',
    });
  }

  public async getPlaybooks(): Promise<{ playbooks: Record<string, any>; count: number }> {
    return this.request<{ playbooks: Record<string, any>; count: number }>('/api/v1/kb/playbooks');
  }

  public async getContacts(): Promise<{ contacts: any }> {
    return this.request<{ contacts: any }>('/api/v1/kb/contacts');
  }
}

export const api = new IncidentApiClient();
