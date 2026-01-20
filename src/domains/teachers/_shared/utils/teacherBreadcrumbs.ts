import {
  BreadcrumbItemConfig,
  TeacherPageType,
  BASE_BREADCRUMBS,
  BREADCRUMB_PLACEHOLDER,
} from '@/components/navigation';

/**
 * Context data for teacher-related breadcrumbs (local extension)
 */
export interface TeacherBreadcrumbContext {
  /** Teacher data (optional - may be loading) */
  teacherData?: {
    id: number;
    name: string;
  } | null;
  /** Salary calculation data for salary-detail page */
  salaryData?: {
    periodDisplay: string;
  } | null;
  /** The type of page being rendered */
  pageType: TeacherPageType;
}

/**
 * Builds breadcrumb items for teacher domain pages
 *
 * @param context - The breadcrumb context containing teacher data and page type
 * @returns Array of breadcrumb items ready to render
 *
 * @example
 * // Teacher details page
 * buildTeacherBreadcrumbs({ teacherData: { id: 1, name: 'John Smith' }, pageType: 'details' })
 * // Returns: [Dashboard, Teachers, "John Smith"]
 */
export function buildTeacherBreadcrumbs(
  context: TeacherBreadcrumbContext
): BreadcrumbItemConfig[] {
  const { teacherData, pageType } = context;

  // Start with base breadcrumbs
  const items: BreadcrumbItemConfig[] = [
    BASE_BREADCRUMBS.dashboard,
    BASE_BREADCRUMBS.teachers,
  ];

  switch (pageType) {
    case 'list':
      // Dashboard → Teachers (current)
      // Mark Teachers as current page
      items[items.length - 1] = {
        ...items[items.length - 1],
        href: undefined,
        isCurrentPage: true,
      };
      break;

    case 'details':
      // Dashboard → Teachers → [Teacher Name]
      items.push({
        label: teacherData?.name ?? BREADCRUMB_PLACEHOLDER,
        isCurrentPage: true,
      });
      break;

    case 'create':
      // Dashboard → Teachers → New Teacher
      items.push({
        label: 'New Teacher',
        isCurrentPage: true,
      });
      break;

    case 'edit':
      // Dashboard → Teachers → Edit [Teacher Name]
      items.push({
        label: teacherData?.name
          ? `Edit ${teacherData.name}`
          : 'Edit Teacher',
        isCurrentPage: true,
      });
      break;

    case 'salary-detail':
      // Dashboard → Teachers → [Teacher Name] → Salary Calculations → [Period]
      if (teacherData) {
        items.push({
          label: teacherData.name,
          href: `/teachers/${teacherData.id}`,
        });
      }
      items.push({
        label: 'Salary Calculations',
        href: teacherData ? `/teachers/${teacherData.id}?tab=salary` : undefined,
      });
      items.push({
        label: context.salaryData?.periodDisplay ?? BREADCRUMB_PLACEHOLDER,
        isCurrentPage: true,
      });
      break;
  }

  return items;
}
