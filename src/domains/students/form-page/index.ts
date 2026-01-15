/**
 * Student Form Page Exports
 */

// Page components
export { default as CreateStudentHeader } from './CreateStudentHeader';

// Form components
export { default as TabbedStudentFormContent } from './forms/TabbedStudentFormContent';
export type { StudentFormRef } from './forms/TabbedStudentFormContent';

// Form tabs (used by TabbedStudentFormContent)
export { default as StudentInformationTab } from './forms/tabs/StudentInformationTab';
export { default as ParentGuardianTab } from './forms/tabs/ParentGuardianTab';
export { default as FinancialInformationTab } from './forms/tabs/FinancialInformationTab';
