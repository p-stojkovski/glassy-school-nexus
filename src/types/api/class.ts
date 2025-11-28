/**
 * TypeScript type definitions for the Classes API
 * Based on the provided backend Classes API documentation
 */

// Shared DTOs
export interface ScheduleSlotDto {
  id?: string;  // Optional: filled when fetching existing schedules
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  startTime: string; // "HH:mm"
  endTime: string;   // "HH:mm"
  isObsolete?: boolean;  // Optional: true for archived schedules
  pastLessonCount?: number;  // Optional: count of past lessons (scheduled_date < today)
  futureLessonCount?: number;  // Optional: count of future lessons (scheduled_date > today) that will be deleted
}

// Requests
export interface CreateClassRequest {
  name: string;                 // required, max 100
  subjectId: string;            // required, GUID
  teacherId: string;            // required, GUID
  classroomId: string;          // required, GUID
  description?: string | null;  // optional
  requirements?: string | null; // optional
  objectives?: string[] | null; // optional
  materials?: string[] | null;  // optional
  schedule: ScheduleSlotDto[];  // required, ≥ 1 slot
  studentIds?: string[] | null; // optional
}

export interface UpdateClassRequest extends CreateClassRequest {}

// Responses
export interface LessonSummaryDto {
  totalLessons: number;
  scheduledLessons: number;
  conductedLessons: number;
  cancelledLessons: number;
  makeupLessons: number;
  noShowLessons: number;
}

export interface NewScheduleSlotGenerationInfo {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  generatedCount: number;
  skippedConflictCount: number;
  skippedPastDateCount: number;
  warnings?: string[];
}

export interface ClassResponse {
  id: string;                   // GUID
  name: string;
  subjectId: string;
  subjectName: string;
  teacherId: string;
  teacherName: string;
  classroomId: string;
  classroomName: string;
  classroomCapacity: number;
  enrolledCount: number;
  availableSlots: number;
  description: string | null;
  requirements: string | null;
  objectives: string[] | null;
  materials: string[] | null;
  createdAt: string;
  updatedAt: string;
  schedule: ScheduleSlotDto[];  // filled on GetById; empty for list/search
  studentIds: string[];         // filled on GetById; empty for list/search
  lessonSummary: LessonSummaryDto;
  generatedLessonsInfo?: NewScheduleSlotGenerationInfo[];  // only populated during updates with new schedule slots
  lessonGenerationWarnings?: string[]; // warnings from lesson generation for new schedule slots
}

// ============================================================================
// Lazy Loading Response Types
// ============================================================================

/** Slimmed down response for class basic info (lazy loading - initial page load) */
export interface ClassBasicInfoResponse {
  id: string;
  name: string;
  subjectId: string;
  subjectName: string;
  teacherId: string;
  teacherName: string;
  classroomId: string;
  classroomName: string;
  classroomCapacity: number;
  enrolledCount: number;
  availableSlots: number;
  createdAt: string;
  updatedAt: string;
  lessonSummary: LessonSummaryDto;
}

/** Response for class schedule data (lazy loading - loaded when Schedule tab is viewed) */
export interface ClassScheduleResponse {
  schedule: ScheduleSlotDto[];
}

/** Response for class additional details (lazy loading - loaded when Overview tab is viewed) */
export interface ClassAdditionalDetailsResponse {
  description: string | null;
  requirements: string | null;
  objectives: string[] | null;
  materials: string[] | null;
}

export interface ClassCreatedResponse { id: string; }

export interface ArchivedScheduleSlotResponse {
  id: string;
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  startTime: string; // "HH:mm"
  endTime: string;   // "HH:mm"
  isObsolete: boolean;
  pastLessonCount: number;
}

// Student progress summary types
export interface AttendanceSummary {
  present: number;
  absent: number;
  late: number;
  excused: number;
  notMarked: number;
}

export interface HomeworkSummary {
  complete: number;
  partial: number;
  missing: number;
  notChecked: number;
}

// Student discount information for privacy-respecting display
export interface StudentDiscountInfo {
  hasDiscount: boolean;
  discountTypeName?: string | null;
  discountAmount?: number | null;
}

// Student payment obligation summary for privacy-respecting display
// Payment obligations feature is in progress - using placeholder data
export interface StudentPaymentObligationInfo {
  hasPendingObligations: boolean;
  pendingCount: number;
  totalPendingAmount: number;
}

