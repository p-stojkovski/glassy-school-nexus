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
  UpdateBasicInfoRequest,
  UpdateAdditionalDetailsRequest,
  ClassSearchParams,
  ClassApiPaths,
  ClassHttpStatus,
  ProblemDetails,
  StudentLessonSummary,
  StudentLessonDetail,
  ArchivedScheduleSlotResponse,
  ManageEnrollmentsRequest,
  ManageEnrollmentsResponse,
  TransferStudentRequest,
  TransferStudentResponse,
  ClassBasicInfoResponse,
  ClassScheduleResponse,
  ClassAdditionalDetailsResponse,
  AddStudentsRequest,
  AddStudentsResponse,
  RemoveStudentResponse,
  DisableClassResponse,
  EnableClassResponse,
  ClassListItemResponse,
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
  SuggestAvailableTimeSlotsRequest,
  SuggestAvailableTimeSlotsResponse,
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
      (raw as any).rules,
      (raw as any).Rules,
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

  /** Get class by ID (basic info only - schedule and additional details loaded separately) */
  async getClassById(id: string): Promise<ClassBasicInfoResponse> {
    try {
      
return await apiService.get<ClassBasicInfoResponse>(ClassApiPaths.BY_ID(id));
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

  /** Search classes (no pagination) - returns lightweight list items */
  async searchClasses(params: ClassSearchParams = {}): Promise<ClassListItemResponse[]> {
    try {
      const qs = new URLSearchParams();
      if (params.searchTerm) qs.append('searchTerm', params.searchTerm);
      if (params.subjectId) qs.append('subjectId', params.subjectId);
      if (params.teacherId) qs.append('teacherId', params.teacherId);
      if (params.academicYearId) qs.append('academicYearId', params.academicYearId);
      if (params.onlyWithAvailableSlots !== undefined) qs.append('onlyWithAvailableSlots', String(params.onlyWithAvailableSlots));
      if (params.includeDisabled !== undefined) qs.append('includeDisabled', String(params.includeDisabled));
      if (params.includeAllYears !== undefined) qs.append('includeAllYears', String(params.includeAllYears));
      const endpoint = qs.toString() ? `${ClassApiPaths.SEARCH}?${qs.toString()}` : ClassApiPaths.SEARCH;

return await apiService.get<ClassListItemResponse[]>(endpoint);
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

  /** Update basic class info only (name, subject, teacher, classroom) */
  async updateBasicInfo(id: string, request: UpdateBasicInfoRequest): Promise<ClassResponse> {
    try {
      return await apiService.patch<ClassResponse>(ClassApiPaths.BASIC_INFO(id), request);
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
        if (details?.type?.includes('invalid_subject')) throw makeApiError(error, 'The selected subject does not exist');
        if (details?.type?.includes('invalid_teacher')) throw makeApiError(error, 'The selected teacher does not exist');
        if (details?.type?.includes('invalid_classroom')) throw makeApiError(error, 'The selected classroom does not exist');
        const validationError = details?.detail || 'Invalid class data provided';
        throw makeApiError(error, `Validation error: ${validationError}`);
      }
      if (error.status === ClassHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to update class');
      }
      throw makeApiError(error, `Failed to update basic info: ${error.message || 'Unknown error'}`);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // LAZY LOADING ENDPOINTS
  // ═══════════════════════════════════════════════════════════════════════════

  /** Get class schedule (lazy loading - called when Schedule tab is viewed) */
  async getClassSchedule(id: string): Promise<ClassScheduleResponse> {
    try {
      return await apiService.get<ClassScheduleResponse>(ClassApiPaths.SCHEDULE(id));
    } catch (error: any) {
      if (error.status === ClassHttpStatus.NOT_FOUND) {
        throw makeApiError(error, 'Class not found');
      }
      if (error.status === ClassHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to view schedule');
      }
      throw makeApiError(error, `Failed to fetch schedule: ${error.message || 'Unknown error'}`);
    }
  }

  /** Get class additional details (lazy loading - called when Overview tab is viewed) */
  async getAdditionalDetails(id: string): Promise<ClassAdditionalDetailsResponse> {
    try {
      return await apiService.get<ClassAdditionalDetailsResponse>(ClassApiPaths.ADDITIONAL_DETAILS(id));
    } catch (error: any) {
      if (error.status === ClassHttpStatus.NOT_FOUND) {
        throw makeApiError(error, 'Class not found');
      }
      if (error.status === ClassHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to view additional details');
      }
      throw makeApiError(error, `Failed to fetch additional details: ${error.message || 'Unknown error'}`);
    }
  }

  /** Update additional class details only (description, requirements, objectives, materials) */
  async updateAdditionalDetails(id: string, request: UpdateAdditionalDetailsRequest): Promise<ClassResponse> {
    try {
      return await apiService.patch<ClassResponse>(ClassApiPaths.ADDITIONAL_DETAILS(id), request);
    } catch (error: any) {
      if (error.status === ClassHttpStatus.NOT_FOUND) {
        throw makeApiError(error, 'Class not found');
      }
      if (error.status === ClassHttpStatus.BAD_REQUEST) {
        const details: ProblemDetails | undefined = error.details;
        const validationError = details?.detail || 'Invalid details data provided';
        throw makeApiError(error, `Validation error: ${validationError}`);
      }
      if (error.status === ClassHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to update class');
      }
      throw makeApiError(error, `Failed to update additional details: ${error.message || 'Unknown error'}`);
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

  /** Disable class */
  async disableClass(id: string): Promise<DisableClassResponse> {
    try {
      return await apiService.post<DisableClassResponse>(ClassApiPaths.DISABLE(id), {});
    } catch (error: any) {
      if (error.status === ClassHttpStatus.NOT_FOUND) {
        throw makeApiError(error, 'Class not found');
      }
      if (error.status === ClassHttpStatus.CONFLICT) {
        throw makeApiError(error, 'Class is already disabled');
      }
      if (error.status === ClassHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to disable classes');
      }
      throw makeApiError(error, `Failed to disable class: ${error.message || 'Unknown error'}`);
    }
  }

  /** Enable class */
  async enableClass(id: string): Promise<EnableClassResponse> {
    try {
      return await apiService.post<EnableClassResponse>(ClassApiPaths.ENABLE(id), {});
    } catch (error: any) {
      if (error.status === ClassHttpStatus.NOT_FOUND) {
        throw makeApiError(error, 'Class not found');
      }
      if (error.status === ClassHttpStatus.CONFLICT) {
        throw makeApiError(error, 'Class is already active');
      }
      if (error.status === ClassHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to enable classes');
      }
      throw makeApiError(error, `Failed to enable class: ${error.message || 'Unknown error'}`);
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

  /** Get schedule slots filtered by semester */
  async getScheduleSlotsBySemester(
    classId: string,
    semesterId?: string | null
  ): Promise<ClassScheduleResponse> {
    try {
      const qs = new URLSearchParams();
      if (semesterId) {
        qs.append('semesterId', semesterId);
      }

      const endpoint = qs.toString()
        ? `${ClassApiPaths.SCHEDULE(classId)}?${qs.toString()}`
        : ClassApiPaths.SCHEDULE(classId);

      return await apiService.get<ClassScheduleResponse>(endpoint);
    } catch (error: any) {
      if (error.status === ClassHttpStatus.NOT_FOUND) {
        throw makeApiError(error, 'Class not found');
      }
      if (error.status === ClassHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to view schedule');
      }
      throw makeApiError(error, `Failed to fetch schedule slots: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Suggest available time slots (Phase 5: Intelligent Time Suggestions)
   *
   * Endpoint: POST /api/classes/{classId}/schedule-slots/suggest-available
   * See: /think-english-api/API_SPEC_TIME_SUGGESTIONS.md
   *
   * Analyzes teacher and classroom availability to suggest alternative time slots when conflicts are detected.
   */
  async suggestAvailableTimeSlots(
    classId: string,
    request: SuggestAvailableTimeSlotsRequest
  ): Promise<SuggestAvailableTimeSlotsResponse> {
    try {
      const endpoint = `/api/classes/${classId}/schedule-slots/suggest-available`;
      return await apiService.post<SuggestAvailableTimeSlotsResponse>(endpoint, request);
    } catch (error: any) {
      if (error.status === ClassHttpStatus.NOT_FOUND) {
        throw makeApiError(error, 'Class not found');
      }
      if (error.status === ClassHttpStatus.BAD_REQUEST) {
        throw makeApiError(error, 'Invalid request parameters');
      }
      if (error.status === ClassHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to suggest time slots');
      }
      throw makeApiError(error, `Failed to suggest time slots: ${error.message || 'Unknown error'}`);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ENROLLMENT MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Add students to a class.
   * Business rule: Students can only be enrolled in one class at a time.
   */
  async addStudentsToClass(
    classId: string,
    request: AddStudentsRequest
  ): Promise<AddStudentsResponse> {
    try {
      const endpoint = ClassApiPaths.ENROLLMENTS(classId);
      // Backend expects PascalCase: { StudentIdsToAdd, StudentIdsToRemove, IncludeTodayLesson }
      const backendRequest = {
        StudentIdsToAdd: request.studentIdsToAdd,
        StudentIdsToRemove: null,
        IncludeTodayLesson: request.includeTodayLesson,
      };
      return await apiService.post<AddStudentsResponse>(endpoint, backendRequest);
    } catch (error: any) {
      if (error.status === ClassHttpStatus.NOT_FOUND) {
        throw makeApiError(error, 'Class not found');
      }
      if (error.status === ClassHttpStatus.BAD_REQUEST) {
        throw makeApiError(error, error.message || 'Invalid enrollment request');
      }
      if (error.status === ClassHttpStatus.CONFLICT) {
        throw makeApiError(error, 'One or more students are already enrolled in another class');
      }
      if (error.status === ClassHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to manage enrollments');
      }
      throw makeApiError(error, `Failed to add students: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Remove a student from a class.
   * This marks the enrollment as inactive rather than deleting it.
   */
  async removeStudentFromClass(
    classId: string,
    studentId: string
  ): Promise<RemoveStudentResponse> {
    try {
      const endpoint = ClassApiPaths.ENROLLMENT_BY_STUDENT(classId, studentId);
      return await apiService.delete<RemoveStudentResponse>(endpoint);
    } catch (error: any) {
      if (error.status === ClassHttpStatus.NOT_FOUND) {
        throw makeApiError(error, 'Enrollment not found');
      }
      if (error.status === ClassHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to remove students');
      }
      throw makeApiError(error, `Failed to remove student: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Transfer a student from this class to another class.
   * Preserves enrollment history in the source class and creates new enrollment in target.
   */
  async transferStudent(
    classId: string,
    studentId: string,
    request: TransferStudentRequest
  ): Promise<TransferStudentResponse> {
    try {
      const endpoint = ClassApiPaths.ENROLLMENT_TRANSFER(classId, studentId);
      return await apiService.post<TransferStudentResponse>(endpoint, request);
    } catch (error: any) {
      if (error.status === ClassHttpStatus.NOT_FOUND) {
        throw makeApiError(error, 'Class or student enrollment not found');
      }
      if (error.status === ClassHttpStatus.BAD_REQUEST) {
        throw makeApiError(error, error.message || 'Invalid transfer request');
      }
      if (error.status === ClassHttpStatus.CONFLICT) {
        throw makeApiError(error, 'Student is already enrolled in the target class');
      }
      if (error.status === ClassHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to transfer students');
      }
      throw makeApiError(error, `Failed to transfer student: ${error.message || 'Unknown error'}`);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CLASS SALARY RULES (Phase 6.1 - Teacher Variable Salary)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Get all salary rules for a class
   */
  async getSalaryRules(classId: string): Promise<any[]> {
    try {
      const endpoint = `/api/classes/${classId}/salary-rules`;
      const raw = await apiService.get<any>(endpoint);
      return normalizeListResponse<any>(raw);
    } catch (error: any) {
      if (error.status === ClassHttpStatus.NOT_FOUND) {
        throw makeApiError(error, 'Class not found');
      }
      if (error.status === ClassHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to view salary rules');
      }
      throw makeApiError(error, `Failed to fetch salary rules: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Create a new salary rule for a class
   */
  async createSalaryRule(classId: string, data: any): Promise<any> {
    try {
      const endpoint = `/api/classes/${classId}/salary-rules`;
      return await apiService.post<any>(endpoint, data);
    } catch (error: any) {
      if (error.status === ClassHttpStatus.NOT_FOUND) {
        throw makeApiError(error, 'Class not found');
      }
      if (error.status === ClassHttpStatus.BAD_REQUEST) {
        throw makeApiError(error, error.message || 'Invalid salary rule data');
      }
      if (error.status === ClassHttpStatus.CONFLICT) {
        throw makeApiError(error, 'A salary rule with overlapping dates already exists');
      }
      if (error.status === ClassHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to create salary rules');
      }
      throw makeApiError(error, `Failed to create salary rule: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Update an existing salary rule
   */
  async updateSalaryRule(classId: string, ruleId: string, data: any): Promise<any> {
    try {
      const endpoint = `/api/classes/${classId}/salary-rules/${ruleId}`;
      return await apiService.put<any>(endpoint, data);
    } catch (error: any) {
      if (error.status === ClassHttpStatus.NOT_FOUND) {
        throw makeApiError(error, 'Class or salary rule not found');
      }
      if (error.status === ClassHttpStatus.BAD_REQUEST) {
        throw makeApiError(error, error.message || 'Invalid salary rule data');
      }
      if (error.status === ClassHttpStatus.CONFLICT) {
        throw makeApiError(error, 'A salary rule with overlapping dates already exists');
      }
      if (error.status === ClassHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to update salary rules');
      }
      throw makeApiError(error, `Failed to update salary rule: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Delete a salary rule
   */
  async deleteSalaryRule(classId: string, ruleId: string): Promise<void> {
    try {
      const endpoint = `/api/classes/${classId}/salary-rules/${ruleId}`;
      await apiService.delete<void>(endpoint);
    } catch (error: any) {
      if (error.status === ClassHttpStatus.NOT_FOUND) {
        throw makeApiError(error, 'Class or salary rule not found');
      }
      if (error.status === ClassHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to delete salary rules');
      }
      throw makeApiError(error, `Failed to delete salary rule: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Get salary preview for a specific month
   */
  async getSalaryPreview(classId: string, year: number, month: number): Promise<any> {
    try {
      const endpoint = `/api/classes/${classId}/salary-preview?year=${year}&month=${month}`;
      return await apiService.get<any>(endpoint);
    } catch (error: any) {
      if (error.status === ClassHttpStatus.NOT_FOUND) {
        throw makeApiError(error, 'Class not found');
      }
      if (error.status === ClassHttpStatus.BAD_REQUEST) {
        throw makeApiError(error, 'Invalid year or month parameters');
      }
      if (error.status === ClassHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to view salary preview');
      }
      throw makeApiError(error, `Failed to fetch salary preview: ${error.message || 'Unknown error'}`);
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
export const updateBasicInfo = (id: string, request: UpdateBasicInfoRequest) => classApiService.updateBasicInfo(id, request);
export const updateAdditionalDetails = (id: string, request: UpdateAdditionalDetailsRequest) => classApiService.updateAdditionalDetails(id, request);
export const deleteClass = (id: string) => classApiService.deleteClass(id);
export const disableClass = (id: string) => classApiService.disableClass(id);
export const enableClass = (id: string) => classApiService.enableClass(id);
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
export const getScheduleSlotsBySemester = (classId: string, semesterId?: string | null) =>
  classApiService.getScheduleSlotsBySemester(classId, semesterId);
export const suggestAvailableTimeSlots = (classId: string, request: SuggestAvailableTimeSlotsRequest) =>
  classApiService.suggestAvailableTimeSlots(classId, request);

// Enrollment management
export const addStudentsToClass = (classId: string, request: AddStudentsRequest) =>
  classApiService.addStudentsToClass(classId, request);
export const removeStudentFromClass = (classId: string, studentId: string) =>
  classApiService.removeStudentFromClass(classId, studentId);
export const transferStudent = (classId: string, studentId: string, request: TransferStudentRequest) =>
  classApiService.transferStudent(classId, studentId, request);

// Salary rules (Phase 6.1 - Teacher Variable Salary)
export const getSalaryRules = (classId: string) =>
  classApiService.getSalaryRules(classId);
export const createSalaryRule = (classId: string, data: any) =>
  classApiService.createSalaryRule(classId, data);
export const updateSalaryRule = (classId: string, ruleId: string, data: any) =>
  classApiService.updateSalaryRule(classId, ruleId, data);
export const deleteSalaryRule = (classId: string, ruleId: string) =>
  classApiService.deleteSalaryRule(classId, ruleId);
export const getSalaryPreview = (classId: string, year: number, month: number) =>
  classApiService.getSalaryPreview(classId, year, month);

