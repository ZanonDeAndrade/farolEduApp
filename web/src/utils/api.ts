/**
 * API utility functions
 */

/** API Error class for custom error handling */
export class ApiError extends Error {
    public status: number;
    public data: any;
  
    constructor(message: string, status: number, data?: any) {
      super(message);
      this.name = 'ApiError';
      this.status = status;
      this.data = data;
    }
  }
  
  /** HTTP methods type */
  export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  
  /** API request configuration */
  export interface ApiConfig {
    method?: HttpMethod;
    headers?: Record<string, string>;
    body?: any;
    timeout?: number;
  }
  
  /** Get authorization headers */
  export const getAuthHeaders = (): Record<string, string> => {
    const token = localStorage.getItem('auth_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };
  
  /** Get default headers */
  export const getDefaultHeaders = (): Record<string, string> => ({
    'Content-Type': 'application/json',
    ...getAuthHeaders(),
  });
  
  /** Handle API response */
  export const handleApiResponse = async (response: Response): Promise<any> => {
    const contentType = response.headers.get('content-type');
    const data = contentType?.includes('application/json')
      ? await response.json()
      : await response.text();
  
    if (!response.ok) {
      throw new ApiError(data?.message || `HTTP error! status: ${response.status}`, response.status, data);
    }
  
    return data;
  };
  
  /** Create request with timeout */
  export const createRequestWithTimeout = (
    url: string,
    config: RequestInit,
    timeout: number = 10000
  ): Promise<Response> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
  
    return fetch(url, { ...config, signal: controller.signal }).finally(() => {
      clearTimeout(timeoutId);
    });
  };
  
  /** Build query string from object */
  export const buildQueryString = (params: Record<string, any>): string => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    return searchParams.toString() ? `?${searchParams.toString()}` : '';
  };
  
  /** Parse API error for user-friendly messages */
  export const parseApiError = (error: any): string => {
    if (error instanceof ApiError) {
      switch (error.status) {
        case 400: return error.data?.message || 'Dados inválidos fornecidos';
        case 401: return 'Sessão expirada. Faça login novamente';
        case 403: return 'Você não tem permissão';
        case 404: return 'Recurso não encontrado';
        case 500: return 'Erro interno do servidor';
        default: return error.message || 'Erro desconhecido';
      }
    }
  
    if (error.name === 'AbortError') return 'Tempo limite da requisição excedido';
    if (!navigator.onLine) return 'Sem conexão com a internet';
    return 'Erro de conexão. Verifique sua internet';
  };
  