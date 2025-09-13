import { useState, useEffect, useCallback } from 'react';
import academicCalendarApiService from '@/domains/settings/services/academicCalendarApi';
import { AcademicYear } from '@/domains/settings/types/academicCalendarTypes';

interface UseAcademicYearsReturn {
  years: AcademicYear[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const ACADEMIC_YEARS_STORAGE_KEY = 'think-english-academic-years';

// Cache helpers
const getYearsFromCache = (): AcademicYear[] | null => {
  try {
    const stored = localStorage.getItem(ACADEMIC_YEARS_STORAGE_KEY);
    if (stored) return JSON.parse(stored) as AcademicYear[];
  } catch (error) {
    console.warn('Failed to parse academic years from localStorage:', error);
    localStorage.removeItem(ACADEMIC_YEARS_STORAGE_KEY);
  }
  return null;
};

const setYearsToCache = (years: AcademicYear[]): void => {
  try {
    localStorage.setItem(ACADEMIC_YEARS_STORAGE_KEY, JSON.stringify(years));
  } catch (error) {
    console.warn('Failed to store academic years in localStorage:', error);
  }
};

export const clearAcademicYearsCache = (): void => {
  try {
    localStorage.removeItem(ACADEMIC_YEARS_STORAGE_KEY);
  } catch {/* no-op */}
};

export const useAcademicYears = (): UseAcademicYearsReturn => {
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAcademicYears = useCallback(async (forceRefresh = false) => {
    // Fast path: cache
    if (!forceRefresh) {
      const cached = getYearsFromCache();
      if (cached && cached.length > 0) {
        setYears(cached);
        setError(null);
        return;
      }
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await academicCalendarApiService.getAllAcademicYears();
      setYears(data);
      setYearsToCache(data);
    } catch (err: any) {
      console.error('Failed to fetch academic years:', err);
      setError(err?.message || 'Failed to load academic years');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAcademicYears(false);
  }, [fetchAcademicYears]);

  const refetch = useCallback(async () => {
    await fetchAcademicYears(true);
  }, [fetchAcademicYears]);

  return {
    years,
    isLoading,
    error,
    refetch,
  };
};
