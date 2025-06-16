/**
 * Domain-specific data hooks index
 *
 * Exports all domain-specific hooks for lazy loading of data.
 * These replace the all-data-upfront approach with per-domain loading.
 */

export { useDomainData } from './useDomainData';
export { useStudentsData } from './useStudentsData';
export { useClassroomsData } from './useClassroomsData';
export { useClassesData } from './useClassesData';
export { useTeachersData } from './useTeachersData';
export {
  useFinancialData,
  useFinancialObligationsData,
  useFinancialPaymentsData,
} from './useFinancialData';

// Keep the original hook for backward compatibility during migration
export { useMockData } from './useMockData';
