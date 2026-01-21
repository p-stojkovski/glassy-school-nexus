import { useCallback } from 'react';

/**
 * Map of routes to their lazy import functions.
 * These match the lazy() imports in App.tsx.
 */
const routeImports: Record<string, () => Promise<unknown>> = {
  '/': () => import('@/pages/Dashboard'),
  '/students': () => import('@/pages/StudentManagement'),
  '/teachers': () => import('@/pages/Teachers'),
  '/classes': () => import('@/domains/classes/list-page'),
  '/private-lessons': () => import('@/pages/PrivateLessons'),
  '/attendance': () => import('@/pages/AttendanceManagement'),
  '/grades': () => import('@/pages/GradesManagement'),
  '/finance': () => import('@/pages/FinancialManagement'),
  '/settings': () => import('@/pages/SettingsPage'),
};

/**
 * Returns a prefetch function that can be called to preload a route's chunk.
 * Uses requestIdleCallback when available for non-blocking prefetch.
 *
 * @example
 * const prefetch = usePrefetchRoute();
 * <button onMouseEnter={() => prefetch('/students')}>Students</button>
 */
export function usePrefetchRoute() {
  const prefetch = useCallback((route: string) => {
    const importFn = routeImports[route];
    if (!importFn) return;

    // Prefetch on idle to avoid blocking main thread
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => importFn());
    } else {
      // Fallback for browsers without requestIdleCallback (Safari)
      setTimeout(() => importFn(), 100);
    }
  }, []);

  return prefetch;
}

/**
 * Directly prefetch a route without using a hook.
 * Useful for event handlers that don't need React context.
 */
export function prefetchRoute(route: string): void {
  const importFn = routeImports[route];
  if (!importFn) return;

  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => importFn());
  } else {
    setTimeout(() => importFn(), 100);
  }
}

export default usePrefetchRoute;
