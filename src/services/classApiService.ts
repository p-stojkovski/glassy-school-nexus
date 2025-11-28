/**
 * Class API Service
 * Implements classes endpoints using global loading interceptor
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import apiService from './api';
import {
  ClassResponse,
  ClassCreatedResponse,
  CreateClassRequest,
  UpdateClassRequest,
  ClassSearchParams,
  ClassApiPaths,
  ClassHttpStatus,
  ProblemDetails,
  StudentLessonSummary,
  StudentLessonDetail,
  ArchivedScheduleSlotResponse,
} from '@/types/api/class';
import {
  ScheduleValidationRequest,
  ScheduleValidationResponse,
} from '@/types/api/scheduleValidation';
import {
  CreateScheduleSlotRequest,
  CreateScheduleSlotResponse,
  UpdateScheduleSlotRequest,
  UpdateScheduleSlotResponse,
  DeleteScheduleSlotResponse,
} from '@/types/api/scheduleSlot';

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
      (raw as any).classes,
      (raw as any).data,
      (raw as any).value,
    ];
    for (const candidate of candidates) {
      if (Array.isArray(candidate)) return candidate as T[];
    }
  }
  return [] as T[];
}

export class ClassApiService {

  /** Get all classes (summary) */
  async getAllClasses(): Promise<ClassResponse[]> {
    try {
      
const raw = await apiService.get<any>(ClassApiPaths.BASE);
      return normalizeListResponse<ClassResponse>(raw);
    } catch (error: any) {
      if (error.status === ClassHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to access classes');
      }
      throw makeApiError(error, `Failed to fetch classes: ${error.message || 'Unknown error'}`);
    }
  }

  /** Get class by ID (full details) */
  async getClassById(id: string): Promise<ClassResponse> {
    try {
      
return await apiService.get<ClassResponse>(ClassApiPaths.BY_ID(id));
    } catch (error: any) {
      if (error.status === ClassHttpStatus.NOT_FOUND) {
        throw makeApiError(error, 'Class not found');
      }
      if (error.status === ClassHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to access class details');
      }
      throw makeApiError(error, `Failed to fetch class: ${error.message || 'Unknown error'}`);
    }
  }

  /** Search classes (no pagination) */
  async searchClasses(params: ClassSearchParams = {}): Promise<ClassResponse[]> {
    try {
      const qs = new URLSearchParams();
      if (params.searchTerm) qs.append('searchTerm', params.searchTerm);
      if (params.subjectId) qs.append('subjectId', params.subjectId);
      if (params.teacherId) qs.append('teacherId', params.teacherId);
      if (params.onlyWithAvailableSlots !== undefined) qs.append('onlyWithAvailableSlots', String(params.onlyWithAvailableSlots));
      const endpoint = qs.toString() ? `${ClassApiPaths.SEARCH}?${qs.toString()}` : ClassApiPaths.SEARCH;
      
return await apiService.get<ClassResponse[]>(endpoint);
    } catch (error: any) {
      if (error.status === ClassHttpStatus.BAD_REQUEST) {
        if (error.details?.detail?.toLowerCase()?.includes('subject id')) {
          throw makeApiError(error, 'Subject ID must be a valid GUID');
        }
        throw makeApiError(error, 'Invalid search parameters provided');
      }
      if (error.status === ClassHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to search classes');
      }
      throw makeApiError(error, `Failed to search classes: ${error.message || 'Unknown error'}`);
    }
  }

  /** Create class */
  async createClass(request: CreateClassRequest): Promise<ClassCreatedResponse> {
    try {
      
return await apiService.post<ClassCreatedResponse>(ClassApiPaths.BASE, request);
    } catch (error: any) {
      if (error.status === ClassHttpStatus.CONFLICT) {
        // Let the error handler deal with 409 conflicts using backend detail message
        throw error;
      }
      if (error.status === ClassHttpStatus.BAD_REQUEST) {
        const details: ProblemDetails | undefined = error.details;
        if (details?.type?.includes('invalid_subject')) return makeApiError(error, 'The selected subject does not exist');
        if (details?.type?.includes('invalid_teacher')) return makeApiError(error, 'The selected teacher does not exist');
        if (details?.type?.includes('invalid_classroom')) return makeApiError(error, 'The selected classroom does not exist');
        const validationError = details?.detail || 'Invalid class data provided';
        throw makeApiError(error, `Validation error: ${validationError}`);
      }
      if (error.status === ClassHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to create classes');
      }
      throw makeApiError(error, `Failed to create class: ${error.message || 'Unknown error'}`);
    }
  }

  /** Update class */
  async updateClass(id: string, request: UpdateClassRequest): Promise<ClassResponse> {
    try {
      
return await apiService.put<ClassResponse>(ClassApiPaths.BY_ID(id), request);
    } catch (error: any) {
      if (error.status === ClassHttpStatus.NOT_FOUND) {
        throw makeApiError(error, 'Class not found');
      }
      if (error.status === ClassHttpStatus.CONFLICT) {
        // Let the error handler deal with 409 conflicts using backend detail message
        throw error;
      }
      if (error.status === ClassHttpStatus.BAD_REQUEST) {
        const details: ProblemDetails | undefined = error.details;
        if (details?.type?.includes('invalid_subject')) return makeApiError(error, 'The selected subject does not exist');
        if (details?.type?.includes('invalid_teacher')) return makeApiError(error, 'The selected teacher does not exist');
        if (details?.type?.includes('invalid_classroom')) return makeApiError(error, 'The selected classroom does not exist');
        const validationError = details?.detail || 'Invalid class data provided';
        throw makeApiError(error, `Validation error: ${validationError}`);
      }
      if (error.status === ClassHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to update classes');
      }
      throw makeApiError(error, `Failed to update class: ${error.message || 'Unknown error'}`);
    }
  }

  /** Delete class */
  async deleteClass(id: string): Promise<void> {
    try {
      
await apiService.delete<void>(ClassApiPaths.BY_ID(id));
    } catch (error: any) {
      if (error.status === ClassHttpStatus.NOT_FOUND) {
        throw makeApiError(error, 'Class not found');
      }
      if (error.status === ClassHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to delete classes');
      }
      throw makeApiError(error, `Failed to delete class: ${error.message || 'Unknown error'}`);
    }
  }

  /** Get aggregated student summaries for a class */
  async getClassStudentsSummary(classId: string): Promise<StudentLessonSummary[]> {
    try {
      const endpoint = `/api/classes/${classId}/students/summary`;
      const raw = await apiService.get<any>(endpoint);
      return normalizeListResponse<StudentLessonSummary>(raw);
    } catch (error: any) {
      if (error.status === ClassHttpStatus.NOT_FOUND) {
        throw makeApiError(error, 'Class not found');
      }
      if (error.status === ClassHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to view student summaries');
      }
      throw makeApiError(error, `Failed to fetch student summaries: ${error.message || 'Unknown error'}`);
    }
  }

  /** Get per-lesson details for a student in a class */
  async getClassStudentLessons(classId: string, studentId: string): Promise<StudentLessonDetail[]> {
    try {
      const endpoint = `/api/classes/${classId}/students/${studentId}/lessons`;
      const raw = await apiService.get<any>(endpoint);
      return normalizeListResponse<StudentLessonDetail>(raw);
    } catch (error: any) {
      if (error.status === ClassHttpStatus.NOT_FOUND) {
        throw makeApiError(error, 'Class or student not found');
      }
      if (error.status === ClassHttpStatus.FORBIDDEN) {
        throw makeApiError(error, 'Student is not enrolled in this class');
      }
      if (error.status === ClassHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to view lesson details');
      }
      throw makeApiError(error, `Failed to fetch student lesson details: ${error.message || 'Unknown error'}`);
    }
  }

  /** Get archived schedule slots for a class */
  async getArchivedSchedules(classId: string): Promise<ArchivedScheduleSlotResponse[]> {
    try {
      const raw = await apiService.get<any>(ClassApiPaths.ARCHIVED_SCHEDULES(classId));
      return normalizeListResponse<ArchivedScheduleSlotResponse>(raw);
    } catch (error: any) {
      if (error.status === ClassHttpStatus.NOT_FOUND) {
        throw makeApiError(error, 'Class not found');
      }
      if (error.status === ClassHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to view archived schedules');
      }
      throw makeApiError(error, `Failed to fetch archived schedules: ${error.message || 'Unknown error'}`);
    }
  }

  /** Validate schedule changes for conflicts and modifications */
  async validateScheduleChanges(
    classId: string,
    request: ScheduleValidationRequest
  ): Promise<ScheduleValidationResponse> {
    try {
      const endpoint = `/api/classes/${classId}/schedules/validate`;
      return await apiService.post<any>(endpoint, request);
    } catch (error: any) {
      if (error.status === ClassHttpStatus.NOT_FOUND) {
        throw makeApiError(error, 'Class not found');
      }
      if (error.status === ClassHttpStatus.BAD_REQUEST) {
        throw makeApiError(error, 'Invalid schedule data provided');
      }
      if (error.status === ClassHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to validate schedules');
      }
      throw makeApiError(error, `Failed to validate schedule changes: ${error.message || 'Unknown error'}`);
    }
  }

  /** Create a new schedule slot */
  async createScheduleSlot(
    classId: string,
    request: CreateScheduleSlotRequest
  ): Promise<CreateScheduleSlotResponse> {
    try {
      const endpoint = `/api/classes/${classId}/schedules/slots`;
      return await apiService.post<CreateScheduleSlotResponse>(endpoint, request);
    } catch (error: any) {
      if (error.status === ClassHttpStatus.NOT_FOUND) {
        throw makeApiError(error, 'Class not found');
      }
      if (error.status === ClassHttpStatus.BAD_REQUEST) {
        throw makeApiError(error, 'Invalid schedule slot data provided');
      }
      if (error.status === ClassHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to create schedule slots');
      }
      throw makeApiError(error, `Failed to create schedule slot: ${error.message || 'Unknown error'}`);
    }
  }

  /** Update an existing schedule slot */
  async updateScheduleSlot(
    classId: string,
    slotId: string,
    request: UpdateScheduleSlotRequest
  ): Promise<UpdateScheduleSlotResponse> {
    try {
      const endpoint = `/api/classes/${classId}/schedules/slots/${slotId}`;
      return await apiService.put<UpdateScheduleSlotResponse>(endpoint, request);
    } catch (error: any) {
      if (error.status === ClassHttpStatus.NOT_FOUND) {
        throw makeApiError(error, 'Class or schedule slot not found');
      }
      if (error.status === ClassHttpStatus.BAD_REQUEST) {
        throw makeApiError(error, 'Invalid schedule slot data provided');
      }
      if (error.status === ClassHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to update schedule slots');
      }
      throw makeApiError(error, `Failed to update schedule slot: ${error.message || 'Unknown error'}`);
    }
  }

  /** Delete a schedule slot */
  async deleteScheduleSlot(
    classId: string,
    slotId: string
  ): Promise<DeleteScheduleSlotResponse> {
    try {
      const endpoint = `/api/classes/${classId}/schedules/slots/${slotId}`;
      return await apiService.delete<DeleteScheduleSlotResponse>(endpoint);
    } catch (error: any) {
      if (error.status === ClassHttpStatus.NOT_FOUND) {
        throw makeApiError(error, 'Class or schedule slot not found');
      }
      if (error.status === ClassHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to delete schedule slots');
      }
      throw makeApiError(error, `Failed to delete schedule slot: ${error.message || 'Unknown error'}`);
    }
  }
}

