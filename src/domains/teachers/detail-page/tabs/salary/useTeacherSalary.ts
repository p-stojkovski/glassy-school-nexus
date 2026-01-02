import { useState, useEffect, useCallback } from 'react';
import { getTeacherSalary } from '@/services/teacherApiService';
import { TeacherSalaryResponse } from '@/types/api/teacherSalary';

interface UseTeacherSalaryOptions {
  teacherId: string;
  year: number;
  month: number;
}

interface UseTeacherSalaryResult {
  data: TeacherSalaryResponse | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Hook to fetch and manage teacher salary data for a specific month
 */
export function useTeacherSalary({ 
  teacherId, 
  year, 
  month 
}: UseTeacherSalaryOptions): UseTeacherSalaryResult {
  const [data, setData] = useState<TeacherSalaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!teacherId || !year || !month) {
      setError('Teacher ID, year, and month are required');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await getTeacherSalary(teacherId, year, month);
      setData(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load salary data';
      setError(message);
      console.error('Error loading teacher salary:', err);
    } finally {
      setLoading(false);
    }
  }, [teacherId, year, month]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    data,
    loading,
    error,
    refresh: loadData,
  };
}
