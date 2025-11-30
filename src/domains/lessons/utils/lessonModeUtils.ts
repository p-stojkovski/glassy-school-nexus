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
 * Determines if a lesson can be marked as conducted
 * @param statusName - The current status of the lesson
 * @returns Whether the lesson can transition to Conducted status
 */
export function canConductLesson(statusName: LessonStatusName): boolean {
  return statusName === 'Scheduled' || statusName === 'Make Up';
}
