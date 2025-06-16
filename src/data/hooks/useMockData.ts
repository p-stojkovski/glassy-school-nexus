/**
 * useMockData - React hook for centralized mock data management
 *
 * This hook provides a React interface for the MockDataService, handling
 * loading states, error handling, and reactive updates to mock data.
 * It integrates with Redux store and provides methods for CRUD operations.
 */

import { useState, useEffect, useCallback } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { toast } from '@/hooks/use-toast';

// Import Redux actions
import {
  setStudents,
  setLoading as setStudentsLoading,
} from '@/domains/students/studentsSlice';
import {
  setClassrooms,
  setLoading as setClassroomsLoading,
} from '@/domains/classrooms/classroomsSlice';
import { setClasses } from '@/domains/classes/classesSlice';
import {
  setTeachers,
  setLoading as setTeachersLoading,
} from '@/domains/teachers/teachersSlice';
import {
  createObligation,
  createPayment,
  clearAllFinancialData,
} from '@/domains/finance/financeSlice';

// Import service and types
import {
  mockDataService,
  type MockDataState,
  type DataLoadOptions,
} from '../MockDataService';

export interface UseMockDataReturn {
  // Loading states
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;

  // Data operations
  loadAllData: (options?: DataLoadOptions) => Promise<void>;
  resetToDefaults: () => Promise<void>;
  clearAllData: () => Promise<void>;

  // Individual data type operations
  refreshStudents: () => Promise<void>;
  refreshClassrooms: () => Promise<void>;
  refreshClasses: () => Promise<void>;
  refreshTeachers: () => Promise<void>;
  refreshFinancialData: () => Promise<void>;

  // Utility functions
  getDataStats: () => Promise<any>;
  exportData: () => Promise<string>;
  importData: (jsonString: string) => Promise<void>;
  isStorageAvailable: boolean;

  // Demo reset with notification
  resetDemoData: () => Promise<void>;
}

export interface UseMockDataOptions {
  autoLoad?: boolean;
  loadOnMount?: boolean;
  showSuccessToasts?: boolean;
  showErrorToasts?: boolean;
}

