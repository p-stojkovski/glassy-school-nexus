/**
 * Lesson Mode Utilities
 * Functions for determining and configuring lesson interaction modes
 */

import { LessonStatusName } from '@/types/api/lesson';
import { LessonMode, LessonModeConfig } from '../types/lessonMode';

/**
 * Determines the lesson mode based on the lesson status
 * @param statusName - The current status of the lesson
 * @returns The appropriate lesson mode
 */
export function getLessonMode(statusName: LessonStatusName): LessonMode {
  switch (statusName) {
    case 'Conducted':
      return 'editing';
    case 'Scheduled':
    case 'Make Up':
      return 'teaching';
    default:
      // Cancelled and No Show lessons shouldn't typically be edited
      // but default to editing mode if somehow accessed
      return 'editing';
  }
}

/**
 * Checks if a lesson status allows access to the teaching/editing interface
 * @param statusName - The current status of the lesson
 * @returns Whether the lesson can be accessed in the teaching mode interface
 */
export function canAccessLessonInterface(statusName: LessonStatusName): boolean {
  // Allow access for Scheduled, Conducted, and Make Up lessons
  // Cancelled and No Show lessons should not be editable
  return ['Scheduled', 'Conducted', 'Make Up'].includes(statusName);
}

/**
 * Gets the full configuration for a lesson mode
 * @param statusName - The current status of the lesson
 * @param lessonDate - Optional date string for display in editing mode
 * @returns The complete lesson mode configuration
 */
