import { useState, useEffect, useCallback } from 'react';
import { getAllSubjects } from '@/services/teacherApiService';
import { SubjectDto } from '@/types/api/teacher';

export interface UseSubjectsResult {
  subjects: SubjectDto[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const SUBJECTS_STORAGE_KEY = 'think-english-subjects';

// Helper functions for session storage
const getSubjectsFromStorage = (): SubjectDto[] | null => {
  try {
    const stored = sessionStorage.getItem(SUBJECTS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as SubjectDto[];
    }
  } catch (error) {
    console.warn('Failed to parse subjects from session storage:', error);
    // Clear corrupted data
    sessionStorage.removeItem(SUBJECTS_STORAGE_KEY);
  }
  return null;
};

const setSubjectsToStorage = (subjects: SubjectDto[]): void => {
  try {
    sessionStorage.setItem(SUBJECTS_STORAGE_KEY, JSON.stringify(subjects));
  } catch (error) {
    console.warn('Failed to store subjects in session storage:', error);
  }
};

export const useSubjects = (): UseSubjectsResult => {
  const [subjects, setSubjects] = useState<SubjectDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSubjects = useCallback(async (forceRefresh = false) => {
    // Check session storage first (unless force refresh)
    if (!forceRefresh) {
      const cachedSubjects = getSubjectsFromStorage();
      if (cachedSubjects && cachedSubjects.length > 0) {
        setSubjects(cachedSubjects);
        setError(null);
        return;
      }
    }

    // Fetch from API
    setIsLoading(true);
    setError(null);
    
    try {
      const subjectsData = await getAllSubjects();
      setSubjects(subjectsData);
      // Cache the results
      setSubjectsToStorage(subjectsData);
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to fetch subjects';
      setError(errorMessage);
      console.error('Error fetching subjects:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Force refresh function that bypasses cache
  const refetchFromApi = useCallback(async () => {
    await fetchSubjects(true);
  }, [fetchSubjects]);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  return {
    subjects,
    isLoading,
    error,
    refetch: refetchFromApi,
  };
};
