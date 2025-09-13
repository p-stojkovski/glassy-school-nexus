/**
 * useStudentsData - API-backed students data loader
 *
 * Loads and refreshes students exclusively from the server API.
 * No local/session storage or mock data is used.
 */

import { useCallback, useEffect, useState } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { setStudents } from '@/domains/students/studentsSlice';
import { getAllStudents } from '@/services/studentApiService';

export interface UseStudentsDataOptions {
  autoLoad?: boolean;
  loadOnMount?: boolean;
  showErrorToasts?: boolean;
}

export const useStudentsData = (
  options: UseStudentsDataOptions = {}
) => {
  const { autoLoad = true, loadOnMount = true } = options;
  const dispatch = useAppDispatch();

  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ReturnType<typeof Array.prototype.slice>>([]) as any;

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const students = await getAllStudents();
      dispatch(setStudents(students));
      setData(students);
      setIsInitialized(true);
    } catch (err: any) {
      setError(err?.message || 'Failed to load students');
    } finally {
      setIsLoading(false);
    }
  }, [dispatch]);

  const refreshData = useCallback(async () => {
    await loadData();
  }, [loadData]);

  const updateData = useCallback(async (_newData: any) => {
    // No-op in API mode; updates happen through specific create/update endpoints
  }, []);

  useEffect(() => {
    if (autoLoad && loadOnMount && !isInitialized && !isLoading) {
      loadData();
    }
  }, [autoLoad, loadOnMount, isInitialized, isLoading, loadData]);

  return {
    isLoading,
    isInitialized,
    error,
    data,
    loadData,
    refreshData,
    updateData,
    isDomainLoaded: isInitialized,
  };
};

