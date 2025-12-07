/**
 * TypeScript type definitions for the Lessons API
 * Based on the ThinkEnglish API executive summary for Classes and Lessons features
 */

// Predefined lesson statuses (managed in Settings page)
export type LessonStatusName = 'Scheduled' | 'Conducted' | 'Cancelled' | 'Make Up' | 'No Show';

// Lesson Status DTO (read-only, managed in Settings)
export interface LessonStatusDto {
  id: string;                    // GUID
  name: LessonStatusName;
  description: string | null;
  createdAt: string;            // ISO 8601
  updatedAt: string;            // ISO 8601
}

// Requests
export interface CreateLessonRequest {
  classId: string;              // required, GUID
  scheduledDate: string;        // required, ISO date "YYYY-MM-DD"
  startTime: string;            // required, "HH:mm"
  endTime: string;              // required, "HH:mm"
  notes?: string | null;        // optional
}

export interface CancelLessonRequest {
  cancellationReason: string;   // required
  createMakeupLesson?: boolean; // optional, defaults to false
}

export interface MarkLessonConductedRequest {
  conductedAt?: string | null;  // optional, ISO 8601 datetime, defaults to now
  notes?: string | null;        // optional
}

export interface CreateMakeupLessonRequest {
  scheduledDate: string;        // required, ISO date "YYYY-MM-DD"
  startTime: string;            // required, "HH:mm"
  endTime: string;              // required, "HH:mm"
  notes?: string | null;        // optional
}

export interface GenerateLessonsRequest {
  classId: string;              // required, GUID
  startDate: string;            // required, ISO date "YYYY-MM-DD"
  endDate: string;              // required, ISO date "YYYY-MM-DD"
  skipExistingConflicts?: boolean; // optional, defaults to true
}

// Reschedule lesson request
export interface RescheduleLessonRequest {
  newScheduledDate: string;     // required, ISO date "YYYY-MM-DD"
  newStartTime: string;         // required, "HH:mm"
  newEndTime: string;           // required, "HH:mm"
  rescheduleReason?: string;    // optional, max 500 chars
}

// Generation modes for academic-aware lesson generation
export type GenerationMode = 'CustomRange' | 'Semester' | 'Month' | 'FullYear';

// Academic-aware generation request
export interface GenerateLessonsAcademicAwareRequest {
  startDate: string;            // required, ISO date "YYYY-MM-DD"
  endDate: string;              // required, ISO date "YYYY-MM-DD"
  generationMode: GenerationMode;
  academicYearId?: string | null; // GUID, required for semester/full_year modes
  semesterId?: string | null;   // GUID, required for semester mode
  respectBreaks?: boolean;      // optional, defaults to true
  /**
   * @deprecated This flag is ignored server-side. All non-teaching days (including holiday-type) are controlled by respectBreaks.
   */
  respectHolidays?: boolean;    // deprecated
}

// Academic context information
export interface AcademicContext {
  academicYearId: string | null; // GUID
  academicYearName: string | null;
  semesterId: string | null;    // GUID
  semesterName: string | null;
  teachingBreakDays: number;
  publicHolidayDays: number;
  totalNonTeachingDays: number;
}

// Generated lesson information
export interface GeneratedLesson {
  lessonId: string;             // GUID
  scheduledDate: string;        // ISO date "YYYY-MM-DD"
  startTime: string;            // "HH:mm"
  endTime: string;              // "HH:mm"
  dayOfWeek: string;
}

// Skipped lesson information
export interface SkippedLesson {
  scheduledDate: string;        // ISO date "YYYY-MM-DD"
  startTime: string;            // "HH:mm"
  endTime: string;              // "HH:mm"
  dayOfWeek: string;
  skipReason: 'teaching_break' | 'public_holiday' | 'scheduling_conflict';
}

// Lesson generation error
export interface LessonGenerationError {
  scheduledDate: string;        // ISO date "YYYY-MM-DD"
  startTime: string;            // "HH:mm"
  endTime: string;              // "HH:mm"
  errorType: string;
  errorMessage: string;
}

// Academic-aware lesson generation result
export interface AcademicAwareLessonGenerationResult {
  classId: string;              // GUID
  generationMode: string;
  academicContext: AcademicContext | null;
  generatedCount: number;
  skippedCount: number;
  conflictCount: number;
  teachingBreakSkips: number;
  publicHolidaySkips: number;
  generatedLessons: GeneratedLesson[];
  skippedLessons: SkippedLesson[];
  errors: LessonGenerationError[];
}

