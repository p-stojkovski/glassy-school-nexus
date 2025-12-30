/**
 * Student Form Page Exports
 */

// Page components
export { default as CreateStudentHeader } from './CreateStudentHeader';

// Form components
export { default as StudentForm } from './forms/StudentForm';
export { default as StudentFormContent } from './forms/StudentFormContent';
export { default as TabbedStudentFormContent } from './forms/TabbedStudentFormContent';
export type { StudentFormRef } from './forms/TabbedStudentFormContent';

// Hooks
export { useStudentForm } from './hooks/useStudentForm';
export { useStudentFormPage } from './hooks/useStudentFormPage';

// Form tabs
export { default as StudentInformationTab } from './forms/tabs/StudentInformationTab';
export { default as ParentGuardianTab } from './forms/tabs/ParentGuardianTab';
export { default as FinancialInformationTab } from './forms/tabs/FinancialInformationTab';
