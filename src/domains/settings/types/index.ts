/**
 * Settings domain types barrel export
 */

// Subject types
export type {
  Subject,
  CreateSubjectRequest,
  UpdateSubjectRequest,
} from './subjectTypes';

// Discount type types
export type {
  DiscountType,
  CreateDiscountTypeRequest,
  UpdateDiscountTypeRequest,
} from './discountTypeTypes';

// Lesson status types
export type {
  LessonStatus,
  UpdateLessonStatusRequest,
} from './lessonStatusTypes';

// Academic calendar types (re-export as-is)
export {
  academicYearFormSchema,
  semesterFormSchema,
  teachingBreakFormSchema,
  breakTypeLabels,
  breakTypeColors,
} from './academicCalendarTypes';

export type {
  BreakType,
  AcademicYear,
  CreateAcademicYearRequest,
  UpdateAcademicYearRequest,
  Semester,
  CreateSemesterRequest,
  UpdateSemesterRequest,
  TeachingBreak,
  CreateTeachingBreakRequest,
  UpdateTeachingBreakRequest,
  NonTeachingDatesResponse,
  TeachingDaysCountResponse,
  SemesterSummaryResponse,
  AcademicYearFormData,
  SemesterFormData,
  TeachingBreakFormData,
} from './academicCalendarTypes';
