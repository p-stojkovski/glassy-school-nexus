/**
 * Academic Calendar sub-domain barrel export
 */

// Components
export { AcademicCalendarSettingsTab } from './components/AcademicCalendarSettingsTab';
export { AcademicYearsManagement } from './components/AcademicYearsManagement';
export { SemestersManagement } from './components/SemestersManagement';
export { TeachingBreaksManagement } from './components/TeachingBreaksManagement';
export { DateRangeDisplay } from './components/shared/DateRangeDisplay';

// Forms
export { AcademicYearForm } from './forms/AcademicYearForm';
export { SemesterForm } from './forms/SemesterForm';
export { TeachingBreakForm } from './forms/TeachingBreakForm';

// Hooks
export { useAcademicYears } from './hooks/useAcademicYears';
export { useSemesters } from './hooks/useSemesters';
export { useTeachingBreaks } from './hooks/useTeachingBreaks';

// Schemas
export * from './schemas/academicCalendarSchemas';
