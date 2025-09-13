import { useState, useEffect, useCallback } from 'react';
import academicCalendarApiService from '@/domains/settings/services/academicCalendarApi';
import { Semester } from '@/domains/settings/types/academicCalendarTypes';

interface UseSemestersReturn {
  semesters: Semester[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const SEMESTERS_CACHE_PREFIX = 'think-english-semesters:';

// Cache helpers
const cacheKeyForYear = (yearId: string) => `${SEMESTERS_CACHE_PREFIX}${yearId}`;

const getSemestersFromCache = (yearId: string): Semester[] | null => {
  try {
    const key = cacheKeyForYear(yearId);
    const stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored) as Semester[];
  } catch (error) {
    console.warn('Failed to parse semesters from localStorage:', error);
  }
  return null;
};

const setSemestersToCache = (yearId: string, semesters: Semester[]): void => {
  try {
    const key = cacheKeyForYear(yearId);
    localStorage.setItem(key, JSON.stringify(semesters));
  } catch (error) {
    console.warn('Failed to store semesters in localStorage:', error);
  }
};

export const clearSemestersCache = (yearId?: string): void => {
  try {
    if (yearId) {
      localStorage.removeItem(cacheKeyForYear(yearId));
      return;
    }
    // Remove all semester caches by prefix scan
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(SEMESTERS_CACHE_PREFIX)) {
        localStorage.removeItem(key);
        // Adjust index since localStorage shrinks
        i--;
      }
    }
  } catch {/* no-op */}
};

export const useSemesters = (
  academicYearId: string | null | undefined
): UseSemestersReturn => {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSemesters = useCallback(
    async (forceNetwork = false) => {
      // Guard: no year id -> reset state
      if (!academicYearId) {
        setSemesters([]);
        setError(null);
        setIsLoading(false);
        return;
      }

      // Fast path from cache
      if (!forceNetwork) {
        const cached = getSemestersFromCache(academicYearId);
        if (cached && cached.length > 0) {
          setSemesters(cached);
          setError(null);
          return;
        }
      }

      setIsLoading(true);
      setError(null);
      try {
        const data = await academicCalendarApiService.getSemestersByYear(academicYearId);
        setSemesters(data);
        setSemestersToCache(academicYearId, data);
      } catch (err: any) {
        console.error('Failed to fetch semesters:', err);
        setError(err?.message || 'Failed to load semesters');
        setSemesters([]);
      } finally {
        setIsLoading(false);
      }
    },
    [academicYearId]
  );

  useEffect(() => {
    // When year changes, clear list and error, then attempt fetch
    setSemesters([]);
    setError(null);

    if (!academicYearId) {
      setIsLoading(false);
      return;
    }

    fetchSemesters(false);
  }, [academicYearId, fetchSemesters]);

  const refetch = useCallback(async () => {
    if (!academicYearId) return; // no-op
    await fetchSemesters(true);
  }, [academicYearId, fetchSemesters]);

  return {
    semesters,
    isLoading,
    error,
    refetch,
  };
};