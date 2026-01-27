/**
 * TypeScript type definitions for Class Fee Templates API
 * Handles fee template management for classes
 */

// ============================================================================
// FEE TEMPLATE TYPES
// ============================================================================

export type FeeType = 'tuition' | 'material' | 'exam' | 'activity' | 'other';
export type RecurrenceInterval = 'monthly';

/**
 * Class fee template response from API.
 * Maps to backend ClassFeeTemplateResponse.
 */
export interface ClassFeeTemplate {
  id: string;
  classId: string;
  feeType: FeeType;
  name: string;
  amount: number;
  isRecurring: boolean;
  recurrenceInterval: RecurrenceInterval | null;
  isOptional: boolean;
  effectiveFrom: string; // ISO date (YYYY-MM-DD)
  effectiveTo: string | null; // ISO date or null
  sortOrder: number;
  createdAt: string; // ISO datetime
}

/**
 * Request for creating a new class fee template.
 * Maps to backend CreateClassFeeTemplateRequest.
 */
export interface CreateClassFeeTemplateRequest {
  feeType: FeeType;
  name: string;
  amount: number;
  isRecurring: boolean;
  recurrenceInterval?: RecurrenceInterval;
  isOptional: boolean;
  effectiveFrom?: string; // ISO date (YYYY-MM-DD)
  sortOrder?: number;
}

/**
 * Request for updating an existing class fee template.
 * Maps to backend UpdateClassFeeTemplateRequest.
 */
export interface UpdateClassFeeTemplateRequest {
  feeType: FeeType;
  name: string;
  amount: number;
  isRecurring: boolean;
  recurrenceInterval?: RecurrenceInterval;
  isOptional: boolean;
  sortOrder?: number;
}

// ============================================================================
// RESPONSE TYPES
// ============================================================================

/**
 * Response for getting all fee templates for a class.
 */
export interface GetClassFeeTemplatesResponse {
  templates: ClassFeeTemplate[];
}

/**
 * Response for creating a new fee template.
 */
export interface CreateClassFeeTemplateResponse {
  id: string;
}

// ============================================================================
// API ENDPOINT PATHS
// ============================================================================

export const ClassFeesApiPaths = {
  TEMPLATES_BY_CLASS: (classId: string) => `/api/classes/${classId}/fee-templates`,
  TEMPLATE_BY_ID: (classId: string, templateId: string) =>
    `/api/classes/${classId}/fee-templates/${templateId}`,
} as const;

// ============================================================================
// HTTP STATUS CODES
// ============================================================================

export enum ClassFeesHttpStatus {
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

// ============================================================================
// TYPE GUARDS
// ============================================================================

export function isValidFeeType(type: string): type is FeeType {
  return ['tuition', 'material', 'exam', 'activity', 'other'].includes(type);
}

export function isValidRecurrenceInterval(interval: string): interval is RecurrenceInterval {
  return interval === 'monthly';
}
