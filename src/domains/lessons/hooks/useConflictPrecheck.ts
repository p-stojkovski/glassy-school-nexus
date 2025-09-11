import { useState, useRef, useCallback, useEffect } from 'react';
import { LessonConflict } from '@/types/api/lesson';
import lessonApiService from '@/services/lessonApiService';
import { ConflictSuggestion } from '@/domains/lessons/components/ConflictPanel';

interface ConflictPrecheckParams {
  classId: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  excludeLessonId?: string;
}

interface UseConflictPrecheckReturn {
  conflicts: LessonConflict[];
  checking: boolean;
  error: string | null;
  hasConflicts: boolean;
  suggestions: ConflictSuggestion[];
  runCheck: (params: ConflictPrecheckParams) => Promise<void>;
  clearConflicts: () => void;
  applySuggestion: (suggestion: ConflictSuggestion) => void;
  generateSuggestions: (originalDate: string, originalStartTime: string, originalEndTime: string) => ConflictSuggestion[];
}

const DEBOUNCE_DELAY = 500; // ms

export const useConflictPrecheck = (
  onSuggestionApplied?: (suggestion: ConflictSuggestion) => void
): UseConflictPrecheckReturn => {
  const [conflicts, setConflicts] = useState<LessonConflict[]>([]);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<ConflictSuggestion[]>([]);
  
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastCheckRef = useRef<string>('');
  const checkingRef = useRef<boolean>(false);

  // Clear conflicts and reset state
  const clearConflicts = useCallback(() => {
    setConflicts([]);
    setError(null);
    setSuggestions([]);
  }, []);

  // Generate suggestions for alternative times
  const generateSuggestions = useCallback((
    originalDate: string, 
    originalStartTime: string, 
    originalEndTime: string
  ): ConflictSuggestion[] => {
    if (!originalDate || !originalStartTime || !originalEndTime) {
      return [];
    }

    const suggestions: ConflictSuggestion[] = [];
    const baseDate = new Date(originalDate);

    // Next weekday (skip weekends)
    const nextWeekday = new Date(baseDate);
    nextWeekday.setDate(nextWeekday.getDate() + 1);
    while (nextWeekday.getDay() === 0 || nextWeekday.getDay() === 6) {
      nextWeekday.setDate(nextWeekday.getDate() + 1);
    }

    suggestions.push({
      type: 'next_weekday',
      label: `Next weekday (${nextWeekday.toLocaleDateString('en-US', { 
        weekday: 'short',
        month: 'short', 
        day: 'numeric' 
      })})`,
      scheduledDate: nextWeekday.toISOString().split('T')[0],
      startTime: originalStartTime,
      endTime: originalEndTime,
    });

    // Next week, same day
    const nextWeek = new Date(baseDate);
    nextWeek.setDate(nextWeek.getDate() + 7);

    suggestions.push({
      type: 'next_week',
      label: `Next week (${nextWeek.toLocaleDateString('en-US', { 
        weekday: 'short',
        month: 'short', 
        day: 'numeric' 
      })})`,
      scheduledDate: nextWeek.toISOString().split('T')[0],
      startTime: originalStartTime,
      endTime: originalEndTime,
    });

    return suggestions;
  }, []);

  // Run conflict check
  const runCheck = useCallback(async (params: ConflictPrecheckParams) => {
    const { classId, scheduledDate, startTime, endTime, excludeLessonId } = params;

    // Skip if required fields are missing
    if (!classId || !scheduledDate || !startTime || !endTime) {
      clearConflicts();
      return;
    }

    // Create a unique key for this check to avoid duplicate calls
    const checkKey = `${classId}-${scheduledDate}-${startTime}-${endTime}-${excludeLessonId || ''}`;
    
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

        // Temporarily disable global loading for conflict checks
        const wasUsingInterceptor = lessonApiService['useInterceptor'];
        lessonApiService.disableGlobalLoading();
        
        try {
          const conflictResults = await lessonApiService.checkConflicts(
            classId,
            scheduledDate,
            startTime,
            endTime,
            excludeLessonId
          );
        
          // Only apply results if this is still the latest check
          if (lastCheckRef.current === scheduledKey) {
            setConflicts(conflictResults);

            if (conflictResults.length > 0) {
              const newSuggestions = generateSuggestions(scheduledDate, startTime, endTime);
              setSuggestions(newSuggestions);
            } else {
              setSuggestions([]);
            }
          }
        } finally {
          // Restore original interceptor setting
          if (wasUsingInterceptor) {
            lessonApiService.enableGlobalLoading();
          }
        }
      } catch (err: any) {
        console.error('Conflict check failed:', err);
        if (lastCheckRef.current === scheduledKey) {
          setError(err.message || 'Failed to check for conflicts');
          setConflicts([]);
          setSuggestions([]);
        }
      } finally {
        if (lastCheckRef.current === scheduledKey) {
          checkingRef.current = false;
          setChecking(false);
        }
      }
    }, DEBOUNCE_DELAY);
  }, [clearConflicts, generateSuggestions]);

  // Apply a suggestion
  const applySuggestion = useCallback((suggestion: ConflictSuggestion) => {
    // Clear current conflicts since we're applying a suggestion
    clearConflicts();
    
    // Notify parent component about the suggestion
    if (onSuggestionApplied) {
      onSuggestionApplied(suggestion);
    }
  }, [clearConflicts, onSuggestionApplied]);

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
    suggestions,
    runCheck,
    clearConflicts,
    applySuggestion,
    generateSuggestions,
  };
};

export default useConflictPrecheck;
