/**
 * Student Validation Helpers
 * Client-side validation functions that match exact API requirements
 */

import * as z from 'zod';
import {
  StudentValidationRules,
  CreateStudentRequest,
  UpdateStudentRequest,
  StudentFormData,
} from '@/types/api/student';

/**
 * Form error interface for validation results
 */
export interface StudentFormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  enrollmentDate?: string;
  isActive?: string;
  parentContact?: string;
  parentEmail?: string;
  placeOfBirth?: string;
  hasDiscount?: string;
  discountTypeId?: string;
  discountAmount?: string;
  notes?: string;
}

/**
 * Zod schema for creating a student (matches API CreateStudentRequest)
 */
export const createStudentSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required.')
    .max(StudentValidationRules.FIRST_NAME.MAX_LENGTH, `First name must not exceed ${StudentValidationRules.FIRST_NAME.MAX_LENGTH} characters.`)
    .regex(StudentValidationRules.FIRST_NAME.PATTERN, StudentValidationRules.FIRST_NAME.ERROR_MESSAGE),
  
  lastName: z
    .string()
    .min(1, 'Last name is required.')
    .max(StudentValidationRules.LAST_NAME.MAX_LENGTH, `Last name must not exceed ${StudentValidationRules.LAST_NAME.MAX_LENGTH} characters.`)
    .regex(StudentValidationRules.LAST_NAME.PATTERN, StudentValidationRules.LAST_NAME.ERROR_MESSAGE),
  
  email: z
    .string()
    .min(1, 'Email address is required.')
    .max(StudentValidationRules.EMAIL.MAX_LENGTH, `Email must not exceed ${StudentValidationRules.EMAIL.MAX_LENGTH} characters.`)
    .email('Email must be a valid email address.')
    .toLowerCase(),
  
  phone: z
    .string()
    .max(StudentValidationRules.PHONE.MAX_LENGTH, `Phone must not exceed ${StudentValidationRules.PHONE.MAX_LENGTH} characters.`)
    .regex(StudentValidationRules.PHONE.PATTERN, StudentValidationRules.PHONE.ERROR_MESSAGE)
    .optional()
    .or(z.literal('')),

  dateOfBirth: z
    .string()
    .optional()
    .refine((date) => {
      if (!date || date === '') return true;
      const birthDate = new Date(date);
      const today = new Date();
      return birthDate <= today;
    }, 'Date of birth cannot be in the future'),
  
  enrollmentDate: z
    .string()
    .min(1, 'Enrollment date is required.')
    .refine((date) => {
      const enrollDate = new Date(date);
      const today = new Date();
      return enrollDate <= today;
    }, 'Enrollment date cannot be in the future'),
  
  isActive: z.boolean(),
  
  parentContact: z
    .string()
    .min(1, 'Parent/guardian contact is required.'),
    
  parentEmail: z
    .string()
    .min(1, 'Parent email is required.')
    .email('Parent email must be a valid email address.')
    .toLowerCase(),
    
  placeOfBirth: z
    .string()
    .optional()
    .or(z.literal('')),
  
  hasDiscount: z.boolean(),
  
  discountTypeId: z
    .string()
    .regex(StudentValidationRules.DISCOUNT_TYPE_ID.PATTERN, StudentValidationRules.DISCOUNT_TYPE_ID.ERROR_MESSAGE)
    .optional()
    .or(z.literal('')),
  
  discountAmount: z
    .number()
    .min(0, 'Discount amount must be positive.')
    .default(0),
  
  notes: z
    .string()
    .max(StudentValidationRules.NOTES.MAX_LENGTH, `Notes must not exceed ${StudentValidationRules.NOTES.MAX_LENGTH} characters.`)
    .optional()
    .or(z.literal('')),
}).refine(
  (data) => {
    // Only validate discount fields if hasDiscount is true
    if (!data.hasDiscount) {
      return true;
    }
    
    // If discount is enabled, discountTypeId is required
    if (data.hasDiscount && (!data.discountTypeId || data.discountTypeId === '')) {
      return false;
    }
    
    return true;
  },
  {
    message: 'When discount is enabled, discount type must be selected.',
    path: ['discountTypeId'],
  }
);

/**
 * Zod schema for updating a student (matches API UpdateStudentRequest)
 */
export const updateStudentSchema = createStudentSchema; // Same validation rules

/**
 * Type definitions derived from schemas
 */
export type CreateStudentFormData = z.infer<typeof createStudentSchema>;
export type UpdateStudentFormData = z.infer<typeof updateStudentSchema>;

// =============================================================================
// Section-Specific Schemas (for independent section editing)
// =============================================================================

