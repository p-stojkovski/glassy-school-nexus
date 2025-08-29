/**
 * Classroom Validation Helpers
 * Client-side validation functions that match exact API requirements
 */

import * as z from 'zod';
import {
  ClassroomValidationRules,
  CreateClassroomRequest,
  UpdateClassroomRequest,
  ClassroomFormData,
} from '@/types/api/classroom';

/**
 * Form error interface for validation results
 */
export interface ClassroomFormErrors {
  name?: string;
  location?: string;
  capacity?: string;
}

/**
 * Zod schema for creating a classroom (matches API CreateClassroomRequest)
 */
export const createClassroomSchema = z.object({
  name: z
    .string()
    .min(ClassroomValidationRules.NAME.MIN_LENGTH, 'Classroom name is required.')
    .max(ClassroomValidationRules.NAME.MAX_LENGTH, `Classroom name must not exceed ${ClassroomValidationRules.NAME.MAX_LENGTH} characters.`)
    .regex(ClassroomValidationRules.NAME.PATTERN, ClassroomValidationRules.NAME.ERROR_MESSAGE),
  
  location: z
    .string()
    .max(ClassroomValidationRules.LOCATION.MAX_LENGTH, `Location must not exceed ${ClassroomValidationRules.LOCATION.MAX_LENGTH} characters.`)
    .regex(ClassroomValidationRules.LOCATION.PATTERN, ClassroomValidationRules.LOCATION.ERROR_MESSAGE)
    .optional()
    .or(z.literal('')),
  
  capacity: z.preprocess(
    (val) => (val === '' || val === null ? undefined : val),
    z
      .coerce
      .number({
        required_error: 'Capacity number is required.',
        invalid_type_error: 'Capacity number is required.',
      })
      .int('Capacity must be a whole number.')
      .min(
        ClassroomValidationRules.CAPACITY.MIN,
        `Capacity must be at least ${ClassroomValidationRules.CAPACITY.MIN}.`
      )
      .max(
        ClassroomValidationRules.CAPACITY.MAX,
        `Capacity cannot exceed ${ClassroomValidationRules.CAPACITY.MAX}.`
      )
  ),
});

/**
 * Zod schema for updating a classroom (matches API UpdateClassroomRequest)
 */
export const updateClassroomSchema = z.object({
  name: z
    .string()
    .min(ClassroomValidationRules.NAME.MIN_LENGTH, 'Classroom name is required.')
    .max(ClassroomValidationRules.NAME.MAX_LENGTH, `Classroom name must not exceed ${ClassroomValidationRules.NAME.MAX_LENGTH} characters.`)
    .regex(ClassroomValidationRules.NAME.PATTERN, ClassroomValidationRules.NAME.ERROR_MESSAGE),
  
  location: z
    .string()
    .max(ClassroomValidationRules.LOCATION.MAX_LENGTH, `Location must not exceed ${ClassroomValidationRules.LOCATION.MAX_LENGTH} characters.`)
    .regex(ClassroomValidationRules.LOCATION.PATTERN, ClassroomValidationRules.LOCATION.ERROR_MESSAGE)
    .optional()
    .or(z.literal('')),
  
  capacity: z.preprocess(
    (val) => (val === '' || val === null ? undefined : val),
    z
      .coerce
      .number({
        required_error: 'Capacity number is required.',
        invalid_type_error: 'Capacity number is required.',
      })
      .int('Capacity must be a whole number.')
      .min(
        ClassroomValidationRules.CAPACITY.MIN,
        `Capacity must be at least ${ClassroomValidationRules.CAPACITY.MIN}.`
      )
      .max(
        ClassroomValidationRules.CAPACITY.MAX,
        `Capacity cannot exceed ${ClassroomValidationRules.CAPACITY.MAX}.`
      )
  ),
});

/**
 * Type definitions derived from schemas
 */
export type CreateClassroomFormData = z.infer<typeof createClassroomSchema>;
export type UpdateClassroomFormData = z.infer<typeof updateClassroomSchema>;

/**
 * Validation helper function from the integration guide
 * Validates classroom form data and returns structured errors
 * @param data - The form data to validate
 * @returns Object containing validation errors (empty if valid)
 */
export const validateClassroomForm = (
  data: CreateClassroomRequest | UpdateClassroomRequest | ClassroomFormData
): ClassroomFormErrors => {
  const errors: ClassroomFormErrors = {};

  // Name validation
  if (!data.name || data.name.trim().length === 0) {
    errors.name = 'Classroom name is required.';
  } else if (data.name.trim().length > ClassroomValidationRules.NAME.MAX_LENGTH) {
    errors.name = `Classroom name must not exceed ${ClassroomValidationRules.NAME.MAX_LENGTH} characters.`;
  } else if (!ClassroomValidationRules.NAME.PATTERN.test(data.name)) {
    errors.name = ClassroomValidationRules.NAME.ERROR_MESSAGE;
  }

  // Location validation
  if (data.location) {
    if (data.location.trim().length > ClassroomValidationRules.LOCATION.MAX_LENGTH) {
      errors.location = `Location must not exceed ${ClassroomValidationRules.LOCATION.MAX_LENGTH} characters.`;
    } else if (!ClassroomValidationRules.LOCATION.PATTERN.test(data.location)) {
      errors.location = ClassroomValidationRules.LOCATION.ERROR_MESSAGE;
    }
  }

  // Capacity validation
  if (data.capacity !== undefined && data.capacity !== null) {
    if (data.capacity < ClassroomValidationRules.CAPACITY.MIN) {
      errors.capacity = `Capacity must be at least ${ClassroomValidationRules.CAPACITY.MIN}.`;
    } else if (data.capacity > ClassroomValidationRules.CAPACITY.MAX) {
      errors.capacity = `Capacity cannot exceed ${ClassroomValidationRules.CAPACITY.MAX}.`;
    } else if (!Number.isInteger(data.capacity)) {
      errors.capacity = 'Capacity must be a whole number.';
    }
  } else {
    errors.capacity = 'Capacity number is required.';
  }

  return errors;
};

