/**
 * Lesson Mode Types
 * Defines the different modes for interacting with lessons in the teaching interface
 */

/**
 * The mode of interaction with a lesson
 * - 'teaching': Active lesson in progress (Scheduled status)
 * - 'editing': Post-lesson data entry (Conducted status)
 */
export type LessonMode = 'teaching' | 'editing';

/**
 * Configuration for lesson mode UI elements
 */
export interface LessonModeConfig {
  /** The current mode */
  mode: LessonMode;
  /** Whether to show the End Lesson button */
  showEndLessonButton: boolean;
  /** Title for the page header */
  headerTitle: string;
  /** Text for the mode badge */
  badgeText: string;
  /** Badge emoji/icon prefix */
  badgeEmoji: string;
  /** CSS classes for the badge background */
  badgeClassName: string;
  /** Text for the status indicator at bottom of panel */
  statusIndicatorText: string;
  /** CSS classes for the status indicator dot */
  statusDotClassName: string;
}

/**
 * Props for components that need lesson mode awareness
 */
export interface LessonModeProps {
  /** The lesson mode configuration */
  modeConfig: LessonModeConfig;
}