export function getLessonModeConfig(
  statusName: LessonStatusName,
  lessonDate?: string
): LessonModeConfig {
  const mode = getLessonMode(statusName);
  
  // Format the date for display if provided
  const formattedDate = lessonDate 
    ? new Date(lessonDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    : '';

  if (mode === 'teaching') {
    return {
      mode: 'teaching',
      showEndLessonButton: true,
      headerTitle: 'Teaching Mode',
      badgeText: 'LESSON IN PROGRESS',
      badgeEmoji: '🔵',
      badgeClassName: 'bg-blue-500 hover:bg-blue-500',
      statusIndicatorText: 'Lesson management active - all changes auto-save',
      statusDotClassName: 'bg-blue-500',
    };
  }

  // Editing mode (Conducted lessons)
  return {
    mode: 'editing',
    showEndLessonButton: false,
    headerTitle: 'Edit Lesson Details',
    badgeText: `EDITING LESSON${formattedDate ? ` - ${formattedDate}` : ''}`,
    badgeEmoji: '📝',
    badgeClassName: 'bg-amber-500 hover:bg-amber-500',
    statusIndicatorText: 'Editing past lesson - all changes auto-save',
    statusDotClassName: 'bg-amber-500',
  };
}

/**
 * Gets a user-friendly description of what the current mode allows
 * @param mode - The lesson mode
 * @returns Description text for the mode
 */
export function getLessonModeDescription(mode: LessonMode): string {
  if (mode === 'teaching') {
    return 'You are conducting this lesson. Mark attendance, check homework, and add comments as students participate.';
  }
  return 'You are editing a completed lesson. Update attendance records, homework status, and add any notes you missed during class.';
}

/**
 * Determines if a lesson can be marked as conducted based on status and schedule.
 * Applies a grace period (minutes before start) when time data is provided.
 */
export const DEFAULT_CONDUCT_GRACE_MINUTES = 15;

export function canConductLesson(
  statusName: LessonStatusName,
  scheduledDate?: string,
  startTime?: string,
  gracePeriodMinutes: number = DEFAULT_CONDUCT_GRACE_MINUTES
): boolean {
  const statusAllowsConduct = statusName === 'Scheduled' || statusName === 'Make Up';
  if (!statusAllowsConduct) return false;

  // Preserve previous behavior if we don't have time data
  if (!scheduledDate || !startTime) return true;

  const scheduledDateTime = new Date(`${scheduledDate}T${startTime}`);
  if (Number.isNaN(scheduledDateTime.getTime())) return true;

  const effectiveStart = scheduledDateTime.getTime() - gracePeriodMinutes * 60_000;
  return Date.now() >= effectiveStart;
}

/**
 * Returns a user-facing reason why a lesson cannot be conducted yet.
 * Null indicates the lesson can be conducted now.
 */
export function getCannotConductReason(
  statusName: LessonStatusName,
  scheduledDate?: string,
  startTime?: string,
  gracePeriodMinutes: number = DEFAULT_CONDUCT_GRACE_MINUTES
): string | null {
  const statusAllowsConduct = statusName === 'Scheduled' || statusName === 'Make Up';
  if (!statusAllowsConduct) {
    return 'This lesson cannot be conducted in its current status.';
  }

  if (!scheduledDate || !startTime) return null;

  const scheduledDateTime = new Date(`${scheduledDate}T${startTime}`);
  if (Number.isNaN(scheduledDateTime.getTime())) return null;

  const effectiveStart = scheduledDateTime.getTime() - gracePeriodMinutes * 60_000;
  const now = Date.now();

  if (now >= effectiveStart) return null;

  const minutesUntilAllowed = Math.ceil((effectiveStart - now) / 60_000);
  const localizedStart = scheduledDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return `This lesson starts at ${localizedStart}. You can conduct it in ${minutesUntilAllowed} minute${minutesUntilAllowed === 1 ? '' : 's'}.`;
}

/**
 * Checks if a lesson is past its scheduled end time but was never started (still in Scheduled/Make Up status).
 * These lessons need documentation - the teacher must mark them as Conducted, No Show, or Cancelled.
 */
export function isPastUnstartedLesson(
  statusName: LessonStatusName,
  scheduledDate?: string,
  endTime?: string
): boolean {
  // Only applies to Scheduled or Make Up lessons
  const isScheduledStatus = statusName === 'Scheduled' || statusName === 'Make Up';
  if (!isScheduledStatus) return false;

  if (!scheduledDate || !endTime) return false;

  // Parse date - handle both "YYYY-MM-DD" and "YYYY-MM-DDTHH:mm:ss" formats
  const datePart = scheduledDate.split('T')[0]; // Get just the date part
  const [year, month, day] = datePart.split('-').map(Number);
  
  // Parse time - handle both "HH:mm" and "HH:mm:ss" formats
  const timeParts = endTime.split(':').map(Number);
  const hours = timeParts[0];
  const minutes = timeParts[1];
  
  // Create date in local timezone
  const lessonEndDateTime = new Date(year, month - 1, day, hours, minutes);
  if (Number.isNaN(lessonEndDateTime.getTime())) return false;

  // If the lesson's end time has passed, it's a past unstarted lesson
  const isPast = Date.now() > lessonEndDateTime.getTime();
  
  return isPast;
}

/**
 * Configuration for past unstarted lessons
 */
export interface PastLessonIndicator {
  isPastUnstarted: boolean;
  label: string;
  description: string;
  actionLabel: string;
}

/**
 * Gets indicator configuration for past unstarted lessons
 */
export function getPastLessonIndicator(
  statusName: LessonStatusName,
  scheduledDate?: string,
  endTime?: string
): PastLessonIndicator {
  const isPast = isPastUnstartedLesson(statusName, scheduledDate, endTime);
  
  return {
    isPastUnstarted: isPast,
    label: 'Needs Documentation',
    description: 'This lesson has passed without being marked. Please record attendance and mark the lesson status.',
    actionLabel: 'Document Lesson',
  };
}

/**
 * Counts the number of past unstarted lessons in a list
 */
export function countPastUnstartedLessons(
  lessons: Array<{ statusName: LessonStatusName; scheduledDate: string; endTime: string }>
): number {
  return lessons.filter(lesson => 
    isPastUnstartedLesson(lesson.statusName, lesson.scheduledDate, lesson.endTime)
  ).length;
}
