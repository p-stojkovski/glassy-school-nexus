import { useState, useRef, useCallback, useEffect } from 'react';
import { LessonConflict } from '@/types/api/lesson';
import { ScheduleConflictInfo } from '@/types/api/scheduleValidation';
import { classApiService } from '@/services/classApiService';

interface UseScheduleConflictCheckParams {
  classId: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  generateLessons: boolean;
  rangeType: 'UntilYearEnd' | 'UntilSemesterEnd' | 'Custom';
  customEndDate?: string;
}

interface UseScheduleConflictCheckReturn {
  conflicts: LessonConflict[];
  checking: boolean;
  error: string | null;
  hasConflicts: boolean;
  dateRangeContext: string;
  clear: () => void;
}

const DEBOUNCE_DELAY = 500; // ms

/**
 * Maps ScheduleConflictInfo to LessonConflict[] for display in ConflictPanel
 */
function mapToLessonConflicts(conflictInfo: ScheduleConflictInfo): LessonConflict[] {
  const result: LessonConflict[] = [];

  for (const detail of conflictInfo.conflicts) {
    // Parse timeRange "09:00-11:00" into start and end times
    const [startTime, endTime] = detail.timeRange.split('-').map(t => t.trim());

    for (const instance of detail.instances) {
      result.push({
        conflictType: detail.conflictType === 'class_conflict'
          ? 'existing_lesson'
          : detail.conflictType,
        conflictingLessonId: instance.conflictingLessonId,
        conflictDetails: `${detail.dayOfWeek} ${detail.timeRange} - schedule conflict`,
        conflictingClassName: instance.conflictingClassName,
        scheduledDate: instance.date,
        startTime,
        endTime,
      });
    }
  }

  return result;
}

/**
 * Generates human-readable date range context based on rangeType
 */
function getDateRangeContext(rangeType: string, isUsingFallback: boolean): string {
  if (isUsingFallback) {
    return 'Conflicts checked across all future lessons (no active academic year found)';
  }

  switch (rangeType) {
    case 'UntilSemesterEnd':
      return 'Conflicts checked until end of current semester';
    case 'UntilYearEnd':
    default:
      return 'Conflicts checked until end of academic year';
  }
}

export const useScheduleConflictCheck = (): UseScheduleConflictCheckReturn & {
  runCheck: (params: UseScheduleConflictCheckParams) => void;
} => {
  const [conflicts, setConflicts] = useState<LessonConflict[]>([]);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateRangeContext, setDateRangeContext] = useState('');

  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastCheckRef = useRef<string>('');
  const checkingRef = useRef<boolean>(false);

  // Clear conflicts and reset state
  const clear = useCallback(() => {
    setConflicts([]);
    setError(null);
    setDateRangeContext('');
  }, []);

  // Run conflict check
  const runCheck = useCallback(async (params: UseScheduleConflictCheckParams) => {
    const { classId, dayOfWeek, startTime, endTime, generateLessons, rangeType } = params;

    // Skip if generateLessons is false (no lessons = no conflicts)
    if (!generateLessons) {
      clear();
      return;
    }

    // Skip if required fields are missing or invalid
    if (!classId || !dayOfWeek || !startTime || !endTime) {
      clear();
      return;
    }

    // Validate time range
    if (endTime <= startTime) {
      clear();
      return;
    }

    // Create a unique key for this check to avoid duplicate calls
    const checkKey = `${classId}-${dayOfWeek}-${startTime}-${endTime}-${rangeType}`;

    // Skip if this exact check is already in progress
    if (lastCheckRef.current === checkKey || checkingRef.current) {
      return;
    }

    // Clear any existing debounce timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Immediately set checking state and record this scheduled check
    const scheduledKey = checkKey;
    lastCheckRef.current = scheduledKey;
    checkingRef.current = true;
    setChecking(true);
    setError(null);

    // Debounce the actual API call
    debounceTimeoutRef.current = setTimeout(async () => {
      try {
        // If a newer check was scheduled, abort this one
        if (lastCheckRef.current !== scheduledKey) {
          return;
        }

        // Call validation endpoint with single schedule slot
        const response = await classApiService.validateScheduleChanges(classId, {
          newSchedule: [
            {
              dayOfWeek,
              startTime,
              endTime,
            },
          ],
          rangeType: rangeType as any,
        });

        // Only apply results if this is still the latest check
        if (lastCheckRef.current === scheduledKey) {
          const mappedConflicts = mapToLessonConflicts(response.conflictInfo);
          setConflicts(mappedConflicts);
          setDateRangeContext(getDateRangeContext(rangeType, response.conflictInfo.isUsingFallbackDateRange));
        }
      } catch (err: any) {
        console.error('Schedule conflict check failed:', err);
        if (lastCheckRef.current === scheduledKey) {
          setError(err.message || 'Failed to check for conflicts');
          setConflicts([]);
        }
      } finally {
        if (lastCheckRef.current === scheduledKey) {
          checkingRef.current = false;
          setChecking(false);
        }
      }
    }, DEBOUNCE_DELAY);
  }, [clear]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const hasConflicts = conflicts.length > 0;

  return {
    conflicts,
    checking,
    error,
    hasConflicts,
    dateRangeContext,
    runCheck,
    clear,
  };
};

export default useScheduleConflictCheck;
