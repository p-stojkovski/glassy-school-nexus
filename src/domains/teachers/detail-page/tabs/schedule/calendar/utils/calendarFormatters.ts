/**
 * Calendar display formatting functions
 */

import { format, isSameMonth } from 'date-fns';
import type { CalendarDateRange, CalendarView } from '../calendarTypes';

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
 * Format day header for weekly view (Mon 13)
 */
export function formatDayHeader(date: Date): { full: string; short: string; dayNum: string } {
  return {
    full: format(date, 'EEEE'),     // Monday
    short: format(date, 'EEE'),     // Mon
    dayNum: format(date, 'd'),      // 13
  };
}
