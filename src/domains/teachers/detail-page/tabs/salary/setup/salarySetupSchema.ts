import { z } from 'zod';

// Tax rates from the database (North Macedonia 2025)
// Total contributions ≈ 27.5%, Net ≈ 65% of Gross
export const TAX_RATES = {
  PENSION: 0.188,      // 18.8% - ПИОМ (пензија)
  HEALTH: 0.075,       // 7.5% - Здравствено
  EMPLOYMENT: 0.012,   // 1.2% - Вработување
  INJURY: 0.005,       // 0.5% - Additional injury insurance
  INCOME_TAX: 0.10,    // 10% - Данок на личен доход
} as const;

// Derived constants
export const SALARY_SETUP_CONSTANTS = {
  // Contribution rates
  TOTAL_CONTRIBUTION_RATE: TAX_RATES.PENSION + TAX_RATES.HEALTH + TAX_RATES.EMPLOYMENT + TAX_RATES.INJURY, // 0.28

  // Net-to-Gross multiplier: (1 - contributions) * (1 - tax) = 0.72 * 0.90 = 0.648
  NET_TO_GROSS_MULTIPLIER: (1 - (TAX_RATES.PENSION + TAX_RATES.HEALTH + TAX_RATES.EMPLOYMENT + TAX_RATES.INJURY)) * (1 - TAX_RATES.INCOME_TAX),

  // Validation limits (match backend SALARY_CONFIG_VALIDATION)
  MIN_SALARY: 1,
  MAX_SALARY: 9999999.99,
  MAX_NOTES_LENGTH: 500,
} as const;

// Schema for the salary setup form
export const salarySetupSchema = z.object({
  isDirectGrossEntry: z.boolean().default(false),

  // Net salary (used when isDirectGrossEntry is false)
  desiredNetSalary: z.string()
    .optional()
    .transform(val => val?.trim() || '')
    .refine((val) => {
      if (!val) return true; // Will be validated by superRefine
      const num = parseFloat(val);
      return !isNaN(num) && num >= SALARY_SETUP_CONSTANTS.MIN_SALARY;
    }, `Net salary must be at least ${SALARY_SETUP_CONSTANTS.MIN_SALARY} MKD`)
    .refine((val) => {
      if (!val) return true;
      const num = parseFloat(val);
      // Max net = max gross * multiplier
      const maxNet = SALARY_SETUP_CONSTANTS.MAX_SALARY * SALARY_SETUP_CONSTANTS.NET_TO_GROSS_MULTIPLIER;
      return num <= maxNet;
    }, 'Net salary is too high'),

  // Gross salary (used when isDirectGrossEntry is true)
  grossSalary: z.string()
    .optional()
    .transform(val => val?.trim() || '')
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
  notes: z.string()
    .max(SALARY_SETUP_CONSTANTS.MAX_NOTES_LENGTH,
      `Notes cannot exceed ${SALARY_SETUP_CONSTANTS.MAX_NOTES_LENGTH} characters`)
    .optional()
    .transform(val => val?.trim() || undefined),
}).superRefine((data, ctx) => {
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
