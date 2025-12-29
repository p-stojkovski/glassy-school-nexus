/**
 * Lesson API Service
 * Implements lessons endpoints for CRUD operations, status management, and lesson generation
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import apiService from './api';
import {
  LessonResponse,
  LessonSummary,
  LessonSearchParams,
  CreateLessonRequest,
  CancelLessonRequest,
  MarkLessonConductedRequest,
  CreateMakeupLessonRequest,
  GenerateLessonsRequest,
  LessonGenerationResult,
  LessonStatusName,
  MakeupLessonFormData,
  GenerateLessonsAcademicAwareRequest,
  AcademicAwareLessonGenerationResult,
  LessonCreatedResponse,
  LessonConflict,
  ConflictCheckResult,
  LessonNotesResponse,
  LessonApiPaths,
  LessonHttpStatus,
  RescheduleLessonRequest,
  ClassLessonFilterParams,
  PastUnstartedCountResponse
} from '@/types/api/lesson';
import { EnhancedLessonGenerationResult } from '@/types/api/lesson-generation-enhanced';
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
      (raw as any).lessons,
      (raw as any).data,
      (raw as any).value,
    ];
    for (const candidate of candidates) {
      if (Array.isArray(candidate)) return candidate as T[];
    }
  }
  return [] as T[];
}

function formatProblemDetails(details: any): string | null {
  if (!details || typeof details !== 'object') return null;

  // RFC7807: { title, detail, status, errors? }
  const detail = typeof details.detail === 'string' ? details.detail : null;
  if (detail && detail.trim()) return detail;

  const title = typeof details.title === 'string' ? details.title : null;
  const errors = (details as any).errors;

  if (errors && typeof errors === 'object') {
    const parts: string[] = [];
    for (const [key, value] of Object.entries(errors)) {
      if (Array.isArray(value)) {
        const messages = value.filter(v => typeof v === 'string' && v.trim());
        if (messages.length) parts.push(`${key}: ${messages.join(', ')}`);
      } else if (typeof value === 'string' && value.trim()) {
        parts.push(`${key}: ${value}`);
      }
    }
    if (parts.length) return parts.join(' | ');
  }

  return title && title.trim() ? title : null;
}

export class LessonApiService {

  /** Get lessons with optional filtering (returns array) */
  async getLessons(params: LessonSearchParams = {}): Promise<LessonResponse[]> {
    try {
      const qs = new URLSearchParams();
      if (params.classId) qs.append('classId', params.classId);
      if (params.teacherId) qs.append('teacherId', params.teacherId);
      if (params.classroomId) qs.append('classroomId', params.classroomId);
      if (params.statusId) qs.append('statusId', params.statusId);
      if (params.statusName) qs.append('statusName', params.statusName);
      if (params.semesterId) qs.append('semesterId', params.semesterId);
      // Backend expects fromDate/toDate, but frontend uses startDate/endDate
      if (params.startDate) qs.append('fromDate', params.startDate);
      if (params.endDate) qs.append('toDate', params.endDate);
      if (params.generationSource) qs.append('generationSource', params.generationSource);
      if (params.pageSize) qs.append('pageSize', String(params.pageSize));
      if (params.page) qs.append('page', String(params.page));

      const endpoint = qs.toString() ? `${LessonApiPaths.BASE}?${qs.toString()}` : LessonApiPaths.BASE;
      const raw = await apiService.get<any>(endpoint);
      return normalizeListResponse<LessonResponse>(raw);
    } catch (error: any) {
      if (error.status === LessonHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to access lessons');
      }
      if (error.status === LessonHttpStatus.BAD_REQUEST) {
        throw makeApiError(error, 'Invalid lesson search parameters');
      }
      throw makeApiError(error, `Failed to fetch lessons: ${error.message || 'Unknown error'}`);
    }
  }

  /** Search lessons with pagination (skip/take) */
  async searchLessons(params: {
    classId?: string;
    teacherId?: string;
    statusId?: string;
    fromDate?: string;
    toDate?: string;
    skip?: number;
    take?: number;
  } = {}): Promise<{ lessons: LessonResponse[]; totalCount: number; skip: number; take: number }> {
    try {
      const qs = new URLSearchParams();
      if (params.classId) qs.append('classId', params.classId);
      if (params.teacherId) qs.append('teacherId', params.teacherId);
      if (params.statusId) qs.append('statusId', params.statusId);
      if (params.fromDate) qs.append('fromDate', params.fromDate);
      if (params.toDate) qs.append('toDate', params.toDate);
      if (params.skip !== undefined) qs.append('skip', String(params.skip));
      if (params.take !== undefined) qs.append('take', String(params.take));

      const endpoint = qs.toString() ? `${LessonApiPaths.SEARCH}?${qs.toString()}` : LessonApiPaths.SEARCH;
      const raw = await apiService.get<any>(endpoint);

      // Handle response that may be array or paginated object
      if (Array.isArray(raw)) {
        return {
          lessons: raw as LessonResponse[],
          totalCount: raw.length,
          skip: params.skip || 0,
          take: params.take || raw.length
        };
      }

      // Handle paginated response format
      if (raw && typeof raw === 'object') {
        const lessons = raw.lessons || raw.items || raw.results || [];
        return {
          lessons: Array.isArray(lessons) ? lessons : [],
          totalCount: raw.totalCount || lessons.length,
          skip: raw.skip || params.skip || 0,
          take: raw.take || params.take || lessons.length
        };
      }

      return {
        lessons: [],
        totalCount: 0,
        skip: params.skip || 0,
        take: params.take || 0
      };
    } catch (error: any) {
      if (error.status === LessonHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to search lessons');
      }
      if (error.status === LessonHttpStatus.BAD_REQUEST) {
        throw makeApiError(error, 'Invalid lesson search parameters');
      }
      throw makeApiError(error, `Failed to search lessons: ${error.message || 'Unknown error'}`);
    }
  }

  /** Get lesson by ID */
  async getLessonById(id: string): Promise<LessonResponse> {
    try {
return await apiService.get<LessonResponse>(LessonApiPaths.BY_ID(id));
    } catch (error: any) {
      if (error.status === LessonHttpStatus.NOT_FOUND) {
        throw makeApiError(error, 'Lesson not found');
      }
      if (error.status === LessonHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to access lesson details');
      }
      throw makeApiError(error, `Failed to fetch lesson: ${error.message || 'Unknown error'}`);
    }
  }

  /** Get lessons for a specific class with optional filters */
  async getLessonsForClass(classId: string, filters?: ClassLessonFilterParams): Promise<LessonResponse[]> {
    const params: LessonSearchParams = { classId };

    if (filters) {
      const toIsoDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const timeWindow = filters.timeWindow || 'all';

      // Convert scope + window to date range parameters
      // 'upcoming' = today and future, 'past' = before today, 'all' = no date filter
      if (filters.scope === 'upcoming') {
        params.startDate = toIsoDate(today);

        if (timeWindow === 'week') {
          const endDate = new Date(today);
          endDate.setDate(endDate.getDate() + 7);
          params.endDate = toIsoDate(endDate);
        } else if (timeWindow === 'month') {
          const endDate = new Date(today);
          endDate.setMonth(endDate.getMonth() + 1);
          params.endDate = toIsoDate(endDate);
        }
      } else if (filters.scope === 'past') {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        params.endDate = toIsoDate(yesterday);

        if (timeWindow === 'week') {
          const startDate = new Date(yesterday);
          startDate.setDate(startDate.getDate() - 7);
          params.startDate = toIsoDate(startDate);
        } else if (timeWindow === 'month') {
          const startDate = new Date(yesterday);
          startDate.setMonth(startDate.getMonth() - 1);
          params.startDate = toIsoDate(startDate);
        }
      }

      // 'all' scope: no date filters applied

      // Apply status filter if not 'all'
      if (filters.statusName && filters.statusName !== 'all') {
        params.statusName = filters.statusName;
      }

      // Apply semester filter if provided
      if (filters.semesterId) {
        params.semesterId = filters.semesterId;
      }
    }

    const lessons = await this.getLessons(params);

    // Client-side filtering: For 'upcoming' scope, filter out lessons whose end time has already passed
    if (filters?.scope === 'upcoming') {
      const now = Date.now();
      return lessons.filter(lesson => {
        // Parse the lesson's end date/time
        const [year, month, day] = lesson.scheduledDate.split('T')[0].split('-').map(Number);
        const [hours, minutes] = lesson.endTime.split(':').map(Number);

        // Create a Date object for the lesson end time
        const lessonEndDateTime = new Date(year, month - 1, day, hours, minutes);

        // If date parsing failed, include the lesson (fail-safe)
        if (Number.isNaN(lessonEndDateTime.getTime())) {
          return true;
        }

        // Only include lessons whose end time hasn't passed yet
        return lessonEndDateTime.getTime() > now;
      });
    }

    return lessons;
  }

  /** Get past unstarted lessons for a class that need documentation */
  async getPastUnstartedLessons(classId: string): Promise<LessonResponse[]> {
    try {
      const endpoint = `${LessonApiPaths.PAST_UNSTARTED}?classId=${classId}`;
      const raw = await apiService.get<unknown>(endpoint);
      return normalizeListResponse<LessonResponse>(raw);
    } catch (error: unknown) {
      const err = error as { status?: number };
      if (err.status === LessonHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to access past unstarted lessons');
      }
      if (err.status === LessonHttpStatus.BAD_REQUEST) {
        throw makeApiError(error, 'Invalid request for past unstarted lessons');
      }
      throw makeApiError(error, `Failed to fetch past unstarted lessons: ${(error as Error).message || 'Unknown error'}`);
    }
  }

  /** Get count of past unstarted lessons for a class (lightweight endpoint for banner) */
  async getPastUnstartedCount(classId: string): Promise<PastUnstartedCountResponse> {
    try {
      const endpoint = `${LessonApiPaths.PAST_UNSTARTED_COUNT}?classId=${classId}`;
      return await apiService.get<PastUnstartedCountResponse>(endpoint);
    } catch (error: unknown) {
      const err = error as { status?: number };
      if (err.status === LessonHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to access past unstarted lessons count');
      }
      if (err.status === LessonHttpStatus.BAD_REQUEST) {
        throw makeApiError(error, 'Invalid request for past unstarted lessons count');
      }
      throw makeApiError(error, `Failed to fetch past unstarted lessons count: ${(error as Error).message || 'Unknown error'}`);
    }
  }

  /** Get the current active lesson for a class (authoritative server-side determination) */
  async getCurrentLesson(classId: string): Promise<LessonResponse> {
    try {
      const endpoint = `${LessonApiPaths.BASE}/current?classId=${classId}`;
      return await apiService.get<LessonResponse>(endpoint);
    } catch (error: any) {
      if (error.status === LessonHttpStatus.NOT_FOUND) {
        throw makeApiError(error, 'No lesson is currently active for this class');
      }
      if (error.status === LessonHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to access current lesson');
      }
      throw makeApiError(error, `Failed to fetch current lesson: ${error.message || 'Unknown error'}`);
    }
  }

  /** Get the next scheduled lesson for a class after a given date */
  async getNextLesson(classId: string, fromDate?: string, limit?: number): Promise<LessonResponse> {
    try {
      const qs = new URLSearchParams();
      qs.append('classId', classId);
      if (fromDate) qs.append('fromDate', fromDate);
      if (limit) qs.append('limit', String(limit));

      const endpoint = `${LessonApiPaths.BASE}/next?${qs.toString()}`;
      return await apiService.get<LessonResponse>(endpoint);
    } catch (error: any) {
      if (error.status === LessonHttpStatus.NOT_FOUND) {
        throw makeApiError(error, 'No future lessons scheduled for this class');
      }
      if (error.status === LessonHttpStatus.BAD_REQUEST) {
        const detail = formatProblemDetails(error.details);
        throw makeApiError(error, detail || 'Invalid parameters for next lesson query');
      }
      if (error.status === LessonHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to access next lesson');
      }
      throw makeApiError(error, `Failed to fetch next lesson: ${error.message || 'Unknown error'}`);
    }
  }

  /** Create a new lesson */
  async createLesson(request: CreateLessonRequest): Promise<LessonCreatedResponse> {
    try {
return await apiService.post<LessonCreatedResponse>(LessonApiPaths.BASE, request);
    } catch (error: any) {
      if (error.status === LessonHttpStatus.CONFLICT) {
        throw makeApiError(error, 'Schedule conflict detected - lesson cannot be created');
      }
      if (error.status === LessonHttpStatus.BAD_REQUEST) {
        const details = error.details;
        if (details?.detail?.includes('class not found')) {
          throw makeApiError(error, 'The selected class does not exist');
        }
        if (details?.detail?.includes('invalid date')) {
          throw makeApiError(error, 'Invalid lesson date provided');
        }
        if (details?.detail?.includes('invalid time')) {
          throw makeApiError(error, 'Invalid lesson time provided');
        }
        throw makeApiError(error, `Validation error: ${details?.detail || 'Invalid lesson data'}`);
      }
      if (error.status === LessonHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to create lessons');
      }
      throw makeApiError(error, `Failed to create lesson: ${error.message || 'Unknown error'}`);
    }
  }

  /** Cancel a lesson */
  async cancelLesson(id: string, request: CancelLessonRequest): Promise<LessonResponse> {
    try {
      
return await apiService.patch<LessonResponse>(LessonApiPaths.CANCEL(id), request);
    } catch (error: any) {
      if (error.status === LessonHttpStatus.NOT_FOUND) {
        throw makeApiError(error, 'Lesson not found');
      }
      if (error.status === LessonHttpStatus.BAD_REQUEST) {
        const details = error.details;
        if (details?.detail?.includes('cannot cancel')) {
          throw makeApiError(error, 'Lesson cannot be cancelled in its current status');
        }
        throw makeApiError(error, `Validation error: ${details?.detail || 'Invalid cancellation request'}`);
      }
      if (error.status === LessonHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to cancel lessons');
      }
      throw makeApiError(error, `Failed to cancel lesson: ${error.message || 'Unknown error'}`);
    }
  }

  /** Mark lesson as conducted */
  async conductLesson(id: string, request: MarkLessonConductedRequest = {}): Promise<LessonResponse> {
    try {

return await apiService.patch<LessonResponse>(LessonApiPaths.CONDUCT(id), request);
    } catch (error: any) {
      if (error.status === LessonHttpStatus.NOT_FOUND) {
        throw makeApiError(error, 'Lesson not found');
      }
      if (error.status === LessonHttpStatus.BAD_REQUEST) {
        const details = error.details;
        const errorType = (details?.type || details?.Type || '') as string;
        if (typeof errorType === 'string' && errorType.toLowerCase().includes('lesson_not_started_yet')) {
          throw makeApiError(error, details?.detail || 'Cannot conduct this lesson yet. Please wait until the start time.');
        }
        if (details?.detail?.includes('cannot conduct')) {
          throw makeApiError(error, 'Lesson cannot be conducted in its current status');
        }
        throw makeApiError(error, `Validation error: ${details?.detail || 'Invalid conduct request'}`);
      }
      if (error.status === LessonHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to conduct lessons');
      }
      throw makeApiError(error, `Failed to conduct lesson: ${error.message || 'Unknown error'}`);
    }
  }

  /** Reschedule a lesson to a new date and time */
  async rescheduleLesson(id: string, request: RescheduleLessonRequest): Promise<LessonResponse> {
    try {
      return await apiService.patch<LessonResponse>(LessonApiPaths.RESCHEDULE(id), request);
    } catch (error: any) {
      if (error.status === LessonHttpStatus.NOT_FOUND) {
        throw makeApiError(error, 'Lesson not found');
      }
      if (error.status === LessonHttpStatus.CONFLICT) {
        const details = error.details;
        throw makeApiError(error, details?.detail || 'Schedule conflict detected at the new time');
      }
      if (error.status === LessonHttpStatus.BAD_REQUEST) {
        const details = error.details;
        if (details?.detail?.includes('cannot reschedule')) {
          throw makeApiError(error, 'Lesson cannot be rescheduled in its current status');
        }
        if (details?.detail?.includes('past date')) {
          throw makeApiError(error, 'Cannot reschedule to a past date');
        }
        throw makeApiError(error, `Validation error: ${details?.detail || 'Invalid reschedule request'}`);
      }
      if (error.status === LessonHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to reschedule lessons');
      }
      throw makeApiError(error, `Failed to reschedule lesson: ${error.message || 'Unknown error'}`);
    }
  }

  /** Get lesson notes */
  async getLessonNotes(id: string): Promise<LessonNotesResponse> {
    try {
      return await apiService.get<LessonNotesResponse>(LessonApiPaths.NOTES(id));
    } catch (error: any) {
      if (error.status === LessonHttpStatus.NOT_FOUND) {
        throw makeApiError(error, 'Lesson not found');
      }
      if (error.status === LessonHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to access lesson notes');
      }
      throw makeApiError(error, `Failed to fetch lesson notes: ${error.message || 'Unknown error'}`);
    }
  }

  /** Update lesson notes */
  async updateLessonNotes(id: string, notes: string | null): Promise<LessonNotesResponse> {
    try {
      const request = { notes };
      return await apiService.put<LessonNotesResponse>(LessonApiPaths.NOTES(id), request);
    } catch (error: any) {
      if (error.status === LessonHttpStatus.NOT_FOUND) {
        throw makeApiError(error, 'Lesson not found');
      }
      if (error.status === LessonHttpStatus.BAD_REQUEST) {
        throw makeApiError(error, 'Invalid notes data provided');
      }
      if (error.status === LessonHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to update lesson notes');
      }
      throw makeApiError(error, `Failed to update lesson notes: ${error.message || 'Unknown error'}`);
    }
  }

  /** Create makeup lesson for a cancelled lesson */
  async createMakeupLesson(originalLessonId: string, request: CreateMakeupLessonRequest): Promise<LessonCreatedResponse> {
    try {
      
return await apiService.post<LessonCreatedResponse>(LessonApiPaths.MAKEUP(originalLessonId), request);
    } catch (error: any) {
      if (error.status === LessonHttpStatus.NOT_FOUND) {
        throw makeApiError(error, 'Original lesson not found');
      }
      if (error.status === LessonHttpStatus.CONFLICT) {
        throw makeApiError(error, 'Schedule conflict detected - makeup lesson cannot be created');
      }
      if (error.status === LessonHttpStatus.BAD_REQUEST) {
        const details = error.details;
        if (details?.detail?.includes('not cancelled')) {
          throw makeApiError(error, 'Only cancelled lessons can have makeup lessons');
        }
        if (details?.detail?.includes('already has makeup')) {
          throw makeApiError(error, 'This lesson already has a makeup lesson');
        }
        throw makeApiError(error, `Validation error: ${details?.detail || 'Invalid makeup lesson request'}`);
      }
      if (error.status === LessonHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to create makeup lessons');
      }
      throw makeApiError(error, `Failed to create makeup lesson: ${error.message || 'Unknown error'}`);
    }
  }

  /** Generate lessons for a class based on schedule pattern */
  async generateLessons(request: GenerateLessonsRequest): Promise<LessonGenerationResult> {
    try {
      
return await apiService.post<LessonGenerationResult>(LessonApiPaths.GENERATE, request);
    } catch (error: any) {
      if (error.status === LessonHttpStatus.NOT_FOUND) {
        throw makeApiError(error, 'Class not found or has no schedule pattern');
      }
      if (error.status === LessonHttpStatus.BAD_REQUEST) {
        const details = error.details;
        if (details?.detail?.includes('invalid date range')) {
          throw makeApiError(error, 'Invalid date range for lesson generation');
        }
        if (details?.detail?.includes('no schedule')) {
          throw makeApiError(error, 'Class has no schedule pattern to generate lessons from');
        }
        throw makeApiError(error, `Validation error: ${details?.detail || 'Invalid generation request'}`);
      }
      if (error.status === LessonHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to generate lessons');
      }
      throw makeApiError(error, `Failed to generate lessons: ${error.message || 'Unknown error'}`);
    }
  }

  /** Generate lessons with academic calendar awareness */
  async generateLessonsAcademicAware(
    classId: string, 
    request: GenerateLessonsAcademicAwareRequest
  ): Promise<EnhancedLessonGenerationResult> {
    try {
      // Strip deprecated field to avoid confusion; server ignores it anyway
      const { respectHolidays: _ignored, ...payload } = request as any;
      return await apiService.post<EnhancedLessonGenerationResult>(
        LessonApiPaths.GENERATE_ACADEMIC(classId), 
        payload
      );
    } catch (error: any) {
      if (error.status === LessonHttpStatus.NOT_FOUND) {
        throw makeApiError(error, 'Class not found or has no schedule pattern');
      }
      if (error.status === LessonHttpStatus.BAD_REQUEST) {
        const details = error.details;
        if (details?.detail?.includes('invalid date range')) {
          throw makeApiError(error, 'Invalid date range for lesson generation');
        }
        if (details?.detail?.includes('no schedule')) {
          throw makeApiError(error, 'Class has no schedule pattern to generate lessons from');
        }
        if (details?.detail?.includes('academic_year_id is required')) {
          throw makeApiError(error, 'Academic year is required for this generation mode');
        }
        if (details?.detail?.includes('semester_id is required')) {
          throw makeApiError(error, 'Semester is required for this generation mode');
        }
        throw makeApiError(error, `Validation error: ${details?.detail || 'Invalid generation request'}`);
      }
      if (error.status === LessonHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to generate lessons');
      }
      throw makeApiError(error, `Failed to generate lessons with academic awareness: ${error.message || 'Unknown error'}`);
    }
  }

  /** Check for schedule conflicts */
  async checkConflicts(
    classId: string,
    scheduledDate: string, 
    startTime: string, 
    endTime: string, 
    excludeLessonId?: string
  ): Promise<ConflictCheckResult> {
    try {
      const qs = new URLSearchParams();
      if (classId) qs.append('classId', classId);
      qs.append('scheduledDate', scheduledDate);
      qs.append('startTime', startTime);
      qs.append('endTime', endTime);
      if (excludeLessonId) qs.append('excludeLessonId', excludeLessonId);

      const endpoint = `${LessonApiPaths.CONFLICTS}?${qs.toString()}`;
      
      const result = await apiService.get<ConflictCheckResult>(endpoint);
      
      // Ensure conflicts is always an array
      if (!result.conflicts) {
        result.conflicts = [];
      }
      
      return result;
    } catch (error: any) {
      if (error.status === LessonHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to check conflicts');
      }
      if (error.status === LessonHttpStatus.BAD_REQUEST) {
        throw makeApiError(error, 'Invalid conflict check parameters');
      }
      throw makeApiError(error, `Failed to check conflicts: ${error.message || 'Unknown error'}`);
    }
  }

  /** Get lessons for today */
  async getTodayLessons(): Promise<LessonResponse[]> {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    return this.getLessons({ 
      startDate: today, 
      endDate: today
    });
  }

  /** Get upcoming lessons (next 7 days) */
  async getUpcomingLessons(days: number = 7): Promise<LessonResponse[]> {
    const today = new Date();
    const endDate = new Date(today.getTime() + (days * 24 * 60 * 60 * 1000));
    
    return this.getLessons({ 
      startDate: today.toISOString().split('T')[0], 
      endDate: endDate.toISOString().split('T')[0],
      statusName: 'Scheduled'
    });
  }

  /** Get lessons by teacher */
  async getLessonsByTeacher(teacherId: string): Promise<LessonResponse[]> {
    return this.getLessons({ teacherId });
  }

  /** Get lessons by classroom */
  async getLessonsByClassroom(classroomId: string): Promise<LessonResponse[]> {
    return this.getLessons({ classroomId });
  }

  /** Get lessons by status */
  async getLessonsByStatus(statusName: string): Promise<LessonResponse[]> {
    return this.getLessons({ statusName: statusName as any });
  }

  /** Get lessons by semester */
  async getLessonsBySemester(semesterId: string): Promise<LessonResponse[]> {
    return this.getLessons({ semesterId });
  }

  /** Get lessons by class with optional semester filter */
  async getLessonsByClass(classId: string, semesterId?: string): Promise<LessonResponse[]> {
    return this.getLessons({ classId, semesterId });
  }

  /** Get lessons in date range */
  async getLessonsInRange(startDate: string, endDate: string, classId?: string): Promise<LessonResponse[]> {
    return this.getLessons({
      startDate,
      endDate,
      classId,
      includeHistory: true
    });
  }

  /** Quick status change - conduct lesson with current timestamp */
  async quickConductLesson(id: string, notes?: string): Promise<LessonResponse> {
    return this.conductLesson(id, { 
      conductedAt: new Date().toISOString(),
      notes 
    });
  }

  /** Quick cancel with reason and optional makeup lesson */
  async quickCancelLesson(id: string, reason: string, makeupData?: MakeupLessonFormData): Promise<LessonResponse> {
    if (makeupData) {
      // First cancel the lesson
      const cancelledLesson = await this.cancelLesson(id, { 
        cancellationReason: reason
      });
      
      // Then create the makeup lesson
      await this.createMakeupLesson(id, makeupData);
      
      // Return the updated lesson with makeup link
      return await this.getLessonById(id);
    } else {
      return this.cancelLesson(id, { 
        cancellationReason: reason
      });
    }
  }

  /** Batch generate lessons for multiple date ranges */
  async batchGenerateLessons(classId: string, dateRanges: { start: string; end: string }[]): Promise<LessonGenerationResult[]> {
    const results: LessonGenerationResult[] = [];
    
    for (const range of dateRanges) {
      try {
        const result = await this.generateLessons({
          classId,
          startDate: range.start,
          endDate: range.end,
          skipExistingConflicts: true
        });
        results.push(result);
      } catch (error) {
        // Continue with other ranges even if one fails
        console.error(`Failed to generate lessons for range ${range.start} - ${range.end}:`, error);
        results.push({
          lessonsCreated: 0,
          conflictsSkipped: 0,
          conflicts: [{ 
            date: range.start, 
            time: '00:00 - 00:00', 
            reason: 'existing_lesson', 
            conflictDetails: 'Generation failed' 
          }]
        });
      }
    }
    
    return results;
  }
}

