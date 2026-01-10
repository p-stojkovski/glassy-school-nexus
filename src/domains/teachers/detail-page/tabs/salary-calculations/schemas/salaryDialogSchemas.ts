/**
 * Zod validation schemas for salary calculation dialogs
 * Phase 7.4 - Generate, Approve, and Reopen actions
 */
import { z } from 'zod';

// ============================================================================
// Generate Salary Dialog Schema
// ============================================================================

export const generateSalarySchema = z.object({
  year: z.number().int().min(2020).max(2100),
  month: z.number().int().min(1).max(12),
});

export type GenerateSalaryFormData = z.infer<typeof generateSalarySchema>;

// ============================================================================
// Approve Salary Dialog Schema
// ============================================================================

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

// ============================================================================
// Reopen Salary Dialog Schema
// ============================================================================

export const reopenSalarySchema = z.object({
  reason: z
    .string()
    .min(10, 'Reason must be at least 10 characters')
    .max(500, 'Reason must not exceed 500 characters'),
});

export type ReopenSalaryFormData = z.infer<typeof reopenSalarySchema>;
