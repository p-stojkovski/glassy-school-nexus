/**
 * Calendar lesson transformation functions
 */

import { parse, getDay, eachDayOfInterval, isSameMonth, isSameDay } from 'date-fns';
import { DayOfWeek, DAYS_OF_WEEK } from '@/constants/schedule';
import type {
  CalendarDateRange,
  CalendarLesson,
  LessonsByDate,
  MonthDayData,
  StatusCounts,
} from '../calendarTypes';
import type { TeacherLessonResponse } from '@/types/api/teacherLesson';
import { formatDateKey } from './calendarDateRange';

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
