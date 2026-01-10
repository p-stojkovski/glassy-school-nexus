/**
 * Hook to manage fetching and displaying salary calculation detail
 * Phase 7.5 implementation
 */
import { useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  setSalaryCalculationDetail,
  clearSalaryCalculationDetail,
  setLoadingState,
  setError,
} from '@/domains/teachers/teachersSlice';
import { getSalaryCalculation } from '@/services/teacherApiService';
import type { SalaryCalculationDetail } from '@/domains/teachers/_shared/types/salaryCalculation.types';

interface UseTeacherSalaryCalculationDetailOptions {
  calculationId: string | null;
  isOpen: boolean;
}

interface UseTeacherSalaryCalculationDetailReturn {
  detail: SalaryCalculationDetail | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch and manage salary calculation detail
 * Data is fetched when dialog opens (lazy loading)
 * Data is cleared when dialog closes
 */
export const useTeacherSalaryCalculationDetail = ({
  calculationId,
  isOpen,
}: UseTeacherSalaryCalculationDetailOptions): UseTeacherSalaryCalculationDetailReturn => {
  const { teacherId } = useParams<{ teacherId: string }>();
  const dispatch = useAppDispatch();

  const detail = useAppSelector((state) => state.teachers.salaryCalculationDetail);
  const loading = useAppSelector(
    (state) => state.teachers.loading.fetchingSalaryCalculationDetail
  );
  const error = useAppSelector(
    (state) => state.teachers.errors.fetchSalaryCalculationDetail
  );

  const fetchDetail = useCallback(async () => {
    if (!teacherId || !calculationId) return;

    try {
      dispatch(
        setLoadingState({ operation: 'fetchingSalaryCalculationDetail', loading: true })
      );
      dispatch(
        setError({ operation: 'fetchSalaryCalculationDetail', error: null })
      );

      const data = await getSalaryCalculation(teacherId, calculationId);
      dispatch(setSalaryCalculationDetail(data));
    } catch (err: any) {
      const errorMessage =
        err?.message || 'Failed to fetch salary calculation detail';
      dispatch(
        setError({ operation: 'fetchSalaryCalculationDetail', error: errorMessage })
      );
    } finally {
      dispatch(
        setLoadingState({ operation: 'fetchingSalaryCalculationDetail', loading: false })
      );
    }
  }, [teacherId, calculationId, dispatch]);

  // Fetch detail when dialog opens (lazy loading)
  useEffect(() => {
    if (isOpen && calculationId && teacherId) {
      // Only fetch if we don't have the detail or if it's a different calculation
      if (!detail || detail.calculationId !== calculationId) {
        fetchDetail();
      }
    }
  }, [isOpen, calculationId, teacherId, detail, fetchDetail]);

  // Clear detail when dialog closes
  useEffect(() => {
    if (!isOpen) {
      dispatch(clearSalaryCalculationDetail());
    }
  }, [isOpen, dispatch]);

  return {
    detail,
    loading,
    error,
    refetch: fetchDetail,
  };
};
