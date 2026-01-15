/**
 * API Client
 * Handles all API calls to the backend
 */

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/api';

// Mock auth flag - set to true for testing without backend
const USE_MOCK_AUTH = true;

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setToken(token: string | null) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      if (this.token) {
        headers['Authorization'] = `Bearer ${this.token}`;
      }

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        return { error: error.message || 'Request failed' };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Network error' };
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async put<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

// Auth endpoints
export const authApi = {
  login: async (email: string, password: string) => {
    if (USE_MOCK_AUTH) {
      // Fallback to mock auth
      const { mockLogin } = await import('./mockAuth');
      return mockLogin(email, password);
    }
    return apiClient.post('/auth/login', { email, password });
  },
  register: async (email: string, password: string, name: string) => {
    if (USE_MOCK_AUTH) {
      const { mockRegister } = await import('./mockAuth');
      return mockRegister(email, password, name);
    }
    return apiClient.post('/auth/register', { email, password, name });
  },
  getMe: async () => {
    if (USE_MOCK_AUTH) {
      const { mockGetMe } = await import('./mockAuth');
      return mockGetMe(apiClient['token'] || '');
    }
    return apiClient.get('/auth/me');
  },
  updatePushToken: async (pushToken: string) => {
    return apiClient.post('/auth/me/push-token', { pushToken });
  },
};

// Restaurant endpoints
export const restaurantApi = {
  search: async (query: string, lat?: number, lng?: number, radiusMeters?: number) => {
    const params = new URLSearchParams({ query });
    if (lat && lng) {
      params.append('lat', lat.toString());
      params.append('lng', lng.toString());
    }
    if (radiusMeters) {
      params.append('radiusMeters', radiusMeters.toString());
    }
    return apiClient.get(`/restaurants/search?${params}`);
  },
  getDetails: async (placeId: string) => {
    return apiClient.get(`/restaurants/${placeId}`);
  },
};

// Booking endpoints
export const bookingApi = {
  getAvailability: async (placeId: string, datetime: string, partySize: number) => {
    const params = new URLSearchParams({
      placeId,
      datetime,
      partySize: partySize.toString(),
    });
    return apiClient.get(`/bookings/availability?${params}`);
  },
  reviewPlan: async (placeId: string, datetime: string, partySize: number, constraints?: any) => {
    return apiClient.post('/bookings/review-plan', {
      placeId,
      datetime,
      partySize,
      constraints,
    });
  },
  confirm: async (data: {
    planId?: string;
    placeId: string;
    datetime: string;
    partySize: number;
    provider: 'deeplink' | 'yelp_reservations' | 'opentable_partner';
  }) => {
    return apiClient.post('/bookings/confirm', data);
  },
  list: async (upcoming?: boolean) => {
    const params = upcoming !== undefined ? `?upcoming=${upcoming}` : '';
    return apiClient.get(`/bookings${params}`);
  },
  get: async (id: string) => {
    return apiClient.get(`/bookings/${id}`);
  },
  cancel: async (id: string, reason?: string) => {
    return apiClient.post(`/bookings/${id}/cancel`, { reason });
  },
};

// Monitor endpoints
export const monitorApi = {
  start: async (data: {
    placeId: string;
    timeWindowStart: string;
    timeWindowEnd: string;
    partySize: number;
  }) => {
    return apiClient.post('/monitor/start', data);
  },
  stop: async (id: string) => {
    return apiClient.post(`/monitor/stop/${id}`);
  },
  list: async () => {
    return apiClient.get('/monitor');
  },
};
