import { Home, GraduationCap, Users, Settings } from 'lucide-react';
import type { BreadcrumbItemConfig } from './types';

/**
 * Base breadcrumb segments used across the application
 */
export const BASE_BREADCRUMBS = {
  /** Dashboard / Home segment */
  dashboard: {
    label: 'Dashboard',
    href: '/',
    icon: Home,
  } satisfies BreadcrumbItemConfig,

  /** Classes list segment */
  classes: {
    label: 'Classes',
    href: '/classes',
    icon: GraduationCap,
  } satisfies BreadcrumbItemConfig,

  /** Students list segment */
  students: {
    label: 'Students',
    href: '/students',
    icon: Users,
  } satisfies BreadcrumbItemConfig,

  /** Settings segment */
  settings: {
    label: 'Settings',
    href: '/settings',
    icon: Settings,
  } satisfies BreadcrumbItemConfig,

  /** Teachers list segment */
  teachers: {
    label: 'Teachers',
    href: '/teachers',
    icon: Users,
  } satisfies BreadcrumbItemConfig,
} as const;

/**
 * Placeholder text for loading states
 */
export const BREADCRUMB_PLACEHOLDER = '...';
