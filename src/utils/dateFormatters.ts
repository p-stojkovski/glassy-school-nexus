/**
 * Date formatting utilities for consistent date display across the application
 */

/**
 * Format a date string to a readable format
 * @param dateString - ISO date string
 * @returns Formatted date string (e.g., "Jan 15, 2024")
 */
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    return dateString;
  }
}

/**
 * Format a date string to a short format
 * @param dateString - ISO date string
 * @returns Short formatted date string (e.g., "01/15/24")
 */
export function formatDateShort(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: '2-digit',
      month: '2-digit',
      day: '2-digit'
    });
  } catch (error) {
    return dateString;
  }
}

/**
 * Format a date string to include time
 * @param dateString - ISO date string
 * @returns Formatted date and time string (e.g., "Jan 15, 2024 at 2:30 PM")
 */
export function formatDateTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    return dateString;
  }
}

/**
 * Format a date for form inputs (YYYY-MM-DD format)
 * @param dateString - ISO date string
 * @returns Date in YYYY-MM-DD format for input[type="date"]
 */
export function formatDateForInput(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  } catch (error) {
    return '';
  }
}

/**
 * Get relative time (e.g., "2 days ago", "in 3 hours")
 * @param dateString - ISO date string
 * @returns Relative time string
 */
export function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  } catch (error) {
    return dateString;
  }
}

/**
 * Check if a date is today
 * @param dateString - ISO date string
 * @returns True if the date is today
 */
export function isToday(dateString: string): boolean {
  try {
    const date = new Date(dateString);
    const today = new Date();
    return date.toDateString() === today.toDateString();
  } catch (error) {
    return false;
  }
}

/**
 * Check if a date is in the future
 * @param dateString - ISO date string
 * @returns True if the date is in the future
 */
export function isFuture(dateString: string): boolean {
  try {
    const date = new Date(dateString);
    const now = new Date();
    return date.getTime() > now.getTime();
  } catch (error) {
    return false;
  }
}
