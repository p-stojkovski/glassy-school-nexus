import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchLessons,
  fetchLessonById,
  fetchLessonsForClass,
  createLesson,
  cancelLesson,
  conductLesson,
  createMakeupLesson,
  generateLessons,
  fetchTodayLessons,
  fetchUpcomingLessons,
  quickConductLesson,
  quickCancelLesson,
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
} from '../lessonsSlice';
import {
  LessonSearchParams,
  CreateLessonRequest,
  CancelLessonRequest,
  MarkLessonConductedRequest,
  CreateMakeupLessonRequest,
  GenerateLessonsRequest,
  LessonStatusName,
  MakeupLessonFormData,
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
    (classId: string, includeHistory?: boolean) => {
      return dispatch(fetchLessonsForClass({ classId, includeHistory }));
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
    loadTodayLessons,
    loadUpcomingLessons,
    quickConduct,
    quickCancel,
    
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
export const useLessonsForClass = (classId: string) => {
  const dispatch = useAppDispatch();
  const lessons = useAppSelector(selectLessonsForClass(classId));
  const summary = useAppSelector(selectLessonSummaryForClass(classId));
  const loading = useAppSelector(selectLessonsLoading);

  const loadLessons = useCallback(
    (includeHistory?: boolean) => {
      return dispatch(fetchLessonsForClass({ classId, includeHistory }));
    },
    [dispatch, classId]
  );

  return {
    lessons,
    summary,
    loading,
    loadLessons,
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
