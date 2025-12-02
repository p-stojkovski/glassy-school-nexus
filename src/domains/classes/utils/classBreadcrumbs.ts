import { BookOpen } from 'lucide-react';
import {
  BreadcrumbItemConfig,
  ClassPageType,
  BASE_BREADCRUMBS,
  BREADCRUMB_PLACEHOLDER,
} from '@/components/navigation';

/**
 * Context data for class-related breadcrumbs (local extension)
 */
export interface ClassBreadcrumbContext {
  /** Class data (optional - may be loading) */
  classData?: {
    id: string;
    name: string;
  } | null;
  /** Lesson data for teaching page (optional) */
  lessonData?: {
    id: string;
    scheduledDate?: string;
    statusName?: string;
  } | null;
  /** The type of page being rendered */
  pageType: ClassPageType;
}

/**
 * Builds breadcrumb items for class domain pages
 * 
 * @param context - The breadcrumb context containing class/lesson data and page type
 * @returns Array of breadcrumb items ready to render
 * 
 * @example
 * // Class details page
 * buildClassBreadcrumbs({ classData: { id: '1', name: 'Math 101' }, pageType: 'details' })
 * // Returns: [Dashboard, Classes, "Math 101"]
 * 
 * @example
 * // Teaching page
 * buildClassBreadcrumbs({ 
 *   classData: { id: '1', name: 'Math 101' }, 
 *   lessonData: { id: 'L1' },
 *   pageType: 'teaching' 
 * })
 * // Returns: [Dashboard, Classes, "Math 101" (clickable), "Teaching"]
 */
export function buildClassBreadcrumbs(context: ClassBreadcrumbContext): BreadcrumbItemConfig[] {
  const { classData, pageType } = context;
  
  // Start with base breadcrumbs
  const items: BreadcrumbItemConfig[] = [
    BASE_BREADCRUMBS.dashboard,
    BASE_BREADCRUMBS.classes,
  ];

  switch (pageType) {
    case 'list':
      // Dashboard → Classes (current)
      // Mark Classes as current page
      items[items.length - 1] = {
        ...items[items.length - 1],
        href: undefined,
        isCurrentPage: true,
      };
      break;

    case 'details':
      // Dashboard → Classes → [Class Name]
      items.push({
        label: classData?.name ?? BREADCRUMB_PLACEHOLDER,
        isCurrentPage: true,
      });
      break;

    case 'create':
      // Dashboard → Classes → New Class
      items.push({
        label: 'New Class',
        isCurrentPage: true,
      });
      break;

    case 'edit':
      // Dashboard → Classes → Edit [Class Name]
      items.push({
        label: classData?.name 
          ? `Edit ${classData.name}` 
          : 'Edit Class',
        isCurrentPage: true,
      });
      break;

    case 'teaching':
      // Dashboard → Classes → [Class Name] (clickable) → Teaching
      if (classData) {
        items.push({
          label: classData.name,
          href: `/classes/${classData.id}`,
        });
      } else {
        items.push({
          label: BREADCRUMB_PLACEHOLDER,
          href: undefined,
        });
      }
      items.push({
        label: 'Teaching',
        icon: BookOpen,
        isCurrentPage: true,
      });
      break;
  }

  return items;
}

/**
 * Gets the teaching mode breadcrumb label based on lesson data
 * Can be customized to show date or other lesson-specific info
 */
export function getTeachingModeLabel(lessonData?: ClassBreadcrumbContext['lessonData']): string {
  if (!lessonData) {
    return 'Teaching';
  }
  
  // Option: Show date with teaching mode
  // if (lessonData.scheduledDate) {
  //   const date = new Date(lessonData.scheduledDate);
  //   return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - Teaching`;
  // }
  
  return 'Teaching';
}
