/**
 * TypeScript type definitions for Teacher Salary Calculation API
 * Based on backend SalaryCalculationDto and related DTOs
 * See: TEACHER_VARIABLE_SALARY_IMPLEMENTATION_PLAN.md Phase 4.2
 */

// ============================================================================
// Main Types - Salary Calculations
// ============================================================================

/** Salary calculation status */
export type SalaryCalculationStatus = 'pending' | 'approved' | 'reopened';

/** Salary adjustment type */
export type SalaryAdjustmentType = 'addition' | 'deduction';

/** Teacher salary calculation - summary for list view */
export interface SalaryCalculation {
  id: string;
  teacherId: string;
  teacherName: string;
  academicYearId: string;
  periodStart: string; // ISO date string (yyyy-MM-dd)
  periodEnd: string;
  calculatedAmount: number;
  baseSalaryAmount: number; // Monthly base salary for full-time teachers (0 for contract)
  approvedAmount: number | null;
  status: SalaryCalculationStatus;
  approvedAt: string | null; // ISO datetime string
  createdAt: string;
  updatedAt: string;
  employmentType: 'full_time' | 'contract' | null; // Snapshot of employment type at calculation time (null for legacy)
}

/**
 * Breakdown of salary per class/tier within a calculation.
 * When studentCountAtLesson is present, multiple items per class are possible (one per tier).
 */
export interface SalaryCalculationItem {
  classId: string;
  className: string;
  lessonsCount: number;
  activeStudents: number;
  rateApplied: number;
  amount: number;
  ruleSnapshot: RuleSnapshot;
  /**
   * Student count tier for this item.
   * null for legacy items before per-lesson tracking was implemented.
   * When present, indicates the actual student count when lessons were conducted.
   */
  studentCountAtLesson: number | null;
}

/** Audit log entry for salary calculation changes */
export interface SalaryAuditLog {
  id: string;
  action: string; // 'created', 'approved', 'adjusted', 'reopened', 'recalculated', 'adjustment_added', 'adjustment_removed'
  previousAmount: number | null;
  newAmount: number | null;
  reason: string | null; // Required for adjustments/reopening
  createdAt: string; // ISO datetime string
}

/** Manual adjustment (bonus or deduction) for a salary calculation */
export interface SalaryAdjustment {
  id: string;
  adjustmentType: SalaryAdjustmentType;
  description: string;
  amount: number;
  createdAt: string; // ISO datetime string
  createdByName: string | null;
}

/** Snapshot of salary rule used in calculation (for audit trail) */
export interface RuleSnapshot {
  minStudents: number;
  ratePerLesson: number;
  effectiveFrom: string; // ISO date string (yyyy-MM-dd)
}

/** Detailed salary calculation with items, adjustments, and audit log (flat structure from API) */
export interface SalaryCalculationDetail {
  calculationId: string;
  teacherId: string;
  academicYearId: string;
  periodStart: string; // ISO date string (yyyy-MM-dd)
  periodEnd: string;
  calculatedAmount: number;
  baseSalaryAmount: number; // Monthly base salary for full-time teachers (0 for contract)
  approvedAmount: number | null;
  status: SalaryCalculationStatus;
  approvedAt: string | null; // ISO datetime string
  createdAt: string;
  updatedAt: string;
  items: SalaryCalculationItem[];
  adjustments: SalaryAdjustment[];
  auditLog: SalaryAuditLog[];
  adjustmentsTotal: number; // Sum of additions minus deductions
  grandTotal: number; // baseSalaryAmount + calculatedAmount + adjustmentsTotal
  employmentType: 'full_time' | 'contract' | null; // Snapshot of employment type at calculation time (null for legacy)
}

// ============================================================================
// Salary Preview Types
// ============================================================================

/** Salary preview for a single class (teacher context) */
export interface ClassSalaryPreviewItem {
  classId: string;
  className: string;
  scheduledLessons: number;
  activeStudents: number;
  rateApplied: number;
  rateTierDescription: string; // e.g., "10+ students"
  estimatedAmount: number;
  hasPendingEnrollmentChanges: boolean;
  pendingEnrollments: number;
  pendingWithdrawals: number;
}

/** Teacher salary preview - projected earnings for a month */
export interface TeacherSalaryPreview {
  teacherId: string;
  teacherName: string;
  year: number;
  month: number;
  classBreakdown: ClassSalaryPreviewItem[];
  totalEstimated: number;
  baseSalaryAmount?: number; // Optional: base salary for full-time teachers (will be 0 for contract)
  warnings: string[]; // e.g., "Business English skipped (0 students)"
  pendingChangeWarnings: string[]; // e.g., "2 pending enrollments may change tier"
}

