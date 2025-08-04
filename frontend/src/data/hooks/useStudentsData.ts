/**
 * useStudentsData - Domain-specific hook for students data
 *
 * Provides lazy loading for students data only when needed,
 * replacing the all-data-upfront approach.
 */

import { useDomainData, type UseDomainDataOptions } from './useDomainData';
import { setStudents, setLoading } from '@/domains/students/studentsSlice';

export const useStudentsData = (options: UseDomainDataOptions = {}) => {
  return useDomainData('students', setStudents, setLoading, {
    ...options,
    // Students data is often needed first, so we can auto-load
    autoLoad: options.autoLoad ?? true,
    loadOnMount: options.loadOnMount ?? true,
  });
};
