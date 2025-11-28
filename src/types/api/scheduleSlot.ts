/**
 * TypeScript type definitions for Schedule Slot API operations
 */

// Request types
export interface CreateScheduleSlotRequest {
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  startTime: string; // "HH:mm"
  endTime: string;   // "HH:mm"
  generateLessons?: boolean;
  generationOptions?: LessonGenerationOptions;
}

export interface UpdateScheduleSlotRequest {
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  startTime: string; // "HH:mm"
  endTime: string;   // "HH:mm"
  updateFutureLessons?: boolean;
}

export interface LessonGenerationOptions {
  rangeType?: 'UntilYearEnd' | 'UntilSemesterEnd' | 'Custom';
  customEndDate?: string; // ISO date string
  skipConflicts?: boolean;
  skipHolidays?: boolean;
}

// Response types
export interface CreateScheduleSlotResponse {
  scheduleSlotId: string; // GUID
  generationSummary?: LessonGenerationSummary;
}

export interface UpdateScheduleSlotResponse {
  scheduleSlotId: string; // GUID
  updatedFutureLessonsCount: number;
}

export interface DeleteScheduleSlotResponse {
  deletedSlotId: string; // GUID
  wasArchived: boolean;
  archivedLessonsCount: number;
  pastLessonCount: number;
}

export interface LessonGenerationSummary {
  totalGenerated: number;
  skippedConflicts: number;
  skippedHolidays: number;
  earliestLessonDate?: string; // ISO date string
  latestLessonDate?: string;   // ISO date string
  conflicts: ConflictSummary[];
}

export interface ConflictSummary {
  date: string; // ISO date string
  conflictType: string; // "teacher" | "classroom" | "class"
  conflictingClassName?: string;
}
