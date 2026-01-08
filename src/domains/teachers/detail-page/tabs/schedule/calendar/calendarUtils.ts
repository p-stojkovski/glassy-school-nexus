/**
 * Calendar utility functions for date calculations
 */

import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  addWeeks,
  subWeeks,
  addMonths,
  subMonths,
  format,
  isSameDay,
  isSameMonth,
  eachDayOfInterval,
  getDay,
  parse,
} from 'date-fns';
import { DayOfWeek, DAYS_OF_WEEK } from '@/constants/schedule';
import type {
  CalendarDateRange,
  CalendarLesson,
  CalendarView,
  LessonsByDate,
  MonthDayData,
  StatusCounts,
} from './calendarTypes';
import type { TeacherLessonResponse } from '@/types/api/teacherLesson';

/**
 * Get Monday-Sunday range for a week containing the given date
 */
export function getWeekRange(date: Date): CalendarDateRange {
  const monday = startOfWeek(date, { weekStartsOn: 1 });
  const sunday = endOfWeek(date, { weekStartsOn: 1 });
  return { startDate: monday, endDate: sunday };
}

/**
 * Get the full visible range for a month calendar grid (includes spillover days)
 * Returns 6 weeks to ensure consistent grid size
 */
export function getMonthGridRange(date: Date): CalendarDateRange {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  // Start from Monday of the week containing month start
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  // End on Sunday of the week containing month end
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  return { startDate: gridStart, endDate: gridEnd };
}

/**
 * Navigate to previous week/month
 */
export function navigatePrevious(currentDate: Date, view: CalendarView): Date {
  return view === 'weekly'
    ? subWeeks(currentDate, 1)
    : subMonths(currentDate, 1);
}

/**
 * Navigate to next week/month
 */
export function navigateNext(currentDate: Date, view: CalendarView): Date {
  return view === 'weekly'
    ? addWeeks(currentDate, 1)
    : addMonths(currentDate, 1);
}

/**
 * Get date range based on view type
 */
export function getDateRangeForView(date: Date, view: CalendarView): CalendarDateRange {
  return view === 'weekly' ? getWeekRange(date) : getMonthGridRange(date);
}

/**
 * Format date range for display
 * Weekly: "Jan 13 - 19, 2026"
 * Monthly: "January 2026"
 */
export function formatDateRangeDisplay(dateRange: CalendarDateRange, view: CalendarView): string {
  if (view === 'weekly') {
    const { startDate, endDate } = dateRange;
    const sameMonth = isSameMonth(startDate, endDate);
    if (sameMonth) {
      return `${format(startDate, 'MMM d')} - ${format(endDate, 'd, yyyy')}`;
    }
    return `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d, yyyy')}`;
  }
  return format(dateRange.startDate, 'MMMM yyyy');
}

/**
 * Format date to YYYY-MM-DD for map keys
 */
export function formatDateKey(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/**
 * Format date to ISO string for API (YYYY-MM-DD)
 */
export function formatDateForApi(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/**
 * Convert JS Date getDay() (0=Sunday) to our DayOfWeek
 */
export function getDayOfWeek(date: Date): DayOfWeek {
  const dayIndex = getDay(date);
  // getDay returns 0=Sunday, 1=Monday, etc.
  // We want Monday=0, Tuesday=1, ..., Sunday=6
  const adjustedIndex = dayIndex === 0 ? 6 : dayIndex - 1;
  return DAYS_OF_WEEK[adjustedIndex];
}

/**
 * Parse time string (HH:mm:ss) to decimal hours
 */
export function parseTime(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours + minutes / 60;
}

/**
 * Format time for display (HH:mm)
 */
export function formatTime(timeStr: string): string {
  const [hours, minutes] = timeStr.split(':');
  return `${hours}:${minutes}`;
}

/**
 * Format hour for grid labels (9 AM, 12 PM, etc.)
 */
export function formatHour(hour: number): string {
  if (hour === 0) return '12 AM';
  if (hour === 12) return '12 PM';
  if (hour < 12) return `${hour} AM`;
  return `${hour - 12} PM`;
}

/**
 * Convert API lessons to CalendarLessons with derived fields
 * Uses parse() instead of parseISO() to interpret dates in local timezone
 * (parseISO creates UTC midnight, which shifts to previous day in negative UTC offsets)
 */
export function toCalendarLessons(lessons: TeacherLessonResponse[]): CalendarLesson[] {
  return lessons.map((lesson) => {
    // Parse as local timezone date (not UTC) to avoid day-shift issues
    const date = parse(lesson.scheduledDate, 'yyyy-MM-dd', new Date());
    return {
      ...lesson,
      date,
      dayOfWeek: getDayOfWeek(date),
    };
  });
}

/**
 * Group lessons by date (YYYY-MM-DD key)
 */
export function groupLessonsByDate(lessons: CalendarLesson[]): LessonsByDate {
  const map = new Map<string, CalendarLesson[]>();

  lessons.forEach((lesson) => {
    const key = lesson.scheduledDate; // Already in YYYY-MM-DD format
    const existing = map.get(key) || [];
    existing.push(lesson);
    map.set(key, existing);
  });

  // Sort lessons within each day by start time
  map.forEach((dayLessons) => {
    dayLessons.sort((a, b) => parseTime(a.startTime) - parseTime(b.startTime));
  });

  return map;
}

/**
 * Calculate status counts for a set of lessons
 */
export function calculateStatusCounts(lessons: CalendarLesson[]): StatusCounts {
  const counts: StatusCounts = {
    scheduled: 0,
    conducted: 0,
    cancelled: 0,
    makeUp: 0,
    noShow: 0,
    total: lessons.length,
  };

  lessons.forEach((lesson) => {
    switch (lesson.statusName) {
      case 'Scheduled':
        counts.scheduled++;
        break;
      case 'Conducted':
        counts.conducted++;
        break;
      case 'Cancelled':
        counts.cancelled++;
        break;
      case 'Make Up':
        counts.makeUp++;
        break;
      case 'No Show':
        counts.noShow++;
        break;
    }
  });

  return counts;
}

/**
 * Generate month grid data for calendar view
 */
export function generateMonthGridData(
  dateRange: CalendarDateRange,
  currentMonth: Date,
  lessonsByDate: LessonsByDate,
  today: Date
): MonthDayData[] {
  const days = eachDayOfInterval({ start: dateRange.startDate, end: dateRange.endDate });

  return days.map((date) => {
    const dateKey = formatDateKey(date);
    const lessons = lessonsByDate.get(dateKey) || [];

    return {
      date,
      dateKey,
      dayNumber: date.getDate(),
      isCurrentMonth: isSameMonth(date, currentMonth),
      isToday: isSameDay(date, today),
      lessons,
      statusCounts: calculateStatusCounts(lessons),
    };
  });
}

/**
 * Get all days of the week for weekly view header
 */
export function getWeekDays(dateRange: CalendarDateRange): Date[] {
  return eachDayOfInterval({ start: dateRange.startDate, end: dateRange.endDate });
}

/**
 * Check if a date is today
 */
export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

/**
 * Format day header for weekly view (Mon 13)
 */
export function formatDayHeader(date: Date): { full: string; short: string; dayNum: string } {
  return {
    full: format(date, 'EEEE'),     // Monday
    short: format(date, 'EEE'),     // Mon
    dayNum: format(date, 'd'),      // 13
  };
}
