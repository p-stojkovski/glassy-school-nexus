/**
 * Hook for managing teacher salary calculations
 * Handles fetching, filtering, and actions for salary calculations list
 */
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  setLoadingState,
  setError,
  setSalaryCalculations,
  selectSalaryCalculations,
  selectLoading,
  selectErrors,
} from '@/domains/teachers/teachersSlice';
import { getSalaryCalculations } from '@/services/teacherApiService';
import {
  SalaryCalculationStatus,
  SalaryCalculationFilters,
} from '@/domains/teachers/_shared/types/salaryCalculation.types';

export interface SalaryCalculationsFilters {
  status: SalaryCalculationStatus | 'all';
  academicYearId?: string;
}

interface UseTeacherSalaryCalculationsProps {
  academicYearId?: string | null;
}

export function useTeacherSalaryCalculations({ academicYearId }: UseTeacherSalaryCalculationsProps) {
  const { teacherId } = useParams<{ teacherId: string }>();
  const dispatch = useAppDispatch();

  // Redux state
  const calculations = useAppSelector(selectSalaryCalculations).items;
  const loading = useAppSelector(selectLoading).fetchingSalaryCalculations;
  const error = useAppSelector(selectErrors).fetchSalaryCalculations;

  // Local filter state
  const [filters, setFilters] = useState<SalaryCalculationsFilters>({
    status: 'all',
    academicYearId: academicYearId || undefined,
  });

  // Fetch calculations
  const fetchCalculations = async () => {
    if (!teacherId) return;

    try {
      dispatch(setLoadingState({ operation: 'fetchingSalaryCalculations', loading: true }));
      dispatch(setError({ operation: 'fetchSalaryCalculations', error: null }));

      // Build API filters
      const apiFilters: SalaryCalculationFilters = {};
      if (filters.status !== 'all') {
        apiFilters.status = filters.status;
      }
      if (filters.academicYearId) {
        apiFilters.academicYearId = filters.academicYearId;
      }

      const data = await getSalaryCalculations(teacherId, apiFilters);
      dispatch(setSalaryCalculations(data));
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load salary calculations';
      dispatch(setError({ operation: 'fetchSalaryCalculations', error: errorMessage }));
    } finally {
      dispatch(setLoadingState({ operation: 'fetchingSalaryCalculations', loading: false }));
    }
  };

  // Fetch on mount and when filters change
  useEffect(() => {
    fetchCalculations();
  }, [teacherId, filters.status, filters.academicYearId]);

  // Update academic year filter when prop changes
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      academicYearId: academicYearId || undefined,
    }));
  }, [academicYearId]);

  // Filter calculations on client side (for display purposes)
  const filteredCalculations = calculations.filter((calc) => {
    // Guard against undefined items or items without valid id
    if (!calc || !calc.id) return false;
    // Status filter
    if (filters.status !== 'all' && calc.status !== filters.status) {
      return false;
    }
    // Academic year filter
    if (filters.academicYearId && calc.academicYearId !== filters.academicYearId) {
      return false;
    }
    return true;
  });

  return {
    calculations: filteredCalculations,
    loading,
    error,
    filters,
    setFilters,
    refetch: fetchCalculations,
  };
}
