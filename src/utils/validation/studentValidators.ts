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

/**
 * Validation helper function
 * Validates student form data and returns structured errors
 * @param data - The form data to validate
 * @returns Object containing validation errors (empty if valid)
 */
export const validateStudentForm = (
  data: CreateStudentRequest | UpdateStudentRequest | StudentFormData
): StudentFormErrors => {
  const errors: StudentFormErrors = {};

  // First name validation
  if (!data.firstName || data.firstName.trim().length === 0) {
    errors.firstName = 'First name is required.';
  } else if (data.firstName.trim().length > StudentValidationRules.FIRST_NAME.MAX_LENGTH) {
    errors.firstName = `First name must not exceed ${StudentValidationRules.FIRST_NAME.MAX_LENGTH} characters.`;
  } else if (!StudentValidationRules.FIRST_NAME.PATTERN.test(data.firstName)) {
    errors.firstName = StudentValidationRules.FIRST_NAME.ERROR_MESSAGE;
  }

  // Last name validation
  if (!data.lastName || data.lastName.trim().length === 0) {
    errors.lastName = 'Last name is required.';
  } else if (data.lastName.trim().length > StudentValidationRules.LAST_NAME.MAX_LENGTH) {
    errors.lastName = `Last name must not exceed ${StudentValidationRules.LAST_NAME.MAX_LENGTH} characters.`;
  } else if (!StudentValidationRules.LAST_NAME.PATTERN.test(data.lastName)) {
    errors.lastName = StudentValidationRules.LAST_NAME.ERROR_MESSAGE;
  }

  // Email validation
  if (!data.email || data.email.trim().length === 0) {
    errors.email = 'Email address is required.';
  } else if (data.email.trim().length > StudentValidationRules.EMAIL.MAX_LENGTH) {
    errors.email = `Email must not exceed ${StudentValidationRules.EMAIL.MAX_LENGTH} characters.`;
  } else if (!StudentValidationRules.EMAIL.PATTERN.test(data.email)) {
    errors.email = StudentValidationRules.EMAIL.ERROR_MESSAGE;
  }

  // Phone validation (optional)
  if (data.phone && data.phone.trim().length > 0) {
    if (data.phone.trim().length > StudentValidationRules.PHONE.MAX_LENGTH) {
      errors.phone = `Phone must not exceed ${StudentValidationRules.PHONE.MAX_LENGTH} characters.`;
    } else if (!StudentValidationRules.PHONE.PATTERN.test(data.phone)) {
      errors.phone = StudentValidationRules.PHONE.ERROR_MESSAGE;
    }
  }

  // Date of birth validation (optional)
  if (data.dateOfBirth && data.dateOfBirth.trim().length > 0) {
    const birthDate = new Date(data.dateOfBirth);
    const today = new Date();
    if (birthDate > today) {
      errors.dateOfBirth = 'Date of birth cannot be in the future.';
    }
  }

  // Enrollment date validation
  if (!data.enrollmentDate || data.enrollmentDate.trim().length === 0) {
    errors.enrollmentDate = 'Enrollment date is required.';
  } else {
    const enrollDate = new Date(data.enrollmentDate);
    const today = new Date();
    if (enrollDate > today) {
      errors.enrollmentDate = 'Enrollment date cannot be in the future.';
    }
  }

  // Parent/guardian contact validation (required)
  if (!data.parentContact || data.parentContact.trim().length === 0) {
    errors.parentContact = 'Parent/guardian contact is required.';
  }

  // Parent email validation (required)
  if (!data.parentEmail || data.parentEmail.trim().length === 0) {
    errors.parentEmail = 'Parent email is required.';
  } else if (!StudentValidationRules.EMAIL.PATTERN.test(data.parentEmail)) {
    errors.parentEmail = 'Parent email must be a valid email address.';
  }

  // Discount validation
  if (data.hasDiscount) {
    if (!data.discountTypeId || data.discountTypeId.trim().length === 0) {
      errors.discountTypeId = 'Discount type selection is required when discount is enabled.';
    } else if (!StudentValidationRules.DISCOUNT_TYPE_ID.PATTERN.test(data.discountTypeId)) {
      errors.discountTypeId = StudentValidationRules.DISCOUNT_TYPE_ID.ERROR_MESSAGE;
    }
  }

  // Notes validation (optional)
  if (data.notes && data.notes.trim().length > StudentValidationRules.NOTES.MAX_LENGTH) {
    errors.notes = `Notes must not exceed ${StudentValidationRules.NOTES.MAX_LENGTH} characters.`;
  }

  return errors;
};

/**
 * Quick validation check for student first name
 */
