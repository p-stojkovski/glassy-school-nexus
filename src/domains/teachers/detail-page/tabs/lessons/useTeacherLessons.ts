import { useState, useEffect, useCallback, useMemo } from 'react';
import { getTeacherLessons } from '@/services/teacherApiService';
import type {
  TeacherLessonResponse,
  TeacherLessonsStats,
  LessonStatusName,
} from '@/types/api/teacherLesson';
import { ScopeFilter } from '@/domains/lessons/utils/lessonFilters';
import { LessonTimeWindow } from '@/types/api/lesson';

interface UseTeacherLessonsOptions {
  teacherId: string;
  academicYearId?: string | null;
}

interface UseTeacherLessonsResult {
  lessons: TeacherLessonResponse[];
  stats: TeacherLessonsStats | null;
  loading: boolean;
  error: string | null;
  selectedStatus: LessonStatusName | 'All';
  setSelectedStatus: (status: LessonStatusName | 'All') => void;
  selectedClassId: string | null;
  setSelectedClassId: (classId: string | null) => void;
  scopeFilter: ScopeFilter;
  setScopeFilter: (scope: ScopeFilter) => void;
  timeWindow: LessonTimeWindow;
  setTimeWindow: (window: LessonTimeWindow) => void;
  classes: { id: string; name: string }[];
  refresh: () => Promise<void>;
  totalCount: number;
  skip: number;
  take: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  goToNextPage: () => void;
  goToPreviousPage: () => void;
}

export function useTeacherLessons({ teacherId, academicYearId }: UseTeacherLessonsOptions): UseTeacherLessonsResult {
  const [lessons, setLessons] = useState<TeacherLessonResponse[]>([]);
  const [stats, setStats] = useState<TeacherLessonsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [selectedStatus, setSelectedStatus] = useState<LessonStatusName | 'All'>('All');
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [scopeFilter, setScopeFilter] = useState<ScopeFilter>('all');
  const [timeWindow, setTimeWindow] = useState<LessonTimeWindow>('all');

  // Pagination state
  const [skip, setSkip] = useState(0);
  const [take] = useState(50);
  const [totalCount, setTotalCount] = useState(0);

  // Convert scope + time window to date range for API
  const dateRange = useMemo(() => {
    if (scopeFilter === 'all') {
      return { fromDate: undefined, toDate: undefined };
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    let days = 0;
    if (timeWindow === 'week') days = 7;
    else if (timeWindow === 'month') days = 30;
    else if (timeWindow === 'all') days = 3650; // ~10 years

    if (scopeFilter === 'upcoming') {
      const fromDate = today.toISOString().split('T')[0];
      const toDate = timeWindow === 'all'
        ? undefined
        : new Date(today.getTime() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      return { fromDate, toDate };
    } else if (scopeFilter === 'past') {
      const toDate = today.toISOString().split('T')[0];
      const fromDate = timeWindow === 'all'
        ? undefined
        : new Date(today.getTime() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      return { fromDate, toDate };
    }

    return { fromDate: undefined, toDate: undefined };
  }, [scopeFilter, timeWindow]);

  const loadLessons = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getTeacherLessons(teacherId, {
        status: selectedStatus === 'All' ? undefined : [selectedStatus],
        classId: selectedClassId ?? undefined,
        academicYearId: academicYearId ?? undefined,
        fromDate: dateRange.fromDate,
        toDate: dateRange.toDate,
        skip,
        take,
      });

      setLessons(response.lessons);
      setStats(response.stats);
      setTotalCount(response.totalCount);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load teacher lessons');
    } finally {
      setLoading(false);
    }
  }, [teacherId, selectedStatus, selectedClassId, academicYearId, dateRange.fromDate, dateRange.toDate, skip, take]);

  useEffect(() => {
    loadLessons();
  }, [loadLessons]);

  // Extract unique classes from lessons for the filter dropdown
  const classes = useMemo(() => {
    const classMap = new Map<string, string>();
    lessons.forEach((lesson) => {
      if (!classMap.has(lesson.classId)) {
        classMap.set(lesson.classId, lesson.className);
      }
    });
    return Array.from(classMap.entries()).map(([id, name]) => ({ id, name }));
  }, [lessons]);

  // Pagination helpers
  const hasNextPage = skip + take < totalCount;
  const hasPreviousPage = skip > 0;

  const goToNextPage = useCallback(() => {
    if (hasNextPage) {
      setSkip((prev) => prev + take);
    }
  }, [hasNextPage, take]);

  const goToPreviousPage = useCallback(() => {
    if (hasPreviousPage) {
      setSkip((prev) => Math.max(0, prev - take));
    }
  }, [hasPreviousPage, take]);

  // Reset pagination when filters change
  useEffect(() => {
    setSkip(0);
  }, [selectedStatus, selectedClassId, scopeFilter, timeWindow]);

  return {
    lessons,
    stats,
    loading,
    error,
    selectedStatus,
    setSelectedStatus,
    selectedClassId,
    setSelectedClassId,
    scopeFilter,
    setScopeFilter,
    timeWindow,
    setTimeWindow,
    classes,
    refresh: loadLessons,
    totalCount,
    skip,
    take,
    hasNextPage,
    hasPreviousPage,
    goToNextPage,
    goToPreviousPage,
  };
}
