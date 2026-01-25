import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useAcademicYears, useSemesters, useTeachingBreaks } from '../hooks';
import type { AcademicYear, Semester, TeachingBreak } from '../../types/academicCalendarTypes';

export interface UseAcademicYearPageReturn {
  // Data
  academicYear: AcademicYear | null;
  semesters: Semester[];
  teachingBreaks: TeachingBreak[];

  // Loading states
  loading: boolean;           // Initial page load (year fetch)
  semestersLoading: boolean;  // Section loading
  breaksLoading: boolean;     // Section loading

  // Error
  error: string | null;

  // Actions
  refetch: () => Promise<void>;
}

export function useAcademicYearPage(yearId: string | undefined): UseAcademicYearPageReturn {
  const {
    academicYears,
    loading: yearsLoading,
    errors: yearsErrors,
    fetchAcademicYears,
  } = useAcademicYears();

  const {
    semesters,
    loading: semestersLoadingState,
    errors: semestersErrors,
    fetchSemesters,
  } = useSemesters(yearId);

  const {
    teachingBreaks,
    loading: breaksLoadingState,
    errors: breaksErrors,
    fetchTeachingBreaks,
  } = useTeachingBreaks(yearId);

  // Track if we've done the initial fetch to avoid re-fetching
  const hasFetchedRef = useRef(false);

  // Find the academic year by ID from the Redux store
  const academicYear = useMemo(() => {
    if (!yearId) return null;
    return academicYears.find((year) => year.id === yearId) ?? null;
  }, [academicYears, yearId]);

  // Fetch academic years if not already loaded
  useEffect(() => {
    if (academicYears.length === 0 && !yearsLoading.fetching && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchAcademicYears();
    }
  }, [academicYears.length, yearsLoading.fetching, fetchAcademicYears]);

  // Fetch semesters and breaks in parallel when yearId is valid
  useEffect(() => {
    if (yearId) {
      // Fire both fetches in parallel
      fetchSemesters();
      fetchTeachingBreaks();
    }
  }, [yearId, fetchSemesters, fetchTeachingBreaks]);

  // Combine loading states: initial load is true until year data is ready
  const loading = yearsLoading.fetching;
  const semestersLoading = semestersLoadingState.fetching;
  const breaksLoading = breaksLoadingState.fetching;

  // Aggregate errors from all sources
  const error = useMemo(() => {
    const errors = [
      yearsErrors.fetch,
      semestersErrors.fetch,
      breaksErrors.fetch,
    ].filter(Boolean);
    return errors.length > 0 ? errors.join('; ') : null;
  }, [yearsErrors.fetch, semestersErrors.fetch, breaksErrors.fetch]);

  // Refetch function that reloads semesters and breaks
  const refetch = useCallback(async () => {
    if (!yearId) return;

    // Fetch both in parallel
    await Promise.all([
      fetchSemesters(),
      fetchTeachingBreaks(),
    ]);
  }, [yearId, fetchSemesters, fetchTeachingBreaks]);

  return {
    // Data
    academicYear,
    semesters,
    teachingBreaks,

    // Loading states
    loading,
    semestersLoading,
    breaksLoading,

    // Error
    error,

    // Actions
    refetch,
  };
}
