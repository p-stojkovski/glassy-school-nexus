/**
 * Academic Calendar Validation Schemas
 *
 * Re-exports the Zod schemas from the types file for consistency
 * with other sub-domains that define schemas in their own folder.
 */

// Re-export schemas and form data types from the central types file
export {
  academicYearFormSchema,
  semesterFormSchema,
  teachingBreakFormSchema,
  type AcademicYearFormData,
  type SemesterFormData,
  type TeachingBreakFormData,
} from '../../types/academicCalendarTypes';
