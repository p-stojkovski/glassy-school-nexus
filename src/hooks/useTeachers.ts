import { useState, useEffect, useCallback } from 'react';
import { teacherApiService } from '@/services/teacherApiService';
import { TeacherResponse } from '@/types/api/teacher';

export interface UseTeachersResult {
  teachers: TeacherResponse[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const TEACHERS_STORAGE_KEY = 'think-english-teachers';

// Helper functions for localStorage
const getTeachersFromStorage = (): TeacherResponse[] | null => {
  try {
    const stored = localStorage.getItem(TEACHERS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as TeacherResponse[];
    }
  } catch (error) {
    console.warn('Failed to parse teachers from localStorage:', error);
    // Clear corrupted data
    localStorage.removeItem(TEACHERS_STORAGE_KEY);
  }
  return null;
};

const setTeachersToStorage = (teachers: TeacherResponse[]): void => {
  try {
    localStorage.setItem(TEACHERS_STORAGE_KEY, JSON.stringify(teachers));
  } catch (error) {
    console.warn('Failed to store teachers in localStorage:', error);
  }
};

export const useTeachers = (): UseTeachersResult => {
  const [teachers, setTeachers] = useState<TeacherResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTeachers = useCallback(async (forceRefresh = false) => {
    // Check session storage first (unless force refresh)
    if (!forceRefresh) {
      const cachedTeachers = getTeachersFromStorage();
      if (cachedTeachers && cachedTeachers.length > 0) {
        setTeachers(cachedTeachers);
        setError(null);
        return;
      }
    }

    // Fetch from API without global loading
    setIsLoading(true);
    setError(null);
    
    try {
      // Disable global loading for this dropdown component
      teacherApiService
      const teachersData = await teacherApiService.getAllTeachers();
      setTeachers(teachersData);
      // Cache the results
      setTeachersToStorage(teachersData);
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to fetch teachers';
      setError(errorMessage);
      console.error('Error fetching teachers:', err);
    } finally {
            teacherApiService
      setIsLoading(false);
    }
  }, []);

  // Force refresh function that bypasses cache
  const refetchFromApi = useCallback(async () => {
    await fetchTeachers(true);
  }, [fetchTeachers]);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  return {
    teachers,
    isLoading,
    error,
    refetch: refetchFromApi,
  };
};

