/**
 * Student Profile Sections
 *
 * Exports all section components and the shared wrapper for the StudentDetailsTab.
 * Each section handles its own view/edit mode with inline Save/Cancel controls.
 */

export { EditableSectionWrapper } from './EditableSectionWrapper';
export type { EditableSectionWrapperProps } from './EditableSectionWrapper';

// Section components
export { StudentInfoSection } from './StudentInfoSection';
export { GuardianInfoSection } from './GuardianInfoSection';
export { FinancialInfoSection } from './FinancialInfoSection';
