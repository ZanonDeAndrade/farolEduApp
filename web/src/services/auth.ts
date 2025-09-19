// services/authService.ts
import type { User, LoginCredentials, RegisterData } from '../hooks/useAuth';
import { apiService } from './api';

/**
 * Response interface
 */
export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return apiService.post<AuthResponse>('/auth/login', credentials);
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    return apiService.post<AuthResponse>('/auth/register', data);
  }

  async logout(): Promise<void> {
    return apiService.post<void>('/auth/logout');
  }

  async getProfile(): Promise<User> {
    return apiService.get<User>('/auth/profile');
  }

  async updateProfile(updates: Partial<User>): Promise<User> {
    return apiService.put<User>('/auth/profile', updates);
  }
}

export const authService = new AuthService();