/**
 * Quick validation check for classroom name
 * @param name - The classroom name to validate
 * @returns Error message or null if valid
 */
export const validateClassroomName = (name: string): string | null => {
  if (!name || name.trim().length === 0) {
    return 'Classroom name is required.';
  }
  
  if (name.trim().length > ClassroomValidationRules.NAME.MAX_LENGTH) {
    return `Classroom name must not exceed ${ClassroomValidationRules.NAME.MAX_LENGTH} characters.`;
  }
  
  if (!ClassroomValidationRules.NAME.PATTERN.test(name)) {
    return ClassroomValidationRules.NAME.ERROR_MESSAGE;
  }
  
  return null;
};

/**
 * Quick validation check for classroom location
 * @param location - The location to validate
 * @returns Error message or null if valid
 */
export const validateClassroomLocation = (location?: string): string | null => {
  if (!location) return null; // Location is optional
  
  if (location.trim().length > ClassroomValidationRules.LOCATION.MAX_LENGTH) {
    return `Location must not exceed ${ClassroomValidationRules.LOCATION.MAX_LENGTH} characters.`;
  }
  
  if (!ClassroomValidationRules.LOCATION.PATTERN.test(location)) {
    return ClassroomValidationRules.LOCATION.ERROR_MESSAGE;
  }
  
  return null;
};

/**
 * Quick validation check for classroom capacity
 * @param capacity - The capacity to validate
 * @returns Error message or null if valid
 */
export const validateClassroomCapacity = (capacity: number): string | null => {
  if (capacity < ClassroomValidationRules.CAPACITY.MIN) {
    return `Capacity must be at least ${ClassroomValidationRules.CAPACITY.MIN}.`;
  }
  
  if (capacity > ClassroomValidationRules.CAPACITY.MAX) {
    return `Capacity cannot exceed ${ClassroomValidationRules.CAPACITY.MAX}.`;
  }
  
  if (!Number.isInteger(capacity)) {
    return 'Capacity must be a whole number.';
  }
  
  return null;
};

/**
 * Check if form data is valid
 * @param data - The form data to check
 * @returns True if valid, false otherwise
 */
export const isClassroomFormValid = (
  data: CreateClassroomRequest | UpdateClassroomRequest | ClassroomFormData
): boolean => {
  const errors = validateClassroomForm(data);
  return Object.keys(errors).length === 0;
};

/**
 * Sanitize classroom form data
 * Trims whitespace and applies basic sanitization
 * @param data - The form data to sanitize
 * @returns Sanitized form data
 */
export const sanitizeClassroomData = <T extends Partial<ClassroomFormData>>(data: T): T => {
  return {
    ...data,
    name: data.name?.trim() || '',
    location: data.location?.trim() || undefined,
    capacity: typeof data.capacity === 'number' ? data.capacity : undefined,
  } as T;
};

/**
 * Create a CreateClassroomRequest with proper defaults
 * @param data - Partial classroom data
 * @returns Complete CreateClassroomRequest
 */
export const createClassroomRequest = (data: Partial<ClassroomFormData>): CreateClassroomRequest => {
  const sanitized = sanitizeClassroomData(data);
  
  return {
    name: sanitized.name || '',
    location: sanitized.location || undefined,
    capacity: sanitized.capacity || ClassroomValidationRules.CAPACITY.DEFAULT,
  };
};

/**
 * Create an UpdateClassroomRequest with required fields
 * @param data - Classroom data for update
 * @returns Complete UpdateClassroomRequest
 */
export const createUpdateClassroomRequest = (data: ClassroomFormData): UpdateClassroomRequest => {
  const sanitized = sanitizeClassroomData(data);
  
  return {
    name: sanitized.name,
    location: sanitized.location,
    capacity: sanitized.capacity || ClassroomValidationRules.CAPACITY.DEFAULT,
  };
};

/**
 * Validation result type for async validation
 */
export interface ValidationResult {
  isValid: boolean;
  errors: ClassroomFormErrors;
  data?: CreateClassroomRequest | UpdateClassroomRequest;
}

/**
 * Comprehensive validation with sanitization and request object creation
 * @param data - The form data to validate
 * @param isUpdate - Whether this is for update (requires capacity) or create
 * @returns Validation result with errors and sanitized data
 */
export const validateAndPrepareClassroomData = (
  data: Partial<ClassroomFormData>,
  isUpdate: boolean = false
): ValidationResult => {
  const sanitized = sanitizeClassroomData(data);
  const errors = validateClassroomForm(sanitized);
  const isValid = Object.keys(errors).length === 0;
  
  if (!isValid) {
    return { isValid: false, errors };
  }
  
  const requestData = isUpdate 
    ? createUpdateClassroomRequest(sanitized as ClassroomFormData)
    : createClassroomRequest(sanitized);
  
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
  name: createDebouncedValidator(validateClassroomName, 300),
  location: createDebouncedValidator(validateClassroomLocation, 300),
  capacity: createDebouncedValidator(validateClassroomCapacity, 300),
};

export default {
  validateClassroomForm,
  validateClassroomName,
  validateClassroomLocation,
  validateClassroomCapacity,
  isClassroomFormValid,
  sanitizeClassroomData,
  createClassroomRequest,
  createUpdateClassroomRequest,
  validateAndPrepareClassroomData,
  createDebouncedValidator,
  debouncedValidators,
  // Zod schemas
  createClassroomSchema,
  updateClassroomSchema,
};