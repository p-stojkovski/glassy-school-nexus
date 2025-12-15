/**
 * Formats a date as "Today", "Tomorrow", or "Mon, Dec 1" format
 */
export const formatRelativeDate = (date: Date | string): string => {
  const targetDate = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Reset times for comparison
  const targetDateOnly = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
  const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const tomorrowOnly = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());

  if (targetDateOnly.getTime() === todayOnly.getTime()) {
    return 'Today';
  }
  if (targetDateOnly.getTime() === tomorrowOnly.getTime()) {
    return 'Tomorrow';
  }

  return targetDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
};
