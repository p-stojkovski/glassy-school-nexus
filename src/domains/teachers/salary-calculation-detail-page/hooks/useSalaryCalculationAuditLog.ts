/**
 * Hook for managing salary calculation audit log with lazy loading
 * Fetches audit log data only when the collapsible section is expanded
 * Pattern: Same as useTeacherSalaryPreview (lazy load + caching)
 */
import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  setLoadingState,
  setError,
  setSalaryAuditLogs,
} from '@/domains/teachers/teachersSlice';
import { getSalaryCalculation } from '@/services/teacherApiService';

interface UseSalaryCalculationAuditLogOptions {
  isExpanded: boolean;
}

export function useSalaryCalculationAuditLog({ isExpanded }: UseSalaryCalculationAuditLogOptions) {
  const { teacherId, calculationId } = useParams<{ teacherId: string; calculationId: string }>();
  const dispatch = useAppDispatch();
  const [hasFetched, setHasFetched] = useState(false);

  // Redux state
  const auditLogs = useAppSelector((state) => state.teachers.salaryAuditLogs);
  const loading = useAppSelector((state) => state.teachers.loading.fetchingSalaryAuditLog);
  const error = useAppSelector((state) => state.teachers.errors.fetchSalaryAuditLog);

  // Fetch audit log (extracts from salary calculation detail)
  const fetchAuditLog = useCallback(async () => {
    if (!teacherId || !calculationId) return;

    try {
      dispatch(setLoadingState({ operation: 'fetchingSalaryAuditLog', loading: true }));
      dispatch(setError({ operation: 'fetchSalaryAuditLog', error: null }));

      const data = await getSalaryCalculation(teacherId, calculationId);
      dispatch(setSalaryAuditLogs(data.auditLog));
      setHasFetched(true);
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to load audit log';
      dispatch(setError({ operation: 'fetchSalaryAuditLog', error: errorMessage }));
    } finally {
      dispatch(setLoadingState({ operation: 'fetchingSalaryAuditLog', loading: false }));
    }
  }, [teacherId, calculationId, dispatch]);

  // Fetch only when expanded for the first time (lazy load)
  useEffect(() => {
    if (isExpanded && !hasFetched && !loading) {
      fetchAuditLog();
    }
  }, [isExpanded, hasFetched, loading, fetchAuditLog]);

  const refetch = useCallback(() => {
    fetchAuditLog();
  }, [fetchAuditLog]);

  return {
    auditLogs,
    loading,
    error,
    refetch,
    hasFetched,
  };
}
