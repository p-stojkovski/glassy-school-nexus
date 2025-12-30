import { useState, useEffect, useCallback, useRef } from 'react';
import { classApiService } from '@/services/classApiService';
import { StudentLessonSummary, StudentLessonDetail } from '@/types/api/class';

/**
 * Cache entry for student summaries.
 */
interface SummariesCacheEntry {
  version: number;
  summaries: StudentLessonSummary[];
}

/**
 * State returned by the useStudentProgressData hook.
 */
export interface StudentProgressDataState {
  /** Student summary data */
  summaries: StudentLessonSummary[];
  /** Loading state for initial data fetch */
  loading: boolean;
  /** Error message if fetch failed */
  error: string | null;
  /** Map of studentId -> lesson details (lazy loaded) */
  lessonDetails: Record<string, StudentLessonDetail[]>;
  /** Set of studentIds currently loading details */
  loadingDetails: Set<string>;
}

/**
 * Actions provided by the useStudentProgressData hook.
 */
export interface StudentProgressDataActions {
  /** Load lesson details for a specific student */
  loadStudentDetails: (studentId: string) => Promise<void>;
  /** Retry fetching summaries after an error */
  retry: () => Promise<void>;
  /** Force refresh the data (bypasses cache) */
  refresh: () => Promise<void>;
}

/**
 * Combined return type for the hook.
 */
export type UseStudentProgressDataReturn = StudentProgressDataState & StudentProgressDataActions;

/**
 * Options for the useStudentProgressData hook.
 */
export interface UseStudentProgressDataOptions {
  /** Class ID to fetch data for */
  classId: string;
  /** Version number - increment to force refetch */
  dataVersion?: number;
  /** Custom API service (for testing) */
  apiService?: typeof classApiService;
}

// Module-level cache (preserved across re-renders but not hot reloads)
const summariesCache = new Map<string, SummariesCacheEntry>();

// In-flight request deduplication
const summariesInFlight = new Map<string, Promise<StudentLessonSummary[]>>();

/**
 * useStudentProgressData - Data fetching hook for student progress.
 *
 * This hook handles:
 * - Fetching student summaries with caching
 * - Lazy loading of student lesson details
 * - Request deduplication (prevents duplicate API calls)
 * - Version-based cache invalidation
 *
 * The hook is designed for testability:
 * - All API calls are made through an injectable service
 * - State is fully exposed for assertions
 * - Side effects are encapsulated in the hook
 *
 * @example
 * const { summaries, loading, error, loadStudentDetails } = useStudentProgressData({
 *   classId: 'abc-123',
 *   dataVersion: 0,
 * });
 *
 * // Load details when user expands a row
 * const handleRowExpand = (studentId: string) => {
 *   loadStudentDetails(studentId);
 * };
 */
export const useStudentProgressData = ({
  classId,
  dataVersion = 0,
  apiService = classApiService,
}: UseStudentProgressDataOptions): UseStudentProgressDataReturn => {
  const [summaries, setSummaries] = useState<StudentLessonSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lessonDetails, setLessonDetails] = useState<Record<string, StudentLessonDetail[]>>({});
  const [loadingDetails, setLoadingDetails] = useState<Set<string>>(new Set());

  // Track if component is mounted to prevent state updates after unmount
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Fetch summaries on mount or when version changes
  useEffect(() => {
    const fetchSummaries = async () => {
      // Check cache first
      const cached = summariesCache.get(classId);
      if (cached && cached.version === dataVersion) {
        setSummaries(cached.summaries);
        setLoading(false);
        return;
      }

      // Check for in-flight request to deduplicate
      const inFlightKey = `${classId}:${dataVersion}`;
      const existingRequest = summariesInFlight.get(inFlightKey);

      if (existingRequest) {
        setLoading(true);
        setError(null);
        try {
          const data = await existingRequest;
          if (isMounted.current) {
            setSummaries(data);
            setLoading(false);
          }
        } catch (err: unknown) {
          if (isMounted.current) {
            setError(err instanceof Error ? err.message : 'Failed to load student summaries');
            setLoading(false);
          }
        }
        return;
      }

      // Make new request
      setLoading(true);
      setError(null);

      try {
        const request = apiService.getClassStudentsSummary(classId);
        summariesInFlight.set(inFlightKey, request);

        const data = await request;

        if (isMounted.current) {
          setSummaries(data);
          summariesCache.set(classId, { version: dataVersion, summaries: data });
        }
      } catch (err: unknown) {
        console.error('Error fetching student summaries:', err);
        if (isMounted.current) {
          setError(err instanceof Error ? err.message : 'Failed to load student summaries');
        }
      } finally {
        summariesInFlight.delete(inFlightKey);
        if (isMounted.current) {
          setLoading(false);
        }
      }
    };

    fetchSummaries();
  }, [classId, dataVersion, apiService]);

  // Load lesson details for a student (lazy loading)
  const loadStudentDetails = useCallback(
    async (studentId: string) => {
      // Skip if already loaded
      if (lessonDetails[studentId]) {
        return;
      }

      // Skip if already loading
      if (loadingDetails.has(studentId)) {
        return;
      }

      setLoadingDetails((prev) => new Set(prev).add(studentId));

      try {
        const details = await apiService.getClassStudentLessons(classId, studentId);

        if (isMounted.current) {
          setLessonDetails((prev) => ({ ...prev, [studentId]: details }));
        }
      } catch (err: unknown) {
        console.error('Error fetching lesson details:', err);
        // We don't set an error state here - the UI can handle missing details gracefully
      } finally {
        if (isMounted.current) {
          setLoadingDetails((prev) => {
            const next = new Set(prev);
            next.delete(studentId);
            return next;
          });
        }
      }
    },
    [classId, lessonDetails, loadingDetails, apiService]
  );

  // Retry fetching summaries after an error
  const retry = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await apiService.getClassStudentsSummary(classId);

      if (isMounted.current) {
        setSummaries(data);
        summariesCache.set(classId, { version: dataVersion, summaries: data });
      }
    } catch (err: unknown) {
      console.error('Error fetching student summaries:', err);
      if (isMounted.current) {
        setError(err instanceof Error ? err.message : 'Failed to load student summaries');
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [classId, dataVersion, apiService]);

  // Force refresh (bypasses cache)
  const refresh = useCallback(async () => {
    // Clear cache entry
    summariesCache.delete(classId);
    // Clear lesson details
    setLessonDetails({});
    // Refetch
    await retry();
  }, [classId, retry]);

  return {
    summaries,
    loading,
    error,
    lessonDetails,
    loadingDetails,
    loadStudentDetails,
    retry,
    refresh,
  };
};

/**
 * Clear the summaries cache (for testing or forced refresh scenarios).
 */
export const clearStudentProgressCache = (classId?: string) => {
  if (classId) {
    summariesCache.delete(classId);
  } else {
    summariesCache.clear();
  }
};

export default useStudentProgressData;
