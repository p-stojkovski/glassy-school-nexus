/**
 * useLessons Hook
 * 
 * Custom hook for lesson management operations including academic-aware lesson generation
 */

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
  quickConductLesson,
  quickCancelLesson,
  fetchTodayLessons,
  fetchUpcomingLessons,
  setFilters,
  updateFilters,
  clearFilters,
  setViewMode,
  setDateRange,
  selectLessons,
  selectSelectedLesson,
} from '@/domains/lessons/lessonsSlice';
import { lessonApiService } from '@/services/lessonApiService';
import { 
  LessonSearchParams,
  CreateLessonRequest,
  CancelLessonRequest,
  MarkLessonConductedRequest,
  CreateMakeupLessonRequest,
  GenerateLessonsRequest,
  GenerateLessonsAcademicAwareRequest,
  AcademicAwareLessonGenerationResult,
  MakeupLessonFormData,
  ClassLessonFilterParams
} from '@/types/api/lesson';
import { EnhancedLessonGenerationResult } from '@/types/api/lesson-generation-enhanced';

export function useLessons() {
  const dispatch = useAppDispatch();
  
  // Selectors
  const lessons = useAppSelector(selectLessons);
  const selectedLesson = useAppSelector(selectSelectedLesson);
  const loading = useAppSelector((state) => state.lessons.loading);
  const loadingStates = useAppSelector((state) => state.lessons.loadingStates);
  const error = useAppSelector((state) => state.lessons.error);
  const filters = useAppSelector((state) => state.lessons.filters);
  const viewMode = useAppSelector((state) => state.lessons.viewMode);
  const dateRange = useAppSelector((state) => state.lessons.dateRange);
  const todayLessons = useAppSelector((state) => state.lessons.todayLessons);
  const upcomingLessons = useAppSelector((state) => state.lessons.upcomingLessons);
  const lastGenerationResult = useAppSelector((state) => state.lessons.lastGenerationResult);

  // Actions
  const fetchLessonsAction = useCallback((params?: LessonSearchParams) => {
    return dispatch(fetchLessons(params));
  }, [dispatch]);

  const fetchLessonByIdAction = useCallback((id: string) => {
    return dispatch(fetchLessonById(id));
  }, [dispatch]);

  const fetchLessonsForClassAction = useCallback((classId: string, filters?: ClassLessonFilterParams) => {
    return dispatch(fetchLessonsForClass({ classId, filters }));
  }, [dispatch]);

  const createLessonAction = useCallback((request: CreateLessonRequest) => {
    return dispatch(createLesson(request));
  }, [dispatch]);

  const cancelLessonAction = useCallback((id: string, request: CancelLessonRequest) => {
    return dispatch(cancelLesson({ id, request }));
  }, [dispatch]);

  const conductLessonAction = useCallback((id: string, request?: MarkLessonConductedRequest) => {
    return dispatch(conductLesson({ id, request }));
  }, [dispatch]);

  const createMakeupLessonAction = useCallback((originalLessonId: string, request: CreateMakeupLessonRequest) => {
    return dispatch(createMakeupLesson({ originalLessonId, request }));
  }, [dispatch]);

  const generateLessonsAction = useCallback((request: GenerateLessonsRequest) => {
    return dispatch(generateLessons(request));
  }, [dispatch]);

  const quickConductLessonAction = useCallback((id: string, notes?: string) => {
    return dispatch(quickConductLesson({ id, notes }));
  }, [dispatch]);

  const quickCancelLessonAction = useCallback((id: string, reason: string, makeupData?: MakeupLessonFormData) => {
    return dispatch(quickCancelLesson({ id, reason, makeupData }));
  }, [dispatch]);

  const fetchTodayLessonsAction = useCallback(() => {
    return dispatch(fetchTodayLessons());
  }, [dispatch]);

  const fetchUpcomingLessonsAction = useCallback((days?: number) => {
    return dispatch(fetchUpcomingLessons(days));
  }, [dispatch]);

  // Academic-aware lesson generation (direct API call since it's not in Redux yet)
  const generateLessonsAcademicAware = useCallback(async (
    classId: string, 
    request: GenerateLessonsAcademicAwareRequest
  ): Promise<EnhancedLessonGenerationResult> => {
    return lessonApiService.generateLessonsAcademicAware(classId, request);
  }, []);

  // Filter management
  const setFiltersAction = useCallback((filters: LessonSearchParams) => {
    dispatch(setFilters(filters));
  }, [dispatch]);

  const updateFiltersAction = useCallback((filters: Partial<LessonSearchParams>) => {
    dispatch(updateFilters(filters));
  }, [dispatch]);

  const clearFiltersAction = useCallback(() => {
    dispatch(clearFilters());
  }, [dispatch]);

  // View management
  const setViewModeAction = useCallback((mode: 'list' | 'calendar' | 'timeline') => {
    dispatch(setViewMode(mode));
  }, [dispatch]);

  const setDateRangeAction = useCallback((range: { startDate: string; endDate: string }) => {
    dispatch(setDateRange(range));
  }, [dispatch]);

  return {
    // Data
    lessons,
    selectedLesson,
    loading,
    loadingStates,
    error,
    filters,
    viewMode,
    dateRange,
    todayLessons,
    upcomingLessons,
    lastGenerationResult,

    // Actions
    fetchLessons: fetchLessonsAction,
    fetchLessonById: fetchLessonByIdAction,
    fetchLessonsForClass: fetchLessonsForClassAction,
    createLesson: createLessonAction,
    cancelLesson: cancelLessonAction,
    conductLesson: conductLessonAction,
    createMakeupLesson: createMakeupLessonAction,
    generateLessons: generateLessonsAction,
    generateLessonsAcademicAware,
    quickConductLesson: quickConductLessonAction,
    quickCancelLesson: quickCancelLessonAction,
    fetchTodayLessons: fetchTodayLessonsAction,
    fetchUpcomingLessons: fetchUpcomingLessonsAction,

    // Filter management
    setFilters: setFiltersAction,
    updateFilters: updateFiltersAction,
    clearFilters: clearFiltersAction,

    // View management
    setViewMode: setViewModeAction,
    setDateRange: setDateRangeAction,
  };
}

export default useLessons;

