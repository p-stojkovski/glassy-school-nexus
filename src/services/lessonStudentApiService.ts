/**
 * Lesson Student API Service
 * Handles CRUD operations for student data within lessons (attendance, homework, comments)
 */

import apiService from './api';
import { classApiService } from './classApiService';
import {
  LessonStudentResponse,
  AttendanceUpdateRequest,
  HomeworkUpdateRequest,
  CommentsUpdateRequest,
  LessonNotesUpdateRequest,
  LessonStudentApiPaths,
  LessonStudentError
} from '@/types/api/lesson-students';
import { StudentLessonDetail } from '@/types/api/class';
import { StudentHistorySummary } from '@/types/api/lesson-history';

// Preserve status/details when rethrowing with a custom message
function makeApiError(original: any, message: string): Error & { status?: number; details?: any } {
  const err: any = new Error(message);
  if (original) {
    err.status = original.status;
    err.details = original.details;
  }
  return err as Error & { status?: number; details?: any };
}

// Normalize API responses that may wrap arrays in different shapes
function normalizeListResponse<T>(raw: any): T[] {
  if (Array.isArray(raw)) return raw as T[];
  if (raw && typeof raw === 'object') {
    const candidates = [
      (raw as any).items,
      (raw as any).results,
      (raw as any).students,
      (raw as any).data,
      (raw as any).value,
    ];
    for (const candidate of candidates) {
      if (Array.isArray(candidate)) return candidate as T[];
    }
  }
  return [] as T[];
}

export class LessonStudentApiService {

  /** Get all students enrolled in a lesson with their attendance/homework status */
  async getLessonStudents(lessonId: string): Promise<LessonStudentResponse[]> {
    try {
      const raw = await apiService.get<any>(LessonStudentApiPaths.LESSON_STUDENTS(lessonId));
      return normalizeListResponse<LessonStudentResponse>(raw);
    } catch (error: any) {
      if (error.status === 404) {
        throw makeApiError(error, 'Lesson not found');
      }
      if (error.status === 401) {
        throw makeApiError(error, 'Authentication required to access lesson students');
      }
      throw makeApiError(error, `Failed to fetch lesson students: ${error.message || 'Unknown error'}`);
    }
  }

  /** Update attendance status for a student in a lesson */
  async updateAttendance(
    lessonId: string, 
    studentId: string, 
    request: AttendanceUpdateRequest
  ): Promise<LessonStudentResponse> {
    try {
      return await apiService.put<LessonStudentResponse>(
        LessonStudentApiPaths.STUDENT_ATTENDANCE(lessonId, studentId), 
        request
      );
    } catch (error: any) {
      if (error.status === 404) {
        throw makeApiError(error, 'Lesson or student not found');
      }
      if (error.status === 400) {
        const details = error.details;
        if (details?.detail?.includes('invalid status')) {
          throw makeApiError(error, 'Invalid attendance status provided');
        }
        throw makeApiError(error, `Validation error: ${details?.detail || 'Invalid attendance data'}`);
      }
      if (error.status === 401) {
        throw makeApiError(error, 'Authentication required to update attendance');
      }
      throw makeApiError(error, `Failed to update attendance: ${error.message || 'Unknown error'}`);
    }
  }

  /** Update homework status for a student in a lesson */
  async updateHomework(
    lessonId: string, 
    studentId: string, 
    request: HomeworkUpdateRequest
  ): Promise<LessonStudentResponse> {
    try {
      return await apiService.put<LessonStudentResponse>(
        LessonStudentApiPaths.STUDENT_HOMEWORK(lessonId, studentId), 
        request
      );
    } catch (error: any) {
      if (error.status === 404) {
        throw makeApiError(error, 'Lesson or student not found');
      }
      if (error.status === 400) {
        const details = error.details;
        if (details?.detail?.includes('invalid status')) {
          throw makeApiError(error, 'Invalid homework status provided');
        }
        throw makeApiError(error, `Validation error: ${details?.detail || 'Invalid homework data'}`);
      }
      if (error.status === 401) {
        throw makeApiError(error, 'Authentication required to update homework');
      }
      throw makeApiError(error, `Failed to update homework: ${error.message || 'Unknown error'}`);
    }
  }

