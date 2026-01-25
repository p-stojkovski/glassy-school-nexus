import { Calendar } from 'lucide-react';
import {
  BreadcrumbItemConfig,
  BASE_BREADCRUMBS,
  BREADCRUMB_PLACEHOLDER,
} from '@/components/navigation';

/**
 * Page types for academic year detail pages
 */
export type AcademicYearPageType = 'details';

/**
 * Context data for academic year breadcrumbs
 */
export interface AcademicYearBreadcrumbContext {
  /** Academic year data (optional - may be loading) */
  yearData?: {
    id: string;
    name: string;
  } | null;
  /** The type of page being rendered */
  pageType: AcademicYearPageType;
}

/**
 * Academic Calendar breadcrumb segment
 */
const ACADEMIC_CALENDAR_BREADCRUMB: BreadcrumbItemConfig = {
  label: 'Academic Calendar',
  href: '/settings?tab=academic-calendar',
  icon: Calendar,
};

/**
 * Builds breadcrumb items for academic year detail pages
 *
 * @param context - The breadcrumb context containing year data and page type
 * @returns Array of breadcrumb items ready to render
 *
 * @example
 * // Year details page
 * buildAcademicYearBreadcrumbs({ yearData: { id: '1', name: '2024-2025' }, pageType: 'details' })
 * // Returns: [Settings, Academic Calendar, "2024-2025"]
 */
export function buildAcademicYearBreadcrumbs(
  context: AcademicYearBreadcrumbContext
): BreadcrumbItemConfig[] {
  const { yearData, pageType } = context;

  // Start with base breadcrumbs: Settings > Academic Calendar
  const items: BreadcrumbItemConfig[] = [
    BASE_BREADCRUMBS.settings,
    ACADEMIC_CALENDAR_BREADCRUMB,
  ];

  switch (pageType) {
    case 'details':
      // Settings → Academic Calendar → [Year Name]
      items.push({
        label: yearData?.name ?? BREADCRUMB_PLACEHOLDER,
        isCurrentPage: true,
      });
      break;
  }

  return items;
}
