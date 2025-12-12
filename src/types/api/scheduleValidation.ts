/**
 * Schedule validation types for pre-save validation and conflict detection
 */

export interface ScheduleValidationRequest {
  newSchedule: Array<{
    dayOfWeek: string;
    startTime: string;
    endTime: string;
  }>;
  rangeType?: 'UntilYearEnd' | 'UntilSemesterEnd' | 'Custom';
  customEndDate?: string;
}

export interface ScheduleValidationResponse {
  isValid: boolean;
  modificationImpact: ScheduleModificationImpact;
  conflictInfo: ScheduleConflictInfo;
  existingScheduleOverlap?: ExistingScheduleOverlapInfo;
}

export interface ScheduleModificationImpact {
  modifications: ScheduleModification[];
  totalFutureLessonsToUpdate: number;
}

export interface ScheduleModification {
  dayOfWeek: string;
  oldStartTime: string;
  oldEndTime: string;
  newStartTime: string;
  newEndTime: string;
  futureLessonCount: number;
  earliestAffectedDate: string;
  latestAffectedDate: string;
}

export interface ScheduleConflictInfo {
  hasConflicts: boolean;
  isUsingFallbackDateRange: boolean;
  conflicts: ConflictDetail[];
}

export interface ConflictDetail {
  conflictType: 'teacher_conflict' | 'classroom_conflict' | 'class_conflict';
  dayOfWeek: string;
  timeRange: string;
  instances: ConflictInstance[];
}

export interface ConflictInstance {
  date: string;
  conflictingClassName: string;
  conflictingLessonId: string;
}

/**
 * Information about existing schedule slots that overlap with the proposed schedule.
 */
export interface ExistingScheduleOverlapInfo {
  hasOverlap: boolean;
  overlaps: ExistingScheduleOverlap[];
}

/**
 * Details of an existing schedule slot that overlaps with the proposed time.
 */
export interface ExistingScheduleOverlap {
  scheduleSlotId: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  overlapType: 'exact' | 'partial';
  futureLessonCount: number;
  pastLessonCount: number;
}
