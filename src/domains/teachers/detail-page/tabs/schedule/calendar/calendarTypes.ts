/**
 * Teacher Lessons Calendar Types
 */

import { LessonStatusName, TeacherLessonResponse, TeacherLessonsStats } from '@/types/api/teacherLesson';
import { DayOfWeek } from '@/constants/schedule';

export type CalendarView = 'weekly' | 'monthly';

export interface CalendarDateRange {
  startDate: Date;
  endDate: Date;
}

/**
 * Calendar lesson - extends TeacherLessonResponse with derived fields
 */
export interface CalendarLesson extends TeacherLessonResponse {
  /** Derived day of week from scheduledDate */
  dayOfWeek: DayOfWeek;
  /** Parsed date object for comparisons */
  date: Date;
}

/**
 * Lessons grouped by date (YYYY-MM-DD key)
 */
export type LessonsByDate = Map<string, CalendarLesson[]>;

/**
 * Status counts for a day or period
 */
export interface StatusCounts {
  scheduled: number;
  conducted: number;
  cancelled: number;
  makeUp: number;
  noShow: number;
  total: number;
}

/**
 * Day cell data for monthly view
 */
export interface MonthDayData {
  date: Date;
  dateKey: string; // YYYY-MM-DD
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  lessons: CalendarLesson[];
  statusCounts: StatusCounts;
}

/**
 * Hook options
 */
export interface UseLessonsCalendarOptions {
  teacherId: string;
  academicYearId?: string | null;
}

/**
 * Hook result
 */
export interface UseLessonsCalendarResult {
  // View state
  view: CalendarView;
  setView: (view: CalendarView) => void;

  // Date navigation
  currentDate: Date;
  dateRange: CalendarDateRange;
  goToToday: () => void;
  goToPrevious: () => void;
  goToNext: () => void;

  // Data
  lessons: CalendarLesson[];
  lessonsByDate: LessonsByDate;
  loading: boolean;
  error: string | null;

  // Filters
  selectedClassId: string | null;
  setSelectedClassId: (classId: string | null) => void;
  selectedStatus: LessonStatusName | 'All';
  setSelectedStatus: (status: LessonStatusName | 'All') => void;
  classes: { id: string; name: string }[];

  // Filtered results
  filteredLessons: CalendarLesson[];
  filteredLessonsByDate: LessonsByDate;

  // Stats (optional, from API)
  stats: TeacherLessonsStats | null;

  // Refresh
  refresh: () => Promise<void>;
}

/**
 * Status color configuration for calendar slots
 */
export interface StatusColorConfig {
  bg: string;
  border: string;
  text: string;
  dot: string;
}

export const STATUS_COLORS: Record<LessonStatusName, StatusColorConfig> = {
  'Scheduled': {
    bg: 'bg-slate-500/40',
    border: 'border-slate-400/30',
    text: 'text-slate-200',
    dot: 'bg-slate-400',
  },
  'Conducted': {
    bg: 'bg-emerald-500/60',
    border: 'border-emerald-400/40',
    text: 'text-emerald-100',
    dot: 'bg-emerald-400',
  },
  'Cancelled': {
    bg: 'bg-rose-500/50',
    border: 'border-rose-400/40',
    text: 'text-rose-100',
    dot: 'bg-rose-400',
  },
  'Make Up': {
    bg: 'bg-violet-500/50',
    border: 'border-violet-400/40',
    text: 'text-violet-100',
    dot: 'bg-violet-400',
  },
  'No Show': {
    bg: 'bg-slate-500/30',
    border: 'border-slate-400/20',
    text: 'text-slate-300',
    dot: 'bg-slate-500',
  },
};
