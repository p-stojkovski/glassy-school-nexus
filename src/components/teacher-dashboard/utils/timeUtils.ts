/**
 * Time utilities for teacher dashboard lesson context detection
 * Simple, maintainable functions for time comparison and formatting
 */

/**
 * Get current time in HH:mm format (24-hour)
 */
export const getCurrentTime = (): string => {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
};

/**
 * Get current date in YYYY-MM-DD format
 */
export const getCurrentDate = (): string => {
  const now = new Date();
  return now.toISOString().split('T')[0];
};

/**
 * Check if current time falls within a lesson's time range
 * @param currentTime - Current time in HH:mm format
 * @param startTime - Lesson start time in HH:mm format  
 * @param endTime - Lesson end time in HH:mm format
 * @returns true if current time is within the lesson period
 */
export const isTimeInRange = (currentTime: string, startTime: string, endTime: string): boolean => {
  // Convert HH:mm to minutes for easy comparison
  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const currentMinutes = timeToMinutes(currentTime);
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);

  return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
};

/**
 * Format time range for display
 * @param startTime - Start time in HH:mm format
 * @param endTime - End time in HH:mm format
 * @returns Formatted time range string with en dash
 */
export const formatTimeRange = (startTime: string, endTime: string): string => {
  return `${startTime}–${endTime}`;
};

/**
 * Calculate duration between two times
 * @param startTime - Start time in HH:mm format
 * @param endTime - End time in HH:mm format
 * @returns Duration string (e.g., "1h 30m")
 */
export const calculateDuration = (startTime: string, endTime: string): string => {
  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };
  
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);
  const diffMinutes = endMinutes - startMinutes;
  
  if (diffMinutes >= 60) {
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
  return `${diffMinutes}m`;
};

/**
 * Get a human-readable current date string
 * @returns Formatted date string (e.g., "Monday, September 16, 2024")
 */
export const getCurrentDateFormatted = (): string => {
  const now = new Date();
  return now.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long', 
    day: 'numeric'
  });
};

/**
 * Get day of week for a given date
 * @param dateString - Date in YYYY-MM-DD format
 * @returns Day of week (e.g., "Monday")
 */
export const getDayOfWeek = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { weekday: 'long' });
};

/**
 * Calculate time until lesson starts
 * @param lessonStartTime - Lesson start time in HH:mm format
 * @param currentTime - Current time in HH:mm format
 * @returns Object with countdown information
 */
export const calculateTimeUntilLesson = (lessonStartTime: string, currentTime: string): {
  totalMinutes: number;
  hours: number;
  minutes: number;
  isStartingSoon: boolean;
} => {
  // Convert HH:mm to minutes for easy calculation
  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const currentMinutes = timeToMinutes(currentTime);
  const lessonMinutes = timeToMinutes(lessonStartTime);
  
  // Calculate difference
  let diffMinutes = lessonMinutes - currentMinutes;
  
  // Handle case where lesson is tomorrow (negative difference)
  if (diffMinutes < 0) {
    diffMinutes = 0; // Lesson has already started or passed
  }
  
  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;
  const isStartingSoon = diffMinutes <= 5 && diffMinutes > 0;
  
  return {
    totalMinutes: diffMinutes,
    hours,
    minutes,
    isStartingSoon
  };
};

/**
 * Format countdown for display
 * @param totalMinutes - Total minutes until lesson
 * @param hours - Hours component
 * @param minutes - Minutes component
 * @returns Formatted countdown string
 */
export const formatCountdown = (totalMinutes: number, hours: number, minutes: number): string => {
  if (totalMinutes === 0) {
    return 'starting now';
  }
  
  if (totalMinutes <= 5) {
    return `starting in ${totalMinutes} minute${totalMinutes === 1 ? '' : 's'}`;
  }
  
  if (hours === 0) {
    return `in ${minutes} minute${minutes === 1 ? '' : 's'}`;
  }
  
  if (minutes === 0) {
    return `in ${hours} hour${hours === 1 ? '' : 's'}`;
  }
  
  return `in ${hours} hour${hours === 1 ? '' : 's'} ${minutes} minute${minutes === 1 ? '' : 's'}`;
};

