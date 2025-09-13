/**
 * TypeScript type definitions for the Classroom API
 * Based on the backend ClassroomEndpoints.cs and integration guide
 */

// Request Models
export interface CreateClassroomRequest {
  name: string;          // Required: 1-50 characters, letters, numbers, spaces, hyphens, underscores, periods, commas, parentheses
  location?: string;     // Optional: max 100 characters, same allowed characters plus # and /
  capacity?: number;     // Optional: 1-50, defaults to 15
}

export interface UpdateClassroomRequest {
  name: string;          // Required: 1-50 characters, same validation as create
  location?: string;     // Optional: max 100 characters
  capacity: number;      // Required: 1-50
}

// Response Models
export interface ClassroomResponse {
  id: string;           // UUID format
  name: string;         // Classroom name
  location?: string;    // Optional location/description
  capacity: number;     // Maximum capacity
  createdDate: string;  // ISO 8601 datetime
  lastUpdated: string;  // ISO 8601 datetime
}

export interface ClassroomCreatedResponse {
  id: string;           // UUID of created classroom
}

export interface NameAvailabilityResponse {
  isAvailable: boolean; // true if name is available
}

// Error Response Model (ASP.NET Core ProblemDetails)
export interface ProblemDetails {
  title: string;        // Error title
  detail: string;       // Error description
  status: number;       // HTTP status code
  type?: string;        // Optional problem type URI
  instance?: string;    // Optional problem instance URI
}

// Search Parameters for the search endpoint
export interface ClassroomSearchParams {
  searchTerm?: string;    // Search by name or location
  minCapacity?: number;   // DEPRECATED: Capacity filtering has been removed from UI
  maxCapacity?: number;   // DEPRECATED: Capacity filtering has been removed from UI
}

// Name availability check parameters
export interface NameAvailabilityParams {
  name: string;           // Required: Classroom name to check
  excludeId?: string;     // Optional: Classroom ID to exclude from check (useful for updates)
}

// API Error Codes (based on backend error handling)
export enum ClassroomErrorCodes {
  CLASSROOM_NAME_EXISTS = 'classroom_name_exists',
  NOT_FOUND = 'not_found',
  CLASSROOM_NOT_FOUND = 'classroom_not_found',
  CLASSROOM_RETRIEVAL_FAILED = 'classroom_retrieval_failed',
  CLASSROOMS_RETRIEVAL_FAILED = 'classrooms_retrieval_failed',
  CLASSROOM_SEARCH_FAILED = 'classroom_search_failed',
  CLASSROOM_CREATION_FAILED = 'classroom_creation_failed',
  CLASSROOM_UPDATE_FAILED = 'classroom_update_failed',
  CLASSROOM_DELETION_FAILED = 'classroom_deletion_failed',
  NAME_CHECK_FAILED = 'name_check_failed',
}

// HTTP Status Codes for classroom operations
export enum ClassroomHttpStatus {
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
export const ClassroomApiPaths = {
  BASE: '/api/classrooms',
  BY_ID: (id: string) => `/api/classrooms/${id}`,
  SEARCH: '/api/classrooms/search',
  NAME_AVAILABLE: '/api/classrooms/name-available',
} as const;

// Form data interface used internally by components
export interface ClassroomFormData {
  name: string;
  location?: string;
  capacity: number;
}

// Validation constraints (matching backend validation)
export const ClassroomValidationRules = {
  NAME: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 50,
    PATTERN: /^[\p{L}\p{N}\s\-_.,()]+$/u, // Letters, numbers, spaces, hyphens, underscores, periods, commas, parentheses
    ERROR_MESSAGE: 'Classroom name can only contain letters, numbers, spaces, hyphens, underscores, periods, commas, and parentheses.',
  },
  LOCATION: {
    MAX_LENGTH: 100,
    PATTERN: /^[\p{L}\p{N}\s\-_.,()#/]+$/u, // Same as name plus # and /
    ERROR_MESSAGE: 'Location can only contain letters, numbers, spaces, hyphens, underscores, periods, commas, parentheses, hash symbols, and forward slashes.',
  },
  CAPACITY: {
    MIN: 1,
    MAX: 50,
    DEFAULT: 15,
  },
} as const;

// Type guards for API responses
export function isClassroomResponse(obj: any): obj is ClassroomResponse {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.capacity === 'number' &&
    typeof obj.createdDate === 'string' &&
    typeof obj.lastUpdated === 'string'
  );
}

export function isClassroomCreatedResponse(obj: any): obj is ClassroomCreatedResponse {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.id === 'string'
  );
}

export function isNameAvailabilityResponse(obj: any): obj is NameAvailabilityResponse {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.isAvailable === 'boolean'
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
