import { LessonResponse } from '@/types/api/lesson';

export type ScopeFilter = 'upcoming' | 'past' | 'all';
export type TimeRangeFilter = 'week' | 'month' | 'all';

export interface LessonFilters {
  status?: string;
  teacher?: string;
  scope?: ScopeFilter;
  timeRange?: TimeRangeFilter;
  searchQuery?: string;
}

export const filterLessons = (
  lessons: LessonResponse[],
  filters: LessonFilters
): LessonResponse[] => {
  let filtered = [...lessons];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Status filter
  if (filters.status && filters.status !== 'all') {
    filtered = filtered.filter(l => l.statusName === filters.status);
  }

  // Teacher filter
  if (filters.teacher && filters.teacher !== 'all') {
    filtered = filtered.filter(l => l.teacherId === filters.teacher);
  }

  // Scope filter (upcoming/past/all)
  if (filters.scope === 'upcoming') {
    filtered = filtered.filter(l => {
      const lessonDate = new Date(l.scheduledDate);
      lessonDate.setHours(0, 0, 0, 0);
      return lessonDate >= today;
    });
  } else if (filters.scope === 'past') {
    filtered = filtered.filter(l => {
      const lessonDate = new Date(l.scheduledDate);
      lessonDate.setHours(0, 0, 0, 0);
      return lessonDate < today;
    });
  }

  // Time range filter
  if (filters.timeRange === 'week') {
    const weekEnd = new Date(today);
    weekEnd.setDate(weekEnd.getDate() + 7);
    filtered = filtered.filter(l => {
      const lessonDate = new Date(l.scheduledDate);
      lessonDate.setHours(0, 0, 0, 0);
      return lessonDate <= weekEnd;
    });
  } else if (filters.timeRange === 'month') {
    const monthEnd = new Date(today);
    monthEnd.setMonth(monthEnd.getMonth() + 1);
    filtered = filtered.filter(l => {
      const lessonDate = new Date(l.scheduledDate);
      lessonDate.setHours(0, 0, 0, 0);
      return lessonDate <= monthEnd;
    });
  }

  // Search filter (search in notes and class name)
  if (filters.searchQuery && filters.searchQuery.trim() !== '') {
    const query = filters.searchQuery.toLowerCase();
    filtered = filtered.filter(l => 
      l.notes?.toLowerCase().includes(query) ||
      l.className.toLowerCase().includes(query) ||
      l.teacherName.toLowerCase().includes(query)
    );
  }

  return filtered;
};
