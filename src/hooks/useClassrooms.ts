import { useState, useEffect, useCallback, useRef } from 'react';
import classroomApiService from '@/services/classroomApiService';
import { ClassroomResponse } from '@/types/api/classroom';

export interface UseClassroomsResult {
  classrooms: ClassroomResponse[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const CLASSROOMS_STORAGE_KEY = 'think-english-classrooms';

// Helper functions for localStorage
const getClassroomsFromStorage = (): ClassroomResponse[] | null => {
  try {
    const stored = localStorage.getItem(CLASSROOMS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as ClassroomResponse[];
    }
  } catch (error) {
    console.warn('Failed to parse classrooms from localStorage:', error);
    // Clear corrupted data
    localStorage.removeItem(CLASSROOMS_STORAGE_KEY);
  }
  return null;
};

const setClassroomsToStorage = (classrooms: ClassroomResponse[]): void => {
  try {
    localStorage.setItem(CLASSROOMS_STORAGE_KEY, JSON.stringify(classrooms));
  } catch (error) {
    console.warn('Failed to store classrooms in localStorage:', error);
  }
};

export const useClassrooms = (): UseClassroomsResult => {
  const [classrooms, setClassrooms] = useState<ClassroomResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isFetchingRef = useRef(false);

  const fetchClassrooms = useCallback(async (forceRefresh = false) => {
    // Prevent concurrent fetches
    if (isFetchingRef.current) return;

    // Check localStorage first (unless force refresh)
    if (!forceRefresh) {
      const cachedClassrooms = getClassroomsFromStorage();
      if (cachedClassrooms && cachedClassrooms.length > 0) {
        setClassrooms(cachedClassrooms);
        setError(null);
        return;
      }
    }

    // Fetch from API without global loading
    isFetchingRef.current = true;
    setIsLoading(true);
    setError(null);
    
    try {
      // Use skip loading option to avoid global spinner
      const classroomsData = await classroomApiService.getAllClassrooms();
      setClassrooms(classroomsData);
      // Cache the results
      setClassroomsToStorage(classroomsData);
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to fetch classrooms';
      setError(errorMessage);
      console.error('Error fetching classrooms:', err);
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, []);

  // Force refresh function that bypasses cache
  const refetchFromApi = useCallback(async () => {
    await fetchClassrooms(true);
  }, [fetchClassrooms]);

  // Initial fetch
  useEffect(() => {
    fetchClassrooms();
  }, [fetchClassrooms]);

  // Listen for localStorage changes (when cache is cleared from Settings)
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      // When the classrooms cache is cleared (set to null), refetch from API
      if (event.key === CLASSROOMS_STORAGE_KEY && event.newValue === null) {
        fetchClassrooms(true);
      }
    };

    // Custom event for same-window localStorage changes
    const handleCustomStorageChange = () => {
      // Check if the cache was cleared
      const cached = getClassroomsFromStorage();
      if (!cached) {
        fetchClassrooms(true);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('classrooms-cache-cleared', handleCustomStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('classrooms-cache-cleared', handleCustomStorageChange);
    };
  }, [fetchClassrooms]);

  return {
    classrooms,
    isLoading,
    error,
    refetch: refetchFromApi,
  };
};

