import { useState, useEffect, useMemo, useCallback } from 'react';
import { LessonStatusName, ClassLessonFilterParams, LessonTimeWindow } from '@/types/api/lesson';
import { AcademicSemesterResponse } from '@/types/api/academic-calendar';
import { ScopeFilter } from '@/domains/lessons/utils/lessonFilters';
import { loadFromStorage, saveToStorage } from '@/lib/storage';
import { academicCalendarApiService } from '@/services/academicCalendarApiService';

type LessonFilter = 'all' | LessonStatusName;
type TimeFilterState = {
  scope: ScopeFilter;
  timeWindow: LessonTimeWindow;
};

const DEFAULT_SCOPE: ScopeFilter = 'upcoming';
const DEFAULT_TIME_WINDOW: LessonTimeWindow = 'month';

interface UseLessonsTabFiltersOptions {
  classId: string;
  academicYearId?: string;
}

interface UseLessonsTabFiltersResult {
  // Status filter
  statusFilter: LessonFilter;
  setStatusFilter: (filter: LessonFilter) => void;
  // Scope filter
  scopeFilter: ScopeFilter;
  handleScopeChange: (value: ScopeFilter) => void;
  // Time window
  timeWindow: LessonTimeWindow;
  setTimeWindow: (window: LessonTimeWindow) => void;
  // Semester filter
  semesters: AcademicSemesterResponse[];
  selectedSemesterId: string;
  setSelectedSemesterId: (id: string) => void;
  loadingSemesters: boolean;
  // Combined filter params for API
  currentFilters: ClassLessonFilterParams;
}

/**
 * Hook to manage all filtering state for the LessonsTab.
 * Handles status, scope, time window, and semester filters with persistence.
 */
export function useLessonsTabFilters({
  classId,
  academicYearId,
}: UseLessonsTabFiltersOptions): UseLessonsTabFiltersResult {
  const [statusFilter, setStatusFilter] = useState<LessonFilter>('all');

  // Semester filtering state
  const [semesters, setSemesters] = useState<AcademicSemesterResponse[]>([]);
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>('all');
  const [loadingSemesters, setLoadingSemesters] = useState(false);

  // Scope and time window with persistence
  const storageKey = `class-lessons-time-filter-${classId}`;

  const loadStoredTimeFilters = useCallback((): TimeFilterState => {
    const stored = loadFromStorage<Partial<TimeFilterState>>(storageKey);
    return {
      scope: stored?.scope ?? DEFAULT_SCOPE,
      timeWindow: stored?.timeWindow ?? DEFAULT_TIME_WINDOW,
    };
  }, [storageKey]);

  const initialTimeFilters = loadStoredTimeFilters();
  const [scopeFilter, setScopeFilter] = useState<ScopeFilter>(initialTimeFilters.scope);
  const [timeWindow, setTimeWindow] = useState<LessonTimeWindow>(initialTimeFilters.timeWindow);

  // Fetch semesters for the class's academic year
  useEffect(() => {
    const fetchSemesters = async () => {
      if (!academicYearId) return;

      setLoadingSemesters(true);
      try {
        const semestersList = await academicCalendarApiService.getSemestersForYear(academicYearId);
        const activeSemesters = semestersList.filter((s) => !s.isDeleted);
        setSemesters(activeSemesters);
      } catch (err) {
        console.error('Failed to load semesters:', err);
      } finally {
        setLoadingSemesters(false);
      }
    };

    fetchSemesters();
  }, [academicYearId]);

  // Persist time filters per class (session-level)
  useEffect(() => {
    saveToStorage(storageKey, { scope: scopeFilter, timeWindow });
  }, [scopeFilter, timeWindow, storageKey]);

  // Reload stored filters when switching classes
  useEffect(() => {
    const stored = loadStoredTimeFilters();
    setScopeFilter(stored.scope);
    setTimeWindow(stored.timeWindow);
    setSelectedSemesterId('all');
  }, [classId, loadStoredTimeFilters]);

  const handleScopeChange = useCallback((value: ScopeFilter) => {
    setScopeFilter(value);
    if (value === 'all') {
      setTimeWindow('all');
    }
  }, []);

  // Build current filter params for API calls
  const currentFilters = useMemo((): ClassLessonFilterParams => ({
    scope: scopeFilter,
    statusName: statusFilter,
    timeWindow,
    ...(selectedSemesterId !== 'all' && { semesterId: selectedSemesterId }),
  }), [scopeFilter, statusFilter, timeWindow, selectedSemesterId]);

  return {
    statusFilter,
    setStatusFilter,
    scopeFilter,
    handleScopeChange,
    timeWindow,
    setTimeWindow,
    semesters,
    selectedSemesterId,
    setSelectedSemesterId,
    loadingSemesters,
    currentFilters,
  };
}
