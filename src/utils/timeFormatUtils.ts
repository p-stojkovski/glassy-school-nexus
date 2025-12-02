/**
 * Time formatting utilities
 * Provides functions to format and manipulate time strings
 * Ensures consistent HH:mm format (without seconds)
 */

/**
 * Strip seconds from time string if present
 * Converts HH:mm:ss to HH:mm, or returns HH:mm as-is
 *
 * @param time - Time string in HH:mm or HH:mm:ss format
 * @returns Formatted time in HH:mm format
 *
 * @example
 * formatTimeWithoutSeconds('09:00:00') // '09:00'
 * formatTimeWithoutSeconds('09:00') // '09:00'
 * formatTimeWithoutSeconds('') // ''
 */
export const formatTimeWithoutSeconds = (time: string | null | undefined): string => {
  if (!time) return '';

  // Split by colon and take first two parts (HH:mm)
  const parts = time.split(':');
  if (parts.length >= 2) {
    return `${parts[0]}:${parts[1]}`;
  }

  return time;
};

/**
 * Format time range without seconds
 * Converts "HH:mm:ss - HH:mm:ss" to "HH:mm - HH:mm"
 *
 * @param startTime - Start time in HH:mm or HH:mm:ss format
 * @param endTime - End time in HH:mm or HH:mm:ss format
 * @returns Formatted time range in "HH:mm - HH:mm" format
 *
 * @example
 * formatTimeRangeWithoutSeconds('09:00:00', '10:00:00') // '09:00 - 10:00'
 * formatTimeRangeWithoutSeconds('09:00', '10:00') // '09:00 - 10:00'
 */
export const formatTimeRangeWithoutSeconds = (
  startTime: string | null | undefined,
  endTime: string | null | undefined
): string => {
  const formattedStart = formatTimeWithoutSeconds(startTime);
  const formattedEnd = formatTimeWithoutSeconds(endTime);

  if (!formattedStart || !formattedEnd) {
    return '';
  }

  return `${formattedStart} - ${formattedEnd}`;
};
