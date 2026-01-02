/**
 * Teacher API Service
 * Implements all teacher-related API endpoints using the existing API infrastructure
 */

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
  SubjectDto,
  CreateTeacherRequest,
  UpdateTeacherRequest,
  TeacherSearchParams,
  TeacherApiPaths,
  TeacherHttpStatus,
} from '@/types/api/teacher';
import {
  TeacherPaymentRateResponse,
  TeacherPaymentRatesResponse,
  SetTeacherPaymentRateRequest,
  UpdateTeacherPaymentRateRequest,
  PaymentRateApiPaths,
  PaymentRateHttpStatus,
} from '@/types/api/teacherPaymentRate';
import {
  TeacherLessonsResponse,
  TeacherLessonsQueryParams,
} from '@/types/api/teacherLesson';
import {
  TeacherSalaryResponse,
  SalaryAdjustmentResponse,
  SalaryAdjustmentsResponse,
  CreateSalaryAdjustmentRequest,
  UpdateSalaryAdjustmentRequest,
  TeacherSalaryApiPaths,
} from '@/types/api/teacherSalary';

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
   * Search for teachers by name, email, or subject
   * @param searchParams - Search parameters
   * @returns Promise<TeacherResponse[]>
   */
  async searchTeachers(searchParams: TeacherSearchParams = {}): Promise<TeacherResponse[]> {
    try {
      const params = new URLSearchParams();
      
      if (searchParams.searchTerm) {
        params.append('searchTerm', searchParams.searchTerm);
      }
      
      if (searchParams.subjectId) {
        params.append('subjectId', searchParams.subjectId);
      }

      const queryString = params.toString();
      const endpoint = queryString ? `${TeacherApiPaths.SEARCH}?${queryString}` : TeacherApiPaths.SEARCH;
      
      
const raw = await apiService.get<any>(endpoint);
      const teachers = normalizeListResponse<TeacherResponse>(raw);
      return teachers;
    } catch (error: any) {
      if (error.status === TeacherHttpStatus.BAD_REQUEST) {
        // Check if it's invalid subject ID error
        if (error.details?.detail?.includes('Subject ID')) {
          throw makeApiError(error, 'Invalid subject ID format provided');
        }
        throw makeApiError(error, 'Invalid search parameters provided');
      }
      if (error.status === TeacherHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to search teachers');
      }
      throw makeApiError(error, `Failed to search teachers: ${error.message || 'Unknown error'}`);
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
   * Get all payment rates for a teacher
   * @param teacherId - Teacher ID (UUID format)
   * @param includeInactive - Whether to include inactive (historical) rates
   * @returns Promise<TeacherPaymentRatesResponse>
   */
  async getTeacherPaymentRates(
    teacherId: string,
    includeInactive = false
  ): Promise<TeacherPaymentRatesResponse> {
    try {
      const endpoint = PaymentRateApiPaths.WITH_INACTIVE(teacherId, includeInactive);
      const response = await apiService.get<TeacherPaymentRatesResponse>(endpoint);
      return response;
    } catch (error: any) {
      if (error.status === PaymentRateHttpStatus.NOT_FOUND) {
        throw makeApiError(error, 'Teacher not found');
      }
      throw makeApiError(error, `Failed to fetch payment rates: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Set a new payment rate for a teacher-class combination
   * @param teacherId - Teacher ID (UUID format)
   * @param request - Payment rate details
   * @returns Promise<TeacherPaymentRateResponse>
   */
  async setTeacherPaymentRate(
    teacherId: string,
    request: SetTeacherPaymentRateRequest
  ): Promise<TeacherPaymentRateResponse> {
    try {
      const endpoint = PaymentRateApiPaths.BASE(teacherId);
      const response = await apiService.post<TeacherPaymentRateResponse>(endpoint, request);
      return response;
    } catch (error: any) {
      if (error.status === PaymentRateHttpStatus.NOT_FOUND) {
        throw makeApiError(error, 'Teacher or class not found');
      }
      if (error.status === PaymentRateHttpStatus.CONFLICT) {
        throw makeApiError(error, 'An active payment rate already exists for this class');
      }
      if (error.status === PaymentRateHttpStatus.BAD_REQUEST) {
        throw makeApiError(error, 'Invalid payment rate data');
      }
      throw makeApiError(error, `Failed to set payment rate: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Update an existing payment rate
   * @param teacherId - Teacher ID (UUID format)
   * @param rateId - Payment rate ID (UUID format)
   * @param request - Updated payment rate details
   * @returns Promise<TeacherPaymentRateResponse>
   */
  async updateTeacherPaymentRate(
    teacherId: string,
    rateId: string,
    request: UpdateTeacherPaymentRateRequest
  ): Promise<TeacherPaymentRateResponse> {
    try {
      const endpoint = PaymentRateApiPaths.BY_ID(teacherId, rateId);
      const response = await apiService.put<TeacherPaymentRateResponse>(endpoint, request);
      return response;
    } catch (error: any) {
      if (error.status === PaymentRateHttpStatus.NOT_FOUND) {
        throw makeApiError(error, 'Payment rate not found');
      }
      if (error.status === PaymentRateHttpStatus.BAD_REQUEST) {
        throw makeApiError(error, 'Invalid payment rate data');
      }
      throw makeApiError(error, `Failed to update payment rate: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Delete (deactivate) a payment rate
   * @param teacherId - Teacher ID (UUID format)
   * @param rateId - Payment rate ID (UUID format)
   * @returns Promise<void>
   */
  async deleteTeacherPaymentRate(teacherId: string, rateId: string): Promise<void> {
    try {
      const endpoint = PaymentRateApiPaths.BY_ID(teacherId, rateId);
      await apiService.delete(endpoint);
    } catch (error: any) {
      if (error.status === PaymentRateHttpStatus.NOT_FOUND) {
        throw makeApiError(error, 'Payment rate not found');
      }
      throw makeApiError(error, `Failed to delete payment rate: ${error.message || 'Unknown error'}`);
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
   * Get teacher's monthly salary breakdown
   * @param teacherId - Teacher ID (UUID format)
   * @param year - Year (4-digit)
   * @param month - Month (1-12)
   * @returns Promise<TeacherSalaryResponse>
   */
  async getTeacherSalary(
    teacherId: string,
    year: number,
    month: number
  ): Promise<TeacherSalaryResponse> {
    try {
      const endpoint = `${TeacherSalaryApiPaths.SALARY(teacherId)}?year=${year}&month=${month}`;
      const response = await apiService.get<TeacherSalaryResponse>(endpoint);
      return response;
    } catch (error: any) {
      if (error.status === TeacherHttpStatus.NOT_FOUND) {
        throw makeApiError(error, 'Teacher not found');
      }
      if (error.status === TeacherHttpStatus.BAD_REQUEST) {
        throw makeApiError(error, 'Invalid year or month');
      }
      throw makeApiError(error, `Failed to fetch teacher salary: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Get salary adjustments for a teacher in a specific month
   * @param teacherId - Teacher ID (UUID format)
   * @param year - Year (4-digit)
   * @param month - Month (1-12)
   * @returns Promise<SalaryAdjustmentsResponse>
   */
  async getSalaryAdjustments(
    teacherId: string,
    year: number,
    month: number
  ): Promise<SalaryAdjustmentsResponse> {
    try {
      const endpoint = `${TeacherSalaryApiPaths.ADJUSTMENTS(teacherId)}?year=${year}&month=${month}`;
      const response = await apiService.get<SalaryAdjustmentsResponse>(endpoint);
      return response;
    } catch (error: any) {
      if (error.status === TeacherHttpStatus.NOT_FOUND) {
        throw makeApiError(error, 'Teacher not found');
      }
      if (error.status === TeacherHttpStatus.BAD_REQUEST) {
        throw makeApiError(error, 'Invalid year or month');
      }
      throw makeApiError(error, `Failed to fetch salary adjustments: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Create a new salary adjustment (bonus or deduction)
   * @param teacherId - Teacher ID (UUID format)
   * @param request - Adjustment data
   * @returns Promise<SalaryAdjustmentResponse>
   */
  async createSalaryAdjustment(
    teacherId: string,
    request: CreateSalaryAdjustmentRequest
  ): Promise<SalaryAdjustmentResponse> {
    try {
      const endpoint = TeacherSalaryApiPaths.ADJUSTMENTS(teacherId);
      const response = await apiService.post<SalaryAdjustmentResponse>(endpoint, request);
      return response;
    } catch (error: any) {
      if (error.status === TeacherHttpStatus.NOT_FOUND) {
        throw makeApiError(error, 'Teacher not found');
      }
      if (error.status === TeacherHttpStatus.BAD_REQUEST) {
        throw makeApiError(error, 'Invalid adjustment data');
      }
      throw makeApiError(error, `Failed to create salary adjustment: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Update an existing salary adjustment
   * @param teacherId - Teacher ID (UUID format)
   * @param adjustmentId - Adjustment ID (UUID format)
   * @param request - Updated adjustment data
   * @returns Promise<SalaryAdjustmentResponse>
   */
  async updateSalaryAdjustment(
    teacherId: string,
    adjustmentId: string,
    request: UpdateSalaryAdjustmentRequest
  ): Promise<SalaryAdjustmentResponse> {
    try {
      const endpoint = TeacherSalaryApiPaths.ADJUSTMENT_BY_ID(teacherId, adjustmentId);
      const response = await apiService.put<SalaryAdjustmentResponse>(endpoint, request);
      return response;
    } catch (error: any) {
      if (error.status === TeacherHttpStatus.NOT_FOUND) {
        throw makeApiError(error, 'Salary adjustment not found');
      }
      if (error.status === TeacherHttpStatus.BAD_REQUEST) {
        throw makeApiError(error, 'Invalid adjustment data');
      }
      throw makeApiError(error, `Failed to update salary adjustment: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Delete a salary adjustment
   * @param teacherId - Teacher ID (UUID format)
   * @param adjustmentId - Adjustment ID (UUID format)
   * @returns Promise<void>
   */
  async deleteSalaryAdjustment(teacherId: string, adjustmentId: string): Promise<void> {
    try {
      const endpoint = TeacherSalaryApiPaths.ADJUSTMENT_BY_ID(teacherId, adjustmentId);
      await apiService.delete(endpoint);
    } catch (error: any) {
      if (error.status === TeacherHttpStatus.NOT_FOUND) {
        throw makeApiError(error, 'Salary adjustment not found');
      }
      throw makeApiError(error, `Failed to delete salary adjustment: ${error.message || 'Unknown error'}`);
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

export const searchTeachers = (
  searchTerm?: string,
  subjectId?: string
) => teacherApiService.searchTeachers({ searchTerm, subjectId });

export const createTeacher = (request: CreateTeacherRequest) =>
  teacherApiService.createTeacher(request);

export const updateTeacher = (id: string, request: UpdateTeacherRequest) =>
  teacherApiService.updateTeacher(id, request);

export const deleteTeacher = (id: string) => teacherApiService.deleteTeacher(id);

export const getAllSubjects = () => teacherApiService.getAllSubjects();

export const checkTeacherEmailAvailable = (email: string, excludeId?: string) =>
  teacherApiService.checkEmailAvailable(email, excludeId);

// Payment Rate Operations
export const getTeacherPaymentRates = (teacherId: string, includeInactive = false) =>
  teacherApiService.getTeacherPaymentRates(teacherId, includeInactive);

export const setTeacherPaymentRate = (teacherId: string, request: SetTeacherPaymentRateRequest) =>
  teacherApiService.setTeacherPaymentRate(teacherId, request);

export const updateTeacherPaymentRate = (teacherId: string, rateId: string, request: UpdateTeacherPaymentRateRequest) =>
  teacherApiService.updateTeacherPaymentRate(teacherId, rateId, request);

export const deleteTeacherPaymentRate = (teacherId: string, rateId: string) =>
  teacherApiService.deleteTeacherPaymentRate(teacherId, rateId);

// Lesson Operations
export const getTeacherLessons = (teacherId: string, params?: TeacherLessonsQueryParams) =>
  teacherApiService.getTeacherLessons(teacherId, params);

// Salary Operations
export const getTeacherSalary = (teacherId: string, year: number, month: number) =>
  teacherApiService.getTeacherSalary(teacherId, year, month);

export const getSalaryAdjustments = (teacherId: string, year: number, month: number) =>
  teacherApiService.getSalaryAdjustments(teacherId, year, month);

export const createSalaryAdjustment = (teacherId: string, request: CreateSalaryAdjustmentRequest) =>
  teacherApiService.createSalaryAdjustment(teacherId, request);

export const updateSalaryAdjustment = (teacherId: string, adjustmentId: string, request: UpdateSalaryAdjustmentRequest) =>
  teacherApiService.updateSalaryAdjustment(teacherId, adjustmentId, request);

export const deleteSalaryAdjustment = (teacherId: string, adjustmentId: string) =>
  teacherApiService.deleteSalaryAdjustment(teacherId, adjustmentId);

// Export the service instance as default
export default teacherApiService;

