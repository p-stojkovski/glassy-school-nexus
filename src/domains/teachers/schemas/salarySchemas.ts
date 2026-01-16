/**
 * Consolidated salary validation schemas for Teachers domain
 * Phase 7 - Schema Consolidation
 *
 * Contains all salary-related Zod schemas:
 * - Salary setup (initial configuration)
 * - Base salary changes
 * - Salary calculations (generate, approve, reopen)
 * - Adjustments
 */
import { z } from 'zod';
import { BASE_SALARY_VALIDATION } from '@/types/api/teacherBaseSalary';
import { SalaryCalculationValidationRules } from '@/domains/teachers/_shared/types/salaryCalculation.types';

// ============================================================================
// TAX RATES AND CONSTANTS
// ============================================================================

/**
 * Tax rates from the database (North Macedonia 2025)
 * Total contributions ≈ 27.5%, Net ≈ 65% of Gross
 */
export const TAX_RATES = {
  PENSION: 0.188, // 18.8% - ПИОМ (пензија)
  HEALTH: 0.075, // 7.5% - Здравствено
  EMPLOYMENT: 0.012, // 1.2% - Вработување
  INJURY: 0.005, // 0.5% - Additional injury insurance
  INCOME_TAX: 0.1, // 10% - Данок на личен доход
} as const;

/**
 * Derived constants for salary calculations
 */
export const SALARY_SETUP_CONSTANTS = {
  // Contribution rates
  TOTAL_CONTRIBUTION_RATE:
    TAX_RATES.PENSION +
    TAX_RATES.HEALTH +
    TAX_RATES.EMPLOYMENT +
    TAX_RATES.INJURY, // 0.28

  // Net-to-Gross multiplier: (1 - contributions) * (1 - tax) = 0.72 * 0.90 = 0.648
  NET_TO_GROSS_MULTIPLIER:
    (1 -
      (TAX_RATES.PENSION +
        TAX_RATES.HEALTH +
        TAX_RATES.EMPLOYMENT +
        TAX_RATES.INJURY)) *
    (1 - TAX_RATES.INCOME_TAX),

  // Validation limits (match backend SALARY_CONFIG_VALIDATION)
  MIN_SALARY: 1,
  MAX_SALARY: 9999999.99,
  MAX_NOTES_LENGTH: 500,
} as const;

// ============================================================================
// SALARY SETUP SCHEMA (Initial Salary Configuration)
// ============================================================================

/**
 * Schema for the initial salary setup form
 * Used when configuring a teacher's salary for the first time
 */
export const salarySetupSchema = z
  .object({
    isDirectGrossEntry: z.boolean().default(false),

    // Net salary (used when isDirectGrossEntry is false)
    desiredNetSalary: z
      .string()
      .optional()
      .transform((val) => val?.trim() || '')
      .refine((val) => {
        if (!val) return true; // Will be validated by superRefine
        const num = parseFloat(val);
        return !isNaN(num) && num >= SALARY_SETUP_CONSTANTS.MIN_SALARY;
      }, `Net salary must be at least ${SALARY_SETUP_CONSTANTS.MIN_SALARY} MKD`)
      .refine((val) => {
        if (!val) return true;
        const num = parseFloat(val);
        // Max net = max gross * multiplier
        const maxNet =
          SALARY_SETUP_CONSTANTS.MAX_SALARY *
          SALARY_SETUP_CONSTANTS.NET_TO_GROSS_MULTIPLIER;
        return num <= maxNet;
      }, 'Net salary is too high'),

    // Gross salary (used when isDirectGrossEntry is true)
    grossSalary: z
      .string()
      .optional()
      .transform((val) => val?.trim() || '')
      .refine((val) => {
        if (!val) return true; // Will be validated by superRefine
        const num = parseFloat(val);
        return !isNaN(num) && num >= SALARY_SETUP_CONSTANTS.MIN_SALARY;
      }, `Gross salary must be at least ${SALARY_SETUP_CONSTANTS.MIN_SALARY} MKD`)
      .refine((val) => {
        if (!val) return true;
        const num = parseFloat(val);
        return num <= SALARY_SETUP_CONSTANTS.MAX_SALARY;
      }, `Gross salary cannot exceed ${SALARY_SETUP_CONSTANTS.MAX_SALARY.toLocaleString()} MKD`),

    // Effective date (defaults to 1st of current month)
    effectiveFrom: z.date().default(() => {
      const now = new Date();
      return new Date(now.getFullYear(), now.getMonth(), 1);
    }),

    // Optional notes
    notes: z
      .string()
      .max(
        SALARY_SETUP_CONSTANTS.MAX_NOTES_LENGTH,
        `Notes cannot exceed ${SALARY_SETUP_CONSTANTS.MAX_NOTES_LENGTH} characters`
      )
      .optional()
      .transform((val) => val?.trim() || undefined),
  })
  .superRefine((data, ctx) => {
    // Conditional validation: require the appropriate salary field based on mode
    if (data.isDirectGrossEntry) {
      if (!data.grossSalary) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Gross salary is required',
          path: ['grossSalary'],
        });
      }
    } else {
      if (!data.desiredNetSalary) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Desired net salary is required',
          path: ['desiredNetSalary'],
        });
      }
    }
  });

