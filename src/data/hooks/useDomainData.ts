/**
 * useDomainData - Generic hook for domain-specific data loading
 *
 * This hook provides a lazy loading pattern for individual domains,
 * replacing the all-data-upfront approach. Each domain can load only
 * its required data when needed, improving performance.
 */

import { useState, useEffect, useCallback } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { toast } from '@/hooks/use-toast';
import { AnyAction } from '@reduxjs/toolkit';

// Import service and types
import {
  mockDataService,
  type MockDataState,
  type DataLoadOptions,
} from '../MockDataService';

export interface UseDomainDataReturn<T extends keyof MockDataState> {
  // Loading states
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  data: MockDataState[T] | null;

  // Data operations
  loadData: (options?: DataLoadOptions) => Promise<void>;
  refreshData: () => Promise<void>;
  updateData: (data: MockDataState[T]) => Promise<void>;

  // Utility functions
  isDomainLoaded: boolean;
}

export interface UseDomainDataOptions {
  autoLoad?: boolean;
  loadOnMount?: boolean;
  showSuccessToasts?: boolean;
  showErrorToasts?: boolean;
  dependencies?: (keyof MockDataState)[]; // Fixed type constraint
}

/**
 * Generic domain data hook
 */
export const useDomainData = <T extends keyof MockDataState>(
  domain: T,
  dispatchAction: (data: MockDataState[T]) => AnyAction | void,
  setLoadingAction?: (loading: boolean) => AnyAction | void,
  options: UseDomainDataOptions = {}
): UseDomainDataReturn<T> => {
  const {
    autoLoad = true,
    loadOnMount = true,
    showSuccessToasts = false, // Usually false for individual domains
    showErrorToasts = true,
    dependencies = [],
  } = options;

  const dispatch = useAppDispatch();

  // State management
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<MockDataState[T] | null>(null);

  // Check if domain is already loaded in cache
  const isDomainLoaded = mockDataService.isDomainLoaded(domain);

  /**
   * Load domain data and dispatch to Redux store
   */
  const loadData = useCallback(
    async (loadOptions: DataLoadOptions = {}) => {
      setIsLoading(true);
      setError(null);

      // Set loading state in Redux if action provided
      if (setLoadingAction) {
        const action = setLoadingAction(true);
        if (action) dispatch(action);
      }

      try {
        // Load dependencies first if any
        if (dependencies.length > 0) {
          await mockDataService.preloadDomains(dependencies, loadOptions);
        }

        // Load domain data
        const domainData = await mockDataService.loadDomainData(
          domain,
          loadOptions
        );

        // Dispatch to Redux store
        const action = dispatchAction(domainData);
        if (action) dispatch(action);

        // Update local state
        setData(domainData);
        setIsInitialized(true);

        if (showSuccessToasts) {
          toast({
            title: `${domain} Data Loaded`,
            description: `${domain} data has been successfully loaded.`,
            variant: 'default',
          });
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : `Failed to load ${domain} data`;
        setError(errorMessage);

        if (showErrorToasts) {
          toast({
            title: `${domain} Data Load Error`,
            description: errorMessage,
            variant: 'destructive',
          });
        }

        console.error(`Failed to load ${domain} data:`, err);
      } finally {
        setIsLoading(false);

        // Clear loading state in Redux if action provided
        if (setLoadingAction) {
          const action = setLoadingAction(false);
          if (action) dispatch(action);
        }
      }
    },
    [
      domain,
      dispatch,
      dispatchAction,
      setLoadingAction,
      showSuccessToasts,
      showErrorToasts,
      dependencies,
    ]
  );

  /**
   * Refresh domain data (force reload)
   */
  const refreshData = useCallback(async () => {
    await loadData({ useCache: false });
  }, [loadData]);

  /**
   * Update domain data
   */
  const updateData = useCallback(
    async (newData: MockDataState[T]) => {
      try {
        await mockDataService.saveDomainData(domain, newData);
        const action = dispatchAction(newData);
        if (action) dispatch(action);
        setData(newData);
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : `Failed to update ${domain} data`;
        setError(errorMessage);

        if (showErrorToasts) {
          toast({
            title: `${domain} Data Update Error`,
            description: errorMessage,
            variant: 'destructive',
          });
        }

        console.error(`Failed to update ${domain} data:`, err);
      }
    },
    [domain, dispatch, dispatchAction, showErrorToasts]
  );

  // Auto-load on mount if enabled and not already loaded
  useEffect(() => {
    if (
      autoLoad &&
      loadOnMount &&
      !isInitialized &&
      !isDomainLoaded &&
      !isLoading
    ) {
      loadData();
    }
  }, [
    autoLoad,
    loadOnMount,
    isInitialized,
    isDomainLoaded,
    isLoading,
    loadData,
  ]);

  return {
    isLoading,
    isInitialized,
    error,
    data,
    loadData,
    refreshData,
    updateData,
    isDomainLoaded,
  };
};
