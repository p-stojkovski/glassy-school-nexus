/**
 * Teacher Salary Error Codes
 *
 * These constants match the backend error codes from:
 * - ThinkEnglishApi.Api.Features.Teachers.TeacherSalary.Shared.TeacherSalaryErrors
 * - ThinkEnglishApi.Api.Features.TeacherSalaries.Shared.SalaryCalculationErrors
 *
 * Use these codes instead of string matching on error messages for reliable error detection.
 */

// ============================================================================
// TEACHER SALARY ERRORS (TeacherSalaryErrors.cs)
// ============================================================================

export const TeacherSalaryErrorCodes = {
  /** Teacher was not found */
  TEACHER_NOT_FOUND: 'TeacherSalary.TeacherNotFound',

  /** No salary configuration found - show setup prompt */
  NO_SALARY_CONFIGURED: 'TeacherSalary.NoSalaryConfigured',

  /** Invalid year format */
  INVALID_YEAR: 'TeacherSalary.InvalidYear',

  /** Invalid month (must be 1-12) */
  INVALID_MONTH: 'TeacherSalary.InvalidMonth',

  /** Database error during salary operation */
  DATABASE_ERROR: 'TeacherSalary.DatabaseError',
} as const;

// ============================================================================
// SALARY CALCULATION ERRORS (SalaryCalculationErrors.cs)
// ============================================================================

export const SalaryCalculationErrorCodes = {
  /** Teacher not found */
  TEACHER_NOT_FOUND: 'teacher_not_found',

  /** No active academic year configured */
  NO_ACTIVE_ACADEMIC_YEAR: 'no_active_academic_year',

  /** Period is outside the active academic year */
  PERIOD_OUTSIDE_ACADEMIC_YEAR: 'period_outside_academic_year',

  /** A salary calculation already exists for this overlapping period */
  OVERLAPPING_SALARY_PERIOD: 'overlapping_salary_period',

  /** A salary calculation already exists for this month/year */
  DUPLICATE_SALARY_MONTH_YEAR: 'duplicate_salary_month_year',

  /** Cannot generate salary for future months */
  FUTURE_MONTH_NOT_ALLOWED: 'future_month_not_allowed',

  /** No conducted lessons found for the period */
  NO_CONDUCTED_LESSONS: 'no_conducted_lessons',

  /** Teacher has no active classes assigned */
  TEACHER_NO_CLASSES: 'teacher_no_classes',

  /** Class has no salary rules configured */
  NO_SALARY_RULES_CONFIGURED: 'no_salary_rules_configured',

  /** Failed to create salary calculation */
  CREATION_FAILED: 'salary_calculation_creation_failed',

  /** Failed to retrieve salary calculation */
  RETRIEVAL_FAILED: 'salary_calculation_retrieval_failed',

  /** Salary calculation not found */
  CALCULATION_NOT_FOUND: 'salary_calculation_not_found',

  /** Calculation does not belong to the specified teacher */
  CALCULATION_NOT_BELONG_TO_TEACHER: 'salary_calculation_not_belong_to_teacher',

  /** Cannot approve a calculation that is not pending or reopened */
  CANNOT_APPROVE_NON_PENDING: 'cannot_approve_non_pending',

  /** Adjustment reason is required when changing the calculated amount */
  ADJUSTMENT_REASON_REQUIRED: 'adjustment_reason_required',

  /** Cannot reopen a calculation that is not approved */
  CANNOT_REOPEN_NON_APPROVED: 'cannot_reopen_non_approved',

  /** Failed to trigger salary recalculation */
  RECALCULATION_FAILED: 'salary_recalculation_failed',

  // Adjustment errors

  /** Cannot add/remove adjustments from an approved calculation */
  CANNOT_MODIFY_APPROVED_CALCULATION: 'cannot_modify_approved_calculation',

  /** Adjustment not found */
  ADJUSTMENT_NOT_FOUND: 'adjustment_not_found',

  /** Duplicate adjustment already exists */
  DUPLICATE_ADJUSTMENT: 'duplicate_adjustment',

  /** Failed to create adjustment */
  ADJUSTMENT_CREATION_FAILED: 'adjustment_creation_failed',

  /** Failed to delete adjustment */
  ADJUSTMENT_DELETION_FAILED: 'adjustment_deletion_failed',

  /** Invalid rule snapshot in database */
  INVALID_RULE_SNAPSHOT: 'invalid_rule_snapshot',
} as const;

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type TeacherSalaryErrorCode = typeof TeacherSalaryErrorCodes[keyof typeof TeacherSalaryErrorCodes];
export type SalaryCalculationErrorCode = typeof SalaryCalculationErrorCodes[keyof typeof SalaryCalculationErrorCodes];

/**
 * Helper to extract error code from API error
 * The backend returns error code in the 'type' field of ProblemDetails
 *
 * @example
 * try {
 *   await getTeacherSalary(teacherId, academicYearId);
 * } catch (err) {
 *   const code = extractErrorCode(err);
 *   if (code === TeacherSalaryErrorCodes.NO_SALARY_CONFIGURED) {
 *     // Show setup prompt
 *   }
 * }
 */
export function extractErrorCode(error: unknown): string | null {
  if (!error || typeof error !== 'object') return null;

  const err = error as Record<string, unknown>;

  // Check for code property directly (from makeApiError)
  if (typeof err.code === 'string') {
    return err.code;
  }

  // Check for details.type (ProblemDetails format)
  if (err.details && typeof err.details === 'object') {
    const details = err.details as Record<string, unknown>;
    if (typeof details.type === 'string') {
      // Extract code from URL format: "https://api.thinkenglish.com/errors/error_code"
      const type = details.type;
      if (type.includes('/errors/')) {
        return type.split('/errors/').pop() || type;
      }
      return type;
    }
  }

  return null;
}

/**
 * Helper to check if an error matches a specific error code
 *
 * @example
 * if (hasErrorCode(err, TeacherSalaryErrorCodes.NO_SALARY_CONFIGURED)) {
 *   setNoSalaryConfigured(true);
 * }
 */
export function hasErrorCode(error: unknown, expectedCode: string): boolean {
  const code = extractErrorCode(error);
  return code === expectedCode;
}
