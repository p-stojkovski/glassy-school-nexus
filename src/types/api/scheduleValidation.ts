/**
 * Schedule validation types for pre-save validation and conflict detection
 */

export interface ScheduleValidationRequest {
  newSchedule: Array<{
    dayOfWeek: string;
    startTime: string;
    endTime: string;
  }>;
}

export interface ScheduleValidationResponse {
  isValid: boolean;
  modificationImpact: ScheduleModificationImpact;
  conflictInfo: ScheduleConflictInfo;
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
