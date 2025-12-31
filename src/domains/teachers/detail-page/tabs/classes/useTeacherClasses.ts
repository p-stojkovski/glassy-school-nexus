import { useState, useEffect, useCallback, useMemo } from 'react';
import { teacherApiService } from '@/services/teacherApiService';
import { TeacherClassDto } from '@/types/api/teacher';

interface UseTeacherClassesOptions {
  teacherId: string;
}

interface UseTeacherClassesResult {
  /** All classes loaded from API */
  classes: TeacherClassDto[];
  /** Loading state */
  loading: boolean;
  /** Error message if fetch failed */
  error: string | null;

  /** Unique academic years derived from classes */
  academicYears: { id: string; name: string }[];
  /** Currently selected academic year filter */
  selectedYearId: string | null;
  /** Set the academic year filter */
  setSelectedYearId: (id: string | null) => void;

  /** Active/inactive status filter (null = all) */
  activeFilter: boolean | null;
  /** Set the active status filter */
  setActiveFilter: (value: boolean | null) => void;

  /** Classes filtered by current filter state */
  filteredClasses: TeacherClassDto[];

  /** Refresh data from API */
  refresh: () => Promise<void>;
}

/**
 * Hook for fetching and filtering teacher's assigned classes.
 * Fetches all classes on mount and provides frontend filtering by year and status.
 */
export function useTeacherClasses({ teacherId }: UseTeacherClassesOptions): UseTeacherClassesResult {
  // Data state
  const [classes, setClasses] = useState<TeacherClassDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [selectedYearId, setSelectedYearId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<boolean | null>(null);

  // Load classes from API
  const loadClasses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch all classes (no backend filtering - we filter on frontend)
      const data = await teacherApiService.getTeacherClasses(teacherId);
      setClasses(data);

      // Default to first (most recent) year if not already set
      if (data.length > 0 && !selectedYearId) {
        setSelectedYearId(data[0].academicYearId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load classes');
    } finally {
      setLoading(false);
    }
  }, [teacherId, selectedYearId]);

  // Fetch on mount
  useEffect(() => {
    loadClasses();
  }, [teacherId]); // Only refetch when teacherId changes, not on filter changes

  // Derive unique academic years from loaded classes
  const academicYears = useMemo(() => {
    const yearsMap = new Map<string, { id: string; name: string }>();
    classes.forEach(c => {
      if (!yearsMap.has(c.academicYearId)) {
        yearsMap.set(c.academicYearId, {
          id: c.academicYearId,
          name: c.academicYearName
        });
      }
    });
    return Array.from(yearsMap.values());
  }, [classes]);

  // Apply frontend filters
  const filteredClasses = useMemo(() => {
    return classes.filter(c => {
      // Filter by academic year if selected
      if (selectedYearId && c.academicYearId !== selectedYearId) {
        return false;
      }
      // Filter by active status if set
      if (activeFilter !== null && c.isActive !== activeFilter) {
        return false;
      }
      return true;
    });
  }, [classes, selectedYearId, activeFilter]);

  return {
    classes,
    loading,
    error,
    academicYears,
    selectedYearId,
    setSelectedYearId,
    activeFilter,
    setActiveFilter,
    filteredClasses,
    refresh: loadClasses,
  };
}

export default useTeacherClasses;
