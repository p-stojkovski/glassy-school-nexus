import { ValidationResult, ValidationError } from '@/domains/classes/hooks/useTabEditMode';

export interface ClassInfoFormData {
  name: string;
  subjectId: string;
  teacherId: string;
  classroomId: string;
  description: string;
}

/**
 * Validate class info fields (name, subject, teacher, classroom, description)
 */
export const validateClassInfo = (data: ClassInfoFormData): ValidationResult => {
  const errors: ValidationError[] = [];

  // Name validation
  if (!data.name || data.name.trim() === '') {
    errors.push({
      field: 'name',
      message: 'Class name is required',
    });
  } else if (data.name.length > 100) {
    errors.push({
      field: 'name',
      message: 'Class name must be 100 characters or less',
    });
  }

  // Subject validation
  if (!data.subjectId) {
    errors.push({
      field: 'subjectId',
      message: 'Subject is required',
    });
  }

  // Teacher validation
  if (!data.teacherId) {
    errors.push({
      field: 'teacherId',
      message: 'Teacher is required',
    });
  }

  // Classroom validation
  if (!data.classroomId) {
    errors.push({
      field: 'classroomId',
      message: 'Classroom is required',
    });
  }

  // Description validation (optional, but if provided, max 500 chars)
  if (data.description && data.description.length > 500) {
    errors.push({
      field: 'description',
      message: 'Description must be 500 characters or less',
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Get first error for a specific field
 */
export const getFieldError = (errors: ValidationError[], field: string): string | null => {
  const error = errors.find((e) => e.field === field);
  return error?.message || null;
};
