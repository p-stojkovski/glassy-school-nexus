import { useState, useEffect, useCallback } from 'react';
import { getTeacherSalary } from '@/services/teacherApiService';
import { TeacherSalaryResponse } from '@/types/api/teacherSalary';

interface UseTeacherSalaryOptions {
  teacherId: string;
  academicYearId?: string;
}

interface UseTeacherSalaryResult {
  data: TeacherSalaryResponse | null;
  loading: boolean;
  error: string | null;
  noSalaryConfigured: boolean;
  refresh: () => Promise<void>;
}

/**
 * Hook to fetch and manage teacher salary data for a specific academic year
 */
export function useTeacherSalary({
  teacherId,
  academicYearId
}: UseTeacherSalaryOptions): UseTeacherSalaryResult {
  const [data, setData] = useState<TeacherSalaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [noSalaryConfigured, setNoSalaryConfigured] = useState(false);

  const loadData = useCallback(async () => {
    if (!teacherId) {
      setError('Teacher ID is required');
      setLoading(false);
      return;
    }

    if (!academicYearId) {
      // If no academic year selected yet, just show loading
      setLoading(false);
      setData(null);
      return;
    }

    setLoading(true);
    setError(null);
    setNoSalaryConfigured(false);

    try {
      const result = await getTeacherSalary(teacherId, academicYearId);
      setData(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load salary data';

      // Detect the specific "no salary configured" error
      if (message.includes('No salary configuration found')) {
        setNoSalaryConfigured(true);
        setData(null);
        // Don't set error - we'll show a friendly empty state instead
      } else {
        setError(message);
        console.error('Error loading teacher salary:', err);
      }
    } finally {
      setLoading(false);
    }
  }, [teacherId, academicYearId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    data,
    loading,
    error,
    noSalaryConfigured,
    refresh: loadData,
  };
}
