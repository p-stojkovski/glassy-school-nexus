import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAcademicYears } from '@/hooks/useAcademicYears';
import { AcademicYear } from '@/domains/settings/types/academicCalendarTypes';

export interface UseTeacherAcademicYearReturn {
  selectedYear: AcademicYear | null;
  selectedYearId: string | null;
  setSelectedYearId: (id: string) => void;
  years: AcademicYear[];
  isLoading: boolean;
  isBetweenYears: boolean;
  betweenYearsMessage: string | null;
}

/**
 * Hook for managing academic year selection in teacher detail page
 * 
 * Features:
 * - Reads/writes `year` query param from URL
 * - Fetches all academic years
 * - Auto-selects active year or most recent year if between academic years
 * - Detects "between years" state (no active year contains today)
 * 
 * URL Pattern: /teachers/:teacherId?year=<academic-year-id>
 */
export const useTeacherAcademicYear = (): UseTeacherAcademicYearReturn => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { years, isLoading, error } = useAcademicYears();
  const [isInitialized, setIsInitialized] = useState(false);

  // Get year ID from URL
  const yearIdFromUrl = searchParams.get('year');

  // Determine active year and between-years state
  const { activeYear, isBetweenYears } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time for date comparison

    const active = years.find((year) => {
      const start = new Date(year.startDate);
      const end = new Date(year.endDate);
      return start <= today && today <= end;
    });

    return {
      activeYear: active || null,
      isBetweenYears: !active && years.length > 0,
    };
  }, [years]);

  // Determine default year (active or most recent)
  const defaultYear = useMemo(() => {
    if (activeYear) return activeYear;

    // If between years, select the most recent year (by endDate)
    if (years.length > 0) {
      const sorted = [...years].sort((a, b) => 
        new Date(b.endDate).getTime() - new Date(a.endDate).getTime()
      );
      return sorted[0];
    }

    return null;
  }, [activeYear, years]);

  // Auto-select default year on initial load if no URL param
  useEffect(() => {
    if (isLoading || isInitialized) return;

    if (!yearIdFromUrl && defaultYear) {
      // Set URL param to default year
      setSearchParams({ year: defaultYear.id }, { replace: true });
    }

    setIsInitialized(true);
  }, [yearIdFromUrl, defaultYear, isLoading, isInitialized, setSearchParams]);

  // Selected year object
  const selectedYear = useMemo(() => {
    if (!yearIdFromUrl) return defaultYear;
    return years.find((y) => y.id === yearIdFromUrl) || defaultYear;
  }, [yearIdFromUrl, years, defaultYear]);

  // Selected year ID
  const selectedYearId = selectedYear?.id || null;

  // Setter for year selection
  const setSelectedYearId = (id: string) => {
    setSearchParams({ year: id });
  };

  // Between years message
  const betweenYearsMessage = useMemo(() => {
    if (!isBetweenYears || !selectedYear) return null;
    return `Currently between academic years. Showing ${selectedYear.name}.`;
  }, [isBetweenYears, selectedYear]);

  return {
    selectedYear,
    selectedYearId,
    setSelectedYearId,
    years,
    isLoading,
    isBetweenYears,
    betweenYearsMessage,
  };
};
