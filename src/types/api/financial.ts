/**
 * TypeScript type definitions for Financial Management API
 * Handles payment obligations and payment tracking
 */

// ============================================================================
// PAYMENT OBLIGATION TYPES
// ============================================================================

export type ObligationStatus = 'pending' | 'partial' | 'paid' | 'overdue' | 'cancelled';
export type ObligationType = 'tuition' | 'activity-fee' | 'material-fee' | 'exam-fee' | 'other';
export type RecurrenceType = 'once' | 'monthly' | 'semester' | 'yearly';

export interface PaymentObligation {
  id: string;                      // GUID
  studentId: string;               // GUID of student
  studentName?: string;            // Student full name (optional in request)
  type: ObligationType;            // Type of obligation
  description: string;             // Human-readable description
  dueDate: string;                // ISO 8601 date
  amount: number;                 // Amount in decimal format
  paidAmount: number;             // Amount already paid
  status: ObligationStatus;        // Current status
  recurrence?: RecurrenceType;    // If recurring obligation
  notes?: string;                 // Additional notes
  createdAt?: string;             // ISO 8601 datetime
  updatedAt?: string;             // ISO 8601 datetime
}

export interface CreatePaymentObligationRequest {
  studentId: string;              // Required
  type: ObligationType;           // Required
  description: string;            // Required
  dueDate: string;               // Required: ISO 8601 date
  amount: number;                // Required: decimal number
  recurrence?: RecurrenceType;   // Optional: default 'once'
  notes?: string;                // Optional
}

export interface UpdatePaymentObligationRequest {
  type: ObligationType;          // Required
  description: string;           // Required
  dueDate: string;              // Required: ISO 8601 date
  amount: number;               // Required
  status?: ObligationStatus;    // Optional: can update status
  recurrence?: RecurrenceType;  // Optional
  notes?: string;               // Optional
}

export interface CreatePaymentObligationResponse {
  id: string;                   // GUID of created obligation
}

// ============================================================================
// BATCH OBLIGATION CREATION
// ============================================================================

export interface BatchCreateObligationRequest {
  studentIds: string[];                                  // Required: list of student GUIDs
  type: ObligationType;                                 // Required
  description: string;                                  // Required
  dueDate: string;                                     // Required: ISO 8601 date
  amount: number;                                      // Required
  recurrence?: RecurrenceType;                        // Optional
  notes?: string;                                     // Optional
}

export interface BatchCreateObligationResponse {
  successCount: number;          // Number of successfully created obligations
  failureCount: number;          // Number of failed creations
  createdIds: string[];         // GUIDs of created obligations
  failedStudentIds: Array<{
    studentId: string;
    error: string;
  }>;
}

// ============================================================================
// PAYMENT TYPES
// ============================================================================

export type PaymentStatus = 'pending' | 'confirmed' | 'failed' | 'refunded';
export type PaymentMethod = 'cash' | 'check' | 'bank-transfer' | 'card' | 'other';

export interface PaymentRecord {
  id: string;                      // GUID
  obligationId: string;           // GUID of obligation being paid
  studentId: string;              // GUID of student
  studentName?: string;           // Student full name (optional)
  amount: number;                 // Amount paid in decimal format
  method: PaymentMethod;          // Payment method used
  status: PaymentStatus;          // Payment status
  referenceNumber?: string;       // Check #, transaction ID, etc.
  notes?: string;                 // Payment notes
  recordedBy?: string;            // User who recorded payment
  createdAt?: string;             // ISO 8601 datetime
  updatedAt?: string;             // ISO 8601 datetime
}

export interface CreatePaymentRecordRequest {
  obligationId: string;          // Required
  amount: number;                // Required: decimal number
  method: PaymentMethod;         // Required
  referenceNumber?: string;      // Optional
  notes?: string;                // Optional
}

export interface UpdatePaymentRecordRequest {
  amount?: number;               // Optional
  method?: PaymentMethod;        // Optional
  status?: PaymentStatus;        // Optional
  referenceNumber?: string;      // Optional
  notes?: string;                // Optional
}

export interface CreatePaymentRecordResponse {
  id: string;                   // GUID of created payment record
}

// ============================================================================
// FINANCIAL SUMMARY & REPORTING
// ============================================================================

export interface StudentFinancialSummary {
  studentId: string;            // GUID
  studentName: string;
  totalObligations: number;     // Total amount owed
  paidAmount: number;           // Total amount paid
  remainingAmount: number;      // Total outstanding
  obligationCount: number;      // Number of obligations
  paidCount: number;           // Obligations with full payment
  partialCount: number;        // Obligations with partial payment
  pendingCount: number;        // Unpaid obligations
  overDueCount: number;        // Overdue obligations
  overdueDaysAverage?: number; // Average days overdue
  lastPaymentDate?: string;    // ISO 8601 date
}

