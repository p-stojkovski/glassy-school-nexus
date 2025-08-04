/**
 * useFinancialData - Domain-specific hook for financial data
 *
 * Provides lazy loading for financial data (obligations and payments)
 * with dependencies on students data.
 */

import { useDomainData, type UseDomainDataOptions } from './useDomainData';
import { useAppDispatch } from '@/store/hooks';
import { useCallback } from 'react';
import {
  createObligation,
  createPayment,
  clearAllFinancialData,
} from '@/domains/finance/financeSlice';
import type {
  PaymentObligation,
  Payment,
} from '@/domains/finance/financeSlice';

/**
 * Custom dispatch function for obligations array
 */
const useObligationsDispatch = () => {
  const dispatch = useAppDispatch();

  return useCallback(
    (obligations: PaymentObligation[]) => {
      // Clear existing obligations
      dispatch(clearAllFinancialData());

      // Add each obligation individually
      obligations.forEach((obligation) => {
        dispatch(createObligation(obligation));
      });
    },
    [dispatch]
  );
};

/**
 * Custom dispatch function for payments array
 */
const usePaymentsDispatch = () => {
  const dispatch = useAppDispatch();

  return useCallback(
    (payments: Payment[]) => {
      // Add each payment individually (obligations should be loaded first)
      payments.forEach((payment) => {
        dispatch(createPayment(payment));
      });
    },
    [dispatch]
  );
};

export const useFinancialObligationsData = (
  options: UseDomainDataOptions = {}
) => {
  const obligationsDispatch = useObligationsDispatch();

  return useDomainData('obligations', obligationsDispatch, undefined, {
    ...options,
    autoLoad: options.autoLoad ?? true,
    loadOnMount: options.loadOnMount ?? true,
    // Financial data depends on students
    dependencies: options.dependencies ?? ['students'],
  });
};

export const useFinancialPaymentsData = (
  options: UseDomainDataOptions = {}
) => {
  const paymentsDispatch = usePaymentsDispatch();

  return useDomainData('payments', paymentsDispatch, undefined, {
    ...options,
    autoLoad: options.autoLoad ?? true,
    loadOnMount: options.loadOnMount ?? true,
    // Payments depend on obligations being loaded first
    dependencies: options.dependencies ?? ['students', 'obligations'],
  });
};

/**
 * Combined hook for both obligations and payments
 */
export const useFinancialData = (options: UseDomainDataOptions = {}) => {
  const obligationsHook = useFinancialObligationsData(options);
  const paymentsHook = useFinancialPaymentsData(options);

  return {
    obligations: obligationsHook,
    payments: paymentsHook,
    isLoading: obligationsHook.isLoading || paymentsHook.isLoading,
    isInitialized: obligationsHook.isInitialized && paymentsHook.isInitialized,
    error: obligationsHook.error || paymentsHook.error,
  };
};
