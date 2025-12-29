import { useState, useEffect, useCallback } from 'react';
import { LessonResponse } from '@/types/api/lesson';
import { TeacherResponse } from '@/types/api/teacher';
import { ClassResponse } from '@/types/api/class';
import { lessonApiService } from '@/services/lessonApiService';
import { 
  getCurrentTime, 
  getCurrentDate, 
  isTimeInRange,
  isWeekend,
  checkHoliday,
  findNextLessonDate,
  formatDateForDisplay
} from '../utils/timeUtils';

/**
 * Lesson context states for the teacher dashboard
 */
export type LessonContextState = 'active' | 'upcoming' | 'completed' | 'none';

/**
 * Result interface for the lesson context hook
 */
export interface UseLessonContextResult {
  // Current lesson context
  currentLesson: LessonResponse | null;
  lessonState: LessonContextState;
  
  // Additional context data
  completedLessons: LessonResponse[];
  
  // Enhanced context for new components
  currentDate: string;
  isWeekend: boolean;
  isHoliday: boolean;
  holidayName?: string;
  nextLessonInfo?: {
    date: string;
    dayOfWeek: string;
    time: string;
    className: string;
  };
  
  // Lesson management state
  isLessonStarted: boolean;
  isLessonManagementActive: boolean;
  
  // State management
  isLoading: boolean;
  error: string | null;
  currentTime: string;
  
  // Actions
  refreshLessons: () => void;
  startLessonManagement: () => void;
  endLessonManagement: () => Promise<void>;
}

/**
 * Type alias for lesson context
 */
export type LessonContextType = UseLessonContextResult;

/**
 * Hook to manage lesson context detection for a teacher and class
 * Provides real-time updates and lesson state detection
 */
// localStorage key for lesson management state
const LESSON_MANAGEMENT_KEY = 'teacher-dashboard-lesson-management';