// Responses
export interface LessonResponse {
  id: string;                   // GUID
  classId: string;              // GUID
  className: string;
  teacherId: string;            // GUID
  teacherName: string;
  subjectId: string;            // GUID
  subjectName: string;
  classroomId: string;          // GUID (from class)
  classroomName: string;
  scheduledDate: string;        // ISO date "YYYY-MM-DD"
  startTime: string;            // "HH:mm"
  endTime: string;              // "HH:mm"
  statusId: string;             // GUID
  statusName: LessonStatusName;
  conductedAt: string | null;   // ISO 8601 datetime
  cancellationReason: string | null;
  makeupLessonId: string | null; // GUID, links to makeup lesson
  originalLessonId?: string | null; // GUID, present if this is a makeup lesson
  notes: string | null;
  generationSource: 'manual' | 'automatic' | 'makeup';
  
  // Historical snapshots (preserved at creation)
  teacherNameSnapshot: string;
  subjectNameSnapshot: string;
  classroomNameSnapshot: string;
  
  createdAt: string;            // ISO 8601
  updatedAt: string;            // ISO 8601
}

export interface LessonCreatedResponse {
  id: string;                   // GUID
}

export interface LessonNotesResponse {
  notes?: string | null;        // Teacher notes for the lesson
}

export interface LessonGenerationResult {
  lessonsCreated: number;
  conflictsSkipped: number;
  conflicts: {
    date: string;               // ISO date
    time: string;               // "HH:mm - HH:mm"
    reason: 'teacher_conflict' | 'classroom_conflict' | 'existing_lesson';
    conflictDetails: string;
  }[];
}

// Query parameters for lesson filtering
export interface LessonSearchParams {
  classId?: string;             // GUID - filter by specific class
  teacherId?: string;           // GUID - filter by teacher
  classroomId?: string;         // GUID - filter by classroom
  statusId?: string;            // GUID - filter by status
  statusName?: LessonStatusName; // filter by status name (takes precedence over statusId on backend)
  startDate?: string;           // ISO date - filter from this date (maps to fromDate on backend)
  endDate?: string;             // ISO date - filter until this date (maps to toDate on backend)
  generationSource?: 'manual' | 'automatic' | 'makeup';
  includeHistory?: boolean;     // include past lessons, defaults to true
  pageSize?: number;            // pagination
  page?: number;                // pagination (0-based)
}

// Time windows for Class Lessons tab
export type LessonTimeWindow = 'week' | 'month' | 'all';

/**
 * Filter parameters specific to the class lessons tab.
 * These are used to request server-side filtered lessons for a class.
 */
export interface ClassLessonFilterParams {
  /** Time scope filter: 'upcoming' returns today and future, 'past' returns before today, 'all' returns everything */
  scope?: 'upcoming' | 'past' | 'all';
  /** Status filter: 'all' returns all statuses, otherwise filter by specific status name */
  statusName?: 'all' | LessonStatusName;
  /**
   * Optional preset window for time filtering.
   * - 'week' -> 7 day window anchored to today/yesterday depending on scope
   * - 'month' -> 1 month window anchored to today/yesterday depending on scope
   * - 'all' -> full history/future for the selected scope
   */
  timeWindow?: LessonTimeWindow;
}

// Lesson summary for class overview
export interface LessonSummary {
  totalLessons: number;
  completedLessons: number;
  scheduledLessons: number;
  cancelledLessons: number;
  makeupLessons: number;
  noShowLessons: number;
  upcomingLessons: number;      // lessons within next 7 days
  nextLessonDate: string | null; // ISO date of next scheduled lesson
}

// Conflict detection result
export interface LessonConflict {
  conflictType: 'teacher_conflict' | 'classroom_conflict' | 'existing_lesson';
  conflictingLessonId: string;  // GUID
  conflictDetails: string;
  conflictingClassName: string;
  classroomName?: string | null; // Added classroom name
  scheduledDate: string;        // ISO date
  startTime: string;            // "HH:mm"
  endTime: string;              // "HH:mm"
}

// Conflict check result with academic context
export interface ConflictCheckResult {
  hasConflicts: boolean;
  conflicts: LessonConflict[];
  academicContext?: AcademicContext | null;
  validationWarning?: string | null;
}

// API paths
export const LessonApiPaths = {
  BASE: '/api/lessons',
  BY_ID: (id: string) => `/api/lessons/${id}`,
  CURRENT: '/api/lessons/current',
  NEXT: '/api/lessons/next',
  PAST_UNSTARTED: '/api/lessons/past-unstarted',
  CANCEL: (id: string) => `/api/lessons/${id}/cancel`,
  CONDUCT: (id: string) => `/api/lessons/${id}/conduct`,
  RESCHEDULE: (id: string) => `/api/lessons/${id}/reschedule`,
  MAKEUP: (id: string) => `/api/lessons/${id}/makeup`,
  NOTES: (id: string) => `/api/lessons/${id}/notes`,
  GENERATE: '/api/lessons/generate',
  GENERATE_ACADEMIC: (id: string) => `/api/lessons/generate-academic/${id}`,
  SEARCH: '/api/lessons/search',
  CONFLICTS: '/api/lessons/conflicts',
  STATUSES: '/api/lesson-statuses',
} as const;

