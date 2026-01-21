/**
 * Schedule slot interface for formatting
 * Compatible with TeacherClassScheduleSlot and PaymentScheduleSlot
 */
interface ScheduleSlot {
  dayName: string;
  startTime: string;
  endTime: string;
}

/**
 * Formats class schedule slots into a human-readable string.
 * Groups slots by time pattern and shows day combinations.
 *
 * @param slots - Array of schedule slots with dayName, startTime, and endTime
 * @returns Formatted string like "Mon, Wed 09:00-10:30" or "Mon 09:00-10:30 | Wed 14:00-15:30"
 *
 * @example
 * // Input: [{ dayName: "Monday", startTime: "09:00", endTime: "10:30" }]
 * // Output: "Mon 09:00-10:30"
 *
 * @example
 * // Input: [
 * //   { dayName: "Monday", startTime: "09:00", endTime: "10:30" },
 * //   { dayName: "Wednesday", startTime: "09:00", endTime: "10:30" }
 * // ]
 * // Output: "Mon, Wed 09:00-10:30"
 */
export function formatSchedule(slots: ScheduleSlot[]): string {
  if (!slots || slots.length === 0) {
    return 'No schedule';
  }

  // Group slots by time pattern
  const timeGroups = new Map<string, string[]>();

  slots.forEach((slot) => {
    const timeKey = `${slot.startTime}-${slot.endTime}`;
    const dayShort = slot.dayName.substring(0, 3);

    if (!timeGroups.has(timeKey)) {
      timeGroups.set(timeKey, []);
    }
    timeGroups.get(timeKey)!.push(dayShort);
  });

  // Build formatted strings
  const parts: string[] = [];
  timeGroups.forEach((days, time) => {
    parts.push(`${days.join(', ')} ${time}`);
  });

  return parts.join(' | ');
}
