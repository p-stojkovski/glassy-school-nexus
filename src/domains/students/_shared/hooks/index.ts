/**
 * Shared Student Hooks
 *
 * Primary hook: useStudents - provides Redux state access and API operations.
 * For list page orchestration, use useStudentsListPage from '@/domains/students/list-page'.
 */

export { useStudents, type StudentFormData } from './useStudents';
export { useStudentFilters } from './useStudentFilters';
export { useUnsavedChangesWarning } from './useUnsavedChangesWarning';
export { useInitializeStudents } from './useInitializeStudents';
