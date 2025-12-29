import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import lessonApiService from '@/services/lessonApiService';
import {
  fetchLessons,
  fetchLessonById,
  fetchLessonsForClass,
  fetchPastUnstartedLessons,
  fetchPastUnstartedCount,
  createLesson,
  cancelLesson,
  conductLesson,
  createMakeupLesson,
  generateLessons,
  fetchTodayLessons,
  fetchUpcomingLessons,
  quickConductLesson,
  quickCancelLesson,
  rescheduleLesson,
  // Actions
  setLessons,
  setSelectedLesson,
  setFilters,
  updateFilters,
  clearFilters,
  setViewMode,
  setDateRange,
  clearError,
  // Selectors
  selectLessons,
  selectSelectedLesson,
  selectLessonSummaryForClass,
  selectLessonsLoading,
  selectLessonLoading,
  selectCreatingLesson,
  selectCancellingLesson,
  selectConductingLesson,
  selectGeneratingLessons,
  selectReschedulingLesson,
  selectLessonsError,
  selectLessonsFilters,
  selectLessonsViewMode,
  selectLessonsDateRange,
  selectTodayLessons,
  selectUpcomingLessons,
  selectLessonsForClass,
  selectLessonsByStatus,
  selectLessonCounts,
  selectIsAnyLessonLoading,
  selectPastUnstartedLessons,
  selectPastUnstartedCount,
  selectFetchingPastUnstarted,
  selectFetchingPastUnstartedCount,
} from '../lessonsSlice';
  import { 
  LessonSearchParams,
  CreateLessonRequest,
  CancelLessonRequest,
  MarkLessonConductedRequest,
  CreateMakeupLessonRequest,
  GenerateLessonsRequest,
  GenerateLessonsAcademicAwareRequest,
  AcademicAwareLessonGenerationResult,
  LessonStatusName,
  MakeupLessonFormData,
  RescheduleLessonRequest,
  ClassLessonFilterParams,
} from '@/types/api/lesson';

export const useLessons = () => {
  const dispatch = useAppDispatch();

  // Selectors
  const lessons = useAppSelector(selectLessons);
  const selectedLesson = useAppSelector(selectSelectedLesson);
  const loading = useAppSelector(selectLessonsLoading);
  const lessonLoading = useAppSelector(selectLessonLoading);
  const creatingLesson = useAppSelector(selectCreatingLesson);
  const cancellingLesson = useAppSelector(selectCancellingLesson);
  const conductingLesson = useAppSelector(selectConductingLesson);
  const generatingLessons = useAppSelector(selectGeneratingLessons);
  const reschedulingLesson = useAppSelector(selectReschedulingLesson);
  const error = useAppSelector(selectLessonsError);
  const filters = useAppSelector(selectLessonsFilters);
  const viewMode = useAppSelector(selectLessonsViewMode);
  const dateRange = useAppSelector(selectLessonsDateRange);
  const todayLessons = useAppSelector(selectTodayLessons);
  const upcomingLessons = useAppSelector(selectUpcomingLessons);
  const lessonCounts = useAppSelector(selectLessonCounts);
  const isAnyLoading = useAppSelector(selectIsAnyLessonLoading);

  // Actions
  const loadLessons = useCallback(
    (params?: LessonSearchParams) => {
      return dispatch(fetchLessons(params || {}));
    },
    [dispatch]
  );

  const loadLessonById = useCallback(
    (id: string) => {
      return dispatch(fetchLessonById(id));
    },
    [dispatch]
  );

  const loadLessonsForClass = useCallback(
    (classId: string, filters?: ClassLessonFilterParams) => {
      return dispatch(fetchLessonsForClass({ classId, filters }));
    },
    [dispatch]
  );


  const addLesson = useCallback(
    (request: CreateLessonRequest) => {
      return dispatch(createLesson(request));
    },
    [dispatch]
  );

  const cancelLessonById = useCallback(
    (id: string, request: CancelLessonRequest) => {
      return dispatch(cancelLesson({ id, request }));
    },
    [dispatch]
  );

  const conductLessonById = useCallback(
    (id: string, request?: MarkLessonConductedRequest) => {
      return dispatch(conductLesson({ id, request }));
    },
    [dispatch]
  );

  const createMakeup = useCallback(
    (originalLessonId: string, request: CreateMakeupLessonRequest) => {
      return dispatch(createMakeupLesson({ originalLessonId, request }));
    },
    [dispatch]
  );

  const generateLessonsForClass = useCallback(
    (request: GenerateLessonsRequest) => {
      return dispatch(generateLessons(request));
    },
    [dispatch]
  );

  // Academic-aware generation (call service directly for simplicity in this request)
  const generateLessonsAcademicAware = useCallback(
    async (classId: string, request: GenerateLessonsAcademicAwareRequest) => {
      try {
        const result = await lessonApiService.generateLessonsAcademicAware(classId, request);
        return result;
      } finally {
      }
    },
    []
  );

  const loadTodayLessons = useCallback(() => {
    return dispatch(fetchTodayLessons());
  }, [dispatch]);

  const loadUpcomingLessons = useCallback((days?: number) => {
    return dispatch(fetchUpcomingLessons(days));
  }, [dispatch]);

  const quickConduct = useCallback(
    (id: string, notes?: string) => {
      return dispatch(quickConductLesson({ id, notes }));
    },
    [dispatch]
  );

  const quickCancel = useCallback(
    (id: string, reason: string, makeupData?: MakeupLessonFormData) => {
      return dispatch(quickCancelLesson({ id, reason, makeupData }));
    },
    [dispatch]
  );

  const rescheduleLessonById = useCallback(
    (id: string, request: RescheduleLessonRequest) => {
      return dispatch(rescheduleLesson({ id, request }));
    },
    [dispatch]
  );

  // UI Actions
  const selectLesson = useCallback(
    (lesson: any) => {
      dispatch(setSelectedLesson(lesson));
    },
    [dispatch]
  );

  const updateFiltersState = useCallback(
    (newFilters: Partial<LessonSearchParams>) => {
      dispatch(updateFilters(newFilters));
    },
    [dispatch]
  );

  const setFiltersState = useCallback(
    (newFilters: LessonSearchParams) => {
      dispatch(setFilters(newFilters));
    },
    [dispatch]
  );

  const clearFiltersState = useCallback(() => {
    dispatch(clearFilters());
  }, [dispatch]);

  const setViewModeState = useCallback(
    (mode: 'list' | 'calendar' | 'timeline') => {
      dispatch(setViewMode(mode));
    },
    [dispatch]
  );

  const setDateRangeState = useCallback(
    (range: { startDate: string; endDate: string }) => {
      dispatch(setDateRange(range));
    },
    [dispatch]
  );

  const clearErrorState = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    // Data
    lessons,
    selectedLesson,
    todayLessons,
    upcomingLessons,
    lessonCounts,
    
    // Loading states
    loading,
    lessonLoading,
    creatingLesson,
    cancellingLesson,
    conductingLesson,
    generatingLessons,
    reschedulingLesson,
    isAnyLoading,
    
    // Error
    error,
    clearError: clearErrorState,
    
    // UI State
    filters,
    viewMode,
    dateRange,
    
    // Actions
    loadLessons,
    loadLessonById,
    loadLessonsForClass,
    addLesson,
    cancelLessonById,
    conductLessonById,
    createMakeup,
    generateLessonsForClass,
    generateLessonsAcademicAware,
    loadTodayLessons,
    loadUpcomingLessons,
    quickConduct,
    quickCancel,
    rescheduleLessonById,
    
    // UI Actions
    selectLesson,
    updateFilters: updateFiltersState,
    setFilters: setFiltersState,
    clearFilters: clearFiltersState,
    setViewMode: setViewModeState,
    setDateRange: setDateRangeState,
  };
};

