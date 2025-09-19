// services/apiService.ts
import type { ApiConfig, HttpMethod } from '../utils/api';
import { ApiError, getDefaultHeaders, handleApiResponse, createRequestWithTimeout, buildQueryString } from '../utils/api';

/**
 * Base API service
 */
export class ApiService {
  private baseURL: string;
  private defaultTimeout: number;

  constructor(baseURL?: string, timeout: number = 10000) {
    this.baseURL = baseURL || process.env.REACT_APP_API_URL || 'http://localhost:3001';
    this.defaultTimeout = timeout;
  }

  private async request<T>(endpoint: string, config: ApiConfig = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const timeout = config.timeout ?? this.defaultTimeout;

    const requestInit: RequestInit = {
      method: config.method ? String(config.method) : 'GET',
      headers: { ...getDefaultHeaders(), ...config.headers },
      body: config.body instanceof FormData
        ? config.body
        : config.body
        ? JSON.stringify(config.body)
        : undefined
    };

    try {
      const response = await createRequestWithTimeout(url, requestInit, timeout);
      return await handleApiResponse(response);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(error instanceof Error ? error.message : 'Network error', 0);
    }
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const queryString = params ? buildQueryString(params) : '';
    return this.request<T>(`${endpoint}${queryString}`, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, { method: 'POST', body: data });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, { method: 'PUT', body: data });
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, { method: 'PATCH', body: data });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  async upload<T>(endpoint: string, file: File, additionalData?: Record<string, any>): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) =>
        formData.append(key, String(value))
      );
    }

    return this.request<T>(endpoint, {
      method: 'POST',
      body: formData,
      headers: { ...getDefaultHeaders(), 'Content-Type': undefined as any }
    });
  }
}

// Singleton instance
export const apiService = new ApiService();
