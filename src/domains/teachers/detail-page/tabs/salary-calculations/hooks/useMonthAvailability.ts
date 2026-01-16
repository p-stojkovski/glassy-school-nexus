/**
 * useMonthAvailability - Month selection logic for salary calculation generation
 * Extracted from GenerateSalaryDialog.tsx (Phase 3.1 refactoring)
 * 
 * Purpose: Determines which months are available for salary generation by:
 * - Checking which months already have salary calculations
 * - Preventing selection of future months
 * - Auto-selecting first available month when year changes
 */
import { useMemo, useEffect, useCallback } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { MONTHS } from '@/domains/teachers/_shared/constants';
import type { SalaryCalculation } from '@/domains/teachers/_shared/types/salaryCalculation.types';
import type { GenerateSalaryFormData } from '@/domains/teachers/schemas';

export interface UseMonthAvailabilityOptions {
  /**
   * Existing salary calculations to check against
   */
  existingCalculations: SalaryCalculation[];
  
  /**
   * Selected year from the form
   */
  selectedYear: number;
  
  /**
   * react-hook-form instance for auto-updating month selection
   */
  form: UseFormReturn<GenerateSalaryFormData>;
  
  /**
   * Whether the dialog is open (for initialization)
   */
  isOpen: boolean;
}

export interface UseMonthAvailabilityReturn {
  /**
   * Set of month numbers (1-12) that already have calculations for selected year
   */
  generatedMonthsForYear: Set<number>;
  
  /**
   * Check if a specific month is in the future
   */
  isFutureMonth: (year: number, month: number) => boolean;
  
  /**
   * Whether all available months for selected year have been generated
   */
  isAllMonthsGenerated: boolean;
  
  /**
   * Current year (for reference)
   */
  currentYear: number;
  
  /**
   * Current month (1-based, for reference)
   */
  currentMonth: number;
}

/**
 * Hook to manage month availability logic for salary calculation generation
 */
export const useMonthAvailability = ({
  existingCalculations,
  selectedYear,
  form,
  isOpen,
}: UseMonthAvailabilityOptions): UseMonthAvailabilityReturn => {
  // Current date context
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1-based

  // Compute which months already have salary calculations for the selected year
  const generatedMonthsForYear = useMemo(() => {
    const monthsSet = new Set<number>();
    existingCalculations.forEach((calc) => {
      if (calc?.periodStart) {
        const date = new Date(calc.periodStart);
        if (date.getFullYear() === selectedYear) {
          monthsSet.add(date.getMonth() + 1); // 1-based month
        }
      }
    });
    return monthsSet;
  }, [existingCalculations, selectedYear]);

  // Check if a month is in the future (for current year)
  const isFutureMonth = useCallback((year: number, month: number): boolean => {
    if (year < currentYear) return false; // Past year = all months valid
    if (year > currentYear) return true; // Future year = all months invalid
    return month > currentMonth; // Current year = check month
  }, [currentYear, currentMonth]);

  // Find first available (non-generated, non-future) month for a given year
  const findFirstAvailableMonth = useCallback((year: number): number => {
    const monthsForYear = new Set<number>();
    existingCalculations.forEach((calc) => {
      if (calc?.periodStart) {
        const date = new Date(calc.periodStart);
        if (date.getFullYear() === year) {
          monthsForYear.add(date.getMonth() + 1);
        }
      }
    });

    // For current year, only consider months up to current month
    const maxMonth = year === currentYear ? currentMonth : 12;

    // Try current month first (if not future), then find any available month
    if (!monthsForYear.has(currentMonth) && currentMonth <= maxMonth) return currentMonth;
    for (let m = 1; m <= maxMonth; m++) {
      if (!monthsForYear.has(m)) return m;
    }
    return currentMonth; // Fallback
  }, [existingCalculations, currentYear, currentMonth]);

  // Reset form when dialog opens - set first available month
  useEffect(() => {
    if (isOpen) {
      const firstAvailableMonth = findFirstAvailableMonth(currentYear);
      form.reset({
        year: currentYear,
        month: firstAvailableMonth,
      });
    }
  }, [isOpen, form, currentYear, findFirstAvailableMonth]);

  // When year changes, auto-select first available month if current selection is disabled or future
  useEffect(() => {
    const currentMonthValue = form.getValues('month');
    const isCurrentDisabled = generatedMonthsForYear.has(currentMonthValue) || isFutureMonth(selectedYear, currentMonthValue);
    if (isCurrentDisabled) {
      const firstAvailable = findFirstAvailableMonth(selectedYear);
      const isFirstAvailableValid = !generatedMonthsForYear.has(firstAvailable) && !isFutureMonth(selectedYear, firstAvailable);
      if (isFirstAvailableValid) {
        form.setValue('month', firstAvailable);
      }
    }
  }, [selectedYear, generatedMonthsForYear, form, findFirstAvailableMonth, isFutureMonth]);

  // Check if all available months for selected year are generated
  const isAllMonthsGenerated = (() => {
    const maxMonth = selectedYear === currentYear ? currentMonth : 12;
    const generatedAvailableCount = Array.from(generatedMonthsForYear).filter(m => m <= maxMonth).length;
    return generatedAvailableCount === maxMonth;
  })();

  return {
    generatedMonthsForYear,
    isFutureMonth,
    isAllMonthsGenerated,
    currentYear,
    currentMonth,
  };
};
