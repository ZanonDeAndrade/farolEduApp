import React, { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import type { User, LoginCredentials, RegisterData } from '../hooks/useAuth';

/**
 * Auth context interface
 */
interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<{ user: User; token: string }>;
  register: (data: RegisterData) => Promise<{ user: User; token: string }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<User>;
  hasRole: (role: User['role']) => boolean;
  isTeacher: () => boolean;
  isStudent: () => boolean;
  clearError: () => void;
}

/**
 * Create auth context
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Auth provider props
 */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Auth provider component
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const auth = useAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to use auth context
 */
export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

/**
 * Higher-order component for protected routes
 */
export const withAuth = <P extends object>(
  Component: React.ComponentType<P>,
  requiredRole?: User['role']
) => {
  const AuthenticatedComponent = (props: P) => {
    const { isAuthenticated, user, loading } = useAuthContext();

    if (loading) {
      return (
        <div className="loading">
          Carregando...
        </div>
      );
    }

    if (!isAuthenticated) {
      return (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h2>Acesso Negado</h2>
          <p>Você precisa fazer login para acessar esta página.</p>
        </div>
      );
    }

    if (requiredRole && user?.role !== requiredRole) {
      return (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h2>Acesso Negado</h2>
          <p>Você não tem permissão para acessar esta página.</p>
        </div>
      );
    }

    return <Component {...props} />;
  };

  AuthenticatedComponent.displayName = `withAuth(${Component.displayName || Component.name})`;
  
  return AuthenticatedComponent;
};
