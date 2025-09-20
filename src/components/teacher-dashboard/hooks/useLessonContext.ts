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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(getCurrentTime());
  const [currentDate, setCurrentDate] = useState(getCurrentDate());
  const [isLessonManagementActive, setIsLessonManagementActive] = useState(false);

  /**
   * Get lesson management state key for current teacher/class
   */
  const getLessonManagementKey = useCallback(() => {
    if (!teacher || !classItem) return null;
    return `${LESSON_MANAGEMENT_KEY}-${teacher.id}-${classItem.id}`;
  }, [teacher, classItem]);

  /**
   * Load lesson management state from localStorage
   */
  const loadLessonManagementState = useCallback(() => {
    const key = getLessonManagementKey();
    if (!key) return false;
    
    try {
      const saved = localStorage.getItem(key);
      if (!saved) return false;
      
      const data = JSON.parse(saved);
      const now = Date.now();
      
      // Check if state is expired (older than 24 hours)
      if (now - data.timestamp > 24 * 60 * 60 * 1000) {
        localStorage.removeItem(key);
        return false;
      }
      
      // Verify the lesson is still valid and active
      if (data.lessonId && data.isActive) {
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error loading lesson management state:', error);
      return false;
    }
  }, [getLessonManagementKey]);

  /**
   * Save lesson management state to localStorage
   */
  const saveLessonManagementState = useCallback((lessonId: string, isActive: boolean) => {
    const key = getLessonManagementKey();
    if (!key) return;
    
    try {
      const data = {
        lessonId,
        isActive,
        timestamp: Date.now()
      };
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving lesson management state:', error);
    }
  }, [getLessonManagementKey]);

  /**
   * Clear lesson management state from localStorage
   */
  const clearLessonManagementState = useCallback(() => {
    const key = getLessonManagementKey();
    if (key) {
      localStorage.removeItem(key);
    }
  }, [getLessonManagementKey]);

  /**
   * Fetch today's lessons for the selected teacher and class
   */
  const fetchTodayLessons = useCallback(async () => {
    if (!teacher || !classItem) {
      setAllTodayLessons([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const today = getCurrentDate();
      
      // Fetch lessons for today using the existing API service
      const lessons = await lessonApiService.getLessons({
        teacherId: teacher.id,
        classId: classItem.id,
        startDate: today,
        endDate: today,
        statusName: 'Scheduled' // Focus on scheduled lessons
      });

      setAllTodayLessons(lessons);
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to load today\'s lessons';
      setError(errorMessage);
      console.error('Error fetching today\'s lessons:', err);
    } finally {
      setIsLoading(false);
    }
  }, [teacher, classItem]);

  /**
   * Determine the current lesson context based on time and lessons
   */
  const determineLessonContext = useCallback((lessons: LessonResponse[], currentTimeStr: string) => {
    if (lessons.length === 0) {
      return {
        currentLesson: null,
        lessonState: 'none' as LessonContextState,
        nextLesson: null,
        completedLessons: []
      };
    }

    // Sort lessons by start time
    const sortedLessons = [...lessons].sort((a, b) => 
      a.startTime.localeCompare(b.startTime)
    );

    // Find active lesson (current time is within lesson period)
    const activeLesson = sortedLessons.find(lesson => 
      isTimeInRange(currentTimeStr, lesson.startTime, lesson.endTime)
    );

    if (activeLesson) {
      return {
        currentLesson: activeLesson,
        lessonState: 'active' as LessonContextState,
        nextLesson: null,
        completedLessons: sortedLessons.filter(l => l.endTime < currentTimeStr)
      };
    }

    // Find upcoming lesson (next lesson after current time)
    const upcomingLesson = sortedLessons.find(lesson => 
      lesson.startTime > currentTimeStr
    );

    if (upcomingLesson) {
      return {
        currentLesson: upcomingLesson,
        lessonState: 'upcoming' as LessonContextState,
        nextLesson: upcomingLesson,
        completedLessons: sortedLessons.filter(l => l.endTime < currentTimeStr)
      };
    }

    // All lessons are in the past
    const completedLessons = sortedLessons.filter(l => l.endTime < currentTimeStr);
    
    return {
      currentLesson: null,
      lessonState: completedLessons.length > 0 ? 'completed' as LessonContextState : 'none' as LessonContextState,
      nextLesson: null,
      completedLessons
    };
  }, []);

  /**
   * Start lesson management
   */
  const startLessonManagement = useCallback(() => {
    const lessonContext = determineLessonContext(allTodayLessons, currentTime);
    if (lessonContext.currentLesson && lessonContext.lessonState === 'active') {
      setIsLessonManagementActive(true);
      saveLessonManagementState(lessonContext.currentLesson.id, true);
    }
  }, [allTodayLessons, currentTime, determineLessonContext, saveLessonManagementState]);

  /**
   * End lesson management and conduct the lesson
   */
  const endLessonManagement = useCallback(async () => {
    const lessonContext = determineLessonContext(allTodayLessons, currentTime);
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
  }, [allTodayLessons, currentTime, determineLessonContext, isLessonManagementActive, clearLessonManagementState, fetchTodayLessons]);

  /**
   * Manual refresh function
   */
  const refreshLessons = useCallback(() => {
    setCurrentTime(getCurrentTime());
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

  // Real-time updates every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(getCurrentTime());
      setCurrentDate(getCurrentDate());
    }, 60000); // Update every 60 seconds

    return () => clearInterval(interval);
  }, []);

  // Calculate lesson context based on current data
  const lessonContext = determineLessonContext(allTodayLessons, currentTime);

  // Enhanced context data for new components
  const weekendStatus = isWeekend(currentDate);
  const holidayInfo = checkHoliday(currentDate);
  const nextLessonDate = findNextLessonDate(currentDate);
  
  // Create next lesson info (placeholder - in real app would query actual lessons)
  const nextLessonInfo = nextLessonDate ? {
    date: formatDateForDisplay(nextLessonDate.date),
    dayOfWeek: nextLessonDate.dayOfWeek,
    time: '10:00 - 11:30', // Placeholder time
    className: classItem?.name || 'Class'
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