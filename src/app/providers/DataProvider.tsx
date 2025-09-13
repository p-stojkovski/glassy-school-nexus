/**
 * DataProvider - Minimal provider for domain-specific data loading
 *
 * This component provides a minimal context for domain-specific data hooks
 * without loading all data upfront. Each domain loads its own data when needed.
 * This replaces the previous all-data-upfront approach with lazy loading.
 */

import React from 'react';
import { mockDataService } from '@/data/MockDataService';

interface DataProviderProps {
  children: React.ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  // Check if storage is available and show warning if not
  const isStorageAvailable = mockDataService.isStorageAvailable();

  if (!isStorageAvailable) {
    console.warn(
      'localStorage is not available. Data will not persist between sessions.'
    );
  }

  // No need to load all data upfront - domain hooks will load their own data
  return <>{children}</>;
};

