import { useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from './index';

/**
 * User interface
 */
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  avatar?: string;
  createdAt: string;
}

/**
 * Auth state interface
 */
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

/**
 * Login credentials interface
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Register data interface
 */
export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'teacher';
}

/**
 * Custom hook for authentication
 */
export const useAuth = () => {
  const [tokenStorage, setTokenStorage] = useLocalStorage<string | null>('auth_token', null);
  const [userStorage, setUserStorage] = useLocalStorage<User | null>('auth_user', null);
  
  const [state, setState] = useState<AuthState>({
    user: userStorage,
    token: tokenStorage,
    isAuthenticated: !!tokenStorage && !!userStorage,
    loading: false,
    error: null
  });

  /**
   * Set authenticated user
   */
  const setAuth = useCallback((user: User, token: string) => {
    setState({
      user,
      token,
      isAuthenticated: true,
      loading: false,
      error: null
    });
    setUserStorage(user);
    setTokenStorage(token);
  }, [setUserStorage, setTokenStorage]);

  /**
   * Clear authentication
   */
  const clearAuth = useCallback(() => {
    setState({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null
    });
    setUserStorage(null);
    setTokenStorage(null);
  }, [setUserStorage, setTokenStorage]);

  /**
   * Login function
   */
  const login = useCallback(async (credentials: LoginCredentials) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Simulate API call - replace with actual API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });

      if (!response.ok) {
        throw new Error('Credenciais inválidas');
      }

      const { user, token } = await response.json();
      setAuth(user, token);
      
      return { user, token };
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Erro ao fazer login'
      }));
      throw error;
    }
  }, [setAuth]);

  /**
   * Register function
   */
  const register = useCallback(async (data: RegisterData) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Simulate API call - replace with actual API
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Erro ao criar conta');
      }

      const { user, token } = await response.json();
      setAuth(user, token);
      
      return { user, token };
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Erro ao criar conta'
      }));
      throw error;
    }
  }, [setAuth]);

  /**
   * Logout function
   */
  const logout = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true }));

    try {
      // Simulate API call to invalidate token
      if (state.token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${state.token}`,
            'Content-Type': 'application/json'
          }
        });
      }
    } catch (error) {
      console.warn('Error during logout:', error);
    } finally {
      clearAuth();
    }
  }, [state.token, clearAuth]);

  /**
   * Update user profile
   */
  const updateProfile = useCallback(async (updates: Partial<User>) => {
    if (!state.user || !state.token) {
      throw new Error('Usuário não autenticado');
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${state.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar perfil');
      }

      const updatedUser = await response.json();
      setAuth(updatedUser, state.token);
      
      return updatedUser;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Erro ao atualizar perfil'
      }));
      throw error;
    }
  }, [state.user, state.token, setAuth]);

  /**
   * Check if user has specific role
   */
  const hasRole = useCallback((role: User['role']) => {
    return state.user?.role === role;
  }, [state.user]);

  /**
   * Check if user is teacher
   */
  const isTeacher = useCallback(() => {
    return hasRole('teacher');
  }, [hasRole]);

  /**
   * Check if user is student
   */
  const isStudent = useCallback(() => {
    return hasRole('student');
  }, [hasRole]);

  /**
   * Clear auth error
   */
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Check token validity on mount
  useEffect(() => {
    if (tokenStorage && userStorage) {
      // TODO: Validate token with API
      setState(prev => ({
        ...prev,
        isAuthenticated: true
      }));
    }
  }, [tokenStorage, userStorage]);

  return {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    hasRole,
    isTeacher,
    isStudent,
    clearError
  };
};