/**
 * Hook for Salary Calculation Detail Page
 * Manages data fetching and state for the standalone detail page
 * Adapted from useTeacherSalaryCalculationDetail dialog hook
 */
import { useEffect, useCallback, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  setSalaryCalculationDetail,
  clearSalaryCalculationDetail,
  clearSalaryAuditLogs,
  setLoadingState,
  setError,
} from '@/domains/teachers/teachersSlice';
import { getSalaryCalculation, getTeacherById } from '@/services/teacherApiService';
import type { SalaryCalculationDetail } from '@/domains/teachers/_shared/types/salaryCalculation.types';

interface UseTeacherSalaryCalculationDetailPageOptions {
  teacherId: string | null;
  calculationId: string | null;
}

interface UseTeacherSalaryCalculationDetailPageReturn {
  detail: SalaryCalculationDetail | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  teacherName: string;
  periodDisplay: string;
  currentEmploymentType: 'full_time' | 'contract';
}

/**
 * Format period for display
 * Example: "December 1 - 15, 2026"
 */
const formatPeriod = (start: string, end: string): string => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const startMonth = startDate.toLocaleDateString('en-US', { month: 'long' });
  const startDay = startDate.getDate();
  const endDay = endDate.getDate();
  const year = endDate.getFullYear();
  return `${startMonth} ${startDay} - ${endDay}, ${year}`;
};

/**
 * Hook to fetch and manage salary calculation detail for page view
 * Auto-fetches on mount and provides teacher name + period display for breadcrumbs
 */
export const useTeacherSalaryCalculationDetail = ({
  teacherId,
  calculationId,
}: UseTeacherSalaryCalculationDetailPageOptions): UseTeacherSalaryCalculationDetailPageReturn => {
  const dispatch = useAppDispatch();
  const [teacherName, setTeacherName] = useState('Loading...');
  const [currentEmploymentType, setCurrentEmploymentType] = useState<'full_time' | 'contract'>('contract');

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

      // Fetch both teacher info (for breadcrumbs) and calculation detail
      const [teacherData, calculationData] = await Promise.all([
        getTeacherById(teacherId),
        getSalaryCalculation(teacherId, calculationId),
      ]);

      setTeacherName(teacherData.name);
      setCurrentEmploymentType(teacherData.employmentType);
      dispatch(setSalaryCalculationDetail(calculationData));
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

  // Fetch on mount
  useEffect(() => {
    if (teacherId && calculationId) {
      fetchDetail();
    }

    // Cleanup on unmount
    return () => {
      dispatch(clearSalaryCalculationDetail());
      dispatch(clearSalaryAuditLogs());
    };
  }, [teacherId, calculationId, fetchDetail, dispatch]);

  const periodDisplay = detail
    ? formatPeriod(detail.periodStart, detail.periodEnd)
    : 'Loading...';

  return {
    detail,
    loading,
    error,
    refetch: fetchDetail,
    teacherName,
    periodDisplay,
    currentEmploymentType,
  };
};
