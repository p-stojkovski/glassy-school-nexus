/**
 * TypeScript type definitions for the Lesson Students API
 * Handles attendance, homework, and comments for students within lessons
 */

// Attendance status options
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

// Homework status options  
export type HomeworkStatus = 'complete' | 'missing' | 'partial';

// Response model for lesson student data
export interface LessonStudentResponse {
  id: string | null;              // null if implicit/default row returned without persisted record
  studentId: string;              // GUID of the student
  studentName: string;            // Full name of the student
  attendanceStatus: AttendanceStatus | null;  // null if not marked yet
  homeworkStatus: HomeworkStatus | null;      // null if not checked yet
  comments: string | null;        // Teacher comments for this student in this lesson
  updatedAt: string;              // ISO 8601 timestamp of last update
}

// Request models for updates
export interface AttendanceUpdateRequest {
  status: AttendanceStatus;
}

export interface HomeworkUpdateRequest {
  status: HomeworkStatus;
}

export interface CommentsUpdateRequest {
  comments: string;
}

export interface LessonNotesUpdateRequest {
  notes: string;
}

// API endpoint paths
export const LessonStudentApiPaths = {
  LESSON_STUDENTS: (lessonId: string) => `/api/lessons/${lessonId}/students`,
  STUDENT_ATTENDANCE: (lessonId: string, studentId: string) => 
    `/api/lessons/${lessonId}/students/${studentId}/attendance`,
  STUDENT_HOMEWORK: (lessonId: string, studentId: string) => 
    `/api/lessons/${lessonId}/students/${studentId}/homework`,
  STUDENT_COMMENTS: (lessonId: string, studentId: string) => 
    `/api/lessons/${lessonId}/students/${studentId}/comments`,
  LESSON_NOTES: (lessonId: string) => `/api/lessons/${lessonId}/notes`,
} as const;

// Status color mappings for UI consistency
export const AttendanceStatusColors = {
  present: 'bg-green-500/20 text-green-300 border-green-500/30',
  absent: 'bg-red-500/20 text-red-300 border-red-500/30',
  late: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  excused: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
} as const;

export const HomeworkStatusColors = {
  complete: 'bg-green-500/20 text-green-300 border-green-500/30',
  missing: 'bg-red-500/20 text-red-300 border-red-500/30',
  partial: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
} as const;

// Status display labels
export const AttendanceStatusLabels = {
  present: 'Present',
  absent: 'Absent',
  late: 'Late',
  excused: 'Excused',
} as const;

export const HomeworkStatusLabels = {
  complete: 'Complete',
  missing: 'Missing',
  partial: 'Partial',
} as const;

// Type guards
export function isValidAttendanceStatus(status: string): status is AttendanceStatus {
  return ['present', 'absent', 'late', 'excused'].includes(status);
}

export function isValidHomeworkStatus(status: string): status is HomeworkStatus {
  return ['complete', 'missing', 'partial'].includes(status);
}

export function isLessonStudentResponse(obj: any): obj is LessonStudentResponse {
  return obj && 
         typeof obj === 'object' && 
         typeof obj.studentId === 'string' &&
         typeof obj.studentName === 'string' &&
         typeof obj.updatedAt === 'string' &&
         (obj.id === null || typeof obj.id === 'string') &&
         (obj.attendanceStatus === null || isValidAttendanceStatus(obj.attendanceStatus)) &&
         (obj.homeworkStatus === null || isValidHomeworkStatus(obj.homeworkStatus)) &&
         (obj.comments === null || typeof obj.comments === 'string');
}

// Save status for UI feedback
export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

// Error types for handling
export interface LessonStudentError {
  studentId: string;
  field: 'attendance' | 'homework' | 'comments';
  message: string;
}