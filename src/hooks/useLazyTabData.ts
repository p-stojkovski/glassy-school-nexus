import { useState, useEffect, useCallback } from 'react';

interface UseLazyTabDataOptions<T> {
  fetchFn: () => Promise<T>;
  enabled?: boolean;
}

interface UseLazyTabDataResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  hasFetched: boolean;
  refetch: () => Promise<void>;
}

export function useLazyTabData<T>({
  fetchFn,
  enabled = true,
}: UseLazyTabDataOptions<T>): UseLazyTabDataResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFn();
      setData(result);
      setHasFetched(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load data';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [fetchFn]);

  useEffect(() => {
    if (enabled && !hasFetched) {
      fetch();
    }
  }, [enabled, hasFetched, fetch]);

  return {
    data,
    loading,
    error,
    hasFetched,
    refetch: fetch,
  };
}