export const useLessonContext = (
  teacher: TeacherResponse | null,
  classItem: ClassResponse | null
): UseLessonContextResult => {
  const [allTodayLessons, setAllTodayLessons] = useState<LessonResponse[]>([]);
  const [nextLesson, setNextLesson] = useState<LessonResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(getCurrentTime());
  const [currentDate, setCurrentDate] = useState(getCurrentDate());
  const [isLessonManagementActive, setIsLessonManagementActive] = useState(false);

  /**
   * Lesson management state is no longer persisted to localStorage.
   * The server is the authoritative source for determining current lessons,
   * so we don't need client-side caching that can become stale.
   * State is now transient - cleared when the component unmounts or user navigates away.
   */
  const saveLessonManagementState = useCallback((lessonId: string, isActive: boolean) => {
    // Intentionally simplified - no localStorage persistence
    console.debug('Lesson management state: lesson=%s, active=%s', lessonId, isActive);
  }, []);

  const clearLessonManagementState = useCallback(() => {
    // No state to clear
  }, []);

  const loadLessonManagementState = useCallback(() => {
    // Always start fresh - server is the source of truth
    return false;
  }, []);

  /**
   * Fetch the current active lesson and next scheduled lesson for the class
   * This uses server-side determination to avoid client clock skew and stale cached data
   * Both queries run in parallel for efficiency
   */
  const fetchTodayLessons = useCallback(async () => {
    if (!classItem) {
      setAllTodayLessons([]);
      setNextLesson(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Call both endpoints in parallel for efficiency
      // 1. Get current active lesson (authoritative server-side determination)
      // 2. Get next scheduled lesson (for dashboard display when no active lesson)
      const fromDate = getCurrentDate();
      const [currentLessonResult, nextLessonResult] = await Promise.allSettled([
        lessonApiService.getCurrentLesson(classItem.id),
        lessonApiService.getNextLesson(classItem.id, fromDate, 1)
      ]);

      // Handle current lesson result
      let currentLesson: LessonResponse | null = null;
      if (currentLessonResult.status === 'fulfilled') {
        currentLesson = currentLessonResult.value;
        setAllTodayLessons([currentLesson]);
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
          // No active lesson is not an error - it's a valid state
          setAllTodayLessons([]);
        } else {
          // Actual error (auth, server, etc)
          setError(errorMessage);
          console.error('Error fetching current lesson:', err);
        }
      }

      // Handle next lesson result
      if (nextLessonResult.status === 'fulfilled') {
        const nextLessonData = nextLessonResult.value;
        
        // Safety net: filter out lessons that have already ended today
        // This is a defensive measure in case the backend doesn't fully exclude them
        const today = getCurrentDate();
        const now = getCurrentTime();
        
        const isLessonEndedToday = 
          nextLessonData.scheduledDate.startsWith(today) && 
          nextLessonData.endTime <= now;
        
        if (isLessonEndedToday) {
          console.warn(
            'Next lesson has already ended today. Lesson ID: %s, End time: %s, Current time: %s',
            nextLessonData.id,
            nextLessonData.endTime,
            now
          );
          setNextLesson(null);
        } else {
          setNextLesson(nextLessonData);
        }
      } else {
        // No next lesson or error - 404 is expected and normal
        const err = nextLessonResult.reason;
        const errorMessage = err?.message || '';
        const isNoFutureLessonError = 
          err?.status === 404 || 
          errorMessage.includes('No future lessons');

        if (isNoFutureLessonError) {
          // No future lessons is not an error - it's a valid state
          setNextLesson(null);
        } else {
          // Log other errors but don't fail the entire fetch
          console.error('Error fetching next lesson:', err);
          setNextLesson(null);
        }
      }
    } catch (err: any) {
      // Fallback error handling (shouldn't be reached with allSettled)
      const errorMessage = err?.message || 'Failed to fetch lesson information';
      setError(errorMessage);
      console.error('Error in fetchTodayLessons:', err);
      setAllTodayLessons([]);
      setNextLesson(null);
    } finally {
      setIsLoading(false);
    }
  }, [classItem]);

  /**
   * Determine the current lesson context.
   * Since the server already determined that there is a current active lesson,
   * we can simply mark it as active. No client-side time matching needed.
   */
  const determineLessonContext = useCallback((lessons: LessonResponse[]) => {
    if (lessons.length === 0) {
      return {
        currentLesson: null,
        lessonState: 'none' as LessonContextState,
        nextLesson: null,
        completedLessons: []
      };
    }

    // Server already determined this is the current active lesson
    const currentLesson = lessons[0];
    
    return {
      currentLesson,
      lessonState: 'active' as LessonContextState,
      nextLesson: null,
      completedLessons: []
    };
  }, []);

  /**
   * Start lesson management
   */
  const startLessonManagement = useCallback(() => {
    const lessonContext = determineLessonContext(allTodayLessons);
    if (lessonContext.currentLesson && lessonContext.lessonState === 'active') {
      setIsLessonManagementActive(true);
      saveLessonManagementState(lessonContext.currentLesson.id, true);
    }
  }, [allTodayLessons, determineLessonContext, saveLessonManagementState]);

  /**
   * End lesson management and conduct the lesson
   */
  const endLessonManagement = useCallback(async () => {
    const lessonContext = determineLessonContext(allTodayLessons);
    if (lessonContext.currentLesson && isLessonManagementActive) {
      try {
        setIsLoading(true);
        
        // Call the API to mark lesson as conducted
        await lessonApiService.conductLesson(lessonContext.currentLesson.id, {
          notes: 'Lesson completed via teacher dashboard'
        });
        
        // Clear the management state
        setIsLessonManagementActive(false);
        clearLessonManagementState();
        
        // Refresh lessons to get updated state
        await fetchTodayLessons();
        
      } catch (err: any) {
        const errorMessage = err?.message || 'Failed to end lesson';
        setError(errorMessage);
        console.error('Error ending lesson:', err);
        throw err; // Re-throw to handle in UI
      } finally {
        setIsLoading(false);
      }
    }
  }, [allTodayLessons, determineLessonContext, isLessonManagementActive, clearLessonManagementState, fetchTodayLessons]);

  /**
   * Manual refresh function
   */
  const refreshLessons = useCallback(() => {
    setCurrentDate(getCurrentDate());
    fetchTodayLessons();
  }, [fetchTodayLessons]);

  // Initial load when teacher/class changes
  useEffect(() => {
    fetchTodayLessons();
  }, [fetchTodayLessons]);

  // Load lesson management state on mount or when teacher/class changes
  useEffect(() => {
    const isActive = loadLessonManagementState();
    setIsLessonManagementActive(isActive);
  }, [loadLessonManagementState]);

  // Calculate lesson context based on current data
  const lessonContext = determineLessonContext(allTodayLessons);

  // Enhanced context data for new components
  const weekendStatus = isWeekend(currentDate);
  const holidayInfo = checkHoliday(currentDate);
  
  // Create next lesson info from actual API data
  // If we have a next lesson from the API, format it for display
  const nextLessonInfo = nextLesson ? {
    date: formatDateForDisplay(nextLesson.scheduledDate),
    dayOfWeek: nextLesson.scheduledDate.split('T')[0], // Will be formatted by getDayOfWeek in UI
    time: `${nextLesson.startTime} - ${nextLesson.endTime}`,
    className: nextLesson.className
  } : undefined;

  // Determine if lesson is started (management is active and lesson is currently active)
  const isLessonStarted = isLessonManagementActive && lessonContext.lessonState === 'active';

  return {
    // Lesson context
    currentLesson: lessonContext.currentLesson,
    lessonState: lessonContext.lessonState,
    completedLessons: lessonContext.completedLessons,
    
    // Enhanced context for new components
    currentDate,
    isWeekend: weekendStatus,
    isHoliday: !!holidayInfo,
    holidayName: holidayInfo?.name,
    nextLessonInfo,
    
    // Lesson management state
    isLessonStarted,
    isLessonManagementActive,
    
    // State management
    isLoading,
    error,
    currentTime,
    
    // Actions
    refreshLessons,
    startLessonManagement,
    endLessonManagement
  };
};