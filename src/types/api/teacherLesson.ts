/**
 * Teacher Lesson API types
 */

export type LessonStatusName = 'Scheduled' | 'Conducted' | 'Cancelled' | 'Make Up' | 'No Show';

export interface TeacherLessonResponse {
  id: string;
  classId: string;
  className: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  statusName: LessonStatusName;
  conductedAt: string | null;
  cancellationReason: string | null;
  makeupLessonId: string | null;
  originalLessonId: string | null;
  originalLessonDate: string | null;
  notes: string | null;
}

export interface TeacherLessonsStats {
  totalLessons: number;
  conductedCount: number;
  cancelledCount: number;
  makeupCount: number;
  scheduledCount: number;
  noShowCount: number;
}

export interface TeacherLessonsResponse {
  lessons: TeacherLessonResponse[];
  stats: TeacherLessonsStats;
  totalCount: number;
  skip: number;
  take: number;
}

export interface TeacherLessonsQueryParams {
  status?: LessonStatusName[];
  classId?: string;
  fromDate?: string;
  toDate?: string;
  skip?: number;
  take?: number;
}
