import { useState, useEffect, useCallback, useMemo } from 'react';
import { getTeacherLessons } from '@/services/teacherApiService';
import type {
  TeacherLessonResponse,
  TeacherLessonsStats,
  LessonStatusName,
} from '@/types/api/teacherLesson';

interface UseTeacherLessonsOptions {
  teacherId: string;
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
  fromDate: string;
  setFromDate: (date: string) => void;
  toDate: string;
  setToDate: (date: string) => void;
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

export function useTeacherLessons({ teacherId }: UseTeacherLessonsOptions): UseTeacherLessonsResult {
  const [lessons, setLessons] = useState<TeacherLessonResponse[]>([]);
  const [stats, setStats] = useState<TeacherLessonsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [selectedStatus, setSelectedStatus] = useState<LessonStatusName | 'All'>('All');
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Pagination state
  const [skip, setSkip] = useState(0);
  const [take] = useState(50);
  const [totalCount, setTotalCount] = useState(0);

  const loadLessons = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getTeacherLessons(teacherId, {
        status: selectedStatus === 'All' ? undefined : [selectedStatus],
        classId: selectedClassId ?? undefined,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
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
  }, [teacherId, selectedStatus, selectedClassId, fromDate, toDate, skip, take]);

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
  }, [selectedStatus, selectedClassId, fromDate, toDate]);

  return {
    lessons,
    stats,
    loading,
    error,
    selectedStatus,
    setSelectedStatus,
    selectedClassId,
    setSelectedClassId,
    fromDate,
    setFromDate,
    toDate,
    setToDate,
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
