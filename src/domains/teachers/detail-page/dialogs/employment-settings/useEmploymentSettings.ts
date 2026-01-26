import { useState, useEffect, useCallback } from 'react';
import { getEmploymentSettings, getSalaryCalculations } from '@/services/teacherApiService';
import type { EmploymentSettingsResponse } from '@/types/api/teacher';

/** Represents a month with an approved salary calculation */
export interface ApprovedMonth {
  year: number;
  month: number; // 0-indexed (January = 0)
}

/**
 * Check if a date falls within an approved month
 * @param date - The date to check
 * @param approvedMonths - List of months with approved salary calculations
 * @returns true if the date should be disabled (falls in an approved month)
 */
export function isDateInApprovedMonth(date: Date, approvedMonths: ApprovedMonth[]): boolean {
  return approvedMonths.some(
    (am) => am.year === date.getFullYear() && am.month === date.getMonth()
  );
}

interface UseEmploymentSettingsParams {
  teacherId: string;
  academicYearId: string;
  open: boolean;
}

interface UseEmploymentSettingsReturn {
  employmentData: EmploymentSettingsResponse | null;
  loadingEmploymentData: boolean;
  approvedMonths: ApprovedMonth[];
  loadingApprovedMonths: boolean;
  approvedMonthsError: string | null;
  /** Matcher function for DatePicker to disable dates in approved months */
  disabledDateMatcher: (date: Date) => boolean;
}

export function useEmploymentSettings({
  teacherId,
  academicYearId,
  open,
}: UseEmploymentSettingsParams): UseEmploymentSettingsReturn {
  const [approvedMonths, setApprovedMonths] = useState<ApprovedMonth[]>([]);
  const [loadingApprovedMonths, setLoadingApprovedMonths] = useState(false);
  const [approvedMonthsError, setApprovedMonthsError] = useState<string | null>(null);
  const [employmentData, setEmploymentData] = useState<EmploymentSettingsResponse | null>(null);
  const [loadingEmploymentData, setLoadingEmploymentData] = useState(false);

  // Fetch employment settings data
  const fetchEmploymentData = useCallback(async () => {
    setLoadingEmploymentData(true);
    try {
      const data = await getEmploymentSettings(teacherId, academicYearId);
      setEmploymentData(data);
    } catch (err) {
      console.error('Failed to fetch employment settings:', err);
      // Graceful degradation: use teacher prop data
      setEmploymentData(null);
    } finally {
      setLoadingEmploymentData(false);
    }
  }, [teacherId, academicYearId]);

  // Fetch approved salary months
  const fetchApprovedMonths = useCallback(async () => {
    setLoadingApprovedMonths(true);
    setApprovedMonthsError(null);
    try {
      const calculations = await getSalaryCalculations(teacherId, { status: 'approved' });
      const months: ApprovedMonth[] = calculations.map((calc) => {
        const date = new Date(calc.periodStart);
        return {
          year: date.getFullYear(),
          month: date.getMonth(),
        };
      });
      setApprovedMonths(months);
    } catch (err) {
      console.error('Failed to fetch approved months:', err);
      setApprovedMonthsError('Could not load blocked months');
      // Graceful degradation: allow all dates if fetch fails
      setApprovedMonths([]);
    } finally {
      setLoadingApprovedMonths(false);
    }
  }, [teacherId]);

  // Fetch data when sheet opens
  useEffect(() => {
    if (open) {
      fetchEmploymentData();
      fetchApprovedMonths();
    }
  }, [open, fetchEmploymentData, fetchApprovedMonths]);

  // Create the disabled date matcher for DatePicker
  const disabledDateMatcher = useCallback(
    (date: Date): boolean => {
      return isDateInApprovedMonth(date, approvedMonths);
    },
    [approvedMonths]
  );

  return {
    employmentData,
    loadingEmploymentData,
    approvedMonths,
    loadingApprovedMonths,
    approvedMonthsError,
    disabledDateMatcher,
  };
}
