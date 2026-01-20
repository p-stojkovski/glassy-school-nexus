/**
 * Hook for loading and managing student data on the detail page.
 *
 * Features:
 * - Checks Redux store first before API fetch
 * - Syncs fetched data back to store
 * - Handles create mode (no fetch)
 * - Provides refresh capability
 */

import { useState, useEffect, useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { RootState } from '@/store';
import { studentApiService } from '@/services/studentApiService';
import {
  Student,
  addStudent as addStudentToStore,
  selectStudentById,
} from '@/domains/students/studentsSlice';
import { StudentErrorHandlers } from '@/utils/apiErrorHandler';

export interface UseStudentDataOptions {
  /** Student ID from route params */
  studentId: string | undefined;
  /** Whether in create mode (no fetch needed) */
  isCreateMode: boolean;
}

export interface UseStudentDataResult {
  /** Student data (from store or local state) */
  student: Student | null;
  /** Loading state for initial fetch */
  loading: boolean;
  /** Error message if fetch failed */
  error: string | null;
  /** Refetch student data from API (bypasses store cache) */
  refreshStudent: () => Promise<void>;
}

export const useStudentData = ({
  studentId,
  isCreateMode,
}: UseStudentDataOptions): UseStudentDataResult => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(!isCreateMode && !!studentId);
  const [error, setError] = useState<string | null>(null);
  const [studentData, setStudentData] = useState<Student | null>(null);

  // Try to get student from Redux store first
  const storeStudent = useAppSelector((state: RootState) =>
    studentId && studentId !== 'new' ? selectStudentById(state, studentId) : undefined
  );

  // Use store data if available, otherwise local state
  const student = storeStudent || studentData;

  // Fetch student data from API if not in store
  const fetchStudent = useCallback(async () => {
    if (isCreateMode || !studentId) {
      setLoading(false);
      return;
    }

    // If already in store, don't fetch
    if (storeStudent) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await studentApiService.getStudentById(studentId);
      setStudentData(data);
      // Also update store for consistency
      dispatch(addStudentToStore(data));
    } catch (err) {
      const msg = StudentErrorHandlers.fetchById(err);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [studentId, isCreateMode, storeStudent, dispatch]);

  // Load student on mount
  useEffect(() => {
    fetchStudent();
  }, [fetchStudent]);

  // Force refresh (bypasses store check)
  const refreshStudent = useCallback(async () => {
    if (!studentId || isCreateMode) return;

    setStudentData(null);
    setLoading(true);
    setError(null);

    try {
      const data = await studentApiService.getStudentById(studentId);
      setStudentData(data);
      dispatch(addStudentToStore(data));
    } catch (err) {
      const msg = StudentErrorHandlers.fetchById(err);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [studentId, isCreateMode, dispatch]);

  return {
    student,
    loading,
    error,
    refreshStudent,
  };
};
