import React, { createContext, useContext, useReducer } from 'react';
import type { ReactNode } from 'react';
import type { Teacher } from '../types/teacher';

// State interface
interface AppState {
  teachers: Teacher[];
  searchQuery: string;
  isLoading: boolean;
  error: string | null;
  user: any | null;
}

// Action types
type AppAction =
  | { type: 'SET_TEACHERS'; payload: Teacher[] }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_USER'; payload: any | null }
  | { type: 'RESET_STATE' };

// Initial state
const initialState: AppState = {
  teachers: [],
  searchQuery: '',
  isLoading: false,
  error: null,
  user: null,
};

// Reducer function
const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_TEACHERS':
      return { ...state, teachers: action.payload, error: null };
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'RESET_STATE':
      return initialState;
    default:
      return state;
  }
};

// Context interface
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  // Helper functions
  setTeachers: (teachers: Teacher[]) => void;
  setSearchQuery: (query: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setUser: (user: any | null) => void;
  resetState: () => void;
}

// Create context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Helper functions
  const setTeachers = (teachers: Teacher[]) =>
    dispatch({ type: 'SET_TEACHERS', payload: teachers });

  const setSearchQuery = (query: string) =>
    dispatch({ type: 'SET_SEARCH_QUERY', payload: query });

  const setLoading = (loading: boolean) =>
    dispatch({ type: 'SET_LOADING', payload: loading });

  const setError = (error: string | null) =>
    dispatch({ type: 'SET_ERROR', payload: error });

  const setUser = (user: any | null) =>
    dispatch({ type: 'SET_USER', payload: user });

  const resetState = () => dispatch({ type: 'RESET_STATE' });

  const value: AppContextType = {
    state,
    dispatch,
    setTeachers,
    setSearchQuery,
    setLoading,
    setError,
    setUser,
    resetState,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Custom hook to use the context
export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
