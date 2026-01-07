import { useState, useEffect, useCallback, useMemo } from 'react';
import { teacherApiService } from '@/services/teacherApiService';
import { TeacherClassDto } from '@/types/api/teacher';
import { loadFromStorage, saveToStorage } from '@/lib/storage';

interface UseTeacherClassesOptions {
  teacherId: string;
  academicYearId?: string | null;
}

export type StatusFilter = 'all' | 'active' | 'inactive';

interface TeacherClassesFilterState {
  selectedYearId: string | null;
  statusFilter: StatusFilter;
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

  /** Status filter: 'all' | 'active' | 'inactive' */
  statusFilter: StatusFilter;
  /** Set the status filter */
  setStatusFilter: (value: StatusFilter) => void;

  /** Whether any non-default filters are active */
  hasActiveFilters: boolean;
  /** Reset all filters to defaults */
  resetFilters: () => void;

  /** Classes filtered by current filter state */
  filteredClasses: TeacherClassDto[];

  /** Refresh data from API */
  refresh: () => Promise<void>;
}

const DEFAULT_STATUS_FILTER: StatusFilter = 'all';

/**
 * Hook for fetching and filtering teacher's assigned classes.
 * Fetches all classes on mount and provides frontend filtering by year and status.
 * Persists filter state to session storage.
 *
 * If academicYearId is provided from parent (page-level), it overrides local filter state.
 */
export function useTeacherClasses({ teacherId, academicYearId }: UseTeacherClassesOptions): UseTeacherClassesResult {
  const storageKey = `teacher-classes-filters-${teacherId}`;

  // Load stored filters
  const loadStoredFilters = useCallback((): Partial<TeacherClassesFilterState> => {
    return loadFromStorage<Partial<TeacherClassesFilterState>>(storageKey) ?? {};
  }, [storageKey]);

  // Data state
  const [classes, setClasses] = useState<TeacherClassDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Filter state with stored defaults
  const storedFilters = loadStoredFilters();
  const [localYearId, setLocalYearId] = useState<string | null>(storedFilters.selectedYearId ?? null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(storedFilters.statusFilter ?? DEFAULT_STATUS_FILTER);

  // Use academicYearId from parent if provided, otherwise use local state
  const selectedYearId = academicYearId ?? localYearId;
  const setSelectedYearId = (id: string | null) => {
    setLocalYearId(id);
  };

  // Load classes from API
  const loadClasses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch all classes (no backend filtering - we filter on frontend)
      const data = await teacherApiService.getTeacherClasses(teacherId);
      setClasses(data);

      // Default to first (most recent) year if not already set and no stored preference
      if (data.length > 0 && !selectedYearId && !initialized) {
        const stored = loadStoredFilters();
        // Only set default if no stored preference exists
        if (!stored.selectedYearId) {
          setSelectedYearId(data[0].academicYearId);
        }
      }
      setInitialized(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load classes');
    } finally {
      setLoading(false);
    }
  }, [teacherId, selectedYearId, initialized, loadStoredFilters]);

  // Fetch on mount
  useEffect(() => {
    loadClasses();
  }, [teacherId]); // Only refetch when teacherId changes, not on filter changes

  // Persist filters when they change (only persist local state, not parent-provided)
  useEffect(() => {
    if (initialized && !academicYearId) {
      saveToStorage(storageKey, { selectedYearId: localYearId, statusFilter });
    }
  }, [localYearId, statusFilter, storageKey, initialized, academicYearId]);

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

  // Determine the default year (first available)
  const defaultYearId = academicYears.length > 0 ? academicYears[0].id : null;

  // Check if any non-default filters are active
  const hasActiveFilters = useMemo(() => {
    const isNonDefaultYear = selectedYearId !== defaultYearId;
    const isNonDefaultStatus = statusFilter !== DEFAULT_STATUS_FILTER;
    return isNonDefaultYear || isNonDefaultStatus;
  }, [selectedYearId, defaultYearId, statusFilter]);

  // Reset filters to defaults
  const resetFilters = useCallback(() => {
    setSelectedYearId(defaultYearId);
    setStatusFilter(DEFAULT_STATUS_FILTER);
  }, [defaultYearId]);

  // Apply frontend filters
  const filteredClasses = useMemo(() => {
    return classes.filter(c => {
      // Filter by academic year if selected
      if (selectedYearId && c.academicYearId !== selectedYearId) {
        return false;
      }
      // Filter by status
      if (statusFilter === 'active' && !c.isActive) {
        return false;
      }
      if (statusFilter === 'inactive' && c.isActive) {
        return false;
      }
      return true;
    });
  }, [classes, selectedYearId, statusFilter]);

  return {
    classes,
    loading,
    error,
    academicYears,
    selectedYearId,
    setSelectedYearId,
    statusFilter,
    setStatusFilter,
    hasActiveFilters,
    resetFilters,
    filteredClasses,
    refresh: loadClasses,
  };
}

export default useTeacherClasses;
