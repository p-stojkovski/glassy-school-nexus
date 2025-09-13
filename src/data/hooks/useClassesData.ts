/**
 * useClassesData - Domain-specific hook for classes data
 *
 * Provides lazy loading for classes data with dependencies on
 * teachers and classrooms data.
 */

import { useDomainData, type UseDomainDataOptions } from './useDomainData';
import { setClasses } from '@/domains/classes/classesSlice';

export const useClassesData = (options: UseDomainDataOptions = {}) => {
  return useDomainData(
    'classes',
    setClasses,
    undefined, // No specific loading action for classes
    {
      ...options,
      autoLoad: options.autoLoad ?? true,
      loadOnMount: options.loadOnMount ?? true,
      // Classes depend on teachers and classrooms
      dependencies: options.dependencies ?? ['teachers', 'classrooms'],
    }
  );
};

