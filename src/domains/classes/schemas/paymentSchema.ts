/**
 * Payment Schema (Zod)
 * Validation schema for payment registration dialog
 * Aligned with backend PaymentValidationRules
 */

import { z } from 'zod';
import { PaymentValidationRules } from '@/types/api/obligations';

/**
 * Valid payment methods - must match backend CHECK constraint
 */
export const PAYMENT_METHOD_OPTIONS: { value: string; label: string }[] = [
  { value: 'cash', label: 'Cash' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'card', label: 'Card' },
];

/**
 * Schema for registering a payment
 * Validates amount, payment method, date, and optional fields
 */
export const paymentSchema = z.object({
  amount: z.coerce
    .number({ required_error: 'Amount is required' })
    .positive('Amount must be greater than 0')
    .max(PaymentValidationRules.AMOUNT.MAX, 'Amount is too large'),

  paymentMethod: z.enum(['cash', 'bank_transfer', 'card'], {
    required_error: 'Payment method is required',
    invalid_type_error: 'Invalid payment method',
  }),

  paymentDate: z.string().min(1, 'Payment date is required'),

  referenceNumber: z
    .string()
    .max(
      PaymentValidationRules.REFERENCE_NUMBER.MAX_LENGTH,
      'Reference number cannot exceed 50 characters'
    )
    .optional()
    .or(z.literal('')),

  notes: z
    .string()
    .max(
      PaymentValidationRules.NOTES.MAX_LENGTH,
      'Notes cannot exceed 500 characters'
    )
    .optional()
    .or(z.literal('')),
});

export type PaymentFormData = z.infer<typeof paymentSchema>;

/**
 * Get today's date as ISO string (YYYY-MM-DD)
 */
export const getTodayDate = (): string => {
  return new Date().toISOString().split('T')[0];
};

/**
 * Default form values for payment registration
 * @param remainingAmount - The remaining balance to default the amount to
 */
export const getPaymentDefaults = (remainingAmount: number): PaymentFormData => ({
  amount: remainingAmount,
  paymentMethod: 'cash',
  paymentDate: getTodayDate(),
  referenceNumber: '',
  notes: '',
});

/**
 * Create a schema with dynamic max validation for remaining balance
 * This ensures the amount doesn't exceed what's owed AND the global max
 */
export const createPaymentSchemaWithMax = (remainingAmount: number) => {
  // Use the smaller of remaining amount or global max
  const effectiveMax = Math.min(remainingAmount, PaymentValidationRules.AMOUNT.MAX);
  const isRemainingSmaller = remainingAmount <= PaymentValidationRules.AMOUNT.MAX;

  return paymentSchema.extend({
    amount: z.coerce
      .number({ required_error: 'Amount is required' })
      .positive('Amount must be greater than 0')
      .max(
        effectiveMax,
        isRemainingSmaller
          ? `Amount cannot exceed remaining balance of ${remainingAmount.toLocaleString()} MKD`
          : 'Amount is too large'
      ),
  });
};