export interface ClassFinancialSummary {
  classId: string;             // GUID
  className: string;
  totalStudents: number;
  totalObligations: number;   // Total amount owed by class
  totalPaid: number;          // Total amount paid by class
  totalOutstanding: number;   // Total unpaid
  collectionRate: number;     // Percentage of paid obligations
  averagePerStudent: number;  // Average obligation per student
  averagePaidPerStudent: number;
}

export interface PaymentHistoryEntry {
  date: string;               // ISO 8601 date
  description: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
}

// ============================================================================
// FINANCIAL REPORT TYPES
// ============================================================================

export interface FinancialReportParams {
  startDate?: string;         // ISO 8601 date
  endDate?: string;           // ISO 8601 date
  classId?: string;          // Optional: filter by class
  studentId?: string;        // Optional: filter by student
  status?: ObligationStatus; // Optional: filter by status
  type?: ObligationType;     // Optional: filter by type
}

export interface FinancialDashboardData {
  totalRevenue: number;
  collectedRevenue: number;
  pendingRevenue: number;
  overdueRevenue: number;
  collectionRate: number;
  studentCount: number;
  studentsWithBalance: number;
  averageObligationPerStudent: number;
  paymentMethodBreakdown: Record<PaymentMethod, number>;
  monthlyTrend: Array<{
    month: string;
    collected: number;
    pending: number;
  }>;
  topStudentsByBalance: StudentFinancialSummary[];
  topStudentsByPayment: StudentFinancialSummary[];
}

// ============================================================================
// DISCOUNT TYPES
// ============================================================================

export type DiscountType = 'percentage' | 'fixed-amount' | 'waive';

export interface DiscountDefinition {
  id: string;                 // GUID
  name: string;              // Name of discount
  type: DiscountType;        // Type of discount
  value: number;             // Percentage (0-100) or amount
  description?: string;      // Description
  isActive: boolean;
  applicableObligationTypes: ObligationType[]; // Which obligations this applies to
  createdAt?: string;        // ISO 8601 datetime
  updatedAt?: string;        // ISO 8601 datetime
}

export interface CreateDiscountRequest {
  name: string;              // Required
  type: DiscountType;        // Required
  value: number;             // Required: 0-100 for percentage, amount for fixed
  description?: string;      // Optional
  applicableObligationTypes?: ObligationType[]; // Optional: defaults to all
}

export interface UpdateDiscountRequest {
  name?: string;
  type?: DiscountType;
  value?: number;
  description?: string;
  isActive?: boolean;
  applicableObligationTypes?: ObligationType[];
}

export interface CreateDiscountResponse {
  id: string;               // GUID of created discount
}

// ============================================================================
// API ENDPOINT PATHS
// ============================================================================

export const FinancialApiPaths = {
  // Payment Obligations
  OBLIGATIONS_BASE: '/api/financial/obligations',
  OBLIGATIONS_BY_ID: (id: string) => `/api/financial/obligations/${id}`,
  OBLIGATIONS_BY_STUDENT: (studentId: string) => `/api/financial/students/${studentId}/obligations`,
  OBLIGATIONS_BATCH_CREATE: '/api/financial/obligations/batch',

  // Payments
  PAYMENTS_BASE: '/api/financial/payments',
  PAYMENTS_BY_ID: (id: string) => `/api/financial/payments/${id}`,
  PAYMENTS_BY_OBLIGATION: (obligationId: string) => `/api/financial/obligations/${obligationId}/payments`,
  PAYMENTS_BY_STUDENT: (studentId: string) => `/api/financial/students/${studentId}/payments`,

  // Financial Summaries
  SUMMARY_STUDENT: (studentId: string) => `/api/financial/students/${studentId}/summary`,
  SUMMARY_CLASS: (classId: string) => `/api/financial/classes/${classId}/summary`,
  SUMMARY_DASHBOARD: '/api/financial/dashboard',

  // Reports
  HISTORY_STUDENT: (studentId: string) => `/api/financial/students/${studentId}/payment-history`,
  REPORT: '/api/financial/report',

  // Discounts
  DISCOUNTS_BASE: '/api/financial/discounts',
  DISCOUNTS_BY_ID: (id: string) => `/api/financial/discounts/${id}`,
} as const;

// ============================================================================
// ERROR CODES
// ============================================================================

