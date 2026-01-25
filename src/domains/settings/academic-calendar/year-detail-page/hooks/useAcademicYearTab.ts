import { useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

export type AcademicYearTab = 'semesters' | 'teaching-breaks';

const VALID_TABS: AcademicYearTab[] = ['semesters', 'teaching-breaks'];
const DEFAULT_TAB: AcademicYearTab = 'semesters';

export interface UseAcademicYearTabReturn {
  activeTab: AcademicYearTab;
  setActiveTab: (tab: AcademicYearTab) => void;
}

/**
 * Hook to manage academic year detail page tab state with URL query param persistence.
 * Following the pattern from useTeacherProfile.ts.
 */
export function useAcademicYearTab(): UseAcademicYearTabReturn {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read initial tab from URL, default to 'semesters'
  const tabFromUrl = searchParams.get('tab');
  const initialTab: AcademicYearTab = 
    tabFromUrl && VALID_TABS.includes(tabFromUrl as AcademicYearTab)
      ? (tabFromUrl as AcademicYearTab)
      : DEFAULT_TAB;

  const [activeTab, setActiveTabState] = useState<AcademicYearTab>(initialTab);

  // Update URL when tab changes
  const setActiveTab = useCallback((tab: AcademicYearTab) => {
    setActiveTabState(tab);
    // Update URL parameter to preserve tab state
    const newParams = new URLSearchParams(searchParams);
    newParams.set('tab', tab);
    setSearchParams(newParams, { replace: true });
  }, [searchParams, setSearchParams]);

  return {
    activeTab,
    setActiveTab,
  };
}
