import { useState, useEffect, useCallback, useMemo } from 'react';
import { teacherApiService } from '@/services/teacherApiService';
import { TeacherClassDto } from '@/types/api/teacher';

interface UseTeacherClassesOptions {
  teacherId: string;
  academicYearId?: string | null;
}

interface UseTeacherClassesResult {
  /** All classes loaded from API */
  classes: TeacherClassDto[];
  /** Loading state */
  loading: boolean;
  /** Error message if fetch failed */
  error: string | null;
  /** Classes filtered by academic year from parent */
  filteredClasses: TeacherClassDto[];
  /** Refresh data from API */
  refresh: () => Promise<void>;
}

/**
 * Hook for fetching and filtering teacher's assigned classes.
 * Fetches all classes on mount and filters by academic year from parent component.
 * The parent component (TeacherProfilePage) controls the academic year via header selector.
 */
export function useTeacherClasses({ teacherId, academicYearId }: UseTeacherClassesOptions): UseTeacherClassesResult {
  // Data state
  const [classes, setClasses] = useState<TeacherClassDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load classes from API
  const loadClasses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch all classes (we filter on frontend by academic year)
      const data = await teacherApiService.getTeacherClasses(teacherId);
      setClasses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load classes');
    } finally {
      setLoading(false);
    }
  }, [teacherId]);

  // Fetch on mount and when teacherId changes
  useEffect(() => {
    loadClasses();
  }, [teacherId]);

  // Apply frontend filter by academic year (from parent)
  const filteredClasses = useMemo(() => {
    if (!academicYearId) {
      return classes;
    }
    return classes.filter(c => c.academicYearId === academicYearId);
  }, [classes, academicYearId]);

  return {
    classes,
    loading,
    error,
    filteredClasses,
    refresh: loadClasses,
  };
}

export default useTeacherClasses;