/**
 * Check if lesson is starting soon (within 5 minutes)
 * @param lessonStartTime - Lesson start time in HH:mm format
 * @param currentTime - Current time in HH:mm format
 * @returns true if lesson starts within 5 minutes
 */
export const isLessonStartingSoon = (lessonStartTime: string, currentTime: string): boolean => {
  const countdown = calculateTimeUntilLesson(lessonStartTime, currentTime);
  return countdown.isStartingSoon;
};

/**
 * Get a complete countdown object for a lesson
 * @param lessonStartTime - Lesson start time in HH:mm format
 * @param currentTime - Current time in HH:mm format
 * @returns Complete countdown information
 */
export const getLessonCountdown = (lessonStartTime: string, currentTime: string) => {
  const countdown = calculateTimeUntilLesson(lessonStartTime, currentTime);
  const formattedCountdown = formatCountdown(countdown.totalMinutes, countdown.hours, countdown.minutes);
  
  return {
    ...countdown,
    formattedCountdown,
    displayText: `Starts at ${lessonStartTime} (${formattedCountdown})`
  };
};

/**
 * Check if a given date is a weekend
 * @param dateString - Date in YYYY-MM-DD format
 * @returns true if Saturday or Sunday
 */
export const isWeekend = (dateString: string): boolean => {
  const date = new Date(dateString);
  const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
  return dayOfWeek === 0 || dayOfWeek === 6;
};

/**
 * Add days to a date string
 * @param dateString - Date in YYYY-MM-DD format
 * @param days - Number of days to add
 * @returns New date in YYYY-MM-DD format
 */
export const addDays = (dateString: string, days: number): string => {
  const date = new Date(dateString);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};

/**
 * Find the next lesson date by searching future dates
 * This is a simplified version - in real implementation, this would query
 * class schedule patterns and generate lessons accordingly
 * @param currentDate - Current date in YYYY-MM-DD format
 * @param searchDays - Number of days to search ahead (default: 14)
 * @returns Next lesson date info or null
 */
export const findNextLessonDate = (
  currentDate: string, 
  searchDays: number = 14
): {
  date: string;
  dayOfWeek: string;
  isWeekend: boolean;
} | null => {
  // This is a placeholder implementation
  // In a real app, this would:
  // 1. Query class schedule patterns from the database
  // 2. Check for existing generated lessons
  // 3. Consider holidays and school calendar
  // 4. Return actual next lesson information
  
  for (let i = 1; i <= searchDays; i++) {
    const nextDate = addDays(currentDate, i);
    const nextDayOfWeek = getDayOfWeek(nextDate);
    const isWeekendDay = isWeekend(nextDate);
    
    // Simple heuristic: assume lessons on weekdays (Mon-Fri)
    if (!isWeekendDay) {
      return {
        date: nextDate,
        dayOfWeek: nextDayOfWeek,
        isWeekend: isWeekendDay
      };
    }
  }
  
  return null;
};

/**
 * Format a date string for display
 * @param dateString - Date in YYYY-MM-DD format
 * @returns Formatted date string (e.g., "September 17, 2024")
 */
export const formatDateForDisplay = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Check if current date is a holiday (placeholder implementation)
 * @param dateString - Date in YYYY-MM-DD format
 * @returns Holiday info or null
 */
export const checkHoliday = (dateString: string): { name: string; type: string } | null => {
  // Placeholder implementation
  // In a real app, this would check against a holiday calendar API or database
  const date = new Date(dateString);
  const month = date.getMonth() + 1; // 0-indexed to 1-indexed
  const day = date.getDate();
  
  // Some common holidays for demo purposes
  if (month === 12 && day === 25) {
    return { name: 'Christmas Day', type: 'public' };
  }
  if (month === 1 && day === 1) {
    return { name: 'New Year\'s Day', type: 'public' };
  }
  if (month === 7 && day === 4) {
    return { name: 'Independence Day', type: 'public' };
  }
  
  return null;
};