export interface StudentLessonSummary {
  studentId: string;
  studentName: string;
  totalLessons: number;
  attendance: AttendanceSummary;
  homework: HomeworkSummary;
  commentsCount: number;
  mostRecentComment?: string | null;
  lastUpdated?: string | null;
  discount?: StudentDiscountInfo | null;
  paymentObligation?: StudentPaymentObligationInfo | null;
}

export interface StudentLessonDetail {
  lessonId: string;
  lessonDate: string;  // ISO date string
  lessonTime: string;  // "HH:MM"
  attendanceStatus?: string | null;  // 'present' | 'absent' | 'late' | 'excused'
  homeworkStatus?: string | null;    // 'complete' | 'partial' | 'missing'
  comments?: string | null;
  updatedAt?: string | null;
}

// Form data interface
export interface ClassFormData {
  name: string;
  subjectId: string;
  teacherId: string;
  classroomId: string;
  description?: string;
  requirements?: string;
  objectives?: string[] | null;
  materials?: string[] | null;
  schedule?: ScheduleSlotDto[];
  studentIds?: string[];
}

// Search params (no pagination)
export interface ClassSearchParams {
  searchTerm?: string;
  subjectId?: string;           // GUID
  teacherId?: string;           // GUID
  onlyWithAvailableSlots?: boolean;
}

// ProblemDetails (reuse shape)
export interface ProblemDetails {
  type?: string;
  title: string;
  detail: string;
  status: number;
  instance?: string;
  errors?: { [property: string]: string[] };
}

// HTTP Status Codes
export enum ClassHttpStatus {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  INTERNAL_SERVER_ERROR = 500,
}

// API paths
export const ClassApiPaths = {
  BASE: '/api/classes',
  BY_ID: (id: string) => `/api/classes/${id}`,
  SEARCH: '/api/classes/search',
  ARCHIVED_SCHEDULES: (id: string) => `/api/classes/${id}/schedules/archived`,
  ENROLLMENTS: (classId: string) => `/api/classes/${classId}/enrollments`,
  ENROLLMENT_BY_STUDENT: (classId: string, studentId: string) => `/api/classes/${classId}/enrollments/${studentId}`,
  ENROLLMENT_TRANSFER: (classId: string, studentId: string) => `/api/classes/${classId}/enrollments/${studentId}/transfer`,
  BASIC_INFO: (id: string) => `/api/classes/${id}/basic-info`,
  ADDITIONAL_DETAILS: (id: string) => `/api/classes/${id}/additional-details`,
  SCHEDULE: (id: string) => `/api/classes/${id}/schedule`,
} as const;

// ============================================================================
// Partial Update Request Types
// ============================================================================

/** Request to update only basic class information */
export interface UpdateBasicInfoRequest {
  name: string;
  subjectId: string;
  teacherId: string;
  classroomId: string;
}

/** Request to update only additional class details */
export interface UpdateAdditionalDetailsRequest {
  description?: string | null;
  requirements?: string | null;
  objectives?: string[] | null;
  materials?: string[] | null;
}

// ============================================================================
// Enrollment Management Types
// ============================================================================

/** Request to add or remove students from a class */
export interface ManageEnrollmentsRequest {
  studentIdsToAdd?: string[];
  studentIdsToRemove?: string[];
}

/** Response from bulk enrollment management */
export interface ManageEnrollmentsResponse {
  addedCount: number;
  removedCount: number;
  currentEnrollmentCount: number;
  warnings?: string[];
}

/** Request to transfer a student to another class */
export interface TransferStudentRequest {
  targetClassId: string;
  reason?: string;
}

/** Response from student transfer */
export interface TransferStudentResponse {
  studentId: string;
  studentName: string;
  sourceClassId: string;
  sourceClassName: string;
  targetClassId: string;
  targetClassName: string;
  transferredAt: string;
  reason?: string;
}

// Validation constants
export const ClassValidationRules = {
  NAME: { MAX_LENGTH: 100 },
  GUID: {
    PATTERN: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    ERROR_MESSAGE: 'Value must be a valid GUID.',
  },
  TIME_24H: {
    PATTERN: /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/,
    ERROR_MESSAGE: 'Time must be in 24h HH:mm format.',
  },
  ALLOWED_DAYS: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'] as const,
} as const;

// Type guards (basic)
export function isClassResponse(obj: any): obj is ClassResponse {
  return obj && typeof obj === 'object' && typeof obj.id === 'string' && typeof obj.name === 'string';
}

export function isClassCreatedResponse(obj: any): obj is ClassCreatedResponse {
  return obj && typeof obj === 'object' && typeof obj.id === 'string';
}

