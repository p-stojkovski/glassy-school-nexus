import { useState, useCallback, useRef, useEffect } from 'react';
import { StudentLessonDetail } from '@/types/api/class';
import {
  StudentHistorySummary,
  ExpandedStudentState,
} from '@/types/api/lesson-history';
import {
  getStudentRecentHistory,
  calculateHistorySummary,
} from '@/services/lessonStudentApiService';

interface UseStudentHistoryExpansionProps {
  classId: string;
  currentLessonId: string;
}

interface UseStudentHistoryExpansionReturn {
  /** Toggle expansion for a student (expands if collapsed, collapses if expanded) */
  toggleExpansion: (studentId: string) => void;

  /** Check if a student row is currently expanded */
  isExpanded: (studentId: string) => boolean;

  /** Get cached history for a student (empty array if not loaded) */
  getHistory: (studentId: string) => StudentLessonDetail[];

  /** Get calculated summary for a student (null if not loaded) */
  getSummary: (studentId: string) => StudentHistorySummary | null;

  /** Check if history is currently loading for a student */
  isLoading: (studentId: string) => boolean;

  /** Get error message for a student (null if no error) */
  getError: (studentId: string) => string | null;

  /** Retry loading history after an error */
  retryLoad: (studentId: string) => void;
}

/**
 * useStudentHistoryExpansion - Manages expansion state for student history rows.
 *
 * Features:
 * - Lazy loading: History is only fetched when a student is expanded for the first time
 * - Caching: Once loaded, history is cached for the page session
 * - Independent states: Each student has independent loading/error states
 * - Multiple expansions: Multiple students can be expanded simultaneously
 *
 * @example
 * const {
 *   toggleExpansion,
 *   isExpanded,
 *   getHistory,
 *   getSummary,
 *   isLoading,
 *   getError,
 *   retryLoad,
 * } = useStudentHistoryExpansion({
 *   classId: 'class-123',
 *   currentLessonId: 'lesson-456',
 * });
 *
 * // Toggle expansion on row click
 * <Button onClick={() => toggleExpansion(studentId)}>
 *   {isExpanded(studentId) ? 'Collapse' : 'Expand'}
 * </Button>
 */
export function useStudentHistoryExpansion({
  classId,
  currentLessonId,
}: UseStudentHistoryExpansionProps): UseStudentHistoryExpansionReturn {
  const [studentStates, setStudentStates] = useState<Map<string, ExpandedStudentState>>(
    new Map()
  );

  // Track if component is mounted to prevent state updates after unmount
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  /**
   * Fetch history for a student and update state.
   * This is called internally when a student is expanded for the first time or on retry.
   */
  const fetchHistory = useCallback(
    async (studentId: string) => {
      // Set loading state
      setStudentStates((prev) => {
        const newMap = new Map(prev);
        const current = prev.get(studentId);
        newMap.set(studentId, {
          isExpanded: true,
          isLoading: true,
          error: null,
          history: current?.history ?? [],
          summary: current?.summary ?? null,
        });
        return newMap;
      });

      try {
        const history = await getStudentRecentHistory(
          classId,
          studentId,
          currentLessonId
        );

        if (isMounted.current) {
          const summary = calculateHistorySummary(history);

          setStudentStates((prev) => {
            const newMap = new Map(prev);
            newMap.set(studentId, {
              isExpanded: true,
              isLoading: false,
              error: null,
              history,
              summary,
            });
            return newMap;
          });
        }
      } catch (err: unknown) {
        if (isMounted.current) {
          const errorMessage =
            err instanceof Error ? err.message : 'Failed to load lesson history';

          setStudentStates((prev) => {
            const newMap = new Map(prev);
            const current = prev.get(studentId);
            newMap.set(studentId, {
              isExpanded: true,
              isLoading: false,
              error: errorMessage,
              history: current?.history ?? [],
              summary: current?.summary ?? null,
            });
            return newMap;
          });
        }
      }
    },
    [classId, currentLessonId]
  );

  /**
   * Toggle expansion for a student.
   * - If collapsed: expands and fetches history if not already cached
   * - If expanded: collapses but keeps cached data
   */
  const toggleExpansion = useCallback(
    (studentId: string) => {
      setStudentStates((prev) => {
        const newMap = new Map(prev);
        const current = prev.get(studentId);

        if (current?.isExpanded) {
          // Collapse: keep cached data, just toggle flag
          newMap.set(studentId, {
            ...current,
            isExpanded: false,
          });
          return newMap;
        } else {
          // Expand - always fetch fresh data
          newMap.set(studentId, {
            isExpanded: true,
            isLoading: true,
            error: null,
            history: current?.history ?? [],
            summary: current?.summary ?? null,
          });
          // Trigger fetch outside of setState to avoid issues
          setTimeout(() => fetchHistory(studentId), 0);
          return newMap;
        }
      });
    },
    [fetchHistory]
  );

  /**
   * Retry loading history after an error.
   * Clears the error and re-fetches.
   */
  const retryLoad = useCallback(
    (studentId: string) => {
      fetchHistory(studentId);
    },
    [fetchHistory]
  );

  // Accessor functions with stable references
  const isExpanded = useCallback(
    (studentId: string): boolean => {
      return studentStates.get(studentId)?.isExpanded ?? false;
    },
    [studentStates]
  );

  const getHistory = useCallback(
    (studentId: string): StudentLessonDetail[] => {
      return studentStates.get(studentId)?.history ?? [];
    },
    [studentStates]
  );

  const getSummary = useCallback(
    (studentId: string): StudentHistorySummary | null => {
      return studentStates.get(studentId)?.summary ?? null;
    },
    [studentStates]
  );

  const isLoading = useCallback(
    (studentId: string): boolean => {
      return studentStates.get(studentId)?.isLoading ?? false;
    },
    [studentStates]
  );

  const getError = useCallback(
    (studentId: string): string | null => {
      return studentStates.get(studentId)?.error ?? null;
    },
    [studentStates]
  );

  return {
    toggleExpansion,
    isExpanded,
    getHistory,
    getSummary,
    isLoading,
    getError,
    retryLoad,
  };
}

export default useStudentHistoryExpansion;
