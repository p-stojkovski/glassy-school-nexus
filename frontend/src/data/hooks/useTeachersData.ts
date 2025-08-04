/**
 * useTeachersData - Domain-specific hook for teachers data
 *
 * Provides lazy loading for teachers data only when needed.
 */

import { useDomainData, type UseDomainDataOptions } from './useDomainData';
import { setTeachers, setLoading } from '@/domains/teachers/teachersSlice';

export const useTeachersData = (options: UseDomainDataOptions = {}) => {
  return useDomainData('teachers', setTeachers, setLoading, {
    ...options,
    autoLoad: options.autoLoad ?? true,
    loadOnMount: options.loadOnMount ?? true,
  });
};
