/**
 * Calendar date range utility functions
 */

import { format, isSameDay, eachDayOfInterval } from 'date-fns';
import type { CalendarDateRange } from '../calendarTypes';

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
