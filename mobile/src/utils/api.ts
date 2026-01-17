/**
 * API Client
 * Handles all API calls to the backend
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import { supabase } from '../lib/supabase';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

class ApiClient {
  private axiosInstance: AxiosInstance;

  constructor(baseUrl: string) {
    this.axiosInstance = axios.create({
      baseURL: baseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.axiosInstance.interceptors.request.use(async (config) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
      }
      return config;
    });
  }

  setToken(token: string | null) {
    // Token is now handled by interceptor, but keeping for backward compatibility
  }

  private async request<T>(
    endpoint: string,
    options: { method: string; data?: any }
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.request<T>({
        url: endpoint,
        method: options.method as any,
        data: options.data,
      });
      return { data: response.data };
    } catch (error) {
      const axiosError = error as AxiosError;
      return { error: (axiosError.response?.data as any)?.message || axiosError.message || 'Request failed' };
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'POST', data: body });
  }

  async put<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'PUT', data: body });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

// Auth endpoints
export const authApi = {
  login: async (email: string, password: string) => {
    return apiClient.post('/auth/login', { email, password });
  },
  register: async (email: string, password: string, name: string) => {
    return apiClient.post('/auth/register', { email, password, name });
  },
  getMe: async () => {
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

// Request endpoints (using Supabase directly)
export const requestApi = {
  createRequest: async (data: {
    restaurant_id: string;
    datetime: string;
    party_size: number;
    notes?: string;
    [key: string]: any;
  }): Promise<ApiResponse<any>> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { error: 'Not authenticated' };
      
      const { data: result, error } = await supabase
        .from('booking_requests')
        .insert({ ...data, diner_id: user.id })
        .select()
        .single();
      
      if (error) return { error: error.message };
      return { data: result };
    } catch (error: any) {
      return { error: error.message || 'Request failed' };
    }
  },
  getRequest: async (id: string): Promise<ApiResponse<any>> => {
    try {
      const { data, error } = await supabase
        .from('booking_requests')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) return { error: error.message };
      return { data };
    } catch (error: any) {
      return { error: error.message || 'Request failed' };
    }
  },
  listMyRequests: async (): Promise<ApiResponse<any>> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { error: 'Not authenticated' };
      
      const { data, error } = await supabase
        .from('booking_requests')
        .select('*')
        .eq('diner_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) return { error: error.message };
      return { data };
    } catch (error: any) {
      return { error: error.message || 'Request failed' };
    }
  },
  restaurantInbox: async (): Promise<ApiResponse<any>> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { error: 'Not authenticated' };
      
      const { data, error } = await supabase
        .from('booking_requests')
        .select('*, restaurants!inner(*)')
        .eq('restaurants.owner_user_id', user.id);
      
      if (error) return { error: error.message };
      return { data };
    } catch (error: any) {
      return { error: error.message || 'Request failed' };
    }
  },
  accept: async (id: string): Promise<ApiResponse<any>> => {
    try {
      const { data, error } = await supabase
        .from('booking_requests')
        .update({ status: 'accepted' })
        .eq('id', id)
        .select()
        .single();
      
      if (error) return { error: error.message };
      return { data };
    } catch (error: any) {
      return { error: error.message || 'Request failed' };
    }
  },
  decline: async (id: string): Promise<ApiResponse<any>> => {
    try {
      const { data, error } = await supabase
        .from('booking_requests')
        .update({ status: 'declined' })
        .eq('id', id)
        .select()
        .single();
      
      if (error) return { error: error.message };
      return { data };
    } catch (error: any) {
      return { error: error.message || 'Request failed' };
    }
  },
};
