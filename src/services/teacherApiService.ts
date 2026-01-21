/**
 * Teacher API Service
 * Implements all teacher-related API endpoints using the existing API infrastructure
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import apiService from './api';
import {
  TeacherResponse,
  TeacherCreatedResponse,
  TeacherOverviewResponse,
  TeacherClassDto,
  TeacherClassesResponse,
  TeacherClassesParams,
  TeacherScheduleResponse,
  TeacherScheduleSlotDto,
  TeacherScheduleParams,
  TeacherStudentsResponse,
  TeacherStudentDto,
  TeacherStudentsParams,
  TeacherClassPaymentSummaryResponse,
  SubjectDto,
  CreateTeacherRequest,
  UpdateTeacherRequest,
  TeacherSearchParams,
  TeacherApiPaths,
  TeacherHttpStatus,
  EmploymentSettingsResponse,
} from '@/types/api/teacher';
import {
  TeacherSalaryConfigResponse,
  TeacherSalaryConfigHistoryResponse,
  SetTeacherSalaryConfigRequest,
  UpdateTeacherSalaryConfigRequest,
  TeacherSalaryConfigApiPaths,
} from '@/types/api/teacherSalaryConfig';
import {
  TeacherLessonsResponse,
  TeacherLessonsQueryParams,
} from '@/types/api/teacherLesson';
import {
  TeacherSalaryResponse,
  TeacherSalaryApiPaths,
} from '@/types/api/teacherSalary';
import {
  SalaryCalculation,
  SalaryCalculationDetail,
  SalaryAdjustment,
  TeacherSalaryPreview,
  GenerateSalaryRequest,
  ApproveSalaryRequest,
  ReopenSalaryRequest,
  CreateSalaryAdjustmentRequest,
  SalaryCalculationFilters,
  SalaryCalculationApiPaths,
} from '@/domains/teachers/_shared/types/salaryCalculation.types';

// Preserve status/details/code when rethrowing with a custom message
function makeApiError(original: any, message: string): Error & { status?: number; details?: any; code?: string } {
  const err: any = new Error(message);
  if (original) {
    err.status = original.status;
    err.details = original.details;
    // Extract error code from ProblemDetails type field
    // Backend returns: { type: "https://api.thinkenglish.com/errors/error_code", ... }
    // Or: { type: "error_code", ... }
    const type = original.details?.type || original.details?.Type;
    if (typeof type === 'string') {
      // Extract code from URL format or use as-is
      err.code = type.includes('/errors/') ? type.split('/errors/').pop() : type;
    }
  }
  return err as Error & { status?: number; details?: any; code?: string };
}

// Normalize API responses that may wrap arrays in different shapes
function normalizeListResponse<T>(raw: any): T[] {
  if (Array.isArray(raw)) return raw as T[];
  if (raw && typeof raw === 'object') {
    const candidates = [
      (raw as any).items,
      (raw as any).results,
      (raw as any).teachers,
      (raw as any).data,
      (raw as any).value,
    ];
    for (const candidate of candidates) {
      if (Array.isArray(candidate)) return candidate as T[];
    }
  }
  return [] as T[];
}

export class TeacherApiService {
  
  /**
   * Get all teachers in the system with optional filtering
   * @param searchParams - Optional search parameters
   * @returns Promise<TeacherResponse[]>
   */
  async getAllTeachers(searchParams?: TeacherSearchParams): Promise<TeacherResponse[]> {
    try {
      let endpoint = TeacherApiPaths.BASE;
      
      if (searchParams && (searchParams.searchTerm || searchParams.subjectId)) {
        const params = new URLSearchParams();
        
        if (searchParams.searchTerm) {
          params.append('searchTerm', searchParams.searchTerm);
        }
        
        if (searchParams.subjectId) {
          params.append('subjectId', searchParams.subjectId);
        }
        
        const queryString = params.toString();
        endpoint = `${endpoint}?${queryString}`;
      }
      
const raw = await apiService.get<any>(endpoint);
      const teachers = normalizeListResponse<TeacherResponse>(raw);
      return teachers;
    } catch (error: any) {
      if (error.status === TeacherHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to access teachers');
      }
      throw makeApiError(error, `Failed to fetch teachers: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Get a specific teacher by their unique identifier
   * @param id - Teacher ID (UUID format)
   * @returns Promise<TeacherResponse>
   */
  async getTeacherById(id: string): Promise<TeacherResponse> {
    try {

const teacher = await apiService.get<TeacherResponse>(TeacherApiPaths.BY_ID(id));
      return teacher;
    } catch (error: any) {
      if (error.status === TeacherHttpStatus.NOT_FOUND) {
        throw makeApiError(error, 'Teacher not found');
      }
      if (error.status === TeacherHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to access teacher details');
      }
      throw makeApiError(error, `Failed to fetch teacher: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Get teacher overview data (aggregated metrics for profile Overview tab)
   * @param id - Teacher ID (UUID format)
   * @returns Promise<TeacherOverviewResponse>
   */
  async getTeacherOverview(id: string): Promise<TeacherOverviewResponse> {
    try {
      const overview = await apiService.get<TeacherOverviewResponse>(TeacherApiPaths.OVERVIEW(id));
      return overview;
    } catch (error: any) {
      if (error.status === TeacherHttpStatus.NOT_FOUND) {
        throw makeApiError(error, 'Teacher not found');
      }
      if (error.status === TeacherHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to access teacher overview');
      }
      throw makeApiError(error, `Failed to fetch teacher overview: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Get classes assigned to a teacher
   * @param id - Teacher ID (UUID format)
   * @param params - Optional filter parameters (academicYearId, isActive)
   * @returns Promise<TeacherClassDto[]>
   */
  async getTeacherClasses(id: string, params?: TeacherClassesParams): Promise<TeacherClassDto[]> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.academicYearId) {
        queryParams.append('academicYearId', params.academicYearId);
      }
      if (params?.isActive !== undefined) {
        queryParams.append('isActive', String(params.isActive));
      }

      const queryString = queryParams.toString();
      const endpoint = queryString
        ? `${TeacherApiPaths.CLASSES(id)}?${queryString}`
        : TeacherApiPaths.CLASSES(id);

      const response = await apiService.get<TeacherClassesResponse>(endpoint);
      return response.classes || [];
    } catch (error: any) {
      if (error.status === TeacherHttpStatus.NOT_FOUND) {
        throw makeApiError(error, 'Teacher not found');
      }
      if (error.status === TeacherHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to access teacher classes');
      }
      throw makeApiError(error, `Failed to fetch teacher classes: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Get teacher's weekly teaching schedule (all classes aggregated)
   * @param id - Teacher ID (UUID format)
   * @param params - Optional filter parameters (activeClassesOnly)
   * @returns Promise<TeacherScheduleResponse>
   */
  async getTeacherSchedule(id: string, params?: TeacherScheduleParams): Promise<TeacherScheduleResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.activeClassesOnly !== undefined) {
        queryParams.append('activeClassesOnly', String(params.activeClassesOnly));
      }

      const queryString = queryParams.toString();
      const endpoint = queryString
        ? `${TeacherApiPaths.SCHEDULE(id)}?${queryString}`
        : TeacherApiPaths.SCHEDULE(id);

      const response = await apiService.get<TeacherScheduleResponse>(endpoint);
      return response;
    } catch (error: any) {
      if (error.status === TeacherHttpStatus.NOT_FOUND) {
        throw makeApiError(error, 'Teacher not found');
      }
      if (error.status === TeacherHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to access teacher schedule');
      }
      throw makeApiError(error, `Failed to fetch teacher schedule: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Get students taught by a teacher across all their classes
   * @param id - Teacher ID (UUID format)
   * @param params - Optional filter parameters (classId, activeEnrollmentsOnly)
   * @returns Promise<TeacherStudentsResponse>
   */
  async getTeacherStudents(id: string, params?: TeacherStudentsParams): Promise<TeacherStudentsResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.classId) {
        queryParams.append('classId', params.classId);
      }
      if (params?.activeEnrollmentsOnly !== undefined) {
        queryParams.append('activeEnrollmentsOnly', String(params.activeEnrollmentsOnly));
      }

      const queryString = queryParams.toString();
      const endpoint = queryString
        ? `${TeacherApiPaths.STUDENTS(id)}?${queryString}`
        : TeacherApiPaths.STUDENTS(id);

      const response = await apiService.get<TeacherStudentsResponse>(endpoint);
      return response;
    } catch (error: any) {
      if (error.status === TeacherHttpStatus.NOT_FOUND) {
        throw makeApiError(error, 'Teacher not found');
      }
      if (error.status === TeacherHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to access teacher students');
      }
      throw makeApiError(error, `Failed to fetch teacher students: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Get teacher's classes with payment summary data (mock payment data)
   * @param id - Teacher ID (UUID format)
   * @returns Promise<TeacherClassPaymentSummaryResponse>
   */
  async getTeacherClassesPaymentSummary(id: string): Promise<TeacherClassPaymentSummaryResponse> {
    try {
      const response = await apiService.get<TeacherClassPaymentSummaryResponse>(
        TeacherApiPaths.CLASSES_PAYMENT_SUMMARY(id)
      );
      return response;
    } catch (error: any) {
      if (error.status === TeacherHttpStatus.NOT_FOUND) {
        throw makeApiError(error, 'Teacher not found');
      }
      if (error.status === TeacherHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to access teacher class payments');
      }
      throw makeApiError(error, `Failed to fetch teacher class payment summary: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Create a new teacher with subject assignment
   * @param request - Teacher creation data
   * @returns Promise<TeacherCreatedResponse>
   */
  async createTeacher(request: CreateTeacherRequest): Promise<TeacherCreatedResponse> {
    try {
      
const result = await apiService.post<TeacherCreatedResponse>(
        TeacherApiPaths.BASE,
        request
      );
      return result;
    } catch (error: any) {
      if (error.status === TeacherHttpStatus.CONFLICT) {
        // Check the error message to determine the type of conflict
        if (error.details?.detail?.includes('email') || error.message?.toLowerCase?.().includes('email')) {
          throw makeApiError(error, 'A teacher with this email address already exists');
        }
        throw makeApiError(error, 'Teacher data conflicts with existing records');
      }
      if (error.status === TeacherHttpStatus.BAD_REQUEST) {
        // Extract validation error details if available
        if (error.details?.detail?.includes('Subject')) {
          throw makeApiError(error, 'The selected subject does not exist');
        }
        const validationError = error.details?.detail || 'Invalid teacher data provided';
        throw makeApiError(error, `Validation error: ${validationError}`);
      }
      if (error.status === TeacherHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to create teachers');
      }
      throw makeApiError(error, `Failed to create teacher: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Update an existing teacher
   * @param id - Teacher ID to update
   * @param request - Updated teacher data
   * @returns Promise<TeacherResponse>
   */
  async updateTeacher(id: string, request: UpdateTeacherRequest): Promise<TeacherResponse> {
    try {
      
const result = await apiService.put<TeacherResponse>(
        TeacherApiPaths.BY_ID(id),
        request
      );
      return result;
    } catch (error: any) {
      if (error.status === TeacherHttpStatus.NOT_FOUND) {
        throw makeApiError(error, 'Teacher not found');
      }
      if (error.status === TeacherHttpStatus.CONFLICT) {
        // Check the error message to determine the type of conflict
        if (error.details?.detail?.includes('email') || error.message?.toLowerCase?.().includes('email')) {
          throw makeApiError(error, 'A teacher with this email address already exists');
        }
        throw makeApiError(error, 'Teacher data conflicts with existing records');
      }
      if (error.status === TeacherHttpStatus.BAD_REQUEST) {
        // Extract validation error details if available
        if (error.details?.detail?.includes('Subject')) {
          throw makeApiError(error, 'The selected subject does not exist');
        }
        const validationError = error.details?.detail || 'Invalid teacher data provided';
        throw makeApiError(error, `Validation error: ${validationError}`);
      }
      if (error.status === TeacherHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to update teachers');
      }
      throw makeApiError(error, `Failed to update teacher: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Delete a teacher from the system
   * @param id - Teacher ID to delete
   * @returns Promise<void>
   */
  async deleteTeacher(id: string): Promise<void> {
    try {
      
await apiService.delete<void>(TeacherApiPaths.BY_ID(id));
    } catch (error: any) {
      if (error.status === TeacherHttpStatus.NOT_FOUND) {
        throw makeApiError(error, 'Teacher not found');
      }
      if (error.status === TeacherHttpStatus.CONFLICT) {
        // Teacher has assigned classes
        const classCount = error.details?.detail?.match(/(\d+) class/)?.[1];
        if (classCount) {
          throw makeApiError(error, `Cannot delete teacher because they are assigned to ${classCount} class(es). Please reassign their classes first.`);
        }
        throw makeApiError(error, 'Cannot delete teacher because they have assigned classes');
      }
      if (error.status === TeacherHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to delete teachers');
      }
      throw makeApiError(error, `Failed to delete teacher: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Get all available subjects for teacher assignment
   * @returns Promise<SubjectDto[]>
   */
  async getAllSubjects(): Promise<SubjectDto[]> {
    try {
      
const raw = await apiService.get<any>(TeacherApiPaths.SUBJECTS);
      const subjects = normalizeListResponse<SubjectDto>(raw);
      return subjects;
    } catch (error: any) {
      if (error.status === TeacherHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to access subjects');
      }
      throw makeApiError(error, `Failed to fetch subjects: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Check if an email is available for a teacher account
   * @param email - Email to check (will be sent as provided)
   * @param excludeId - Optional teacher ID to exclude (for updates)
   * @returns Promise<boolean> - true if available, false if taken
   */
  async checkEmailAvailable(email: string, excludeId?: string): Promise<boolean> {
    try {
      const params = new URLSearchParams();
      params.append('email', email);
      if (excludeId) params.append('excludeId', excludeId);
      const endpoint = `${TeacherApiPaths.EMAIL_AVAILABLE}?${params.toString()}`;

      
const raw = await apiService.get<any>(endpoint);

      // Accept a variety of possible backend response shapes
      if (typeof raw === 'boolean') return raw;
      if (raw && typeof raw === 'object') {
        if (typeof raw.available === 'boolean') return raw.available;
        if (typeof raw.isAvailable === 'boolean') return raw.isAvailable;
        if (typeof raw.result === 'boolean') return raw.result;
        if (typeof raw.value === 'boolean') return raw.value;
      }
      // Fallback: treat truthy as available, falsy as not
      return Boolean(raw);
    } catch (error: any) {
      // For availability checks, treat most failures as not available only if server says conflict.
      // Otherwise surface as a generic error to the caller to handle UI messaging.
      if (error.status === TeacherHttpStatus.CONFLICT) {
        return false;
      }
      throw makeApiError(error, `Failed to check email availability: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Get teacher's salary configuration with history
   * @param teacherId - Teacher ID (UUID format)
   * @returns Promise<TeacherSalaryConfigHistoryResponse>
   */
  async getTeacherSalaryConfig(
    teacherId: string
  ): Promise<TeacherSalaryConfigHistoryResponse> {
    try {
      const endpoint = TeacherSalaryConfigApiPaths.CONFIG(teacherId);
      const response = await apiService.get<TeacherSalaryConfigHistoryResponse>(endpoint);
      return response;
    } catch (error: any) {
      if (error.status === TeacherHttpStatus.NOT_FOUND) {
        throw makeApiError(error, 'Teacher not found');
      }
      throw makeApiError(error, `Failed to fetch salary configuration: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Set a new salary configuration for a teacher
   * @param teacherId - Teacher ID (UUID format)
   * @param request - Salary configuration details
   * @returns Promise<TeacherSalaryConfigResponse>
   */
  async setTeacherSalaryConfig(
    teacherId: string,
    request: SetTeacherSalaryConfigRequest
  ): Promise<TeacherSalaryConfigResponse> {
    try {
      const endpoint = TeacherSalaryConfigApiPaths.CONFIG(teacherId);
      const response = await apiService.post<TeacherSalaryConfigResponse>(endpoint, request);
      return response;
    } catch (error: any) {
      if (error.status === TeacherHttpStatus.NOT_FOUND) {
        throw makeApiError(error, 'Teacher not found');
      }
      if (error.status === TeacherHttpStatus.BAD_REQUEST) {
        throw makeApiError(error, 'Invalid salary configuration data');
      }
      throw makeApiError(error, `Failed to set salary configuration: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Update an existing salary configuration
   * @param teacherId - Teacher ID (UUID format)
   * @param configId - Configuration ID (UUID format)
   * @param request - Updated salary configuration details
   * @returns Promise<TeacherSalaryConfigResponse>
   */
  async updateTeacherSalaryConfig(
    teacherId: string,
    configId: string,
    request: UpdateTeacherSalaryConfigRequest
  ): Promise<TeacherSalaryConfigResponse> {
    try {
      const endpoint = TeacherSalaryConfigApiPaths.CONFIG_BY_ID(teacherId, configId);
      const response = await apiService.put<TeacherSalaryConfigResponse>(endpoint, request);
      return response;
    } catch (error: any) {
      if (error.status === TeacherHttpStatus.NOT_FOUND) {
        throw makeApiError(error, 'Salary configuration not found');
      }
      if (error.status === TeacherHttpStatus.BAD_REQUEST) {
        throw makeApiError(error, 'Invalid salary configuration data');
      }
      throw makeApiError(error, `Failed to update salary configuration: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Get lessons for a teacher with optional filtering and pagination
   * @param teacherId - Teacher ID (UUID format)
   * @param params - Optional filter and pagination parameters
   * @returns Promise<TeacherLessonsResponse>
   */
  async getTeacherLessons(
    teacherId: string,
    params: TeacherLessonsQueryParams = {}
  ): Promise<TeacherLessonsResponse> {
    try {
      const queryParams = new URLSearchParams();

      if (params.status?.length) {
        params.status.forEach(s => queryParams.append('status', s));
      }
      if (params.classId) {
        queryParams.append('classId', params.classId);
      }
      if (params.academicYearId) {
        queryParams.append('academicYearId', params.academicYearId);
      }
      if (params.fromDate) {
        queryParams.append('fromDate', params.fromDate);
      }
      if (params.toDate) {
        queryParams.append('toDate', params.toDate);
      }
      if (params.skip !== undefined) {
        queryParams.append('skip', String(params.skip));
      }
      if (params.take !== undefined) {
        queryParams.append('take', String(params.take));
      }

      const queryString = queryParams.toString();
      const endpoint = queryString
        ? `/api/teachers/${teacherId}/lessons?${queryString}`
        : `/api/teachers/${teacherId}/lessons`;

      const response = await apiService.get<TeacherLessonsResponse>(endpoint);
      return response;
    } catch (error: any) {
      if (error.status === TeacherHttpStatus.NOT_FOUND) {
        throw makeApiError(error, 'Teacher not found');
      }
      if (error.status === TeacherHttpStatus.BAD_REQUEST) {
        throw makeApiError(error, 'Invalid query parameters');
      }
      throw makeApiError(error, `Failed to fetch teacher lessons: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Get teacher's salary breakdown for an academic year
   * @param teacherId - Teacher ID (UUID format)
   * @param academicYearId - Academic Year ID (UUID format)
   * @returns Promise<TeacherSalaryResponse>
   */
  async getTeacherSalary(
    teacherId: string,
    academicYearId: string
  ): Promise<TeacherSalaryResponse> {
    try {
      const endpoint = `${TeacherSalaryApiPaths.SALARY(teacherId)}?academicYearId=${academicYearId}`;
      const response = await apiService.get<TeacherSalaryResponse>(endpoint);
      return response;
    } catch (error: any) {
      if (error.status === TeacherHttpStatus.NOT_FOUND) {
        throw makeApiError(error, 'Teacher not found');
      }
      if (error.status === TeacherHttpStatus.BAD_REQUEST) {
        const errorType = (error.details?.type || error.details?.Type || '') as string;
        if (errorType.includes('NoSalaryConfigured')) {
          throw makeApiError(error, 'No salary configuration found for this teacher. Please set up a gross salary first.');
        }
        if (errorType.includes('InvalidAcademicYear')) {
          throw makeApiError(error, 'Invalid academic year specified');
        }
        throw makeApiError(error, 'Invalid request');
      }
      throw makeApiError(error, `Failed to fetch teacher salary: ${error.message || 'Unknown error'}`);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // TEACHER SALARY CALCULATIONS (Phase 7.1 - Variable Salary Feature)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Get all salary calculations for a teacher (with optional filters)
   * @param teacherId - Teacher ID (UUID format)
   * @param filters - Optional filters (status, academicYearId, date range)
   * @returns Promise<SalaryCalculation[]>
   */
  async getSalaryCalculations(
    teacherId: string,
    filters?: SalaryCalculationFilters
  ): Promise<SalaryCalculation[]> {
    try {
      const queryParams = new URLSearchParams();
      if (filters?.status) {
        queryParams.append('status', filters.status);
      }
      if (filters?.academicYearId) {
        queryParams.append('academicYearId', filters.academicYearId);
      }
      if (filters?.fromDate) {
        queryParams.append('fromDate', filters.fromDate);
      }
      if (filters?.toDate) {
        queryParams.append('toDate', filters.toDate);
      }

      const queryString = queryParams.toString();
      const endpoint = queryString
        ? `${SalaryCalculationApiPaths.LIST(teacherId)}?${queryString}`
        : SalaryCalculationApiPaths.LIST(teacherId);

      const raw = await apiService.get<any>(endpoint);
      const items = normalizeListResponse<any>(raw);
      // Map calculationId to id (API returns calculationId, frontend expects id)
      return items.map((item) => ({
        ...item,
        id: item.calculationId || item.id,
      })) as SalaryCalculation[];
    } catch (error: any) {
      if (error.status === TeacherHttpStatus.NOT_FOUND) {
        throw makeApiError(error, 'Teacher not found');
      }
      if (error.status === TeacherHttpStatus.BAD_REQUEST) {
        throw makeApiError(error, 'Invalid filter parameters');
      }
      throw makeApiError(error, `Failed to fetch salary calculations: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Get a specific salary calculation with items and audit log
   * @param teacherId - Teacher ID (UUID format)
   * @param calcId - Calculation ID (UUID format)
   * @returns Promise<SalaryCalculationDetail>
   */
  async getSalaryCalculation(
    teacherId: string,
    calcId: string
  ): Promise<SalaryCalculationDetail> {
    try {
      const endpoint = SalaryCalculationApiPaths.BY_ID(teacherId, calcId);
      const response = await apiService.get<SalaryCalculationDetail>(endpoint);
      return response;
    } catch (error: any) {
      if (error.status === TeacherHttpStatus.NOT_FOUND) {
        throw makeApiError(error, 'Salary calculation not found');
      }
      throw makeApiError(error, `Failed to fetch salary calculation: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Generate a new salary calculation for a teacher
   * @param teacherId - Teacher ID (UUID format)
   * @param request - Period details (periodStart, periodEnd)
   * @returns Promise<SalaryCalculationDetail>
   */
  async generateSalaryCalculation(
    teacherId: string,
    request: GenerateSalaryRequest
  ): Promise<SalaryCalculationDetail> {
    try {
      const endpoint = SalaryCalculationApiPaths.LIST(teacherId);
      const response = await apiService.post<SalaryCalculationDetail>(endpoint, request);
      return response;
    } catch (error: any) {
      if (error.status === TeacherHttpStatus.NOT_FOUND) {
        throw makeApiError(error, 'Teacher not found');
      }
      if (error.status === TeacherHttpStatus.BAD_REQUEST) {
        const details = error.details?.detail || error.message;
        if (details?.includes('period')) {
          throw makeApiError(error, 'Invalid period dates provided');
        }
        throw makeApiError(error, `Invalid request: ${details}`);
      }
      if (error.status === TeacherHttpStatus.CONFLICT) {
        throw makeApiError(error, 'A calculation already exists for this period');
      }
      throw makeApiError(error, `Failed to generate salary calculation: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Approve a salary calculation (with optional manual adjustment)
   * @param teacherId - Teacher ID (UUID format)
   * @param calcId - Calculation ID (UUID format)
   * @param request - Approved amount and optional adjustment reason
   * @returns Promise<SalaryCalculationDetail>
   */
  async approveSalaryCalculation(
    teacherId: string,
    calcId: string,
    request: ApproveSalaryRequest
  ): Promise<SalaryCalculationDetail> {
    try {
      const endpoint = SalaryCalculationApiPaths.APPROVE(teacherId, calcId);
      const response = await apiService.put<SalaryCalculationDetail>(endpoint, request);
      return response;
    } catch (error: any) {
      if (error.status === TeacherHttpStatus.NOT_FOUND) {
        throw makeApiError(error, 'Salary calculation not found');
      }
      if (error.status === TeacherHttpStatus.BAD_REQUEST) {
        const details = error.details?.detail || error.message;
        if (details?.includes('reason')) {
          throw makeApiError(error, 'Adjustment reason is required when changing the calculated amount');
        }
        throw makeApiError(error, `Invalid request: ${details}`);
      }
      if (error.status === TeacherHttpStatus.CONFLICT) {
        throw makeApiError(error, 'Calculation is already approved');
      }
      throw makeApiError(error, `Failed to approve salary calculation: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Reopen an approved salary calculation (requires reason)
   * @param teacherId - Teacher ID (UUID format)
   * @param calcId - Calculation ID (UUID format)
   * @param request - Reason for reopening
   * @returns Promise<SalaryCalculationDetail>
   */
  async reopenSalaryCalculation(
    teacherId: string,
    calcId: string,
    request: ReopenSalaryRequest
  ): Promise<SalaryCalculationDetail> {
    try {
      const endpoint = SalaryCalculationApiPaths.REOPEN(teacherId, calcId);
      const response = await apiService.put<SalaryCalculationDetail>(endpoint, request);
      return response;
    } catch (error: any) {
      if (error.status === TeacherHttpStatus.NOT_FOUND) {
        throw makeApiError(error, 'Salary calculation not found');
      }
      if (error.status === TeacherHttpStatus.BAD_REQUEST) {
        const details = error.details?.detail || error.message;
        if (details?.includes('reason')) {
          throw makeApiError(error, 'Reason is required to reopen an approved calculation');
        }
        if (details?.includes('pending')) {
          throw makeApiError(error, 'Cannot reopen a calculation that is not approved');
        }
        throw makeApiError(error, `Invalid request: ${details}`);
      }
      throw makeApiError(error, `Failed to reopen salary calculation: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Get teacher's salary preview for a specific month (projected earnings)
   * @param teacherId - Teacher ID (UUID format)
   * @param year - Year (e.g., 2025)
   * @param month - Month (1-12)
   * @returns Promise<TeacherSalaryPreview>
   */
  async getTeacherSalaryPreview(
    teacherId: string,
    year: number,
    month: number
  ): Promise<TeacherSalaryPreview> {
    try {
      const endpoint = SalaryCalculationApiPaths.PREVIEW(teacherId, year, month);
      const response = await apiService.get<TeacherSalaryPreview>(endpoint);
      return response;
    } catch (error: any) {
      if (error.status === TeacherHttpStatus.NOT_FOUND) {
        throw makeApiError(error, 'Teacher not found');
      }
      if (error.status === TeacherHttpStatus.BAD_REQUEST) {
        throw makeApiError(error, 'Invalid year or month parameters');
      }
      throw makeApiError(error, `Failed to fetch salary preview: ${error.message || 'Unknown error'}`);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SALARY ADJUSTMENTS (Bonuses/Deductions)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Create a salary adjustment (bonus or deduction) for a calculation
   * @param teacherId - Teacher ID (UUID format)
   * @param calcId - Calculation ID (UUID format)
   * @param request - Adjustment details (type, description, amount)
   * @returns Promise<SalaryAdjustment> - The created adjustment
   */
  async createSalaryAdjustment(
    teacherId: string,
    calcId: string,
    request: CreateSalaryAdjustmentRequest
  ): Promise<SalaryAdjustment> {
    try {
      const endpoint = SalaryCalculationApiPaths.CREATE_ADJUSTMENT(teacherId, calcId);
      const response = await apiService.post<SalaryAdjustment>(endpoint, request);
      return response;
    } catch (error: any) {
      if (error.status === TeacherHttpStatus.NOT_FOUND) {
        throw makeApiError(error, 'Salary calculation not found');
      }
      if (error.status === TeacherHttpStatus.BAD_REQUEST) {
        const details = error.details?.detail || error.message;
        if (details?.includes('type')) {
          throw makeApiError(error, 'Invalid adjustment type - must be "addition" or "deduction"');
        }
        if (details?.includes('description')) {
          throw makeApiError(error, 'Description must be between 3 and 200 characters');
        }
        if (details?.includes('amount')) {
          throw makeApiError(error, 'Amount must be positive and not exceed 999,999.99');
        }
        throw makeApiError(error, `Invalid request: ${details}`);
      }
      if (error.status === TeacherHttpStatus.CONFLICT) {
        const details = error.details?.detail || error.message;
        if (details?.includes('approved')) {
          throw makeApiError(error, 'Cannot add adjustments to an approved calculation');
        }
        if (details?.includes('duplicate')) {
          throw makeApiError(error, 'An adjustment with this type and description already exists');
        }
        throw makeApiError(error, 'Cannot create adjustment - calculation may be approved');
      }
      throw makeApiError(error, `Failed to create salary adjustment: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Delete a salary adjustment from a calculation
   * @param teacherId - Teacher ID (UUID format)
   * @param calcId - Calculation ID (UUID format)
   * @param adjustmentId - Adjustment ID (UUID format)
   * @returns Promise<void>
   */
  async deleteSalaryAdjustment(
    teacherId: string,
    calcId: string,
    adjustmentId: string
  ): Promise<void> {
    try {
      const endpoint = SalaryCalculationApiPaths.DELETE_ADJUSTMENT(teacherId, calcId, adjustmentId);
      await apiService.delete<void>(endpoint);
    } catch (error: any) {
      if (error.status === TeacherHttpStatus.NOT_FOUND) {
        throw makeApiError(error, 'Adjustment or calculation not found');
      }
      if (error.status === TeacherHttpStatus.CONFLICT) {
        throw makeApiError(error, 'Cannot delete adjustments from an approved calculation');
      }
      throw makeApiError(error, `Failed to delete salary adjustment: ${error.message || 'Unknown error'}`);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // EMPLOYMENT SETTINGS (Employment Type + Base Salary)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Get employment settings for a teacher (employment type, base salary, effective date, join date)
   * @param teacherId - Teacher ID (UUID format)
   * @param academicYearId - Academic Year ID (UUID format)
   * @returns Promise<EmploymentSettingsResponse>
   */
  async getEmploymentSettings(
    teacherId: string,
    academicYearId: string
  ): Promise<EmploymentSettingsResponse> {
    try {
      const endpoint = `${TeacherApiPaths.EMPLOYMENT_SETTINGS(teacherId)}?academicYearId=${academicYearId}`;
      const response = await apiService.get<EmploymentSettingsResponse>(endpoint);
      return response;
    } catch (error: any) {
      if (error.status === TeacherHttpStatus.NOT_FOUND) {
        throw makeApiError(error, 'Teacher not found');
      }
      if (error.status === TeacherHttpStatus.BAD_REQUEST) {
        throw makeApiError(error, 'Invalid request');
      }
      throw makeApiError(error, `Failed to fetch employment settings: ${error.message || 'Unknown error'}`);
    }
  }

}

// Export a singleton instance
export const teacherApiService = new TeacherApiService();

// Export convenience functions that match the pattern from the integration guide
export const getAllTeachers = (searchParams?: TeacherSearchParams) => teacherApiService.getAllTeachers(searchParams);

export const getTeacherById = (id: string) => teacherApiService.getTeacherById(id);

export const getTeacherOverview = (id: string) => teacherApiService.getTeacherOverview(id);

export const getTeacherClasses = (id: string, params?: TeacherClassesParams) =>
  teacherApiService.getTeacherClasses(id, params);

export const getTeacherClassesPaymentSummary = (id: string) =>
  teacherApiService.getTeacherClassesPaymentSummary(id);

export const createTeacher = (request: CreateTeacherRequest) =>
  teacherApiService.createTeacher(request);

export const updateTeacher = (id: string, request: UpdateTeacherRequest) =>
  teacherApiService.updateTeacher(id, request);

export const deleteTeacher = (id: string) => teacherApiService.deleteTeacher(id);

export const getAllSubjects = () => teacherApiService.getAllSubjects();

export const checkTeacherEmailAvailable = (email: string, excludeId?: string) =>
  teacherApiService.checkEmailAvailable(email, excludeId);

// Salary Config Operations
export const getTeacherSalaryConfig = (teacherId: string) =>
  teacherApiService.getTeacherSalaryConfig(teacherId);

export const setTeacherSalaryConfig = (teacherId: string, request: SetTeacherSalaryConfigRequest) =>
  teacherApiService.setTeacherSalaryConfig(teacherId, request);

export const updateTeacherSalaryConfig = (teacherId: string, configId: string, request: UpdateTeacherSalaryConfigRequest) =>
  teacherApiService.updateTeacherSalaryConfig(teacherId, configId, request);

// Lesson Operations
export const getTeacherLessons = (teacherId: string, params?: TeacherLessonsQueryParams) =>
  teacherApiService.getTeacherLessons(teacherId, params);

// Salary Operations
export const getTeacherSalary = (teacherId: string, academicYearId: string) =>
  teacherApiService.getTeacherSalary(teacherId, academicYearId);

// Salary Calculation Operations (Phase 7.1 - Variable Salary Feature)
export const getSalaryCalculations = (teacherId: string, filters?: SalaryCalculationFilters) =>
  teacherApiService.getSalaryCalculations(teacherId, filters);

export const getSalaryCalculation = (teacherId: string, calcId: string) =>
  teacherApiService.getSalaryCalculation(teacherId, calcId);

export const generateSalaryCalculation = (teacherId: string, request: GenerateSalaryRequest) =>
  teacherApiService.generateSalaryCalculation(teacherId, request);

export const approveSalaryCalculation = (teacherId: string, calcId: string, request: ApproveSalaryRequest) =>
  teacherApiService.approveSalaryCalculation(teacherId, calcId, request);

export const reopenSalaryCalculation = (teacherId: string, calcId: string, request: ReopenSalaryRequest) =>
  teacherApiService.reopenSalaryCalculation(teacherId, calcId, request);

export const getTeacherSalaryPreview = (teacherId: string, year: number, month: number) =>
  teacherApiService.getTeacherSalaryPreview(teacherId, year, month);

// Salary Adjustment Operations
export const createSalaryAdjustment = (teacherId: string, calcId: string, request: CreateSalaryAdjustmentRequest) =>
  teacherApiService.createSalaryAdjustment(teacherId, calcId, request);

export const deleteSalaryAdjustment = (teacherId: string, calcId: string, adjustmentId: string) =>
  teacherApiService.deleteSalaryAdjustment(teacherId, calcId, adjustmentId);

// Employment Settings Operations
export const getEmploymentSettings = (teacherId: string, academicYearId: string) =>
  teacherApiService.getEmploymentSettings(teacherId, academicYearId);

// Export the service instance as default
export default teacherApiService;

