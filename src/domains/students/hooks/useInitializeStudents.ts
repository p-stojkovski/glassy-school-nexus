import { useStudentsData } from '@/data/hooks/useStudentsData';
import { useFinancialData } from '@/data/hooks/useFinancialData';

// Hook responsible for lazy loading students and financial data when needed
export const useInitializeStudents = () => {
  // Load students data only when needed
  const studentsHook = useStudentsData({
    autoLoad: true,
    loadOnMount: true,
    showErrorToasts: true,
  });

  // Load financial data only when needed (depends on students)
  const financialHook = useFinancialData({
    autoLoad: true,
    loadOnMount: true,
    showErrorToasts: true,
  });

  // Return refresh functions for external use
  return {
    refreshStudents: studentsHook.refreshData,
    refreshFinancialData: () => {
      financialHook.obligations.refreshData();
      financialHook.payments.refreshData();
    },
    isLoading: studentsHook.isLoading || financialHook.isLoading,
    isInitialized: studentsHook.isInitialized && financialHook.isInitialized,
  };
};
