import { useState, useEffect } from 'react';
import { HomeworkApiService } from '@/services/homeworkApiService';
import lessonStudentApiService from '@/services/lessonStudentApiService';
import { HomeworkAssignmentResponse } from '@/types/api/homework';
import { LessonStudentResponse } from '@/types/api/lesson-students';

interface AttendanceMetrics {
  allMarked: boolean;
  someMarked: boolean;
  noneMarked: boolean;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  totalStudents: number;
}

interface LessonStatusMetrics {
  homework: HomeworkAssignmentResponse | null;
  attendance: AttendanceMetrics;
  loading: boolean;
  error: string | null;
}

const homeworkApiService = new HomeworkApiService();

// Cache for lesson metrics to avoid repeated API calls
const metricsCache = new Map<string, LessonStatusMetrics>();

export const useLessonStatusMetrics = (lessonId: string, shouldFetch: boolean = true): LessonStatusMetrics => {
  const [metrics, setMetrics] = useState<LessonStatusMetrics>(() => {
    // Check cache first
    const cached = metricsCache.get(lessonId);
    if (cached) {
      return cached;
    }
    return {
      homework: null,
      attendance: {
        allMarked: false,
        someMarked: false,
        noneMarked: true,
        presentCount: 0,
        absentCount: 0,
        lateCount: 0,
        totalStudents: 0,
      },
      loading: shouldFetch,
      error: null,
    };
  });

  useEffect(() => {
    if (!shouldFetch) {
      return;
    }

    // Check cache
    const cached = metricsCache.get(lessonId);
    if (cached) {
      setMetrics(cached);
      return;
    }

    const fetchMetrics = async () => {
      setMetrics(prev => ({ ...prev, loading: true, error: null }));

      try {
        const [homeworkData, studentsData] = await Promise.all([
          homeworkApiService.getHomeworkAssignment(lessonId).catch(() => null),
          lessonStudentApiService.getLessonStudents(lessonId).catch(() => [] as LessonStudentResponse[]),
        ]);

        const attendanceMetrics = calculateAttendanceMetrics(studentsData);

        const newMetrics: LessonStatusMetrics = {
          homework: homeworkData,
          attendance: attendanceMetrics,
          loading: false,
          error: null,
        };

        // Cache the results
        metricsCache.set(lessonId, newMetrics);

        setMetrics(newMetrics);
      } catch (error: any) {
        console.error('Failed to fetch lesson metrics:', error);
        const errorMetrics: LessonStatusMetrics = {
          homework: null,
          attendance: {
            allMarked: false,
            someMarked: false,
            noneMarked: true,
            presentCount: 0,
            absentCount: 0,
            lateCount: 0,
            totalStudents: 0,
          },
          loading: false,
          error: error.message || 'Failed to fetch metrics',
        };
        setMetrics(errorMetrics);
      }
    };

    fetchMetrics();
  }, [lessonId, shouldFetch]);

  return metrics;
};

// Calculate attendance metrics from student records
function calculateAttendanceMetrics(students: LessonStudentResponse[]): AttendanceMetrics {
  if (students.length === 0) {
    return {
      allMarked: false,
      someMarked: false,
      noneMarked: true,
      presentCount: 0,
      absentCount: 0,
      lateCount: 0,
      totalStudents: 0,
    };
  }

  const studentsWithAttendance = students.filter(s => s.attendanceStatus !== null);
  const presentCount = students.filter(s => s.attendanceStatus === 'present').length;
  const absentCount = students.filter(s => s.attendanceStatus === 'absent').length;
  const lateCount = students.filter(s => s.attendanceStatus === 'late').length;

  return {
    allMarked: studentsWithAttendance.length === students.length,
    someMarked: studentsWithAttendance.length > 0 && studentsWithAttendance.length < students.length,
    noneMarked: studentsWithAttendance.length === 0,
    presentCount,
    absentCount,
    lateCount,
    totalStudents: students.length,
  };
}

// Clear cache for a specific lesson (useful after updates)
export const clearLessonMetricsCache = (lessonId: string) => {
  metricsCache.delete(lessonId);
};

// Clear entire cache
export const clearAllLessonMetricsCache = () => {
  metricsCache.clear();
};
