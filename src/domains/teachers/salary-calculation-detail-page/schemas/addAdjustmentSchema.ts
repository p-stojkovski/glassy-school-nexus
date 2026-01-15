import { z } from 'zod';
import { SalaryCalculationValidationRules } from '@/domains/teachers/_shared/types/salaryCalculation.types';

export const addAdjustmentSchema = z.object({
  adjustmentType: z.enum(['addition', 'deduction'], {
    required_error: SalaryCalculationValidationRules.ADJUSTMENT.TYPE_REQUIRED,
  }),
  description: z.string()
    .min(SalaryCalculationValidationRules.ADJUSTMENT.DESCRIPTION_MIN_LENGTH, 
         SalaryCalculationValidationRules.ADJUSTMENT.DESCRIPTION_TOO_SHORT)
    .max(SalaryCalculationValidationRules.ADJUSTMENT.DESCRIPTION_MAX_LENGTH,
         SalaryCalculationValidationRules.ADJUSTMENT.DESCRIPTION_TOO_LONG),
  amount: z.number()
    .positive(SalaryCalculationValidationRules.ADJUSTMENT.AMOUNT_NOT_POSITIVE)
    .max(SalaryCalculationValidationRules.ADJUSTMENT.AMOUNT_MAX,
         SalaryCalculationValidationRules.ADJUSTMENT.AMOUNT_TOO_LARGE),
});

export type AddAdjustmentFormData = z.infer<typeof addAdjustmentSchema>;
