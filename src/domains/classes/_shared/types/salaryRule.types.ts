/**
 * TypeScript type definitions for Class Salary Rules API
 * Based on backend ClassSalaryRuleDto and ClassSalaryPreviewDto
 */

// ============================================================================
// Main Types
// ============================================================================

/** Class Salary Rule - Tier-based rate for teacher compensation */
export interface ClassSalaryRule {
  id: string;
  classId: string;
  minStudents: number;
  ratePerLesson: number;
  effectiveFrom: string;  // DateOnly serializes to ISO date string (yyyy-MM-dd)
  effectiveTo: string | null;
  isActive: boolean;
  isApplied: boolean;
}

/** Salary preview calculation for a specific month */
export interface ClassSalaryPreview {
  classId: string;
  className: string;
  scheduledLessons: number;
  activeStudents: number;
  rateApplied: number;
  rateTierDescription: string;
  estimatedAmount: number;
  hasPendingEnrollmentChanges: boolean;
  pendingEnrollments: number;
  pendingWithdrawals: number;
}

// ============================================================================
// Request Types
// ============================================================================

/** Request to create a new salary rule */
export interface CreateSalaryRuleRequest {
  minStudents: number;
  ratePerLesson: number;
  effectiveFrom: string;  // yyyy-MM-dd
  effectiveTo?: string | null;
}

/** Request to update an existing salary rule */
export interface UpdateSalaryRuleRequest {
  minStudents: number;
  ratePerLesson: number;
  effectiveFrom: string;  // yyyy-MM-dd
  effectiveTo?: string | null;
  isActive: boolean;
}

// ============================================================================
// API Path Helpers
// ============================================================================

export const SalaryRuleApiPaths = {
  LIST: (classId: string) => `/api/classes/${classId}/salary-rules`,
  BY_ID: (classId: string, ruleId: string) => `/api/classes/${classId}/salary-rules/${ruleId}`,
  PREVIEW: (classId: string, year: number, month: number) => 
    `/api/classes/${classId}/salary-preview?year=${year}&month=${month}`,
} as const;

// ============================================================================
// Validation Rules
// ============================================================================

export const SalaryRuleValidationRules = {
  MIN_STUDENTS: {
    MIN: 1,
    MAX: 100,
  },
  RATE_PER_LESSON: {
    MIN: 0,
    MAX: 99999.99,
    DECIMALS: 2,
  },
} as const;
