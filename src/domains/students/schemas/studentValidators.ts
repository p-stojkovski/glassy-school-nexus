/**
 * Student Validation Schemas
 *
 * Re-exports all student validation schemas and utilities from the central validation folder.
 * This provides a domain-local entry point for schema imports.
 */

export {
  // Zod schemas
  createStudentSchema,
  updateStudentSchema,
  personalInfoSchema,
  guardianInfoSchema,
  financialInfoSchema,
  // Form data types
  type CreateStudentFormData,
  type UpdateStudentFormData,
  type PersonalInfoFormData,
  type GuardianInfoFormData,
  type FinancialInfoFormData,
  type StudentFormErrors,
  type ValidationResult,
  // Validation utilities
  sanitizeStudentData,
  createStudentRequest,
  createUpdateStudentRequest,
  validateAndPrepareStudentData,
  // Error handlers
  StudentErrorHandlers,
} from '@/utils/validation/studentValidators';

// Re-export StudentFormData from types for convenience
export type { StudentFormData } from '@/types/api/student';