export const useMockData = (
  options: UseMockDataOptions = {}
): UseMockDataReturn => {
  const {
    autoLoad = true,
    loadOnMount = true,
    showSuccessToasts = false,
    showErrorToasts = true,
  } = options;

  const dispatch = useAppDispatch();

  // State management
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check storage availability
  const isStorageAvailable = mockDataService.isStorageAvailable();

  /**
   * Load all data and dispatch to Redux store
   */
  const loadAllData = useCallback(
    async (loadOptions: DataLoadOptions = {}) => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await mockDataService.loadAllData(loadOptions);

        // Dispatch data to Redux store
        await dispatchAllData(data);

        setIsInitialized(true);

        if (showSuccessToasts) {
          toast({
            title: 'Data Loaded',
            description: 'Mock data has been successfully loaded.',
            variant: 'default',
          });
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to load data';
        setError(errorMessage);

        if (showErrorToasts) {
          toast({
            title: 'Data Load Error',
            description: errorMessage,
            variant: 'destructive',
          });
        }

        console.error('Failed to load mock data:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [dispatch, showSuccessToasts, showErrorToasts]
  );

  /**
   * Dispatch all data to Redux store
   */
  const dispatchAllData = useCallback(
    async (data: MockDataState) => {
      // Set loading states
      dispatch(setStudentsLoading(true));
      dispatch(setClassroomsLoading(true));
      dispatch(setTeachersLoading(true));

      try {
        // Dispatch students
        dispatch(setStudents(data.students));

        // Dispatch classrooms
        dispatch(setClassrooms(data.classrooms));

        // Dispatch classes
        dispatch(setClasses(data.classes));

        // Dispatch teachers
        dispatch(setTeachers(data.teachers));

        // Clear and recreate financial data
        dispatch(clearAllFinancialData());

        // Add obligations
        data.obligations.forEach((obligation) => {
          dispatch(createObligation(obligation));
        });

        // Add payments
        data.payments.forEach((payment) => {
          dispatch(createPayment(payment));
        });
      } finally {
        // Clear loading states
        dispatch(setStudentsLoading(false));
        dispatch(setClassroomsLoading(false));
        dispatch(setTeachersLoading(false));
      }
    },
    [dispatch]
  );

  /**
   * Reset all data to defaults
   */
  const resetToDefaults = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await mockDataService.resetToDefaults();
      await dispatchAllData(data);

      if (showSuccessToasts) {
        toast({
          title: 'Data Reset',
          description: 'All data has been reset to default values.',
          variant: 'default',
        });
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to reset data';
      setError(errorMessage);

      if (showErrorToasts) {
        toast({
          title: 'Reset Error',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [dispatchAllData, showSuccessToasts, showErrorToasts]);

  /**
   * Clear all data
   */
  const clearAllData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await mockDataService.clearAllData();

      // Clear Redux store
      dispatch(setStudents([]));
      dispatch(setClassrooms([]));
      dispatch(setClasses([]));
      dispatch(setTeachers([]));
      dispatch(clearAllFinancialData());

      setIsInitialized(false);

      if (showSuccessToasts) {
        toast({
          title: 'Data Cleared',
          description: 'All data has been cleared from storage.',
          variant: 'default',
        });
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to clear data';
      setError(errorMessage);

      if (showErrorToasts) {
        toast({
          title: 'Clear Error',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, showSuccessToasts, showErrorToasts]);

  /**
   * Refresh individual data types
   */
  const refreshStudents = useCallback(async () => {
    try {
      const students = await mockDataService.getData('students');
      dispatch(setStudents(students));
    } catch (err) {
      console.error('Failed to refresh students:', err);
    }
  }, [dispatch]);

  const refreshClassrooms = useCallback(async () => {
    try {
      const classrooms = await mockDataService.getData('classrooms');
      dispatch(setClassrooms(classrooms));
    } catch (err) {
      console.error('Failed to refresh classrooms:', err);
    }
  }, [dispatch]);

  const refreshClasses = useCallback(async () => {
    try {
      const classes = await mockDataService.getData('classes');
      dispatch(setClasses(classes));
    } catch (err) {
      console.error('Failed to refresh classes:', err);
    }
  }, [dispatch]);

  const refreshTeachers = useCallback(async () => {
    try {
      const teachers = await mockDataService.getData('teachers');
      dispatch(setTeachers(teachers));
    } catch (err) {
      console.error('Failed to refresh teachers:', err);
    }
  }, [dispatch]);

  const refreshFinancialData = useCallback(async () => {
    try {
      const obligations = await mockDataService.getData('obligations');
      const payments = await mockDataService.getData('payments');

      dispatch(clearAllFinancialData());

      obligations.forEach((obligation) => {
        dispatch(createObligation(obligation));
      });

      payments.forEach((payment) => {
        dispatch(createPayment(payment));
      });
    } catch (err) {
      console.error('Failed to refresh financial data:', err);
    }
  }, [dispatch]);

  /**
   * Get data statistics
   */
  const getDataStats = useCallback(async () => {
    try {
      return await mockDataService.getDataStats();
    } catch (err) {
      console.error('Failed to get data stats:', err);
      return null;
    }
  }, []);

  /**
   * Export data
   */
  const exportData = useCallback(async (): Promise<string> => {
    try {
      return await mockDataService.exportData();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to export data';
      throw new Error(errorMessage);
    }
  }, []);

  /**
   * Import data
   */
  const importData = useCallback(
    async (jsonString: string) => {
      setIsLoading(true);
      setError(null);

      try {
        await mockDataService.importData(jsonString);
        await loadAllData({ useCache: false }); // Reload from storage

        if (showSuccessToasts) {
          toast({
            title: 'Data Imported',
            description: 'Data has been successfully imported and loaded.',
            variant: 'default',
          });
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to import data';
        setError(errorMessage);

        if (showErrorToasts) {
          toast({
            title: 'Import Error',
            description: errorMessage,
            variant: 'destructive',
          });
        }

        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [loadAllData, showSuccessToasts, showErrorToasts]
  );

  /**
   * Demo reset with user-friendly messaging
   */
  const resetDemoData = useCallback(async () => {
    setIsLoading(true);

    try {
      await resetToDefaults();

      toast({
        title: 'Demo Data Reset',
        description:
          'All demo data has been reset to original values. You can now explore the system with fresh data.',
        variant: 'default',
      });
    } catch (err) {
      toast({
        title: 'Reset Failed',
        description: 'Unable to reset demo data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [resetToDefaults]);

  /**
   * Auto-load data on mount
   */
  useEffect(() => {
    if (loadOnMount && autoLoad && !isInitialized) {
      loadAllData({
        useCache: true,
        validateData: true,
        fallbackToDefault: true,
      });
    }
  }, [loadOnMount, autoLoad, isInitialized, loadAllData]);

  /**
   * Storage availability warning
   */
  useEffect(() => {
    if (!isStorageAvailable && showErrorToasts) {
      toast({
        title: 'Storage Not Available',
        description:
          'Local storage is not available. Data will only persist for this session.',
        variant: 'destructive',
      });
    }
  }, [isStorageAvailable, showErrorToasts]);

  return {
    // Loading states
    isLoading,
    isInitialized,
    error,

    // Data operations
    loadAllData,
    resetToDefaults,
    clearAllData,

    // Individual data type operations
    refreshStudents,
    refreshClassrooms,
    refreshClasses,
    refreshTeachers,
    refreshFinancialData,

    // Utility functions
    getDataStats,
    exportData,
    importData,
    isStorageAvailable,

    // Demo reset
    resetDemoData,
  };
};
