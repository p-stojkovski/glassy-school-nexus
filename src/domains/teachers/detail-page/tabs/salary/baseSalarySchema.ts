import { z } from 'zod';
import { BASE_SALARY_VALIDATION } from '@/types/api/teacherBaseSalary';

/**
 * Zod validation schema for changing base salary
 * Matches backend TeacherBaseSalaryValidationRules
 */
export const changeBaseSalarySchema = z.object({
  baseNetSalary: z
    .number()
    .min(BASE_SALARY_VALIDATION.MIN, `Base salary must be at least ${BASE_SALARY_VALIDATION.MIN} MKD`)
    .max(BASE_SALARY_VALIDATION.MAX, `Base salary cannot exceed 300,000 MKD`),
  effectiveFrom: z
    .string()
    .min(1, 'Effective from date is required')
    .refine((val) => !isNaN(Date.parse(val)), 'Invalid date format'),
  changeReason: z
    .string()
    .max(BASE_SALARY_VALIDATION.MAX_CHANGE_REASON_LENGTH, `Reason cannot exceed ${BASE_SALARY_VALIDATION.MAX_CHANGE_REASON_LENGTH} characters`)
    .optional(),
  academicYearId: z
    .string()
    .uuid('Invalid academic year ID'),
});

export type ChangeBaseSalaryFormData = z.infer<typeof changeBaseSalarySchema>;
