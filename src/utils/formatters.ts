/**
 * General purpose formatters for display formatting across the application.
 * These formatters are specifically designed for salary and financial displays.
 */

/**
 * Formats a number as Macedonian Denar (MKD) currency.
 * @param amount - The numeric amount to format
 * @returns Formatted string with 2 decimal places and "MKD" suffix (e.g., "1,234.56 MKD")
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('mk-MK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount) + ' MKD';
};

/**
 * Formats a date range as a readable period string.
 * @param start - ISO date string for period start
 * @param end - ISO date string for period end
 * @returns Formatted string (e.g., "Jan 1 - Jan 31, 2024")
 */
export const formatDatePeriod = (start: string, end: string): string => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  const startFormatted = startDate.toLocaleDateString('en-US', options);
  const endFormatted = endDate.toLocaleDateString('en-US', { ...options, year: 'numeric' });
  return `${startFormatted} - ${endFormatted}`;
};

/**
 * Formats a date as a human-readable relative time string.
 * Designed for displaying past dates (e.g., salary calculation created dates).
 * @param dateString - ISO date string to format
 * @returns Relative time string (e.g., "Today", "Yesterday", "2 days ago", "3 weeks ago")
 */
export const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return weeks + (weeks > 1 ? ' weeks' : ' week') + ' ago';
  }
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return months + (months > 1 ? ' months' : ' month') + ' ago';
  }
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

/**
 * Formats a date range with full date on both sides.
 * Used in dialogs for more explicit date display.
 * @param start - ISO date string for period start
 * @param end - ISO date string for period end
 * @returns Formatted string (e.g., "Dec 1, 2024 - Dec 15, 2024")
 */
export const formatPeriodFull = (start: string, end: string): string => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
  return `${startDate.toLocaleDateString('en-US', options)} - ${endDate.toLocaleDateString('en-US', options)}`;
};

// Alias for backward compatibility with files using formatPeriod
export { formatDatePeriod as formatPeriod };

// Alias for backward compatibility with files using formatMKD
export { formatCurrency as formatMKD };
