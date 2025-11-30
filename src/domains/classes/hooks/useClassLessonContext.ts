import { useState, useEffect, useCallback } from 'react';
import { LessonResponse } from '@/types/api/lesson';
import { lessonApiService } from '@/services/lessonApiService';

/**
 * Lesson context states for class-level teaching
 */
export type ClassLessonState = 
  | 'active'            // A lesson is currently in progress
  | 'upcoming_today'    // No active lesson, but there's one scheduled for today
  | 'upcoming_future'   // Next lesson is scheduled for a future date
  | 'completed'         // All planned lessons are done for the course
  | 'none';             // No upcoming lesson yet (plan the next one)

/**
 * Result interface for the class lesson context hook
 */
export interface UseClassLessonContextResult {
  // Current lesson context
  currentLesson: LessonResponse | null;
  nextLesson: LessonResponse | null;
  lessonState: ClassLessonState;
  
  // State management
  isLoading: boolean;
  error: string | null;
  
  // Actions
  refreshLessons: () => void;
}

/**
 * Hook to manage lesson context detection for a specific class
 * Used by ClassPage to determine hero CTA state
 */
export const useClassLessonContext = (classId: string | null): UseClassLessonContextResult => {
  const [currentLesson, setCurrentLesson] = useState<LessonResponse | null>(null);
  const [nextLesson, setNextLesson] = useState<LessonResponse | null>(null);
  const [lessonState, setLessonState] = useState<ClassLessonState>('none');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch the current active lesson and next scheduled lesson for the class
   * Uses server-side determination for accuracy
   */
  const fetchLessonContext = useCallback(async () => {
    if (!classId) {
      setCurrentLesson(null);
      setNextLesson(null);
      setLessonState('none');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Call both endpoints in parallel for efficiency
      const [currentLessonResult, nextLessonResult] = await Promise.allSettled([
        lessonApiService.getCurrentLesson(classId),
        lessonApiService.getNextLesson(classId)
      ]);

      // Handle current lesson result
      let activeLesson: LessonResponse | null = null;
      if (currentLessonResult.status === 'fulfilled') {
        activeLesson = currentLessonResult.value;
        setCurrentLesson(activeLesson);
      } else {
        // No active lesson or error - check if it's a 404 (expected) or actual error
        const err = currentLessonResult.reason;
        const errorMessage = err?.message || '';
        const isNoActiveLessonError = 
          err?.status === 404 || 
          err?.status === 400 || 
          errorMessage.includes('not currently active') ||
          errorMessage.includes('No lesson is currently active');

        if (isNoActiveLessonError) {
          setCurrentLesson(null);
        } else {
          setError(errorMessage);
          console.error('Error fetching current lesson:', err);
        }
      }

      // Handle next lesson result
      let upcomingLesson: LessonResponse | null = null;
      if (nextLessonResult.status === 'fulfilled') {
        upcomingLesson = nextLessonResult.value;
        setNextLesson(upcomingLesson);
      } else {
        const err = nextLessonResult.reason;
        const errorMessage = err?.message || '';
        const isNoFutureLessonError = 
          err?.status === 404 || 
          errorMessage.includes('No future lessons');

        if (isNoFutureLessonError) {
          setNextLesson(null);
        } else {
          console.error('Error fetching next lesson:', err);
          setNextLesson(null);
        }
      }

      // Determine lesson state based on results
      // Use local date for comparison to avoid timezone issues
      const getLocalDateString = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };
      
      const today = getLocalDateString(new Date());
      
      if (activeLesson) {
        setLessonState('active');
      } else if (upcomingLesson) {
        // Extract just the date part (YYYY-MM-DD) from scheduledDate
        const lessonDate = upcomingLesson.scheduledDate.split('T')[0];
        
        if (lessonDate === today) {
          // There's a lesson scheduled for today but it hasn't started yet
          setLessonState('upcoming_today');
        } else if (lessonDate > today) {
          // Next lesson is in the future - show that there's an upcoming lesson
          setLessonState('upcoming_future');
        } else {
          // This shouldn't happen (next lesson in the past), but handle gracefully
          setLessonState('none');
        }
      } else {
        // No active lesson and no upcoming lesson
        // Treat as "none" to allow plan-next CTA unless the course is truly completed
        // If back-end exposes a completion flag, replace this with that signal
        setLessonState('none');
      }

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch lesson information';
      setError(errorMessage);
      console.error('Error in fetchLessonContext:', err);
      setCurrentLesson(null);
      setNextLesson(null);
      setLessonState('none');
    } finally {
      setIsLoading(false);
    }
  }, [classId]);

  // Initial load when class changes
  useEffect(() => {
    fetchLessonContext();
  }, [fetchLessonContext]);

  // Refresh function
  const refreshLessons = useCallback(() => {
    fetchLessonContext();
  }, [fetchLessonContext]);

  return {
    currentLesson,
    nextLesson,
    lessonState,
    isLoading,
    error,
    refreshLessons
  };
};

export default useClassLessonContext;
