/**
 * Settings domain barrel export
 *
 * Note: Classrooms is an EXTERNAL domain with its own Redux slice.
 * Import ClassroomSettingsTab from '@/domains/classrooms/' or use the
 * legacy path '@/domains/settings/components/tabs/ClassroomSettingsTab'.
 *
 * Sub-domains included here:
 * - subjects: Full CRUD for subjects with sortOrder
 * - discount-types: Full CRUD for discount types
 * - lesson-statuses: Read + Update only (predefined statuses)
 * - academic-calendar: Academic years, semesters, teaching breaks
 */

// Redux slice and selectors
export { default as settingsReducer } from './settingsSlice';
export * from './settingsSlice';

// Types
export * from './types';

// Shared components
export * from './_shared';

// Sub-domains
export * from './subjects';
export * from './discount-types';
export * from './lesson-statuses';
export * from './academic-calendar';
