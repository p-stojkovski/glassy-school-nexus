/**
 * TypeScript type definitions for the Teacher API
 * Based on the backend Teachers API documentation
 */

// Request Models
export interface CreateTeacherRequest {
  name: string;          // Required: max 100 characters, letters/spaces/hyphens/apostrophes/periods only
  email: string;         // Required: valid email format, max 320 characters, must be unique
  phone?: string;        // Optional: max 20 characters, digits/spaces/hyphens/parentheses/periods/plus signs
  subjectId: string;     // Required: valid GUID, must exist in subjects table
  notes?: string;        // Optional: max 500 characters
}

export interface UpdateTeacherRequest {
  name: string;          // Required: max 100 characters
  email: string;         // Required: valid email format, max 320 characters, unique
  phone?: string;        // Optional: max 20 characters
  subjectId: string;     // Required: valid GUID, must exist
  notes?: string;        // Optional: max 500 characters
}

// Response Models
export interface TeacherResponse {
  id: string;             // GUID as string
  name: string;           // Teacher's full name
  email: string;          // Teacher's email address
  phone?: string;         // Teacher's phone number
  subjectId: string;      // Assigned subject ID
  subjectName: string;    // Assigned subject name
  joinDate: string;       // ISO 8601 date string
  notes?: string;         // Additional notes
  classCount: number;     // Number of assigned classes
}

export interface TeacherCreatedResponse {
  id: string;             // GUID as string of created teacher
}

export interface SubjectDto {
  id: string;             // GUID as string
  key: string;            // Short subject code
  name: string;           // Full subject name
  sortOrder: number;      // Display order
}

// Error Response Model (ASP.NET Core ProblemDetails)
export interface ProblemDetails {
  title: string;        // Error title
  detail: string;       // Error description
  status: number;       // HTTP status code
  type?: string;        // Optional problem type URI
  instance?: string;    // Optional problem instance URI
  errors?: {            // Optional validation errors
    [property: string]: string[];
  };
}

// Search Parameters for the search endpoint
export interface TeacherSearchParams {
  searchTerm?: string;    // Search term for name, email, or subject name
  subjectId?: string;     // Filter by specific subject ID (GUID format)
}

// API Error Codes (based on backend error handling)
export enum TeacherErrorCodes {
  DUPLICATE_EMAIL = 'duplicate_email',
  TEACHER_NOT_FOUND = 'teacher_not_found',
  INVALID_SUBJECT = 'invalid_subject',
  TEACHER_HAS_CLASSES = 'teacher_has_classes',
  INVALID_SUBJECT_ID = 'invalid_subject_id',
  TEACHERS_RETRIEVAL_FAILED = 'teachers_retrieval_failed',
  TEACHER_RETRIEVAL_FAILED = 'teacher_retrieval_failed',
  TEACHER_SEARCH_FAILED = 'teacher_search_failed',
  TEACHER_CREATION_FAILED = 'teacher_creation_failed',
  TEACHER_UPDATE_FAILED = 'teacher_update_failed',
  TEACHER_DELETION_FAILED = 'teacher_deletion_failed',
  SUBJECTS_RETRIEVAL_FAILED = 'subjects_retrieval_failed',
}

// HTTP Status Codes for teacher operations
export enum TeacherHttpStatus {
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

// API Endpoint paths
export const TeacherApiPaths = {
  BASE: '/api/teachers',
  BY_ID: (id: string) => `/api/teachers/${id}`,
  SEARCH: '/api/teachers/search',
  SUBJECTS: '/api/subjects',
  EMAIL_AVAILABLE: '/api/teachers/email-available',
} as const;

// Form data interface used internally by components
export interface TeacherFormData {
  name: string;
  email: string;
  phone?: string;
  subjectId: string;
  notes?: string;
}

// Validation constraints (matching backend validation)
export const TeacherValidationRules = {
  NAME: {
    MAX_LENGTH: 100,
    PATTERN: /^[a-zA-Z\s'\-.]+$/,
    ERROR_MESSAGE: 'Name can only contain letters, spaces, apostrophes, hyphens, and periods.',
  },
  EMAIL: {
    MAX_LENGTH: 320,
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    ERROR_MESSAGE: 'Email must be a valid email address.',
  },
  PHONE: {
    MAX_LENGTH: 20,
    PATTERN: /^[\d\s\-().+]+$/,
    ERROR_MESSAGE: 'Phone can only contain digits, spaces, hyphens, parentheses, periods, and plus signs.',
  },
  NOTES: {
    MAX_LENGTH: 500,
  },
  SUBJECT_ID: {
    PATTERN: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    ERROR_MESSAGE: 'Subject ID must be a valid GUID format.',
  },
} as const;

// Type guards for API responses
export function isTeacherResponse(obj: any): obj is TeacherResponse {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.email === 'string' &&
    typeof obj.subjectId === 'string' &&
    typeof obj.subjectName === 'string' &&
    typeof obj.joinDate === 'string' &&
    typeof obj.classCount === 'number'
  );
}

export function isTeacherCreatedResponse(obj: any): obj is TeacherCreatedResponse {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.id === 'string'
  );
}

export function isSubjectDto(obj: any): obj is SubjectDto {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.id === 'string' &&
    typeof obj.key === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.sortOrder === 'number'
  );
}

export function isProblemDetails(obj: any): obj is ProblemDetails {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.title === 'string' &&
    typeof obj.detail === 'string' &&
    typeof obj.status === 'number'
  );
}