// ============================================================================
// Request Types
// ============================================================================

/** Request to generate a new salary calculation */
export interface GenerateSalaryRequest {
  periodStart: string; // ISO date string (yyyy-MM-dd)
  periodEnd: string;
}

/** Request to approve a salary calculation (with optional manual adjustment) */
export interface ApproveSalaryRequest {
  approvedAmount: number;
  adjustmentReason?: string | null; // Required if approvedAmount !== calculatedAmount
}

/** Request to reopen an approved salary calculation */
export interface ReopenSalaryRequest {
  reason: string; // Always required
}

/** Request to create a salary adjustment (bonus or deduction) */
export interface CreateSalaryAdjustmentRequest {
  adjustmentType: SalaryAdjustmentType; // 'addition' or 'deduction'
  description: string; // Free text, 3-200 characters
  amount: number; // Positive value, max 999999.99
}

// ============================================================================
// API Path Helpers
// ============================================================================

export const SalaryCalculationApiPaths = {
  /** List all calculations for a teacher */
  LIST: (teacherId: string) => `/api/teachers/${teacherId}/salary-calculations`,

  /** Get specific calculation detail */
  BY_ID: (teacherId: string, calcId: string) =>
    `/api/teachers/${teacherId}/salary-calculations/${calcId}`,

  /** Approve a calculation */
  APPROVE: (teacherId: string, calcId: string) =>
    `/api/teachers/${teacherId}/salary-calculations/${calcId}/approve`,

  /** Reopen an approved calculation */
  REOPEN: (teacherId: string, calcId: string) =>
    `/api/teachers/${teacherId}/salary-calculations/${calcId}/reopen`,

  /** Manually trigger recalculation */
  RECALCULATE: (teacherId: string, calcId: string) =>
    `/api/teachers/${teacherId}/salary-calculations/${calcId}/recalculate`,

  /** Get salary preview for a month */
  PREVIEW: (teacherId: string, year: number, month: number) =>
    `/api/teachers/${teacherId}/salary-preview?year=${year}&month=${month}`,

  /** Create a salary adjustment */
  CREATE_ADJUSTMENT: (teacherId: string, calcId: string) =>
    `/api/teachers/${teacherId}/salary-calculations/${calcId}/adjustments`,

  /** Delete a salary adjustment */
  DELETE_ADJUSTMENT: (teacherId: string, calcId: string, adjustmentId: string) =>
    `/api/teachers/${teacherId}/salary-calculations/${calcId}/adjustments/${adjustmentId}`,
} as const;

// ============================================================================
// Filter/Query Types
// ============================================================================

/** Filters for listing salary calculations */
export interface SalaryCalculationFilters {
  status?: SalaryCalculationStatus;
  academicYearId?: string;
  fromDate?: string; // ISO date string
  toDate?: string;
}

// ============================================================================
// Validation Rules (match backend)
// ============================================================================

export const SalaryCalculationValidationRules = {
  PERIOD: {
    START_REQUIRED: 'Period start date is required',
    END_REQUIRED: 'Period end date is required',
    INVALID: 'Period end must be after period start',
    NOT_IN_ACADEMIC_YEAR: 'Period must be within the current academic year',
    OVERLAPS: 'A calculation already exists for this period',
  },
  APPROVAL: {
    AMOUNT_REQUIRED: 'Approved amount is required',
    AMOUNT_NEGATIVE: 'Approved amount cannot be negative',
    REASON_REQUIRED: 'Reason is required when amount differs from calculated',
    REASON_MIN_LENGTH: 10,
    REASON_TOO_SHORT: 'Reason must be at least 10 characters',
  },
  REOPEN: {
    REASON_REQUIRED: 'Reason is required to reopen an approved calculation',
    CANNOT_REOPEN_PENDING: 'Cannot reopen a calculation that is not approved',
  },
  ADJUSTMENT: {
    TYPE_REQUIRED: 'Adjustment type is required',
    TYPE_INVALID: "Adjustment type must be 'addition' or 'deduction'",
    DESCRIPTION_REQUIRED: 'Description is required',
    DESCRIPTION_MIN_LENGTH: 3,
    DESCRIPTION_MAX_LENGTH: 200,
    DESCRIPTION_TOO_SHORT: 'Description must be at least 3 characters',
    DESCRIPTION_TOO_LONG: 'Description must be at most 200 characters',
    AMOUNT_NOT_POSITIVE: 'Amount must be positive',
    AMOUNT_MAX: 999999.99,
    AMOUNT_TOO_LARGE: 'Amount cannot exceed 999,999.99',
    CANNOT_MODIFY_APPROVED: 'Cannot add or remove adjustments from an approved calculation',
  },
} as const;
