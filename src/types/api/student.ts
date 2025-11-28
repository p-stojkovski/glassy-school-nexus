/**
 * TypeScript type definitions for the Students API
 * Based on the backend Students API documentation
 */

// Request Models
export interface CreateStudentRequest {
  firstName: string;        // Required: max 50 characters, letters/spaces/hyphens/apostrophes only
  lastName: string;         // Required: max 50 characters, letters/spaces/hyphens/apostrophes only
  email: string;            // Required: valid email format, max 320 characters, must be unique
  phone?: string;           // Optional: max 20 characters, digits/spaces/hyphens/parentheses/periods/plus
  dateOfBirth?: string;     // Optional: ISO 8601 date, must be in the past
  enrollmentDate: string;   // Required: ISO 8601 date, cannot be in the future
  isActive: boolean;        // Required: student active status
  parentContact?: string;   // Optional: parent/guardian contact
  parentEmail?: string;     // Optional: parent/guardian email
  placeOfBirth?: string;    // Optional: place of birth
  hasDiscount: boolean;     // Required: whether student has discount
  discountTypeId?: string;  // Optional: valid GUID, required when hasDiscount is true
  discountAmount: number;   // Required: discount amount, must be > 0 for discount types that need amounts
  notes?: string;           // Optional: max 500 characters
}

export interface UpdateStudentRequest {
  firstName: string;        // Required: max 50 characters
  lastName: string;         // Required: max 50 characters
  email: string;            // Required: valid email format, max 320 characters, unique
  phone?: string;           // Optional: max 20 characters
  dateOfBirth?: string;     // Optional: ISO 8601 date, must be in the past
  enrollmentDate: string;   // Required: ISO 8601 date, cannot be in the future
  isActive: boolean;        // Required: student active status
  parentContact?: string;   // Optional: parent/guardian contact
  parentEmail?: string;     // Optional: parent/guardian email
  placeOfBirth?: string;    // Optional: place of birth
  hasDiscount: boolean;     // Required: whether student has discount
  discountTypeId?: string;  // Optional: valid GUID, required when hasDiscount is true
  discountAmount: number;   // Required: discount amount
  notes?: string;           // Optional: max 500 characters
}

// Response Models
export interface StudentResponse {
  id: string;               // GUID as string
  firstName: string;        // Student's first name
  lastName: string;         // Student's last name
  fullName: string;         // Student's full name (computed)
  email: string;            // Student's email address
  phone?: string;           // Student's phone number
  dateOfBirth?: string;     // ISO 8601 date string
  enrollmentDate: string;   // ISO 8601 date string
  isActive: boolean;        // Student active status
  parentContact?: string;   // Parent/guardian contact
  parentEmail?: string;     // Parent/guardian email
  placeOfBirth?: string;    // Place of birth
  hasDiscount: boolean;     // Whether student has discount
  discountTypeId?: string;  // Discount type ID
  discountTypeName?: string;// Discount type name
  discountAmount: number;   // Discount amount
  createdAt: string;        // ISO 8601 date string
  updatedAt: string;        // ISO 8601 date string
  notes?: string;           // Additional notes
}

export interface StudentCreatedResponse {
  id: string;               // GUID as string of created student
}

export interface DiscountTypeDto {
  id: string;               // GUID as string
  key: string;              // Short discount code (e.g. "relatives")
  name: string;             // Display name (e.g. "Relatives")
  description: string;      // Detailed description
  isActive: boolean;        // Whether discount type is active
  requiresAmount: boolean;  // Whether this discount type requires an amount
  sortOrder: number;        // Display order
}

// Search Response Model
export interface StudentSearchResponse {
  students: StudentResponse[];  // Array of student objects
  totalCount: number;          // Total number of students matching criteria
  skip: number;                // Pagination offset used
  take: number;                // Number of results returned
}

// Search Parameters for the search endpoint
export interface StudentSearchParams {
  searchTerm?: string;      // Search term for name or email
  isActive?: boolean;       // Filter by active status
  hasDiscount?: boolean;    // Filter by discount status
  discountTypeId?: string;  // Filter by specific discount type (GUID format)
  notEnrolledInAnyClass?: boolean; // Filter to students not enrolled in any active class
  skip?: number;            // Pagination offset (default: 0)
  take?: number;            // Number of results to return (default: 50)
}

