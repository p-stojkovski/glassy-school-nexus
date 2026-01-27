/**
 * Fee Template Validation Schema (Zod)
 * Matches backend CreateClassFeeTemplateValidationRules
 */

import { z } from 'zod';
import type { FeeType, RecurrenceInterval } from '@/types/api/classFees';

// Fee type options for select fields
export const FEE_TYPE_OPTIONS: { value: FeeType; label: string }[] = [
  { value: 'tuition', label: 'Tuition' },
  { value: 'material', label: 'Material' },
  { value: 'exam', label: 'Exam' },
  { value: 'activity', label: 'Activity' },
  { value: 'other', label: 'Other' },
];

export const RECURRENCE_INTERVAL_OPTIONS: { value: RecurrenceInterval; label: string }[] = [
  { value: 'monthly', label: 'Monthly' },
];

/**
 * Schema for creating a new fee template
 * Backend validation rules:
 * - FeeType: required, must be valid enum value
 * - Name: required, 1-100 chars
 * - Amount: required, > 0
 * - IsRecurring: required boolean
 * - RecurrenceInterval: required if IsRecurring is true
 * - IsOptional: required boolean
 * - EffectiveFrom: optional, defaults to today
 * - SortOrder: optional, defaults to 0
 */
export const createFeeTemplateSchema = z.object({
  feeType: z.enum(['tuition', 'material', 'exam', 'activity', 'other'], {
    required_error: 'Fee type is required',
  }),
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must not exceed 100 characters'),
  amount: z.coerce
    .number({ required_error: 'Amount is required' })
    .positive('Amount must be greater than 0'),
  isRecurring: z.boolean(),
  recurrenceInterval: z.enum(['monthly']).optional().nullable(),
  isOptional: z.boolean(),
  effectiveFrom: z.string().min(1, 'Effective date is required'),
  sortOrder: z.coerce.number().int().min(0).default(0),
}).refine(
  (data) => {
    // If recurring, recurrence interval is required
    if (data.isRecurring && !data.recurrenceInterval) {
      return false;
    }
    return true;
  },
  {
    message: 'Recurrence interval is required for recurring fees',
    path: ['recurrenceInterval'],
  }
);

/**
 * Schema for updating an existing fee template
 * Same validation as create, but effectiveFrom is not included (can't change)
 */
export const updateFeeTemplateSchema = z.object({
  feeType: z.enum(['tuition', 'material', 'exam', 'activity', 'other'], {
    required_error: 'Fee type is required',
  }),
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must not exceed 100 characters'),
  amount: z.coerce
    .number({ required_error: 'Amount is required' })
    .positive('Amount must be greater than 0'),
  isRecurring: z.boolean(),
  recurrenceInterval: z.enum(['monthly']).optional().nullable(),
  isOptional: z.boolean(),
  sortOrder: z.coerce.number().int().min(0).default(0),
}).refine(
  (data) => {
    if (data.isRecurring && !data.recurrenceInterval) {
      return false;
    }
    return true;
  },
  {
    message: 'Recurrence interval is required for recurring fees',
    path: ['recurrenceInterval'],
  }
);

// Types from schema
export type CreateFeeTemplateFormData = z.infer<typeof createFeeTemplateSchema>;
export type UpdateFeeTemplateFormData = z.infer<typeof updateFeeTemplateSchema>;

// Helper to get today's date in ISO format (YYYY-MM-DD)
export const getTodayISODate = (): string => {
  return new Date().toISOString().split('T')[0];
};

// Default values for create form
export const getCreateFeeTemplateDefaults = (): Partial<CreateFeeTemplateFormData> => ({
  feeType: 'tuition',
  name: '',
  amount: 0,
  isRecurring: false,
  recurrenceInterval: null,
  isOptional: false,
  effectiveFrom: getTodayISODate(),
  sortOrder: 0,
});

// Re-export getTodayISODate for use by paymentSchema
export { getTodayISODate as getTodayDate };