export enum FinancialErrorCodes {
  // Obligation Errors
  OBLIGATION_NOT_FOUND = 'obligation_not_found',
  OBLIGATION_INVALID_AMOUNT = 'obligation_invalid_amount',
  OBLIGATION_INVALID_DUE_DATE = 'obligation_invalid_due_date',
  OBLIGATION_STUDENT_NOT_FOUND = 'obligation_student_not_found',
  OBLIGATION_ALREADY_PAID = 'obligation_already_paid',
  OBLIGATION_CANNOT_DELETE = 'obligation_cannot_delete',

  // Payment Errors
  PAYMENT_NOT_FOUND = 'payment_not_found',
  PAYMENT_INVALID_AMOUNT = 'payment_invalid_amount',
  PAYMENT_EXCEEDS_OBLIGATION = 'payment_exceeds_obligation',
  PAYMENT_OBLIGATION_NOT_FOUND = 'payment_obligation_not_found',
  PAYMENT_ALREADY_RECORDED = 'payment_already_recorded',

  // Financial Errors
  INSUFFICIENT_FUNDS = 'insufficient_funds',
  DUPLICATE_PAYMENT = 'duplicate_payment',
  INVALID_PAYMENT_METHOD = 'invalid_payment_method',

  // Discount Errors
  DISCOUNT_NOT_FOUND = 'discount_not_found',
  DISCOUNT_NAME_EXISTS = 'discount_name_exists',
  DISCOUNT_INVALID_VALUE = 'discount_invalid_value',
  DISCOUNT_ALREADY_ACTIVE = 'discount_already_active',

  // General Errors
  UNAUTHORIZED_ACCESS = 'unauthorized_access',
  DATABASE_ERROR = 'database_error',
  RETRIEVAL_ERROR = 'retrieval_error',
}

// ============================================================================
// HTTP STATUS CODES
// ============================================================================

export enum FinancialHttpStatus {
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

export function isValidObligationStatus(status: string): status is ObligationStatus {
  return ['pending', 'partial', 'paid', 'overdue', 'cancelled'].includes(status);
}

export function isValidObligationType(type: string): type is ObligationType {
  return ['tuition', 'activity-fee', 'material-fee', 'exam-fee', 'other'].includes(type);
}

export function isValidPaymentStatus(status: string): status is PaymentStatus {
  return ['pending', 'confirmed', 'failed', 'refunded'].includes(status);
}

export function isValidPaymentMethod(method: string): method is PaymentMethod {
  return ['cash', 'check', 'bank-transfer', 'card', 'other'].includes(method);
}

export function isValidDiscountType(type: string): type is DiscountType {
  return ['percentage', 'fixed-amount', 'waive'].includes(type);
}

export function isPaymentObligation(obj: any): obj is PaymentObligation {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.id === 'string' &&
    typeof obj.studentId === 'string' &&
    isValidObligationType(obj.type) &&
    typeof obj.description === 'string' &&
    typeof obj.dueDate === 'string' &&
    typeof obj.amount === 'number' &&
    typeof obj.paidAmount === 'number' &&
    isValidObligationStatus(obj.status)
  );
}

export function isPaymentRecord(obj: any): obj is PaymentRecord {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.id === 'string' &&
    typeof obj.obligationId === 'string' &&
    typeof obj.studentId === 'string' &&
    typeof obj.amount === 'number' &&
    isValidPaymentMethod(obj.method) &&
    isValidPaymentStatus(obj.status)
  );
}

// ============================================================================
// VALIDATION RULES
// ============================================================================

export const FinancialValidationRules = {
  OBLIGATION: {
    AMOUNT: {
      MIN: 0.01,
      MAX: 999999.99,
      ERROR_MESSAGE: 'Obligation amount must be between 0.01 and 999,999.99',
    },
    DESCRIPTION: {
      MIN_LENGTH: 3,
      MAX_LENGTH: 200,
      ERROR_MESSAGE: 'Description must be between 3 and 200 characters',
    },
    DUE_DATE: {
      ERROR_MESSAGE: 'Due date cannot be in the past',
    },
  },
  PAYMENT: {
    AMOUNT: {
      MIN: 0.01,
      MAX: 999999.99,
      ERROR_MESSAGE: 'Payment amount must be between 0.01 and 999,999.99',
    },
    REFERENCE_NUMBER: {
      MAX_LENGTH: 50,
      ERROR_MESSAGE: 'Reference number cannot exceed 50 characters',
    },
  },
  DISCOUNT: {
    NAME: {
      MIN_LENGTH: 2,
      MAX_LENGTH: 100,
      ERROR_MESSAGE: 'Discount name must be between 2 and 100 characters',
    },
    VALUE: {
      MIN: 0,
      MAX: 100,
      ERROR_MESSAGE: 'Percentage discount must be between 0 and 100',
    },
  },
} as const;
