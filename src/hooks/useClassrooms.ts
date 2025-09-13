import { useState, useEffect, useCallback } from 'react';
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

  const fetchClassrooms = useCallback(async (forceRefresh = false) => {
    // Check session storage first (unless force refresh)
    if (!forceRefresh) {
      const cachedClassrooms = getClassroomsFromStorage();
      if (cachedClassrooms && cachedClassrooms.length > 0) {
        setClassrooms(cachedClassrooms);
        setError(null);
        return;
      }
    }

    // Fetch from API without global loading
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
    }
  }, []);

  // Force refresh function that bypasses cache
  const refetchFromApi = useCallback(async () => {
    await fetchClassrooms(true);
  }, [fetchClassrooms]);

  useEffect(() => {
    fetchClassrooms();
  }, [fetchClassrooms]);

  return {
    classrooms,
    isLoading,
    error,
    refetch: refetchFromApi,
  };
};

