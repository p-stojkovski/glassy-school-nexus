import { useMemo } from 'react';
import { LessonResponse } from '@/types/api/lesson';

/**
 * Locking state for a lesson
 */
export interface LessonLockingState {
  /** True if the lesson is locked (Conducted + past day) - edits not allowed */
  isLocked: boolean;
  /** True if the lesson is in grace period (Conducted + same day) - edits allowed but audited */
  isGracePeriod: boolean;
  /** Convenience flag: true if edits are allowed (!isLocked) */
  isEditable: boolean;
  /** True if the lesson has any audit history entries */
  hasAuditHistory: boolean;
  /** Human-readable message about the locking status */
  lockMessage: string | null;
}

/**
 * Format date for display in lock message
 */
function formatDateForMessage(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

/**
 * Hook to derive locking state from a lesson response.
 * Used by TeachingModePage and LessonStudentPanel to determine UI state.
 *
 * @param lesson - The lesson response (or null if loading)
 * @returns LessonLockingState with all locking information
 *
 * @example
 * ```tsx
 * const { isLocked, isGracePeriod, lockMessage } = useLessonLocking(lesson);
 *
 * if (isLocked) {
 *   return <LockedLessonBanner message={lockMessage} />;
 * }
 * ```
 */
export function useLessonLocking(lesson: LessonResponse | null): LessonLockingState {
  return useMemo(() => {
    // Default state when lesson is not loaded
    if (!lesson) {
      return {
        isLocked: false,
        isGracePeriod: false,
        isEditable: true,
        hasAuditHistory: false,
        lockMessage: null,
      };
    }

    const isLocked = lesson.isLocked ?? false;
    const isGracePeriod = lesson.isGracePeriod ?? false;
    const hasAuditHistory = lesson.hasAuditHistory ?? false;

    // Determine lock message
    let lockMessage: string | null = null;
    if (isLocked) {
      lockMessage = `This lesson from ${formatDateForMessage(lesson.scheduledDate)} is locked and cannot be edited. Lessons become read-only after the teaching day ends.`;
    } else if (isGracePeriod) {
      lockMessage = 'Edits are being tracked (same-day edit after lesson completion).';
    }

    return {
      isLocked,
      isGracePeriod,
      isEditable: !isLocked,
      hasAuditHistory,
      lockMessage,
    };
  }, [lesson]);
}

export default useLessonLocking;