  /** Update comments for a student in a lesson */
  async updateComments(
    lessonId: string, 
    studentId: string, 
    request: CommentsUpdateRequest
  ): Promise<LessonStudentResponse> {
    try {
      return await apiService.put<LessonStudentResponse>(
        LessonStudentApiPaths.STUDENT_COMMENTS(lessonId, studentId), 
        request
      );
    } catch (error: any) {
      if (error.status === 404) {
        throw makeApiError(error, 'Lesson or student not found');
      }
      if (error.status === 400) {
        const details = error.details;
        throw makeApiError(error, `Validation error: ${details?.detail || 'Invalid comment data'}`);
      }
      if (error.status === 401) {
        throw makeApiError(error, 'Authentication required to update comments');
      }
      throw makeApiError(error, `Failed to update comments: ${error.message || 'Unknown error'}`);
    }
  }

  /** Update lesson notes */
  async updateLessonNotes(
    lessonId: string, 
    request: LessonNotesUpdateRequest
  ): Promise<void> {
    try {
      await apiService.put<void>(
        LessonStudentApiPaths.LESSON_NOTES(lessonId), 
        request
      );
    } catch (error: any) {
      if (error.status === 404) {
        throw makeApiError(error, 'Lesson not found');
      }
      if (error.status === 400) {
        const details = error.details;
        throw makeApiError(error, `Validation error: ${details?.detail || 'Invalid notes data'}`);
      }
      if (error.status === 401) {
        throw makeApiError(error, 'Authentication required to update lesson notes');
      }
      throw makeApiError(error, `Failed to update lesson notes: ${error.message || 'Unknown error'}`);
    }
  }

  /** Get current lesson notes */
  async getLessonNotes(lessonId: string): Promise<{ notes: string | null }> {
    try {
      return await apiService.get<{ notes: string | null }>(
        LessonStudentApiPaths.LESSON_NOTES(lessonId)
      );
    } catch (error: any) {
      if (error.status === 404) {
        throw makeApiError(error, 'Lesson not found');
      }
      if (error.status === 401) {
        throw makeApiError(error, 'Authentication required to access lesson notes');
      }
      throw makeApiError(error, `Failed to fetch lesson notes: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Get a student's recent lesson history for context while marking attendance.
   * Reuses the existing class student lessons endpoint and filters on frontend.
   *
   * @param classId - The class ID
   * @param studentId - The student ID
   * @param excludeLessonId - Current lesson ID to exclude from results
   * @param limit - Maximum lessons to return (default: 5)
   * @returns Last N conducted lessons, excluding the current lesson
   */
  async getStudentRecentHistory(
    classId: string,
    studentId: string,
    excludeLessonId: string,
    limit: number = 5
  ): Promise<StudentLessonDetail[]> {
    // Fetch all lessons for this student in the class
    const allLessons = await classApiService.getClassStudentLessons(classId, studentId);

    // Filter out the current lesson and take the first N
    // Backend returns lessons in date descending order
    return allLessons
      .filter(lesson => lesson.lessonId !== excludeLessonId)
      .slice(0, limit);
  }
}

// Export singleton instance
const lessonStudentApiService = new LessonStudentApiService();
export default lessonStudentApiService;

/**
 * Calculate summary statistics from lesson history.
 * Pure function - no side effects.
 */
export function calculateHistorySummary(history: StudentLessonDetail[]): StudentHistorySummary {
  let absences = 0;
  let lateCount = 0;
  let missingHomework = 0;

  for (const lesson of history) {
    // Count absences (attendanceStatus === 'absent')
    if (lesson.attendanceStatus === 'absent') {
      absences++;
    }

    // Count late arrivals (attendanceStatus === 'late')
    if (lesson.attendanceStatus === 'late') {
      lateCount++;
    }

    // Count missing homework (homeworkStatus === 'missing')
    if (lesson.homeworkStatus === 'missing') {
      missingHomework++;
    }
  }

  return {
    totalLessons: history.length,
    absences,
    lateCount,
    missingHomework,
    hasRisk: absences >= 3 || missingHomework >= 3
  };
}

// Convenience export for getStudentRecentHistory
export const getStudentRecentHistory = (
  classId: string,
  studentId: string,
  excludeLessonId: string,
  limit?: number
) => lessonStudentApiService.getStudentRecentHistory(classId, studentId, excludeLessonId, limit);