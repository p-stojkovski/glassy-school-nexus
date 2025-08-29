/**
 * Teacher Validation Helpers
 * Client-side validation functions that match exact API requirements
 */

import * as z from 'zod';
import {
  TeacherValidationRules,
  CreateTeacherRequest,
  UpdateTeacherRequest,
  TeacherFormData,
} from '@/types/api/teacher';

/**
 * Form error interface for validation results
 */
export interface TeacherFormErrors {
  name?: string;
  email?: string;
  phone?: string;
  subjectId?: string;
  notes?: string;
}

/**
 * Zod schema for creating a teacher (matches API CreateTeacherRequest)
 */
export const createTeacherSchema = z.object({
  name: z
    .string()
    .min(1, 'Teacher name is required.')
    .max(TeacherValidationRules.NAME.MAX_LENGTH, `Name must not exceed ${TeacherValidationRules.NAME.MAX_LENGTH} characters.`)
    .regex(TeacherValidationRules.NAME.PATTERN, TeacherValidationRules.NAME.ERROR_MESSAGE),
  
  email: z
    .string()
    .min(1, 'Email address is required.')
    .max(TeacherValidationRules.EMAIL.MAX_LENGTH, `Email must not exceed ${TeacherValidationRules.EMAIL.MAX_LENGTH} characters.`)
    .email('Email must be a valid email address.')
    .toLowerCase(),
  
  phone: z
    .string()
    .max(TeacherValidationRules.PHONE.MAX_LENGTH, `Phone must not exceed ${TeacherValidationRules.PHONE.MAX_LENGTH} characters.`)
    .regex(TeacherValidationRules.PHONE.PATTERN, TeacherValidationRules.PHONE.ERROR_MESSAGE)
    .optional()
    .or(z.literal('')),
  
  subjectId: z
    .string()
    .min(1, 'Subject selection is required.')
    .regex(TeacherValidationRules.SUBJECT_ID.PATTERN, TeacherValidationRules.SUBJECT_ID.ERROR_MESSAGE),
  
  notes: z
    .string()
    .max(TeacherValidationRules.NOTES.MAX_LENGTH, `Notes must not exceed ${TeacherValidationRules.NOTES.MAX_LENGTH} characters.`)
    .optional()
    .or(z.literal('')),
});

/**
 * Zod schema for updating a teacher (matches API UpdateTeacherRequest)
 */
export const updateTeacherSchema = z.object({
  name: z
    .string()
    .min(1, 'Teacher name is required.')
    .max(TeacherValidationRules.NAME.MAX_LENGTH, `Name must not exceed ${TeacherValidationRules.NAME.MAX_LENGTH} characters.`)
    .regex(TeacherValidationRules.NAME.PATTERN, TeacherValidationRules.NAME.ERROR_MESSAGE),
  
  email: z
    .string()
    .min(1, 'Email address is required.')
    .max(TeacherValidationRules.EMAIL.MAX_LENGTH, `Email must not exceed ${TeacherValidationRules.EMAIL.MAX_LENGTH} characters.`)
    .email('Email must be a valid email address.')
    .toLowerCase(),
  
  phone: z
    .string()
    .max(TeacherValidationRules.PHONE.MAX_LENGTH, `Phone must not exceed ${TeacherValidationRules.PHONE.MAX_LENGTH} characters.`)
    .regex(TeacherValidationRules.PHONE.PATTERN, TeacherValidationRules.PHONE.ERROR_MESSAGE)
    .optional()
    .or(z.literal('')),
  
  subjectId: z
    .string()
    .min(1, 'Subject selection is required.')
    .regex(TeacherValidationRules.SUBJECT_ID.PATTERN, TeacherValidationRules.SUBJECT_ID.ERROR_MESSAGE),
  
  notes: z
    .string()
    .max(TeacherValidationRules.NOTES.MAX_LENGTH, `Notes must not exceed ${TeacherValidationRules.NOTES.MAX_LENGTH} characters.`)
    .optional()
    .or(z.literal('')),
});

/**
 * Type definitions derived from schemas
 */
export type CreateTeacherFormData = z.infer<typeof createTeacherSchema>;
export type UpdateTeacherFormData = z.infer<typeof updateTeacherSchema>;

/**
 * Validation helper function from the integration guide
 * Validates teacher form data and returns structured errors
 * @param data - The form data to validate
 * @returns Object containing validation errors (empty if valid)
 */