export const classApiService = new ClassApiService();

// Convenience exports matching project style
export const getAllClasses = () => classApiService.getAllClasses();
export const getClassById = (id: string) => classApiService.getClassById(id);
export const searchClasses = (params?: ClassSearchParams) => classApiService.searchClasses(params);
export const createClass = (request: CreateClassRequest) => classApiService.createClass(request);
export const updateClass = (id: string, request: UpdateClassRequest) => classApiService.updateClass(id, request);
export const deleteClass = (id: string) => classApiService.deleteClass(id);
export const getClassStudentsSummary = (classId: string) => classApiService.getClassStudentsSummary(classId);
export const getClassStudentLessons = (classId: string, studentId: string) => classApiService.getClassStudentLessons(classId, studentId);
export const getArchivedSchedules = (classId: string) => classApiService.getArchivedSchedules(classId);
export const validateScheduleChanges = (classId: string, request: ScheduleValidationRequest) =>
  classApiService.validateScheduleChanges(classId, request);
export const createScheduleSlot = (classId: string, request: CreateScheduleSlotRequest) =>
  classApiService.createScheduleSlot(classId, request);
export const updateScheduleSlot = (classId: string, slotId: string, request: UpdateScheduleSlotRequest) =>
  classApiService.updateScheduleSlot(classId, slotId, request);
export const deleteScheduleSlot = (classId: string, slotId: string) =>
  classApiService.deleteScheduleSlot(classId, slotId);