export const lessonApiService = new LessonApiService();

// Convenience exports matching project style
export const getLessons = (params?: LessonSearchParams) => lessonApiService.getLessons(params);
export const searchLessons = (params?: {
  classId?: string;
  teacherId?: string;
  statusId?: string;
  fromDate?: string;
  toDate?: string;
  skip?: number;
  take?: number;
}) => lessonApiService.searchLessons(params);
export const getLessonById = (id: string) => lessonApiService.getLessonById(id);
export const getLessonsForClass = (classId: string, filters?: ClassLessonFilterParams) => lessonApiService.getLessonsForClass(classId, filters);
export const getLessonsByClass = (classId: string, semesterId?: string) => lessonApiService.getLessonsByClass(classId, semesterId);
export const getLessonsBySemester = (semesterId: string) => lessonApiService.getLessonsBySemester(semesterId);
export const getPastUnstartedLessons = (classId: string) => lessonApiService.getPastUnstartedLessons(classId);
export const getPastUnstartedCount = (classId: string) => lessonApiService.getPastUnstartedCount(classId);
export const createLesson = (request: CreateLessonRequest) => lessonApiService.createLesson(request);
export const cancelLesson = (id: string, request: CancelLessonRequest) => lessonApiService.cancelLesson(id, request);
export const conductLesson = (id: string, request?: MarkLessonConductedRequest) => lessonApiService.conductLesson(id, request);
export const getLessonNotes = (id: string) => lessonApiService.getLessonNotes(id);
export const updateLessonNotes = (id: string, notes: string | null) => lessonApiService.updateLessonNotes(id, notes);
export const createMakeupLesson = (originalLessonId: string, request: CreateMakeupLessonRequest) => lessonApiService.createMakeupLesson(originalLessonId, request);
export const generateLessons = (request: GenerateLessonsRequest) => lessonApiService.generateLessons(request);
export const checkConflicts = (classId: string, date: string, start: string, end: string, exclude?: string) => lessonApiService.checkConflicts(classId, date, start, end, exclude);

// Quick access exports
export const getTodayLessons = () => lessonApiService.getTodayLessons();
export const getUpcomingLessons = (days?: number) => lessonApiService.getUpcomingLessons(days);
export const getNextLesson = (classId: string, fromDate?: string, limit?: number) => lessonApiService.getNextLesson(classId, fromDate, limit);
export const quickConductLesson = (id: string, notes?: string) => lessonApiService.quickConductLesson(id, notes);
export const quickCancelLesson = (id: string, reason: string, makeupData?: MakeupLessonFormData) => lessonApiService.quickCancelLesson(id, reason, makeupData);
export const rescheduleLesson = (id: string, request: RescheduleLessonRequest) => lessonApiService.rescheduleLesson(id, request);

export default lessonApiService;

