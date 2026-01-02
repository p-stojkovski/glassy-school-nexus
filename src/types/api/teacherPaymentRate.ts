/**
 * TypeScript type definitions for the Teacher Payment Rate API
 * Based on the backend Payment Rates API documentation
 */

// Request Models
export interface SetTeacherPaymentRateRequest {
  classId: string;                  // Required: valid GUID
  ratePerLesson: number;            // Required: > 0, max 999999.99
  effectiveFrom?: string;           // Optional: ISO date string, defaults to today
  notes?: string;                   // Optional: max 1000 characters
}

export interface UpdateTeacherPaymentRateRequest {
  ratePerLesson?: number;           // Optional: > 0, max 999999.99
  notes?: string;                   // Optional: max 1000 characters
}

// Response Models
export interface TeacherPaymentRateResponse {
  id: string;                       // GUID as string
  teacherId: string;                // GUID as string
  classId: string;                  // GUID as string
  className: string;                // Class name for display
  ratePerLesson: number;            // Payment amount per lesson
  effectiveFrom: string;            // ISO date string
  effectiveTo: string | null;       // ISO date string or null (active)
  notes: string | null;             // Optional notes
  createdAt: string;                // ISO timestamp
  updatedAt: string;                // ISO timestamp
}

export interface TeacherPaymentRatesResponse {
  rates: TeacherPaymentRateResponse[];           // Active rates
  rateHistory: TeacherPaymentRateResponse[];     // Historical rates
  stats: TeacherPaymentRatesStats;
}

export interface TeacherPaymentRatesStats {
  totalRates: number;               // Total number of rates (active + inactive)
  activeRates: number;              // Number of currently active rates
  classesWithRates: number;         // Number of classes with active rates
  classesWithoutRates: number;      // Number of classes without rates
  averageRate: number | null;       // Average rate across active rates
}

// Error Response Model (inherits from ASP.NET Core ProblemDetails)
export interface PaymentRateProblemDetails {
  title: string;                    // Error title
  detail: string;                   // Error description
  status: number;                   // HTTP status code
  type?: string;                    // Optional problem type URI
  instance?: string;                // Optional problem instance URI
  errors?: {                        // Optional validation errors
    [property: string]: string[];
  };
}

// API Error Codes (based on backend TeacherPaymentRateErrors)
export enum PaymentRateErrorCodes {
  NOT_FOUND = 'TeacherPaymentRate.NotFound',
  TEACHER_NOT_FOUND = 'TeacherPaymentRate.TeacherNotFound',
  CLASS_NOT_FOUND = 'TeacherPaymentRate.ClassNotFound',
  CLASS_NOT_ASSIGNED_TO_TEACHER = 'TeacherPaymentRate.ClassNotAssignedToTeacher',
  DUPLICATE_ACTIVE_RATE = 'TeacherPaymentRate.DuplicateActiveRate',
  INVALID_DATE_RANGE = 'TeacherPaymentRate.InvalidDateRange',
  INVALID_RATE = 'TeacherPaymentRate.InvalidRate',
  DATABASE_ERROR = 'TeacherPaymentRate.DatabaseError',
}

// HTTP Status Codes
export enum PaymentRateHttpStatus {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  NOT_FOUND = 404,
  CONFLICT = 409,
  INTERNAL_SERVER_ERROR = 500,
}

// API Paths
export const PaymentRateApiPaths = {
  BASE: (teacherId: string) => `/api/teachers/${teacherId}/payment-rates`,
  BY_ID: (teacherId: string, rateId: string) => `/api/teachers/${teacherId}/payment-rates/${rateId}`,
  WITH_INACTIVE: (teacherId: string, includeInactive: boolean) =>
    `/api/teachers/${teacherId}/payment-rates?includeInactive=${includeInactive}`,
} as const;

// Validation Constants (matching backend)
export const PAYMENT_RATE_VALIDATION = {
  MIN_RATE: 0.01,
  MAX_RATE: 999999.99,
  MAX_NOTES_LENGTH: 1000,
} as const;