export const validateTeacherForm = (
  data: CreateTeacherRequest | UpdateTeacherRequest | TeacherFormData
): TeacherFormErrors => {
  const errors: TeacherFormErrors = {};

  // Name validation
  if (!data.name || data.name.trim().length === 0) {
    errors.name = 'Teacher name is required.';
  } else if (data.name.trim().length > TeacherValidationRules.NAME.MAX_LENGTH) {
    errors.name = `Name must not exceed ${TeacherValidationRules.NAME.MAX_LENGTH} characters.`;
  } else if (!TeacherValidationRules.NAME.PATTERN.test(data.name)) {
    errors.name = TeacherValidationRules.NAME.ERROR_MESSAGE;
  }

  // Email validation
  if (!data.email || data.email.trim().length === 0) {
    errors.email = 'Email address is required.';
  } else if (data.email.trim().length > TeacherValidationRules.EMAIL.MAX_LENGTH) {
    errors.email = `Email must not exceed ${TeacherValidationRules.EMAIL.MAX_LENGTH} characters.`;
  } else if (!TeacherValidationRules.EMAIL.PATTERN.test(data.email)) {
    errors.email = TeacherValidationRules.EMAIL.ERROR_MESSAGE;
  }

  // Phone validation (optional)
  if (data.phone && data.phone.trim().length > 0) {
    if (data.phone.trim().length > TeacherValidationRules.PHONE.MAX_LENGTH) {
      errors.phone = `Phone must not exceed ${TeacherValidationRules.PHONE.MAX_LENGTH} characters.`;
    } else if (!TeacherValidationRules.PHONE.PATTERN.test(data.phone)) {
      errors.phone = TeacherValidationRules.PHONE.ERROR_MESSAGE;
    }
  }

  // Subject ID validation
  if (!data.subjectId || data.subjectId.trim().length === 0) {
    errors.subjectId = 'Subject selection is required.';
  } else if (!TeacherValidationRules.SUBJECT_ID.PATTERN.test(data.subjectId)) {
    errors.subjectId = TeacherValidationRules.SUBJECT_ID.ERROR_MESSAGE;
  }

  // Notes validation (optional)
  if (data.notes && data.notes.trim().length > TeacherValidationRules.NOTES.MAX_LENGTH) {
    errors.notes = `Notes must not exceed ${TeacherValidationRules.NOTES.MAX_LENGTH} characters.`;
  }

  return errors;
};

/**
 * Quick validation check for teacher name
 * @param name - The teacher name to validate
 * @returns Error message or null if valid
 */
export const validateTeacherName = (name: string): string | null => {
  if (!name || name.trim().length === 0) {
    return 'Teacher name is required.';
  }
  
  if (name.trim().length > TeacherValidationRules.NAME.MAX_LENGTH) {
    return `Name must not exceed ${TeacherValidationRules.NAME.MAX_LENGTH} characters.`;
  }
  
  if (!TeacherValidationRules.NAME.PATTERN.test(name)) {
    return TeacherValidationRules.NAME.ERROR_MESSAGE;
  }
  
  return null;
};

/**
 * Quick validation check for teacher email
 * @param email - The email to validate
 * @returns Error message or null if valid
 */
export const validateTeacherEmail = (email: string): string | null => {
  if (!email || email.trim().length === 0) {
    return 'Email address is required.';
  }
  
  if (email.trim().length > TeacherValidationRules.EMAIL.MAX_LENGTH) {
    return `Email must not exceed ${TeacherValidationRules.EMAIL.MAX_LENGTH} characters.`;
  }
  
  if (!TeacherValidationRules.EMAIL.PATTERN.test(email)) {
    return TeacherValidationRules.EMAIL.ERROR_MESSAGE;
  }
  
  return null;
};

/**
 * Quick validation check for teacher phone
 * @param phone - The phone to validate
 * @returns Error message or null if valid
 */
export const validateTeacherPhone = (phone?: string): string | null => {
  if (!phone || phone.trim().length === 0) return null; // Phone is optional
  
  if (phone.trim().length > TeacherValidationRules.PHONE.MAX_LENGTH) {
    return `Phone must not exceed ${TeacherValidationRules.PHONE.MAX_LENGTH} characters.`;
  }
  
  if (!TeacherValidationRules.PHONE.PATTERN.test(phone)) {
    return TeacherValidationRules.PHONE.ERROR_MESSAGE;
  }
  
  return null;
};

/**
 * Quick validation check for subject ID
 * @param subjectId - The subject ID to validate
 * @returns Error message or null if valid
 */
export const validateSubjectId = (subjectId: string): string | null => {
  if (!subjectId || subjectId.trim().length === 0) {
    return 'Subject selection is required.';
  }
  
  if (!TeacherValidationRules.SUBJECT_ID.PATTERN.test(subjectId)) {
    return TeacherValidationRules.SUBJECT_ID.ERROR_MESSAGE;
  }
  
  return null;
};

/**
 * Quick validation check for teacher notes
 * @param notes - The notes to validate
 * @returns Error message or null if valid
 */
