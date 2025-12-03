/**
 * Lesson Mode - Type and Utility Exports
 */

// Types
export type { LessonMode, LessonModeConfig, LessonModeProps } from './types/lessonMode';
export type { PastLessonIndicator } from './utils/lessonModeUtils';

// Utilities
export {
  getLessonMode,
  canAccessLessonInterface,
  getLessonModeConfig,
  getLessonModeDescription,
  canConductLesson,
  getCannotConductReason,
  isPastUnstartedLesson,
  getPastLessonIndicator,
  countPastUnstartedLessons,
  DEFAULT_CONDUCT_GRACE_MINUTES,
} from './utils/lessonModeUtils';
