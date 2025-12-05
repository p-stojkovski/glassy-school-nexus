/**
 * Student API Service
 * Implements all student-related API endpoints using the existing API infrastructure
 */

import apiService from './api';
import {
  StudentResponse,
  StudentCreatedResponse,
  DiscountTypeDto,
  CreateStudentRequest,
  UpdateStudentRequest,
  StudentSearchParams,
  StudentSearchResponse,
  EmailAvailabilityResponse,
  StudentOverviewResponse,
  StudentApiPaths,
  StudentHttpStatus,
  StudentClassEnrollment,
  StudentClassEnrollmentResponse,
  StudentClassesSearchParams,
} from '@/types/api/student';

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

export class StudentApiService {
  
  /**
   * Get all students in the system
   * @returns Promise<StudentResponse[]>
   */
  async getAllStudents(): Promise<StudentResponse[]> {
    try {
      const raw = await apiService.get<any>(StudentApiPaths.BASE);
      const students = normalizeListResponse<StudentResponse>(raw);
      return students;
    } catch (error: any) {
      if (error.status === StudentHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to access students');
      }
      throw makeApiError(error, `Failed to fetch students: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Get a specific student by their unique identifier
   * @param id - Student ID (UUID format)
   * @returns Promise<StudentResponse>
   */
  async getStudentById(id: string): Promise<StudentResponse> {
    try {
      
      const student = await apiService.get<StudentResponse>(StudentApiPaths.BY_ID(id));
      return student;
    } catch (error: any) {
      if (error.status === StudentHttpStatus.NOT_FOUND) {
        throw makeApiError(error, 'Student not found');
      }
      if (error.status === StudentHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to access student details');
      }
      throw makeApiError(error, `Failed to fetch student: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Get student overview metrics (attendance, homework, grades, billing)
   * @param id - Student ID (UUID format)
   * @returns Promise<StudentOverviewResponse>
   */
  async getStudentOverview(id: string): Promise<StudentOverviewResponse> {
    try {
      const overview = await apiService.get<StudentOverviewResponse>(StudentApiPaths.OVERVIEW(id));
      return overview;
    } catch (error: any) {
      if (error.status === StudentHttpStatus.NOT_FOUND) {
        throw makeApiError(error, 'Student not found');
      }
      if (error.status === StudentHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to access student overview');
      }
      throw makeApiError(error, `Failed to fetch student overview: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Get student class enrollments with per-class progress summary
   * @param id - Student ID (UUID format)
   * @param options - Optional filters (academicYearId, includeAllYears)
   * @returns Promise<StudentClassEnrollment[]>
   */
  async getStudentClasses(
    id: string,
    options: StudentClassesSearchParams = {}
  ): Promise<StudentClassEnrollment[]> {
    try {
      const params = new URLSearchParams();
      
      if (options.academicYearId) {
        params.append('academicYearId', options.academicYearId);
      }
      
      if (options.includeAllYears !== undefined) {
        params.append('includeAllYears', options.includeAllYears.toString());
      }
      
      const queryString = params.toString();
      const endpoint = queryString 
        ? `${StudentApiPaths.CLASSES(id)}?${queryString}` 
        : StudentApiPaths.CLASSES(id);
      
      const response = await apiService.get<StudentClassEnrollmentResponse>(endpoint);
      return response.classes || [];
    } catch (error: any) {
      if (error.status === StudentHttpStatus.NOT_FOUND) {
        throw makeApiError(error, 'Student not found');
      }
      if (error.status === StudentHttpStatus.BAD_REQUEST) {
        throw makeApiError(error, 'Invalid academic year ID format');
      }
      if (error.status === StudentHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to access student classes');
      }
      throw makeApiError(error, `Failed to fetch student classes: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Search for students with filters and pagination
   * @param searchParams - Search parameters
   * @returns Promise<StudentSearchResponse>
   */
  async searchStudents(searchParams: StudentSearchParams = {}): Promise<StudentSearchResponse> {
    try {
      const params = new URLSearchParams();
      
      if (searchParams.searchTerm) {
        params.append('searchTerm', searchParams.searchTerm);
      }
      
      if (searchParams.isActive !== undefined) {
        params.append('isActive', searchParams.isActive.toString());
      }

      if (searchParams.hasDiscount !== undefined) {
        params.append('hasDiscount', searchParams.hasDiscount.toString());
      }
      
      if (searchParams.discountTypeId) {
        params.append('discountTypeId', searchParams.discountTypeId);
      }

      if (searchParams.teacherId) {
        params.append('teacherId', searchParams.teacherId);
      }

      if (searchParams.notEnrolledInAnyClass !== undefined) {
        params.append('notEnrolledInAnyClass', searchParams.notEnrolledInAnyClass.toString());
      }

      if (searchParams.skip !== undefined) {
        params.append('skip', searchParams.skip.toString());
      }

      if (searchParams.take !== undefined) {
        params.append('take', searchParams.take.toString());
      }

      const queryString = params.toString();
      const endpoint = queryString ? `${StudentApiPaths.SEARCH}?${queryString}` : StudentApiPaths.SEARCH;
      
      const response = await apiService.get<any>(endpoint);
      
      // Normalize response - API returns 'items' but we expect 'students'
      const normalizedResponse: StudentSearchResponse = {
        students: response.items || response.students || [],
        totalCount: response.totalCount ?? 0,
        skip: response.skip ?? 0,
        take: response.take ?? 50,
      };
      
      return normalizedResponse;
    } catch (error: any) {
      if (error.status === StudentHttpStatus.BAD_REQUEST) {
        // Check if it's invalid discount type ID error
        if (error.details?.detail?.includes('Discount Type ID')) {
          throw makeApiError(error, 'Invalid discount type ID format provided');
        }
        throw makeApiError(error, 'Invalid search parameters provided');
      }
      if (error.status === StudentHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to search students');
      }
      throw makeApiError(error, `Failed to search students: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Create a new student with enrollment and discount information
   * @param request - Student creation data
   * @returns Promise<StudentCreatedResponse>
   */
  async createStudent(request: CreateStudentRequest): Promise<StudentCreatedResponse> {
    try {
      
const result = await apiService.post<StudentCreatedResponse>(
        StudentApiPaths.BASE,
        request
      );
      return result;
    } catch (error: any) {
      if (error.status === StudentHttpStatus.CONFLICT) {
        // Check the error message to determine the type of conflict
        if (error.details?.detail?.includes('email') || error.message?.toLowerCase?.().includes('email')) {
          throw makeApiError(error, 'A student with this email address already exists');
        }
        throw makeApiError(error, 'Student data conflicts with existing records');
      }
      if (error.status === StudentHttpStatus.BAD_REQUEST) {
        // Extract validation error details if available
        if (error.details?.detail?.includes('Discount Type')) {
          throw makeApiError(error, 'The selected discount type does not exist');
        }
        const validationError = error.details?.detail || 'Invalid student data provided';
        throw makeApiError(error, `Validation error: ${validationError}`);
      }
      if (error.status === StudentHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to create students');
      }
      throw makeApiError(error, `Failed to create student: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Update an existing student
   * @param id - Student ID to update
   * @param request - Updated student data
   * @returns Promise<StudentResponse>
   */
  async updateStudent(id: string, request: UpdateStudentRequest): Promise<StudentResponse> {
    try {
      
const result = await apiService.put<StudentResponse>(
        StudentApiPaths.BY_ID(id),
        request
      );
      return result;
    } catch (error: any) {
      if (error.status === StudentHttpStatus.NOT_FOUND) {
        throw makeApiError(error, 'Student not found');
      }
      if (error.status === StudentHttpStatus.CONFLICT) {
        // Check the error message to determine the type of conflict
        if (error.details?.detail?.includes('email') || error.message?.toLowerCase?.().includes('email')) {
          throw makeApiError(error, 'A student with this email address already exists');
        }
        throw makeApiError(error, 'Student data conflicts with existing records');
      }
      if (error.status === StudentHttpStatus.BAD_REQUEST) {
        // Extract validation error details if available
        if (error.details?.detail?.includes('Discount Type')) {
          throw makeApiError(error, 'The selected discount type does not exist');
        }
        const validationError = error.details?.detail || 'Invalid student data provided';
        throw makeApiError(error, `Validation error: ${validationError}`);
      }
      if (error.status === StudentHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to update students');
      }
      throw makeApiError(error, `Failed to update student: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Delete a student from the system
   * @param id - Student ID to delete
   * @returns Promise<void>
   */
  async deleteStudent(id: string): Promise<void> {
    try {
      
await apiService.delete<void>(StudentApiPaths.BY_ID(id));
    } catch (error: any) {
      if (error.status === StudentHttpStatus.NOT_FOUND) {
        throw makeApiError(error, 'Student not found');
      }
      if (error.status === StudentHttpStatus.CONFLICT) {
        // Student has dependencies (enrollments, payments, etc.)
        const detailMessage = error.details?.detail || '';
        if (detailMessage.includes('dependencies')) {
          throw makeApiError(error, 'Cannot delete student because they have existing enrollments or payment records. Please remove all related data first.');
        }
        throw makeApiError(error, 'Cannot delete student because they have existing dependencies');
      }
      if (error.status === StudentHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to delete students');
      }
      throw makeApiError(error, `Failed to delete student: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Get all available discount types
   * @returns Promise<DiscountTypeDto[]>
   */
  async getAllDiscountTypes(): Promise<DiscountTypeDto[]> {
    try {
      
const raw = await apiService.get<any>(StudentApiPaths.DISCOUNT_TYPES);
      const discountTypes = normalizeListResponse<DiscountTypeDto>(raw);
      return discountTypes;
    } catch (error: any) {
      if (error.status === StudentHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to access discount types');
      }
      throw makeApiError(error, `Failed to fetch discount types: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Get a specific discount type by ID
   * @param id - Discount type ID (UUID format)
   * @returns Promise<DiscountTypeDto>
   */
  async getDiscountTypeById(id: string): Promise<DiscountTypeDto> {
    try {
      
const discountType = await apiService.get<DiscountTypeDto>(StudentApiPaths.DISCOUNT_TYPE_BY_ID(id));
      return discountType;
    } catch (error: any) {
      if (error.status === StudentHttpStatus.NOT_FOUND) {
        throw makeApiError(error, 'Discount type not found');
      }
      if (error.status === StudentHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to access discount type details');
      }
      throw makeApiError(error, `Failed to fetch discount type: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Check if an email is available for a student account
   * @param email - Email to check (will be sent as provided)
   * @param excludeId - Optional student ID to exclude (for updates)
   * @returns Promise<boolean> - true if available, false if taken
   */
  async checkEmailAvailable(email: string, excludeId?: string): Promise<boolean> {
    try {
      const params = new URLSearchParams();
      params.append('email', email);
      if (excludeId) params.append('excludeId', excludeId);
      const endpoint = `${StudentApiPaths.EMAIL_AVAILABLE}?${params.toString()}`;

      
      const raw = await apiService.get<any>(endpoint);

      // Accept a variety of possible backend response shapes
      if (typeof raw === 'boolean') return raw;
      if (raw && typeof raw === 'object') {
        if (typeof raw.isAvailable === 'boolean') return raw.isAvailable;
        if (typeof raw.available === 'boolean') return raw.available;
        if (typeof raw.result === 'boolean') return raw.result;
        if (typeof raw.value === 'boolean') return raw.value;
      }
      // Fallback: treat truthy as available, falsy as not
      return Boolean(raw);
    } catch (error: any) {
      // For availability checks, treat most failures as not available only if server says conflict.
      // Otherwise surface as a generic error to the caller to handle UI messaging.
      if (error.status === StudentHttpStatus.CONFLICT) {
        return false;
      }
      throw makeApiError(error, `Failed to check email availability: ${error.message || 'Unknown error'}`);
    }
  }
}

// Export a singleton instance
export const studentApiService = new StudentApiService();

// Export convenience functions that match the pattern from the teachers implementation
export const getAllStudents = () => studentApiService.getAllStudents();

export const getStudentById = (id: string) => studentApiService.getStudentById(id);

export const getStudentOverview = (id: string) => studentApiService.getStudentOverview(id);

export const getStudentClasses = (id: string, options?: StudentClassesSearchParams) =>
  studentApiService.getStudentClasses(id, options);

export const searchStudents = (searchParams: StudentSearchParams = {}) => 
  studentApiService.searchStudents(searchParams);

export const createStudent = (request: CreateStudentRequest) =>
  studentApiService.createStudent(request);

export const updateStudent = (id: string, request: UpdateStudentRequest) =>
  studentApiService.updateStudent(id, request);

export const deleteStudent = (id: string) => studentApiService.deleteStudent(id);

export const getAllDiscountTypes = () => studentApiService.getAllDiscountTypes();

export const getDiscountTypeById = (id: string) => studentApiService.getDiscountTypeById(id);

export const checkStudentEmailAvailable = (email: string, excludeId?: string) =>
  studentApiService.checkEmailAvailable(email, excludeId);

// Export the service instance as default
export default studentApiService;