export const validateTeacherNotes = (notes?: string): string | null => {
  if (!notes || notes.trim().length === 0) return null; // Notes are optional
  
  if (notes.trim().length > TeacherValidationRules.NOTES.MAX_LENGTH) {
    return `Notes must not exceed ${TeacherValidationRules.NOTES.MAX_LENGTH} characters.`;
  }
  
  return null;
};

/**
 * Check if form data is valid
 * @param data - The form data to check
 * @returns True if valid, false otherwise
 */
export const isTeacherFormValid = (
  data: CreateTeacherRequest | UpdateTeacherRequest | TeacherFormData
): boolean => {
  const errors = validateTeacherForm(data);
  return Object.keys(errors).length === 0;
};

/**
 * Sanitize teacher form data
 * Trims whitespace and applies basic sanitization
 * @param data - The form data to sanitize
 * @returns Sanitized form data
 */
export const sanitizeTeacherData = <T extends Partial<TeacherFormData>>(data: T): T => {
  return {
    ...data,
    name: data.name?.trim() || '',
    email: data.email?.trim().toLowerCase() || '',
    phone: data.phone?.trim() || undefined,
    subjectId: data.subjectId?.trim() || '',
    notes: data.notes?.trim() || undefined,
  } as T;
};

/**
 * Create a CreateTeacherRequest with proper sanitization
 * @param data - Partial teacher data
 * @returns Complete CreateTeacherRequest
 */
export const createTeacherRequest = (data: Partial<TeacherFormData>): CreateTeacherRequest => {
  const sanitized = sanitizeTeacherData(data);
  
  return {
    name: sanitized.name || '',
    email: sanitized.email || '',
    phone: sanitized.phone || undefined,
    subjectId: sanitized.subjectId || '',
    notes: sanitized.notes || undefined,
  };
};

/**
 * Create an UpdateTeacherRequest with required fields
 * @param data - Teacher data for update
 * @returns Complete UpdateTeacherRequest
 */
export const createUpdateTeacherRequest = (data: TeacherFormData): UpdateTeacherRequest => {
  const sanitized = sanitizeTeacherData(data);
  
  return {
    name: sanitized.name,
    email: sanitized.email,
    phone: sanitized.phone,
    subjectId: sanitized.subjectId,
    notes: sanitized.notes,
  };
};

/**
 * Validation result type for async validation
 */
export interface ValidationResult {
  isValid: boolean;
  errors: TeacherFormErrors;
  data?: CreateTeacherRequest | UpdateTeacherRequest;
}

/**
 * Comprehensive validation with sanitization and request object creation
 * @param data - The form data to validate
 * @param isUpdate - Whether this is for update or create
 * @returns Validation result with errors and sanitized data
 */
export const validateAndPrepareTeacherData = (
  data: Partial<TeacherFormData>,
  isUpdate: boolean = false
): ValidationResult => {
  const sanitized = sanitizeTeacherData(data);
  const errors = validateTeacherForm(sanitized);
  const isValid = Object.keys(errors).length === 0;
  
  if (!isValid) {
    return { isValid: false, errors };
  }
  
  const requestData = isUpdate 
    ? createUpdateTeacherRequest(sanitized as TeacherFormData)
    : createTeacherRequest(sanitized);
  
  return {
    isValid: true,
    errors: {},
    data: requestData,
  };
};

/**
 * Debounced validation function factory
 * @param validationFn - The validation function to debounce
 * @param delay - Debounce delay in milliseconds
 * @returns Debounced validation function
 */
export const createDebouncedValidator = <T extends any[]>(
  validationFn: (...args: T) => string | null,
  delay: number = 300
): ((...args: T) => Promise<string | null>) => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: T): Promise<string | null> => {
    return new Promise((resolve) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        resolve(validationFn(...args));
      }, delay);
    });
  };
};

/**
 * Pre-configured debounced validators
 */
export const debouncedValidators = {
  name: createDebouncedValidator(validateTeacherName, 300),
  email: createDebouncedValidator(validateTeacherEmail, 300),
  phone: createDebouncedValidator(validateTeacherPhone, 300),
  subjectId: createDebouncedValidator(validateSubjectId, 300),
  notes: createDebouncedValidator(validateTeacherNotes, 300),
};

export default {
  validateTeacherForm,
  validateTeacherName,
  validateTeacherEmail,
  validateTeacherPhone,
  validateSubjectId,
  validateTeacherNotes,
  isTeacherFormValid,
  sanitizeTeacherData,
  createTeacherRequest,
  createUpdateTeacherRequest,
  validateAndPrepareTeacherData,
  createDebouncedValidator,
  debouncedValidators,
  // Zod schemas
  createTeacherSchema,
  updateTeacherSchema,
};
