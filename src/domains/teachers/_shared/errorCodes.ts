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
// TYPE EXPORTS
// ============================================================================

export type TeacherSalaryErrorCode = typeof TeacherSalaryErrorCodes[keyof typeof TeacherSalaryErrorCodes];

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