export type SalarySetupFormData = z.infer<typeof salarySetupSchema>;

// ============================================================================
// CHANGE BASE SALARY SCHEMA
// ============================================================================

/**
 * Schema for changing an existing base salary
 * Matches backend TeacherBaseSalaryValidationRules
 */
export const changeBaseSalarySchema = z.object({
  baseNetSalary: z
    .number()
    .min(
      BASE_SALARY_VALIDATION.MIN,
      `Base salary must be at least ${BASE_SALARY_VALIDATION.MIN} MKD`
    )
    .max(BASE_SALARY_VALIDATION.MAX, `Base salary cannot exceed 300,000 MKD`),
  effectiveFrom: z
    .string()
    .min(1, 'Effective from date is required')
    .refine((val) => !isNaN(Date.parse(val)), 'Invalid date format'),
  changeReason: z
    .string()
    .max(
      BASE_SALARY_VALIDATION.MAX_CHANGE_REASON_LENGTH,
      `Reason cannot exceed ${BASE_SALARY_VALIDATION.MAX_CHANGE_REASON_LENGTH} characters`
    )
    .optional(),
  academicYearId: z.string().uuid('Invalid academic year ID'),
});

export type ChangeBaseSalaryFormData = z.infer<typeof changeBaseSalarySchema>;

// ============================================================================
// SALARY CALCULATION DIALOG SCHEMAS
// ============================================================================

/**
 * Schema for generate salary calculation dialog
 */
export const generateSalarySchema = z.object({
  year: z.number().int().min(2020).max(2100),
  month: z.number().int().min(1).max(12),
});

export type GenerateSalaryFormData = z.infer<typeof generateSalarySchema>;

/**
 * Schema for approve salary calculation dialog
 */
export const approveSalarySchema = z.object({
  approvedAmount: z
    .number()
    .nonnegative('Approved amount cannot be negative')
    .finite('Approved amount must be a valid number'),
  reason: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.length >= 10,
      'Reason must be at least 10 characters if provided'
    ),
});

export type ApproveSalaryFormData = z.infer<typeof approveSalarySchema>;

/**
 * Schema for reopen salary calculation dialog
 */
export const reopenSalarySchema = z.object({
  reason: z
    .string()
    .min(10, 'Reason must be at least 10 characters')
    .max(500, 'Reason must not exceed 500 characters'),
});

export type ReopenSalaryFormData = z.infer<typeof reopenSalarySchema>;

// ============================================================================
// ADJUSTMENT SCHEMA
// ============================================================================

/**
 * Schema for adding adjustments to salary calculations
 */
export const addAdjustmentSchema = z.object({
  adjustmentType: z.enum(['addition', 'deduction'], {
    required_error: SalaryCalculationValidationRules.ADJUSTMENT.TYPE_REQUIRED,
  }),
  description: z
    .string()
    .min(
      SalaryCalculationValidationRules.ADJUSTMENT.DESCRIPTION_MIN_LENGTH,
      SalaryCalculationValidationRules.ADJUSTMENT.DESCRIPTION_TOO_SHORT
    )
    .max(
      SalaryCalculationValidationRules.ADJUSTMENT.DESCRIPTION_MAX_LENGTH,
      SalaryCalculationValidationRules.ADJUSTMENT.DESCRIPTION_TOO_LONG
    ),
  amount: z
    .number()
    .positive(SalaryCalculationValidationRules.ADJUSTMENT.AMOUNT_NOT_POSITIVE)
    .max(
      SalaryCalculationValidationRules.ADJUSTMENT.AMOUNT_MAX,
      SalaryCalculationValidationRules.ADJUSTMENT.AMOUNT_TOO_LARGE
    ),
});

export type AddAdjustmentFormData = z.infer<typeof addAdjustmentSchema>;
