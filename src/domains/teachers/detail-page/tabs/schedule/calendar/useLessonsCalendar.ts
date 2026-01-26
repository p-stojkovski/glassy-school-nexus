/**
 * Hook for managing teacher lessons calendar state and data fetching
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { getTeacherLessons } from '@/services/teacherApiService';
import type { LessonStatusName, TeacherLessonsStats } from '@/types/api/teacherLesson';
import type {
  CalendarView,
  CalendarDateRange,
  CalendarLesson,
  LessonsByDate,
  UseLessonsCalendarOptions,
  UseLessonsCalendarResult,
} from './calendarTypes';
import {
  getDateRangeForView,
  formatDateForApi,
  toCalendarLessons,
  groupLessonsByDate,
  navigatePrevious,
  navigateNext,
} from './utils';

export function useLessonsCalendar({
  teacherId,
  academicYearId,
}: UseLessonsCalendarOptions): UseLessonsCalendarResult {
  // View state - default to weekly
  const [view, setView] = useState<CalendarView>('weekly');

  // Date navigation - anchor date for the current view
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());

  // Data state
  const [lessons, setLessons] = useState<CalendarLesson[]>([]);
  const [stats, setStats] = useState<TeacherLessonsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<LessonStatusName | 'All'>('All');

  // Calculate date range based on view and current date
  const dateRange: CalendarDateRange = useMemo(() => {
    return getDateRangeForView(currentDate, view);
  }, [currentDate, view]);

  // Fetch lessons for the current date range
  const loadLessons = useCallback(async () => {
    if (!teacherId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await getTeacherLessons(teacherId, {
        fromDate: formatDateForApi(dateRange.startDate),
        toDate: formatDateForApi(dateRange.endDate),
        academicYearId: academicYearId ?? undefined,
        // Backend max is 100, which should cover most weekly/monthly views
        take: 100,
      });

      const calendarLessons = toCalendarLessons(response.lessons);
      setLessons(calendarLessons);
      setStats(response.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load lessons');
    } finally {
      setLoading(false);
    }
  }, [teacherId, dateRange.startDate, dateRange.endDate, academicYearId]);

  // Load lessons when dependencies change
  useEffect(() => {
    loadLessons();
  }, [loadLessons]);

  // Group lessons by date
  const lessonsByDate: LessonsByDate = useMemo(() => {
    return groupLessonsByDate(lessons);
  }, [lessons]);

  // Apply client-side filters
  const filteredLessons: CalendarLesson[] = useMemo(() => {
    return lessons.filter((lesson) => {
      // Filter by status
      if (selectedStatus !== 'All' && lesson.statusName !== selectedStatus) {
        return false;
      }
      // Filter by class
      if (selectedClassId && lesson.classId !== selectedClassId) {
        return false;
      }
      return true;
    });
  }, [lessons, selectedStatus, selectedClassId]);

  // Group filtered lessons by date
  const filteredLessonsByDate: LessonsByDate = useMemo(() => {
    return groupLessonsByDate(filteredLessons);
  }, [filteredLessons]);

  // Extract unique classes for filter dropdown
  const classes = useMemo(() => {
    const classMap = new Map<string, string>();
    lessons.forEach((lesson) => {
      if (!classMap.has(lesson.classId)) {
        classMap.set(lesson.classId, lesson.className);
      }
    });
    return Array.from(classMap.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [lessons]);

  // Navigation handlers
  const goToToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  const goToPrevious = useCallback(() => {
    setCurrentDate((prev) => navigatePrevious(prev, view));
  }, [view]);

  const goToNext = useCallback(() => {
    setCurrentDate((prev) => navigateNext(prev, view));
  }, [view]);

  // Handle view change - keep current date but recalculate range
  const handleSetView = useCallback((newView: CalendarView) => {
    setView(newView);
  }, []);

  // Refresh handler
  const refresh = useCallback(async () => {
    await loadLessons();
  }, [loadLessons]);

  return {
    // View state
    view,
    setView: handleSetView,

    // Date navigation
    currentDate,
    dateRange,
    goToToday,
    goToPrevious,
    goToNext,

    // Data
    lessons,
    lessonsByDate,
    loading,
    error,

    // Filters
    selectedClassId,
    setSelectedClassId,
    selectedStatus,
    setSelectedStatus,
    classes,

    // Filtered results
    filteredLessons,
    filteredLessonsByDate,

    // Stats
    stats,

    // Refresh
    refresh,
  };
}
