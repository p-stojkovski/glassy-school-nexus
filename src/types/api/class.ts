/**
 * TypeScript type definitions for the Classes API
 * Based on the provided backend Classes API documentation
 */

// Shared DTOs
export interface ScheduleSlotDto {
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  startTime: string; // "HH:mm"
  endTime: string;   // "HH:mm"
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
export interface ClassResponse {
  id: string;                   // GUID
  name: string;
  subjectId: string;
  subjectName: string;
  teacherId: string;
  teacherName: string;
  classroomId: string;
  classroomName: string;
  enrolledCount: number;
  description: string | null;
  requirements: string | null;
  objectives: string[] | null;
  materials: string[] | null;
  createdAt: string;
  updatedAt: string;
  schedule: ScheduleSlotDto[];  // filled on GetById; empty for list/search
  studentIds: string[];         // filled on GetById; empty for list/search
}

export interface ClassCreatedResponse { id: string; }

// Form data interface
export interface ClassFormData {
  name: string;
  subjectId: string;
  teacherId: string;
  classroomId: string;
  description?: string;
  requirements?: string;
  objectives?: string;
  materials?: string;
  schedule?: ScheduleSlotDto[];
  studentIds?: string[];
}

// Search params (no pagination)
export interface ClassSearchParams {
  searchTerm?: string;
  subjectId?: string;           // GUID
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
} as const;

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
