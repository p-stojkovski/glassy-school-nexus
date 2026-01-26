/**
 * Calendar navigation functions for date range calculations
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
} from 'date-fns';
import type { CalendarDateRange, CalendarView } from '../calendarTypes';

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
