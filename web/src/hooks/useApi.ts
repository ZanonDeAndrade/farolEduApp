import { useState, useEffect, useCallback } from 'react';
import { ApiError, parseApiError } from '../utils/api';

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export const useApi = <T>(apiFunction: () => Promise<T>, dependencies: any[] = []) => {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: true,
    error: null
  });

  const execute = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await apiFunction();
      setState({ data: result, loading: false, error: null });
      return result;
    } catch (error: unknown) {
      const errorMessage = parseApiError(error);
      setState({ data: null, loading: false, error: errorMessage });
      throw error;
    }
  }, [apiFunction]);

  useEffect(() => {
    execute();
  }, dependencies);

  const refetch = useCallback(() => execute(), [execute]);

  return { ...state, execute, refetch };
};

export const useApiMutation = <TData, TVariables = any>(
  apiFunction: (variables: TVariables) => Promise<TData>
) => {
  const [state, setState] = useState<ApiState<TData>>({
    data: null,
    loading: false,
    error: null
  });

  const mutate = useCallback(async (variables: TVariables) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await apiFunction(variables);
      setState({ data: result, loading: false, error: null });
      return result;
    } catch (error: unknown) {
      const errorMessage = parseApiError(error);
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      throw error;
    }
  }, [apiFunction]);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return { ...state, mutate, reset };
};

export const usePaginatedApi = <T>(
  apiFunction: (page: number, limit: number) => Promise<{ data: T[]; total: number; hasMore: boolean }>,
  initialLimit: number = 10
) => {
  const [state, setState] = useState({
    data: [] as T[],
    loading: false,
    error: null as string | null,
    page: 1,
    hasMore: true,
    total: 0
  });

  const loadPage = useCallback(async (page: number, append: boolean = false) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await apiFunction(page, initialLimit);
      setState(prev => ({
        ...prev,
        data: append ? [...prev.data, ...result.data] : result.data,
        loading: false,
        error: null,
        page,
        hasMore: result.hasMore,
        total: result.total
      }));
      return result;
    } catch (error: unknown) {
      const errorMessage = parseApiError(error);
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      throw error;
    }
  }, [apiFunction, initialLimit]);

  const loadFirst = useCallback(() => loadPage(1, false), [loadPage]);
  const loadNext = useCallback(() => {
    if (state.hasMore && !state.loading) {
      return loadPage(state.page + 1, true);
    }
  }, [loadPage, state.hasMore, state.loading, state.page]);
  const refresh = useCallback(() => loadPage(1, false), [loadPage]);

  useEffect(() => { loadFirst(); }, [loadFirst]);

  return { ...state, loadFirst, loadNext, refresh };
};
