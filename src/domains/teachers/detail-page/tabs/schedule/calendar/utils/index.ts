// Calendar utility modules - organized by concern

// Navigation functions (date range calculations, prev/next)
export {
  getWeekRange,
  getMonthGridRange,
  navigatePrevious,
  navigateNext,
  getDateRangeForView,
} from './calendarNavigation';

// Date range utility functions (formatting, day checks)
export {
  formatDateKey,
  formatDateForApi,
  getWeekDays,
  isToday,
} from './calendarDateRange';

// Display formatting functions (time, date, headers)
export {
  formatDateRangeDisplay,
  formatTime,
  formatHour,
  formatDayHeader,
} from './calendarFormatters';

// Lesson transformation functions (API to calendar, grouping, stats)
export {
  getDayOfWeek,
  parseTime,
  toCalendarLessons,
  groupLessonsByDate,
  calculateStatusCounts,
  generateMonthGridData,
} from './calendarLessons';