// Specialized hooks for specific use cases

/**
 * Hook for managing lessons for a specific class with server-side filtering.
 * Supports time scope (upcoming/past/all) and status filtering.
 */
export const useLessonsForClass = (classId: string) => {
  const dispatch = useAppDispatch();
  const lessons = useAppSelector(selectLessonsForClass(classId));
  const pastUnstartedLessons = useAppSelector(selectPastUnstartedLessons);
  const pastUnstartedCount = useAppSelector(selectPastUnstartedCount);
  const summary = useAppSelector(selectLessonSummaryForClass(classId));
  const loading = useAppSelector(selectLessonsLoading);
  const loadingPastUnstarted = useAppSelector(selectFetchingPastUnstarted);
  const loadingPastUnstartedCount = useAppSelector(selectFetchingPastUnstartedCount);

  /**
   * Load lessons for the class with optional server-side filters.
   * @param filters - Optional filters for scope (upcoming/past/all) and status
   */
  const loadLessons = useCallback(
    (filters?: ClassLessonFilterParams) => {
      return dispatch(fetchLessonsForClass({ classId, filters }));
    },
    [dispatch, classId]
  );

  /**
   * Load count of past unstarted lessons (lightweight endpoint for banner).
   * Use this for initial page load when only the count is needed.
   */
  const loadPastUnstartedCount = useCallback(() => {
    return dispatch(fetchPastUnstartedCount(classId));
  }, [dispatch, classId]);

  /**
   * Load full past unstarted lessons for the class (for review mode).
   * Use this when user enters review mode and needs to see all lesson details.
   */
  const loadPastUnstartedLessons = useCallback(() => {
    return dispatch(fetchPastUnstartedLessons(classId));
  }, [dispatch, classId]);

  return {
    lessons,
    pastUnstartedLessons,
    pastUnstartedCount,
    summary,
    loading,
    loadingPastUnstarted,
    loadingPastUnstartedCount,
    loadLessons,
    loadPastUnstartedCount,
    loadPastUnstartedLessons,
  };
};

export const useLessonsByStatus = (status: LessonStatusName) => {
  const lessons = useAppSelector(selectLessonsByStatus(status));
  return { lessons };
};

export const useTodayLessons = () => {
  const dispatch = useAppDispatch();
  const lessons = useAppSelector(selectTodayLessons);
  const loading = useAppSelector(selectLessonsLoading);

  const loadTodayLessons = useCallback(() => {
    return dispatch(fetchTodayLessons());
  }, [dispatch]);

  return {
    lessons,
    loading,
    loadTodayLessons,
  };
};

export const useUpcomingLessons = (days: number = 7) => {
  const dispatch = useAppDispatch();
  const lessons = useAppSelector(selectUpcomingLessons);
  const loading = useAppSelector(selectLessonsLoading);

  const loadUpcomingLessons = useCallback(() => {
    return dispatch(fetchUpcomingLessons(days));
  }, [dispatch, days]);

  return {
    lessons,
    loading,
    loadUpcomingLessons,
  };
};

export default useLessons;

