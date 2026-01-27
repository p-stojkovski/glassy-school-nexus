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

// ============================================================================
// STUDENT OBLIGATION TYPES (for payment registration)
// ============================================================================

/**
 * Status of a student obligation.
 */
export type StudentObligationStatus = 'pending' | 'partial' | 'paid' | 'cancelled';

/**
 * Represents a student's payment obligation.
 * Used by the RegisterPaymentDialog to display obligation info and record payments.
 */
export interface StudentObligation {
  id: string;
  studentId: string;
  studentName: string;
  description: string;
  /** Original amount before any discounts */
  baseAmount: number;
  /** Amount after discounts (what the student actually owes) */
  finalAmount: number;
  /** Amount already paid */
  paidAmount: number;
  /** Remaining amount to be paid (finalAmount - paidAmount) */
  remainingAmount: number;
  status: StudentObligationStatus;
  dueDate: string;
  /** Period start date (ISO: YYYY-MM-DD) */
  periodStart: string;
  /** Period end date (ISO: YYYY-MM-DD) */
  periodEnd: string;
  createdAt: string;
}

// ============================================================================
// PAYMENT TYPES
// ============================================================================

/**
 * Valid payment methods (matches backend CHECK constraint).
 */
export type PaymentMethod = 'cash' | 'bank_transfer' | 'card';

/**
 * Request for creating a payment on an obligation.
 * Maps to backend CreatePaymentRequest.
 */
export interface CreatePaymentRequest {
  amount: number;
  paymentMethod: PaymentMethod;
  /** ISO date format: YYYY-MM-DD */
  paymentDate: string;
  referenceNumber?: string;
  notes?: string;
}

/**
 * Response from creating a payment.
 * Maps to backend CreatePaymentResponse.
 */
export interface CreatePaymentResponse {
  id: string;
}

/**
 * A recorded payment against an obligation.
 * Maps to backend PaymentRecordResponse.
 */
export interface PaymentRecord {
  id: string;
  obligationId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentDate: string;
  referenceNumber?: string;
  notes?: string;
  recordedBy?: string;
  recordedAt: string;
}

/**
 * List response for obligation payments.
 * Maps to backend ObligationPaymentsListResponse.
 */
export interface ObligationPaymentsListResponse {
  payments: PaymentRecord[];
  totalPaid: number;
}

// ============================================================================
// PAYMENT API ENDPOINT PATHS
// ============================================================================

export const PaymentsApiPaths = {
  /** POST /api/obligations/:obligationId/payments */
  CREATE_PAYMENT: (obligationId: string) => `/api/obligations/${obligationId}/payments`,
  /** GET /api/obligations/:obligationId/payments */
  GET_OBLIGATION_PAYMENTS: (obligationId: string) => `/api/obligations/${obligationId}/payments`,
} as const;

// ============================================================================
// PAYMENT VALIDATION RULES
// ============================================================================

export const PaymentValidationRules = {
  AMOUNT: {
    MIN: 0.01,
    MAX: 999999.99,
  },
  REFERENCE_NUMBER: {
    MAX_LENGTH: 50,
  },
  NOTES: {
    MAX_LENGTH: 500,
  },
  VALID_PAYMENT_METHODS: ['cash', 'bank_transfer', 'card'] as const,
} as const;

// ============================================================================
// FINANCIAL STATUS TYPES (for class students obligations display)
// ============================================================================

/**
 * Financial status for display in Students tab.
 * Maps to backend StudentFinancialSummaryResponse.
 */
export type FinancialStatusType = 'paid' | 'pending' | 'partial' | 'overdue' | 'none';

/**
 * Financial summary for a single student in a class.
 * Maps to backend StudentFinancialSummaryResponse.
 */
export interface StudentFinancialSummary {
  studentId: string;
  studentName: string;
  status: FinancialStatusType;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  hasOverdue: boolean;
  overdueAmount: number;
}

/**
 * Response for class students financial status endpoint.
 * Maps to backend ClassStudentsFinancialStatusResponse.
 */
export interface ClassStudentsFinancialStatusResponse {
  studentSummaries: StudentFinancialSummary[];
}

// ============================================================================
// FINANCIAL STATUS API PATHS
// ============================================================================

export const FinancialStatusApiPaths = {
  /** GET /api/classes/:classId/students/financial-status */
  GET_CLASS_STUDENTS_FINANCIAL_STATUS: (classId: string) =>
    `/api/classes/${classId}/students/financial-status`,
} as const;

// ============================================================================
// STUDENT OBLIGATIONS LIST TYPES (for obligations sidebar)
// ============================================================================

/**
 * Response for a single student obligation from the API.
 * Maps to backend StudentObligationResponse.
 * Note: Uses camelCase as .NET serializes PascalCase to camelCase.
 */
export interface StudentObligationResponse {
  id: string;
  studentId: string;
  classId: string | null;
  obligationType: string;
  description: string;
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
  dueDate: string;
  periodStart: string | null;
  periodEnd: string | null;
  status: StudentObligationStatus;
  paidAmount: number;
  remainingAmount: number;
  notes: string | null;
  createdAt: string;
  studentName: string | null;
  className: string | null;
}

/**
 * List response for student obligations.
 * Maps to backend StudentObligationsListResponse.
 */
export interface StudentObligationsListResponse {
  obligations: StudentObligationResponse[];
}

/**
 * Converts API response to the existing StudentObligation interface
 * used by RegisterPaymentDialog and other components.
 */
export function mapResponseToStudentObligation(
  response: StudentObligationResponse
): StudentObligation {
  return {
    id: response.id,
    studentId: response.studentId,
    studentName: response.studentName || '',
    description: response.description,
    baseAmount: response.originalAmount,
    finalAmount: response.finalAmount,
    paidAmount: response.paidAmount,
    remainingAmount: response.remainingAmount,
    status: response.status,
    dueDate: response.dueDate,
    periodStart: response.periodStart || '',
    periodEnd: response.periodEnd || '',
    createdAt: response.createdAt,
  };
}

// ============================================================================
// STUDENT OBLIGATIONS API PATHS
// ============================================================================

export const StudentObligationsApiPaths = {
  /** GET /api/students/:studentId/obligations */
  GET_STUDENT_OBLIGATIONS: (studentId: string) =>
    `/api/students/${studentId}/obligations`,
} as const;