// HTTP Status Codes
export enum LessonHttpStatus {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  INTERNAL_SERVER_ERROR = 500,
}

// Validation constants
export const LessonValidationRules = {
  GUID: {
    PATTERN: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    ERROR_MESSAGE: 'Value must be a valid GUID.',
  },
  TIME_24H: {
    PATTERN: /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/,
    ERROR_MESSAGE: 'Time must be in 24h HH:mm format.',
  },
  DATE_ISO: {
    PATTERN: /^\d{4}-\d{2}-\d{2}$/,
    ERROR_MESSAGE: 'Date must be in ISO format YYYY-MM-DD.',
  },
  DATETIME_ISO: {
    PATTERN: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z?$/,
    ERROR_MESSAGE: 'Datetime must be in ISO 8601 format.',
  },
  CANCELLATION_REASON: {
    MIN_LENGTH: 5,
    MAX_LENGTH: 500,
  },
  NOTES: {
    MAX_LENGTH: 1000,
  },
} as const;

// Status transition rules (business logic)
export const LessonStatusTransitions = {
  Scheduled: ['Conducted', 'Cancelled', 'No Show'],
  Conducted: [], // Terminal state
  Cancelled: ['Make Up'], // Can only create makeup
  'Make Up': ['Conducted', 'Cancelled', 'No Show'],
  'No Show': [], // Terminal state
} as const;

// Status color mapping for UI
export const LessonStatusColors = {
  Scheduled: 'blue',
  Conducted: 'green', 
  Cancelled: 'red',
  'Make Up': 'purple',
  'No Show': 'gray',
} as const;

// Status icon mapping for UI
export const LessonStatusIcons = {
  Scheduled: 'calendar',
  Conducted: 'check-circle',
  Cancelled: 'x-circle',
  'Make Up': 'rotate-ccw',
  'No Show': 'user-x',
} as const;

// Type guards
export function isLessonResponse(obj: any): obj is LessonResponse {
  return obj && 
         typeof obj === 'object' && 
         typeof obj.id === 'string' && 
         typeof obj.classId === 'string' &&
         typeof obj.scheduledDate === 'string';
}

export function isLessonCreatedResponse(obj: any): obj is LessonCreatedResponse {
  return obj && typeof obj === 'object' && typeof obj.id === 'string';
}

export function isValidLessonStatus(status: string): status is LessonStatusName {
  return ['Scheduled', 'Conducted', 'Cancelled', 'Make Up', 'No Show'].includes(status);
}

export function canTransitionToStatus(
  currentStatus: LessonStatusName, 
  targetStatus: LessonStatusName
): boolean {
  return LessonStatusTransitions[currentStatus].includes(targetStatus);
}

// Check if a lesson can be rescheduled based on status
export function canRescheduleLesson(status: LessonStatusName): boolean {
  return status === 'Scheduled' || status === 'Make Up';
}

// Utility types for forms
export interface LessonFormData {
  classId: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  notes?: string;
}

export interface MakeupLessonFormData {
  scheduledDate: string;
  startTime: string;
  endTime: string;
  notes?: string;
}

// Calendar view specific types
export interface CalendarLessonEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  status: LessonStatusName;
  classId: string;
  className: string;
  teacherName: string;
  isOriginalLesson: boolean;
  isMakeupLesson: boolean;
  originalLessonId?: string;
  makeupLessonId?: string;
}

export interface LessonTimeSlot {
  date: string; // ISO date
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  lessons: LessonResponse[];
  hasConflict: boolean;
}

// Settings specific types for lesson status management (read-only)
export interface UpdateLessonStatusRequest {
  description?: string | null;  // optional - only description can be updated
}

export interface LessonStatusResponse {
  id: string;                   // GUID
  name: LessonStatusName;
  description: string | null;
  createdAt: string;            // ISO 8601
  updatedAt: string;            // ISO 8601
}

// Settings API paths for lesson statuses
export const LessonStatusApiPaths = {
  BASE: '/api/lesson-statuses',
  BY_ID: (id: string) => `/api/lesson-statuses/${id}`,
  SEARCH: '/api/lesson-statuses/search',
} as const;

