/**
 * Teacher API Service
 * Implements all teacher-related API endpoints using the existing API infrastructure
 */

import apiService from './api';
import apiWithInterceptor from './apiWithInterceptor';
import {
  TeacherResponse,
  TeacherCreatedResponse,
  SubjectDto,
  CreateTeacherRequest,
  UpdateTeacherRequest,
  TeacherSearchParams,
  TeacherApiPaths,
  TeacherHttpStatus,
} from '@/types/api/teacher';

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
  private useInterceptor = true; // Flag to enable/disable global interceptor
  
  // Get the appropriate API service based on configuration
  private getApiService() {
    return this.useInterceptor ? apiWithInterceptor : apiService;
  }
  
  // Method to disable global loading for all operations in this service
  public disableGlobalLoading() {
    this.useInterceptor = false;
  }
  
  // Method to enable global loading for all operations in this service
  public enableGlobalLoading() {
    this.useInterceptor = true;
  }
  
  /**
   * Get all teachers in the system
   * @returns Promise<TeacherResponse[]>
   */
  async getAllTeachers(): Promise<TeacherResponse[]> {
    try {
      const api = this.getApiService();
      const raw = await api.get<any>(TeacherApiPaths.BASE);
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
      const api = this.getApiService();
      const teacher = await api.get<TeacherResponse>(TeacherApiPaths.BY_ID(id));
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
      
      const api = this.getApiService();
      const raw = await api.get<any>(endpoint);
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
      const api = this.getApiService();
      const result = await api.post<TeacherCreatedResponse>(
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
      const api = this.getApiService();
      const result = await api.put<TeacherResponse>(
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
      const api = this.getApiService();
      await api.delete<void>(TeacherApiPaths.BY_ID(id));
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
      const api = this.getApiService();
      const raw = await api.get<any>(TeacherApiPaths.SUBJECTS);
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

      const api = this.getApiService();
      const raw = await api.get<any>(endpoint);

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
}

// Export a singleton instance
export const teacherApiService = new TeacherApiService();

// Export convenience functions that match the pattern from the integration guide
export const getAllTeachers = () => teacherApiService.getAllTeachers();

export const getTeacherById = (id: string) => teacherApiService.getTeacherById(id);

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

// Export the service instance as default
export default teacherApiService;