/**
 * Student Information (Personal) section schema
 * Fields: firstName, lastName, email, phone, dateOfBirth, placeOfBirth, enrollmentDate, isActive, notes
 */
export const personalInfoSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required.')
    .max(StudentValidationRules.FIRST_NAME.MAX_LENGTH, `First name must not exceed ${StudentValidationRules.FIRST_NAME.MAX_LENGTH} characters.`)
    .regex(StudentValidationRules.FIRST_NAME.PATTERN, StudentValidationRules.FIRST_NAME.ERROR_MESSAGE),
  
  lastName: z
    .string()
    .min(1, 'Last name is required.')
    .max(StudentValidationRules.LAST_NAME.MAX_LENGTH, `Last name must not exceed ${StudentValidationRules.LAST_NAME.MAX_LENGTH} characters.`)
    .regex(StudentValidationRules.LAST_NAME.PATTERN, StudentValidationRules.LAST_NAME.ERROR_MESSAGE),
  
  email: z
    .string()
    .min(1, 'Email address is required.')
    .max(StudentValidationRules.EMAIL.MAX_LENGTH, `Email must not exceed ${StudentValidationRules.EMAIL.MAX_LENGTH} characters.`)
    .email('Email must be a valid email address.')
    .toLowerCase(),
  
  phone: z
    .string()
    .max(StudentValidationRules.PHONE.MAX_LENGTH, `Phone must not exceed ${StudentValidationRules.PHONE.MAX_LENGTH} characters.`)
    .regex(StudentValidationRules.PHONE.PATTERN, StudentValidationRules.PHONE.ERROR_MESSAGE)
    .optional()
    .or(z.literal('')),

  dateOfBirth: z
    .string()
    .optional()
    .refine((date) => {
      if (!date || date === '') return true;
      const birthDate = new Date(date);
      const today = new Date();
      return birthDate <= today;
    }, 'Date of birth cannot be in the future'),
  
  placeOfBirth: z
    .string()
    .optional()
    .or(z.literal('')),
  
  enrollmentDate: z
    .string()
    .min(1, 'Enrollment date is required.')
    .refine((date) => {
      const enrollDate = new Date(date);
      const today = new Date();
      return enrollDate <= today;
    }, 'Enrollment date cannot be in the future'),
  
  isActive: z.boolean(),
  
  notes: z
    .string()
    .max(StudentValidationRules.NOTES.MAX_LENGTH, `Notes must not exceed ${StudentValidationRules.NOTES.MAX_LENGTH} characters.`)
    .optional()
    .or(z.literal('')),
});

export type PersonalInfoFormData = z.infer<typeof personalInfoSchema>;

/**
 * Parent/Guardian Information section schema
 * Fields: parentContact, parentEmail
 */
export const guardianInfoSchema = z.object({
  parentContact: z
    .string()
    .min(1, 'Parent/guardian contact is required.'),
    
  parentEmail: z
    .string()
    .min(1, 'Parent email is required.')
    .email('Parent email must be a valid email address.')
    .toLowerCase(),
});

export type GuardianInfoFormData = z.infer<typeof guardianInfoSchema>;

/**
 * Financial Information section schema
 * Fields: hasDiscount, discountTypeId, discountAmount
 */
export const financialInfoSchema = z.object({
  hasDiscount: z.boolean(),
  
  discountTypeId: z
    .string()
    .regex(StudentValidationRules.DISCOUNT_TYPE_ID.PATTERN, StudentValidationRules.DISCOUNT_TYPE_ID.ERROR_MESSAGE)
    .optional()
    .or(z.literal('')),
  
  discountAmount: z
    .number()
    .min(0, 'Discount amount must be positive.')
    .default(0),
}).refine(
  (data) => {
    // If discount is enabled, discountTypeId is required
    if (data.hasDiscount && (!data.discountTypeId || data.discountTypeId === '')) {
      return false;
    }
    return true;
  },
  {
    message: 'When discount is enabled, discount type must be selected.',
    path: ['discountTypeId'],
  }
);

export type FinancialInfoFormData = z.infer<typeof financialInfoSchema>;

/**
 * Sanitize student form data
 */
export const sanitizeStudentData = <T extends Partial<StudentFormData>>(data: T): T => {
  return {
    ...data,
    firstName: data.firstName?.trim() || '',
    lastName: data.lastName?.trim() || '',
    email: data.email?.trim().toLowerCase() || '',
    phone: data.phone?.trim() || undefined,
    dateOfBirth: data.dateOfBirth?.trim() || undefined,
    enrollmentDate: data.enrollmentDate?.trim() || '',
    parentContact: data.parentContact?.trim() || undefined,
    parentEmail: data.parentEmail?.trim().toLowerCase() || undefined,
    placeOfBirth: data.placeOfBirth?.trim() || undefined,
    discountTypeId: data.discountTypeId?.trim() || undefined,
    notes: data.notes?.trim() || undefined,
  } as T;
};

