/**
 * Hook for managing teacher salary preview
 * Fetches and manages salary preview data for a selected month/year
 * Updated to support lazy loading when collapsible section is expanded
 */
import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  setLoadingState,
  setError,
  setSalaryPreview,
  selectSalaryPreview,
  selectLoading,
  selectErrors,
} from '@/domains/teachers/teachersSlice';
import { getTeacherSalaryPreview } from '@/services/teacherApiService';

interface UseTeacherSalaryPreviewOptions {
  isExpanded: boolean; // Changed from isActive to isExpanded
}

export function useTeacherSalaryPreview({ isExpanded }: UseTeacherSalaryPreviewOptions) {
  const { teacherId } = useParams<{ teacherId: string }>();
  const dispatch = useAppDispatch();

  // State for month/year selection (default to current)
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1); // 1-based (1-12)
  const [hasFetched, setHasFetched] = useState(false);

  // Redux state
  const preview = useAppSelector(selectSalaryPreview);
  const loading = useAppSelector(selectLoading).fetchingSalaryPreview;
  const error = useAppSelector(selectErrors).fetchSalaryPreview;

  // Fetch salary preview
  const fetchPreview = useCallback(async (year: number, month: number) => {
    if (!teacherId) return;

    try {
      dispatch(setLoadingState({ operation: 'fetchingSalaryPreview', loading: true }));
      dispatch(setError({ operation: 'fetchSalaryPreview', error: null }));

      const data = await getTeacherSalaryPreview(teacherId, year, month);
      dispatch(setSalaryPreview(data));
      setHasFetched(true);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load salary preview';
      dispatch(setError({ operation: 'fetchSalaryPreview', error: errorMessage }));
    } finally {
      dispatch(setLoadingState({ operation: 'fetchingSalaryPreview', loading: false }));
    }
  }, [teacherId, dispatch]);

  // Fetch only when expanded for the first time (lazy load)
  useEffect(() => {
    if (isExpanded && !hasFetched && !loading) {
      fetchPreview(selectedYear, selectedMonth);
    }
  }, [isExpanded, hasFetched, loading, selectedYear, selectedMonth, fetchPreview]);

  // Refetch when month/year changes (only if already fetched)
  useEffect(() => {
    if (isExpanded && hasFetched) {
      fetchPreview(selectedYear, selectedMonth);
    }
  }, [isExpanded, selectedYear, selectedMonth, fetchPreview, hasFetched]);

  // Handlers for month/year changes
  const handleYearChange = useCallback((year: number) => {
    setSelectedYear(year);
  }, []);

  const handleMonthChange = useCallback((month: number) => {
    setSelectedMonth(month);
  }, []);

  const refetch = useCallback(() => {
    fetchPreview(selectedYear, selectedMonth);
  }, [fetchPreview, selectedYear, selectedMonth]);

  return {
    preview,
    loading,
    error,
    selectedYear,
    selectedMonth,
    onYearChange: handleYearChange,
    onMonthChange: handleMonthChange,
    refetch,
    hasFetched, // Expose hasFetched for caching logic
  };
}
