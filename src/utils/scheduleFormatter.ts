interface ScheduleItem {
  day: string;
  startTime: string;
  endTime: string;
}

/**
 * Formats a class schedule array into a readable string
 * @param schedule Array of schedule items with day, startTime, and endTime
 * @returns Formatted schedule string like "Mon, Wed, Fri 9:00-10:30"
 */
export function formatSchedule(schedule: ScheduleItem[]): string {
  if (!schedule || schedule.length === 0) {
    return 'No schedule';
  }

  // Group by time slots
  const timeSlots = new Map<string, string[]>();
  
  schedule.forEach(item => {
    const timeSlot = `${item.startTime}-${item.endTime}`;
    if (!timeSlots.has(timeSlot)) {
      timeSlots.set(timeSlot, []);
    }
    timeSlots.get(timeSlot)!.push(abbreviateDay(item.day));
  });

  // Format each time slot
  const formattedSlots = Array.from(timeSlots.entries()).map(([timeSlot, days]) => {
    const sortedDays = sortDayAbbreviations(days);
    return `${sortedDays.join(', ')} ${formatTimeSlot(timeSlot)}`;
  });

  return formattedSlots.join(' | ');
}

/**
 * Formats a time slot from "HH:MM-HH:MM" to a more readable format
 * @param timeSlot Time slot string like "09:00-10:30"
 * @returns Formatted time slot like "9:00-10:30"
 */
function formatTimeSlot(timeSlot: string): string {
  const [startTime, endTime] = timeSlot.split('-');
  return `${formatTime(startTime)}-${formatTime(endTime)}`;
}

/**
 * Formats time from 24-hour format to a cleaner format
 * @param time Time string in HH:MM format
 * @returns Formatted time like "9:00" instead of "09:00"
 */
export function formatTime(time: string): string {
  if (!time) return '';
  
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  return `${hour}:${minutes}`;
}

/**
 * Converts full day names to abbreviated forms
 * @param day Full day name like "Monday"
 * @returns Abbreviated day like "Mon"
 */
export function abbreviateDay(day: string): string {
  const dayMap: Record<string, string> = {
    'Monday': 'Mon',
    'Tuesday': 'Tue',
    'Wednesday': 'Wed',
    'Thursday': 'Thu',
    'Friday': 'Fri',
    'Saturday': 'Sat',
    'Sunday': 'Sun'
  };
  
  return dayMap[day] || day;
}

/**
 * Sorts day abbreviations in proper weekday order
 * @param days Array of day abbreviations
 * @returns Sorted array starting from Monday
 */
function sortDayAbbreviations(days: string[]): string[] {
  const dayOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  return days.sort((a, b) => {
    const indexA = dayOrder.indexOf(a);
    const indexB = dayOrder.indexOf(b);
    return indexA - indexB;
  });
}

/**
 * Gets a short summary of the schedule for display in compact spaces
 * @param schedule Array of schedule items
 * @returns Short format like "3x/week" or "Mon-Fri"
 */
export function formatScheduleCompact(schedule: ScheduleItem[]): string {
  if (!schedule || schedule.length === 0) {
    return 'No schedule';
  }

  if (schedule.length === 1) {
    return abbreviateDay(schedule[0].day);
  }

  if (schedule.length <= 3) {
    return schedule.map(item => abbreviateDay(item.day)).join(', ');
  }

  return `${schedule.length}x/week`;
}