// Error Response Model (ASP.NET Core ProblemDetails)
export interface ProblemDetails {
  title: string;            // Error title
  detail: string;           // Error description
  status: number;           // HTTP status code
  traceId: string;          // Trace ID for debugging
  type?: string;            // Optional problem type URI
  instance?: string;        // Optional problem instance URI
  errors?: {                // Optional validation errors
    [property: string]: string[];
  };
}

// Email availability response
export interface EmailAvailabilityResponse {
  isAvailable: boolean;     // Whether the email is available
}

// API Error Codes (based on business rules)
export enum StudentErrorCodes {
  DUPLICATE_EMAIL = 'duplicate_email',
  STUDENT_NOT_FOUND = 'student_not_found',
  INVALID_DISCOUNT_TYPE = 'invalid_discount_type',
  STUDENT_HAS_DEPENDENCIES = 'student_has_dependencies',
  STUDENTS_RETRIEVAL_FAILED = 'students_retrieval_failed',
  STUDENT_RETRIEVAL_FAILED = 'student_retrieval_failed',
  STUDENT_SEARCH_FAILED = 'student_search_failed',
  STUDENT_CREATION_FAILED = 'student_creation_failed',
  STUDENT_UPDATE_FAILED = 'student_update_failed',
  STUDENT_DELETION_FAILED = 'student_deletion_failed',
  DISCOUNT_TYPES_RETRIEVAL_FAILED = 'discount_types_retrieval_failed',
}

// HTTP Status Codes for student operations
export enum StudentHttpStatus {
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
export const StudentApiPaths = {
  BASE: '/api/students',
  BY_ID: (id: string) => `/api/students/${id}`,
  SEARCH: '/api/students/search',
  EMAIL_AVAILABLE: '/api/students/email-available',
  DISCOUNT_TYPES: '/api/discount-types',
  DISCOUNT_TYPE_BY_ID: (id: string) => `/api/discount-types/${id}`,
} as const;

// Form data interface used internally by components
export interface StudentFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  enrollmentDate: string;
  isActive: boolean;
  parentContact?: string;
  parentEmail?: string;
  placeOfBirth?: string;
  hasDiscount: boolean;
  discountTypeId?: string;
  discountAmount: number;
  notes?: string;
}

// Validation constraints (matching backend validation)
export const StudentValidationRules = {
  FIRST_NAME: {
    MAX_LENGTH: 50,
    PATTERN: /^[a-zA-Z\s'-]+$/,
    ERROR_MESSAGE: 'First name can only contain letters, spaces, hyphens, and apostrophes.',
  },
  LAST_NAME: {
    MAX_LENGTH: 50,
    PATTERN: /^[a-zA-Z\s'-]+$/,
    ERROR_MESSAGE: 'Last name can only contain letters, spaces, hyphens, and apostrophes.',
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
  DISCOUNT_TYPE_ID: {
    PATTERN: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    ERROR_MESSAGE: 'Discount type ID must be a valid GUID format.',
  },
} as const;

// Type guards for API responses
export function isStudentResponse(obj: any): obj is StudentResponse {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.id === 'string' &&
    typeof obj.firstName === 'string' &&
    typeof obj.lastName === 'string' &&
    typeof obj.fullName === 'string' &&
    typeof obj.email === 'string' &&
    typeof obj.enrollmentDate === 'string' &&
    typeof obj.isActive === 'boolean' &&
    typeof obj.hasDiscount === 'boolean' &&
    typeof obj.discountAmount === 'number' &&
    typeof obj.createdAt === 'string' &&
    typeof obj.updatedAt === 'string'
  );
}

export function isStudentCreatedResponse(obj: any): obj is StudentCreatedResponse {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.id === 'string'
  );
}

export function isDiscountTypeDto(obj: any): obj is DiscountTypeDto {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.id === 'string' &&
    typeof obj.key === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.description === 'string' &&
    typeof obj.isActive === 'boolean' &&
    typeof obj.requiresAmount === 'boolean' &&
    typeof obj.sortOrder === 'number'
  );
}

export function isStudentSearchResponse(obj: any): obj is StudentSearchResponse {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    Array.isArray(obj.students) &&
    typeof obj.totalCount === 'number' &&
    typeof obj.skip === 'number' &&
    typeof obj.take === 'number'
  );
}

export function isProblemDetails(obj: any): obj is ProblemDetails {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.title === 'string' &&
    typeof obj.detail === 'string' &&
    typeof obj.status === 'number' &&
    typeof obj.traceId === 'string'
  );
}