export const validateStudentFirstName = (firstName: string): string | null => {
  if (!firstName || firstName.trim().length === 0) {
    return 'First name is required.';
  }
  
  if (firstName.trim().length > StudentValidationRules.FIRST_NAME.MAX_LENGTH) {
    return `First name must not exceed ${StudentValidationRules.FIRST_NAME.MAX_LENGTH} characters.`;
  }
  
  if (!StudentValidationRules.FIRST_NAME.PATTERN.test(firstName)) {
    return StudentValidationRules.FIRST_NAME.ERROR_MESSAGE;
  }
  
  return null;
};

/**
 * Quick validation check for student last name
 */
export const validateStudentLastName = (lastName: string): string | null => {
  if (!lastName || lastName.trim().length === 0) {
    return 'Last name is required.';
  }
  
  if (lastName.trim().length > StudentValidationRules.LAST_NAME.MAX_LENGTH) {
    return `Last name must not exceed ${StudentValidationRules.LAST_NAME.MAX_LENGTH} characters.`;
  }
  
  if (!StudentValidationRules.LAST_NAME.PATTERN.test(lastName)) {
    return StudentValidationRules.LAST_NAME.ERROR_MESSAGE;
  }
  
  return null;
};

/**
 * Quick validation check for student email
 */
export const validateStudentEmail = (email: string): string | null => {
  if (!email || email.trim().length === 0) {
    return 'Email address is required.';
  }
  
  if (email.trim().length > StudentValidationRules.EMAIL.MAX_LENGTH) {
    return `Email must not exceed ${StudentValidationRules.EMAIL.MAX_LENGTH} characters.`;
  }
  
  if (!StudentValidationRules.EMAIL.PATTERN.test(email)) {
    return StudentValidationRules.EMAIL.ERROR_MESSAGE;
  }
  
  return null;
};

/**
 * Quick validation check for student phone
 */
export const validateStudentPhone = (phone?: string): string | null => {
  if (!phone || phone.trim().length === 0) return null; // Phone is optional
  
  if (phone.trim().length > StudentValidationRules.PHONE.MAX_LENGTH) {
    return `Phone must not exceed ${StudentValidationRules.PHONE.MAX_LENGTH} characters.`;
  }
  
  if (!StudentValidationRules.PHONE.PATTERN.test(phone)) {
    return StudentValidationRules.PHONE.ERROR_MESSAGE;
  }
  
  return null;
};

/**
 * Quick validation check for discount type ID
 */
export const validateDiscountTypeId = (discountTypeId?: string, hasDiscount?: boolean): string | null => {
  if (!hasDiscount) return null; // Not required if discount is disabled
  
  if (!discountTypeId || discountTypeId.trim().length === 0) {
    return 'Discount type selection is required when discount is enabled.';
  }
  
  if (!StudentValidationRules.DISCOUNT_TYPE_ID.PATTERN.test(discountTypeId)) {
    return StudentValidationRules.DISCOUNT_TYPE_ID.ERROR_MESSAGE;
  }
  
  return null;
};

/**
 * Check if form data is valid
 */
export const isStudentFormValid = (
  data: CreateStudentRequest | UpdateStudentRequest | StudentFormData
): boolean => {
  const errors = validateStudentForm(data);
  return Object.keys(errors).length === 0;
};

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
 * Comprehensive validation with sanitization and request object creation
 */
export const validateAndPrepareStudentData = (
  data: Partial<StudentFormData>,
  isUpdate: boolean = false
): ValidationResult => {
  const sanitized = sanitizeStudentData(data);
  const errors = validateStudentForm(sanitized);
  const isValid = Object.keys(errors).length === 0;
  
  if (!isValid) {
    return { isValid: false, errors };
  }
  
  const requestData = isUpdate 
    ? createUpdateStudentRequest(sanitized as StudentFormData)
    : createStudentRequest(sanitized);
  
  return {
    isValid: true,
    errors: {},
    data: requestData,
  };
};

// Add to the error handlers
export const StudentErrorHandlers = {
  fetchAll: (error: any) => `Failed to fetch students: ${error?.message || 'Unknown error'}`,
  fetchById: (error: any) => `Failed to fetch student: ${error?.message || 'Unknown error'}`,
  create: (error: any) => `Failed to create student: ${error?.message || 'Unknown error'}`,
  update: (error: any) => `Failed to update student: ${error?.message || 'Unknown error'}`,
  delete: (error: any) => `Failed to delete student: ${error?.message || 'Unknown error'}`,
  search: (error: any) => `Failed to search students: ${error?.message || 'Unknown error'}`,
  fetchDiscountTypes: (error: any) => `Failed to fetch discount types: ${error?.message || 'Unknown error'}`,
};

export default {
  validateStudentForm,
  validateStudentFirstName,
  validateStudentLastName,
  validateStudentEmail,
  validateStudentPhone,
  validateDiscountTypeId,
  isStudentFormValid,
  sanitizeStudentData,
  createStudentRequest,
  createUpdateStudentRequest,
  validateAndPrepareStudentData,
  StudentErrorHandlers,
  // Zod schemas
  createStudentSchema,
  updateStudentSchema,
};
