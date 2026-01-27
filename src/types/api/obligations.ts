/**
 * TypeScript type definitions for Student Obligations API
 * Handles monthly fee obligation generation and management
 */

// ============================================================================
// OBLIGATION GENERATION TYPES
// ============================================================================

/**
 * Request for generating bulk obligations for enrolled students.
 * Maps to backend GenerateBulkObligationsRequest.
 */
export interface GenerateBulkObligationsRequest {
  /** Start of the billing period (ISO date: YYYY-MM-DD) */
  periodStart: string;
  /** End of the billing period (ISO date: YYYY-MM-DD) */
  periodEnd: string;
  /** Payment due date (ISO date: YYYY-MM-DD) */
  dueDate: string;
  /** Optional: specific fee template IDs (if empty, all active recurring templates used) */
  feeTemplateIds?: string[];
  /** Optional: specific student IDs (if empty, all enrolled students included) */
  studentIds?: string[];
}

/**
 * Result status for each student in bulk generation.
 */
export type GenerationResultStatus = 'created' | 'skipped' | 'error';

/**
 * Detail result for a single student in bulk generation.
 */
export interface GenerationResultDetail {
  studentId: string;
  studentName: string;
  status: GenerationResultStatus;
  /** Only present when status is 'created' */
  obligationId?: string;
  /** Present when status is 'skipped' or 'error' */
  reason?: string;
}

/**
 * Response from bulk obligation generation.
 * Maps to backend GenerateBulkObligationsResponse.
 */
export interface GenerateBulkObligationsResponse {
  created: number;
  skipped: number;
  errors: number;
  details: GenerationResultDetail[];
}

// ============================================================================
// API ENDPOINT PATHS
// ============================================================================

export const ObligationsApiPaths = {
  GENERATE_BULK: (classId: string) => `/api/classes/${classId}/obligations/generate`,
} as const;

// ============================================================================
// HTTP STATUS CODES
// ============================================================================

export enum ObligationsHttpStatus {
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
