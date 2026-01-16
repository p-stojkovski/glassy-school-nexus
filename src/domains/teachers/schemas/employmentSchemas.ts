/**
 * Employment validation schemas for Teachers domain
 * Phase 7 - Schema Consolidation
 *
 * Contains employment-related Zod schemas:
 * - Employment settings (type changes, effective dates)
 */
import { z } from 'zod';
import { format } from 'date-fns';
import { BASE_SALARY_VALIDATION } from '@/types/api/teacherBaseSalary';

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get the default effective date (1st of current month) as ISO string
 * @returns ISO date string (YYYY-MM-DD) for the 1st of current month
 */
export function getDefaultEffectiveDate(): string {
  const now = new Date();
  return format(new Date(now.getFullYear(), now.getMonth(), 1), 'yyyy-MM-dd');
}

// ============================================================================
// EMPLOYMENT SETTINGS SCHEMA
// ============================================================================

/**
 * Zod validation schema for Employment Settings
 * Used in the Employment Settings Sheet for changing employment type and base salary
 */
export const employmentSettingsSchema = z
  .object({
    employmentType: z.enum(['contract', 'full_time'], {
      required_error: 'Employment type is required',
    }),
    effectiveFrom: z
      .string({ required_error: 'Please select an effective date' })
      .min(1, 'Please select an effective date')
      .refine((date) => !isNaN(Date.parse(date)), {
        message: 'Invalid date format',
      }),
    baseNetSalary: z.coerce
      .number()
      .min(
        BASE_SALARY_VALIDATION.MIN,
        `Base salary must be at least ${BASE_SALARY_VALIDATION.MIN} MKD`
      )
      .max(
        BASE_SALARY_VALIDATION.MAX,
        `Base salary cannot exceed ${BASE_SALARY_VALIDATION.MAX.toLocaleString()} MKD`
      )
      .optional(),
  })
  .refine(
    (data) =>
      data.employmentType !== 'full_time' ||
      (data.baseNetSalary && data.baseNetSalary > 0),
    {
      message: 'Base salary is required for Full Time employees',
      path: ['baseNetSalary'],
    }
  );

export type EmploymentSettingsFormData = z.infer<
  typeof employmentSettingsSchema
>;
