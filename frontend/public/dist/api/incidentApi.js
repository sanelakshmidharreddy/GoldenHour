export class ApiError extends Error {
    constructor(message, status, code = 'API_ERROR', details) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.code = code;
        this.details = details;
    }
}
export class IncidentApiClient {
    constructor(baseUrl = '') {
        this.baseUrl = baseUrl;
    }
    async request(endpoint, options = {}) {
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
                let errorData = {};
                try {
                    errorData = await response.json();
                }
                catch {
                    // Response was not JSON
                }
                const message = errorData.error?.message || `Request failed with status ${response.status}`;
                const code = errorData.error?.code || 'HTTP_ERROR';
                const details = errorData.error?.details;
                throw new ApiError(message, response.status, code, details);
            }
            return (await response.json());
        }
        catch (err) {
            if (err instanceof ApiError) {
                throw err;
            }
            throw new ApiError(err.message || 'Network connection to GoldenHour backend failed', 0, 'NETWORK_ERROR');
        }
    }
    async submitIntake(payload) {
        return this.request('/api/v1/incident/intake', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
    }
    async getCurrentIncident() {
        return this.request('/api/v1/incident/current');
    }
    async getGuidance() {
        return this.request('/api/v1/incident/guidance');
    }
    async getArtifacts() {
        return this.request('/api/v1/incident/artifacts');
    }
    async resetIncident() {
        return this.request('/api/v1/incident/reset', {
            method: 'POST',
        });
    }
    async getPlaybooks() {
        return this.request('/api/v1/kb/playbooks');
    }
    async getContacts() {
        return this.request('/api/v1/kb/contacts');
    }
}
export const api = new IncidentApiClient();
