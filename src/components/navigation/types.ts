import { type LucideIcon } from 'lucide-react';

/**
 * Configuration for a single breadcrumb item
 */
export interface BreadcrumbItemConfig {
  /** Display label for the breadcrumb */
  label: string;
  /** Navigation target - if undefined, this is the current (non-clickable) page */
  href?: string;
  /** Optional icon to display before the label */
  icon?: LucideIcon;
  /** Whether this is the current page (auto-set if href is undefined) */
  isCurrentPage?: boolean;
}

/**
 * Page types for the class domain
 */
export type ClassPageType = 
  | 'list'      // /classes
  | 'details'   // /classes/:classId
  | 'create'    // /classes/new
  | 'edit'      // /classes/:classId/edit
  | 'teaching'; // /classes/:classId/teach/:lessonId

/**
 * Context data for class-related breadcrumbs
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
 * Page types for the student domain
 */
export type StudentPageType = 
  | 'list'    // /students
  | 'details' // /students/:studentId
  | 'create'  // /students/new
  | 'edit';   // /students/:studentId/edit

/**
 * Context data for student-related breadcrumbs
 */
export interface StudentBreadcrumbContext {
  studentData?: {
    id: string;
    name: string;
  } | null;
  pageType: StudentPageType;
}

/**
 * Page types for settings domain
 */
export type SettingsPageType = 'main';

/**
 * Context data for settings-related breadcrumbs
 */
export interface SettingsBreadcrumbContext {
  pageType: SettingsPageType;
  /** Optional active tab name */
  activeTab?: string;
}