/**
 * Create a CreateStudentRequest with proper sanitization
 */
export const createStudentRequest = (data: Partial<StudentFormData>): CreateStudentRequest => {
  const sanitized = sanitizeStudentData(data);
  
  return {
    firstName: sanitized.firstName || '',
    lastName: sanitized.lastName || '',
    email: sanitized.email || '',
    phone: sanitized.phone,
    dateOfBirth: sanitized.dateOfBirth,
    enrollmentDate: sanitized.enrollmentDate || new Date().toISOString(),
    isActive: sanitized.isActive ?? true,
    parentContact: sanitized.parentContact,
    parentEmail: sanitized.parentEmail,
    placeOfBirth: sanitized.placeOfBirth,
    hasDiscount: sanitized.hasDiscount ?? false,
    discountTypeId: sanitized.discountTypeId,
    discountAmount: sanitized.discountAmount ?? 0,
    notes: sanitized.notes,
  };
};

/**
 * Create an UpdateStudentRequest with required fields
 */
export const createUpdateStudentRequest = (data: StudentFormData): UpdateStudentRequest => {
  const sanitized = sanitizeStudentData(data);
  
  return {
    firstName: sanitized.firstName,
    lastName: sanitized.lastName,
    email: sanitized.email,
    phone: sanitized.phone,
    dateOfBirth: sanitized.dateOfBirth,
    enrollmentDate: sanitized.enrollmentDate,
    isActive: sanitized.isActive,
    parentContact: sanitized.parentContact,
    parentEmail: sanitized.parentEmail,
    placeOfBirth: sanitized.placeOfBirth,
    hasDiscount: sanitized.hasDiscount,
    discountTypeId: sanitized.discountTypeId,
    discountAmount: sanitized.discountAmount,
    notes: sanitized.notes,
  };
};

/**
 * Validation result type
 */
export interface ValidationResult {
  isValid: boolean;
  errors: StudentFormErrors;
  data?: CreateStudentRequest | UpdateStudentRequest;
}

/**
 * Comprehensive validation with sanitization and request object creation.
 * Uses Zod schema.safeParse for validation.
 */
export const validateAndPrepareStudentData = (
  data: Partial<StudentFormData>,
  isUpdate: boolean = false
): ValidationResult => {
  const sanitized = sanitizeStudentData(data);
  const schema = isUpdate ? updateStudentSchema : createStudentSchema;
  const result = schema.safeParse(sanitized);

  if (!result.success) {
    const errors: StudentFormErrors = {};
    result.error.errors.forEach((err) => {
      const path = err.path.join('.');
      if (path && !errors[path as keyof StudentFormErrors]) {
        errors[path as keyof StudentFormErrors] = err.message;
      }
    });
    return { isValid: false, errors };
  }

  // Type assertion is safe: Zod schema output aligns with StudentFormData
  const requestData = isUpdate
    ? createUpdateStudentRequest(result.data as StudentFormData)
    : createStudentRequest(result.data);

  return { isValid: true, errors: {}, data: requestData };
};

const getUnknownErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object' && 'message' in error) {
    const maybeMessage = (error as { message?: unknown }).message;
    if (typeof maybeMessage === 'string') return maybeMessage;
  }
  return 'Unknown error';
};

// Add to the error handlers
export const StudentErrorHandlers = {
  fetchAll: (error: unknown) => `Failed to fetch students: ${getUnknownErrorMessage(error)}`,
  fetchById: (error: unknown) => `Failed to fetch student: ${getUnknownErrorMessage(error)}`,
  create: (error: unknown) => `Failed to create student: ${getUnknownErrorMessage(error)}`,
  update: (error: unknown) => `Failed to update student: ${getUnknownErrorMessage(error)}`,
  delete: (error: unknown) => `Failed to delete student: ${getUnknownErrorMessage(error)}`,
  search: (error: unknown) => `Failed to search students: ${getUnknownErrorMessage(error)}`,
  fetchDiscountTypes: (error: unknown) => `Failed to fetch discount types: ${getUnknownErrorMessage(error)}`,
};

export default {
  sanitizeStudentData,
  createStudentRequest,
  createUpdateStudentRequest,
  validateAndPrepareStudentData,
  StudentErrorHandlers,
  createStudentSchema,
  updateStudentSchema,
};

