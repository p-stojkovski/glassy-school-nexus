/**
 * Enhanced type definitions for the Academic-Aware Lesson Generation API
 * This file extends the base lesson types with enhanced feedback structures
 */

import { GenerationMode } from './lesson';

// Academic context response matching backend API
export interface AcademicContextResponse {
  academicYearId: string | null;
  academicYearName: string | null;
  semesterId: string | null;
  semesterName: string | null;
  teachingBreakDays: number;
  publicHolidayDays: number;
  totalNonTeachingDays: number;
}

// Enhanced lesson generation error
export interface EnhancedLessonGenerationError {
  scheduledDate: string;
  startTime: string;
  endTime: string;
  errorType: string;
  errorMessage: string;
}

// Holiday details provided when a lesson is skipped due to a public holiday
export interface HolidayDetails {
  holidayId: string;             // GUID
  holidayName: string;           // Name of the holiday
  holidayDate: string;           // ISO date "YYYY-MM-DD"
  recurringAnnually: boolean;    // Whether the holiday recurs each year
  holidayNotes: string | null;   // Optional notes about the holiday
}

// Break details provided when a lesson is skipped due to a teaching break
export interface BreakDetails {
  breakId: string;               // GUID
  breakName: string;             // Name of the break period
  breakType: 'vacation' | 'exam' | 'administrative' | string; // Type of break
  breakStartDate: string;        // ISO date "YYYY-MM-DD"
  breakEndDate: string;          // ISO date "YYYY-MM-DD"
  breakNotes: string | null;     // Optional notes about the break
}

// Conflict details provided when a lesson is skipped due to a scheduling conflict
export interface ConflictDetails {
  conflictingLessonId: string;      // GUID of the conflicting lesson
  conflictingClassId: string;       // GUID of the conflicting class
  conflictingClassName: string;     // Name of the conflicting class
  conflictingTeacherName: string;   // Name of the conflicting teacher
  conflictingClassroomName: string; // Name of the conflicting classroom
  conflictingStartTime: string;     // "HH:mm:ss"
  conflictingEndTime: string;       // "HH:mm:ss"
  conflictingLessonStatus: string;  // Status of the conflicting lesson
  conflictType: 'classroom_conflict' | 'teacher_conflict' | string;
}

// Existing lesson details for conflicts
export interface ExistingLessonDetails {
  existingLessonId: string;         // GUID of the existing lesson
  reason: string;                   // Reason for the conflict
}

// Skip details containing information about why a lesson was skipped
export interface SkipDetails {
  generationMode: GenerationMode;
  respectHolidaysEnabled: boolean;
  respectBreaksEnabled: boolean;
  academicYearId: string | null;
  actualDateRange?: {
    startDate: string;                      // ISO date "YYYY-MM-DD"
    endDate: string;                        // ISO date "YYYY-MM-DD"
  };
  holidayDetails: HolidayDetails | null;          // Only populated for public_holiday skips
  breakDetails: BreakDetails | null;              // Only populated for teaching_break skips
  conflictDetails: ConflictDetails | null;        // Only populated for conflict skips
  existingLessonDetails: ExistingLessonDetails | null; // Additional conflict information
}

// Enhanced skipped lesson interface with detailed skip information
export interface EnhancedSkippedLesson {
  scheduledDate: string;        // ISO date "YYYY-MM-DD"
  dayOfWeek: string;            // Day name ("Monday", "Tuesday", etc.)
  startTime: string;            // "HH:mm:ss"
  endTime: string;              // "HH:mm:ss"
  skipReason: 'public_holiday' | 'teaching_break' | 'existing_lesson_conflict';
  skipDetails: SkipDetails;
}

// Enhanced generated lesson interface with additional fields
export interface EnhancedGeneratedLesson {
  id: string;                   // GUID
  scheduledDate: string;        // ISO date "YYYY-MM-DD"
  dayOfWeek: string;            // Day name ("Monday", "Tuesday", etc.)
  startTime: string;            // "HH:mm:ss"
  endTime: string;              // "HH:mm:ss"
  classId: string;              // GUID
  className: string;
  teacherId: string;            // GUID
  teacherName: string;
  classroomId: string;          // GUID
  classroomName: string;
}

// Enhanced lesson generation result with detailed skip information
export interface EnhancedLessonGenerationResult {
  classId: string;
  generatedCount: number;
  skippedCount: number;
  conflictCount: number;
  publicHolidaySkips: number;
  teachingBreakSkips: number;
  generationStartDate: string;  // ISO date "YYYY-MM-DD" (camelCase matches API JSON serialization)
  generationEndDate: string;    // ISO date "YYYY-MM-DD" (camelCase matches API JSON serialization)
  generationMode: string;
  academicContext: AcademicContextResponse | null;
  generatedLessons: EnhancedGeneratedLesson[];
  skippedLessons: EnhancedSkippedLesson[];
  errors: EnhancedLessonGenerationError[];
}
