/**
 * useClassroomsData - Domain-specific hook for classrooms data
 *
 * Provides lazy loading for classrooms data only when needed.
 */

import { useDomainData, type UseDomainDataOptions } from './useDomainData';
import {
  setClassrooms,
  setAllLoading,
} from '@/domains/classrooms/classroomsSlice';

export const useClassroomsData = (options: UseDomainDataOptions = {}) => {
  return useDomainData('classrooms', setClassrooms, setAllLoading, {
    ...options,
    autoLoad: options.autoLoad ?? true,
    loadOnMount: options.loadOnMount ?? true,
  });
};

