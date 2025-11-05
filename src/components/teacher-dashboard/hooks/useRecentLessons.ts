import { useState, useEffect, useCallback } from 'react';
import lessonApiService from '@/services/lessonApiService';
import lessonStudentApiService from '@/services/lessonStudentApiService';
import { homeworkApiService } from '@/services/homeworkApiService';
import { LessonResponse } from '@/types/api/lesson';
import { HomeworkCompletionSummaryResponse } from '@/types/api/lesson-students';

export interface RecentLessonSummary {
  lesson: LessonResponse;
  attendanceCount: number;
  totalStudents: number;
  homeworkCompletedCount: number;
  homeworkTotalCount: number;
  attendanceRate: number;
  homeworkRate: number;
}

interface UseRecentLessonsReturn {
  recentLessons: RecentLessonSummary[] | null;
  loading: boolean;
  error: string | null;
  refreshRecentLessons: () => void;
}

/**
 * Hook for fetching recent completed lessons with attendance and homework statistics
 */
export const useRecentLessons = (classId: string): UseRecentLessonsReturn => {
  const [recentLessons, setRecentLessons] = useState<RecentLessonSummary[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Get attendance statistics for a lesson
   */
  const getAttendanceStats = async (lessonId: string): Promise<{
    attendanceCount: number;
    totalStudents: number;
    attendanceRate: number;
  }> => {
    try {
      // Get all students for this lesson with their attendance status
      const students = await lessonStudentApiService.getLessonStudents(lessonId);
      
      const totalStudents = students.length;
      const attendanceCount = students.filter(student => 
        student.attendanceStatus === 'present' || student.attendanceStatus === 'late'
      ).length;
      
      const attendanceRate = totalStudents > 0 ? (attendanceCount / totalStudents) * 100 : 0;
      
      return {
        attendanceCount,
        totalStudents,
        attendanceRate
      };
    } catch (err: any) {
      console.warn(`Failed to get attendance stats for lesson ${lessonId}:`, err);
      // Return default values if we can't get attendance data
      return {
        attendanceCount: 0,
        totalStudents: 0,
        attendanceRate: 0
      };
    }
  };

  /**
   * Get homework completion statistics for a lesson
   */
  const getHomeworkStats = async (lessonId: string): Promise<{
    homeworkCompletedCount: number;
    homeworkTotalCount: number;
    homeworkRate: number;
  }> => {
    try {
      // Get homework completion summary from existing API
      const summary = await homeworkApiService.getHomeworkCompletionSummary(lessonId);
      
      const homeworkCompletedCount = summary.completionStats.complete + summary.completionStats.partial;
      const homeworkTotalCount = summary.totalStudents;
      const homeworkRate = homeworkTotalCount > 0 ? (homeworkCompletedCount / homeworkTotalCount) * 100 : 0;
      
      return {
        homeworkCompletedCount,
        homeworkTotalCount,
        homeworkRate
      };
    } catch (err: any) {
      console.warn(`Failed to get homework stats for lesson ${lessonId}:`, err);
      // Return default values if we can't get homework data
      return {
        homeworkCompletedCount: 0,
        homeworkTotalCount: 0,
        homeworkRate: 0
      };
    }
  };

  /**
   * Fetch recent completed lessons with their statistics
   */
  const fetchRecentLessons = useCallback(async () => {
    if (!classId) {
      setRecentLessons([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Get conducted lessons for this class (last 30 days to find recent ones)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const lessons = await lessonApiService.getLessons({
        classId,
        statusName: 'Conducted',
        startDate: thirtyDaysAgo.toISOString().split('T')[0], // YYYY-MM-DD format
        endDate: new Date().toISOString().split('T')[0],
        pageSize: 10 // Get last 10 lessons max
      });

      if (!lessons || lessons.length === 0) {
        setRecentLessons([]);
        setLoading(false);
        return;
      }

      // Sort by conducted date (most recent first) and take top 5
      const sortedLessons = lessons
        .filter(lesson => lesson.conductedAt) // Only lessons that were actually conducted
        .sort((a, b) => {
          const dateA = new Date(a.conductedAt!);
          const dateB = new Date(b.conductedAt!);
          return dateB.getTime() - dateA.getTime();
        })
        .slice(0, 5); // Take only the 5 most recent

      // Fetch statistics for each lesson
      const lessonsWithStats = await Promise.all(
        sortedLessons.map(async (lesson): Promise<RecentLessonSummary> => {
          // Fetch attendance and homework stats concurrently
          const [attendanceStats, homeworkStats] = await Promise.all([
            getAttendanceStats(lesson.id),
            getHomeworkStats(lesson.id)
          ]);

          return {
            lesson,
            attendanceCount: attendanceStats.attendanceCount,
            totalStudents: attendanceStats.totalStudents,
            homeworkCompletedCount: homeworkStats.homeworkCompletedCount,
            homeworkTotalCount: homeworkStats.homeworkTotalCount,
            attendanceRate: attendanceStats.attendanceRate,
            homeworkRate: homeworkStats.homeworkRate
          };
        })
      );

      setRecentLessons(lessonsWithStats);
    } catch (err: any) {
      console.error('Error fetching recent lessons:', err);
      setError(err?.message || 'Failed to load recent lessons');
      setRecentLessons(null);
    } finally {
      setLoading(false);
    }
  }, [classId]);

  /**
   * Refresh recent lessons data
   */
  const refreshRecentLessons = useCallback(() => {
    fetchRecentLessons();
  }, [fetchRecentLessons]);

  // Load recent lessons when classId changes
  useEffect(() => {
    fetchRecentLessons();
  }, [fetchRecentLessons]);

  return {
    recentLessons,
    loading,
    error,
    refreshRecentLessons
  };
};