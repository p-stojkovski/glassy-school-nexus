/**
 * Classroom API Service
 * Implements all classroom-related API endpoints using the existing API infrastructure
 */

import apiWithInterceptor from './apiWithInterceptor';
import {
  ClassroomResponse,
  ClassroomCreatedResponse,
  NameAvailabilityResponse,
  CreateClassroomRequest,
  UpdateClassroomRequest,
  ClassroomSearchParams,
  NameAvailabilityParams,
  ClassroomApiPaths,
  ClassroomHttpStatus,
} from '@/types/api/classroom';

// Normalize API responses that may wrap arrays in different shapes
function normalizeListResponse<T>(raw: any): T[] {
  if (Array.isArray(raw)) return raw as T[];
  if (raw && typeof raw === 'object') {
    const candidates = [
      (raw as any).items,
      (raw as any).results,
      (raw as any).classrooms,
      (raw as any).data,
      (raw as any).value,
    ];
    for (const candidate of candidates) {
      if (Array.isArray(candidate)) return candidate as T[];
    }
  }
  return [] as T[];
}

export class ClassroomApiService {
  /**
   * Get all classrooms in the system
   * @returns Promise<ClassroomResponse[]>
   */
  async getAllClassrooms(): Promise<ClassroomResponse[]> {
    try {
      const raw = await apiWithInterceptor.get<any>(ClassroomApiPaths.BASE);
      const classrooms = normalizeListResponse<ClassroomResponse>(raw);
      return classrooms;
    } catch (error: any) {
      if (error.status === ClassroomHttpStatus.UNAUTHORIZED) {
        throw new Error('Authentication required to access classrooms');
      }
      throw new Error(`Failed to fetch classrooms: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Get a specific classroom by its unique identifier
   * @param id - Classroom ID (UUID format)
   * @returns Promise<ClassroomResponse>
   */
  async getClassroomById(id: string): Promise<ClassroomResponse> {
    try {
      const classroom = await apiWithInterceptor.get<ClassroomResponse>(ClassroomApiPaths.BY_ID(id));
      return classroom;
    } catch (error: any) {
      if (error.status === ClassroomHttpStatus.NOT_FOUND) {
        throw new Error('Classroom not found');
      }
      if (error.status === ClassroomHttpStatus.UNAUTHORIZED) {
        throw new Error('Authentication required to access classroom details');
      }
      throw new Error(`Failed to fetch classroom: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Search for classrooms by name or location
   * @param searchParams - Search parameters
   * @returns Promise<ClassroomResponse[]>
   */
  async searchClassrooms(searchParams: ClassroomSearchParams = {}): Promise<ClassroomResponse[]> {
    try {
      const params = new URLSearchParams();
      
      if (searchParams.searchTerm) {
        params.append('searchTerm', searchParams.searchTerm);
      }

      const queryString = params.toString();
      const endpoint = queryString ? `${ClassroomApiPaths.SEARCH}?${queryString}` : ClassroomApiPaths.SEARCH;
      
      const raw = await apiWithInterceptor.get<any>(endpoint);
      const classrooms = normalizeListResponse<ClassroomResponse>(raw);
      return classrooms;
    } catch (error: any) {
      if (error.status === ClassroomHttpStatus.BAD_REQUEST) {
        throw new Error('Invalid search parameters provided');
      }
      if (error.status === ClassroomHttpStatus.UNAUTHORIZED) {
        throw new Error('Authentication required to search classrooms');
      }
      throw new Error(`Failed to search classrooms: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Check if a classroom name is available for use
   * @param params - Name availability parameters
   * @returns Promise<boolean>
   */
  async checkNameAvailability(params: NameAvailabilityParams): Promise<boolean> {
    try {
      const urlParams = new URLSearchParams({ name: params.name });
      if (params.excludeId) {
        urlParams.append('excludeId', params.excludeId);
      }

      const endpoint = `${ClassroomApiPaths.NAME_AVAILABLE}?${urlParams.toString()}`;
      const result = await apiWithInterceptor.get<NameAvailabilityResponse>(endpoint, {
        skipGlobalLoading: true
      });
      
      return result.isAvailable;
    } catch (error: any) {
      if (error.status === ClassroomHttpStatus.BAD_REQUEST) {
        throw new Error('Name parameter is required for availability check');
      }
      if (error.status === ClassroomHttpStatus.UNAUTHORIZED) {
        throw new Error('Authentication required to check name availability');
      }
      throw new Error(`Failed to check name availability: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Create a new classroom
   * @param request - Classroom creation data
   * @returns Promise<ClassroomCreatedResponse>
   */
  async createClassroom(request: CreateClassroomRequest): Promise<ClassroomCreatedResponse> {
    try {
      const result = await apiWithInterceptor.post<ClassroomCreatedResponse>(
        ClassroomApiPaths.BASE,
        request
      );
      return result;
    } catch (error: any) {
      if (error.status === ClassroomHttpStatus.CONFLICT) {
        throw new Error('Classroom name already exists');
      }
      if (error.status === ClassroomHttpStatus.BAD_REQUEST) {
        // Extract validation error details if available
        const validationError = error.details?.detail || 'Invalid classroom data provided';
        throw new Error(`Validation error: ${validationError}`);
      }
      if (error.status === ClassroomHttpStatus.UNAUTHORIZED) {
        throw new Error('Authentication required to create classrooms');
      }
      throw new Error(`Failed to create classroom: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Update an existing classroom
   * @param id - Classroom ID to update
   * @param request - Updated classroom data
   * @returns Promise<ClassroomResponse>
   */
  async updateClassroom(id: string, request: UpdateClassroomRequest): Promise<ClassroomResponse> {
    try {
      const result = await apiWithInterceptor.put<ClassroomResponse>(
        ClassroomApiPaths.BY_ID(id),
        request
      );
      return result;
    } catch (error: any) {
      if (error.status === ClassroomHttpStatus.NOT_FOUND) {
        throw new Error('Classroom not found');
      }
      if (error.status === ClassroomHttpStatus.CONFLICT) {
        throw new Error('Classroom name already exists');
      }
      if (error.status === ClassroomHttpStatus.BAD_REQUEST) {
        // Extract validation error details if available
        const validationError = error.details?.detail || 'Invalid classroom data provided';
        throw new Error(`Validation error: ${validationError}`);
      }
      if (error.status === ClassroomHttpStatus.UNAUTHORIZED) {
        throw new Error('Authentication required to update classrooms');
      }
      throw new Error(`Failed to update classroom: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Delete a classroom from the system
   * @param id - Classroom ID to delete
   * @returns Promise<void>
   */
  async deleteClassroom(id: string): Promise<void> {
    try {
      await apiWithInterceptor.delete<void>(ClassroomApiPaths.BY_ID(id));
    } catch (error: any) {
      if (error.status === ClassroomHttpStatus.NOT_FOUND) {
        throw new Error('Classroom not found');
      }
      if (error.status === ClassroomHttpStatus.UNAUTHORIZED) {
        throw new Error('Authentication required to delete classrooms');
      }
      throw new Error(`Failed to delete classroom: ${error.message || 'Unknown error'}`);
    }
  }
}

// Export a singleton instance
export const classroomApiService = new ClassroomApiService();

// Export convenience functions that match the pattern from the integration guide
export const getAllClassrooms = () => classroomApiService.getAllClassrooms();

export const getClassroomById = (id: string) => classroomApiService.getClassroomById(id);

export const searchClassrooms = (
  searchTerm?: string
) => classroomApiService.searchClassrooms({ searchTerm });

export const checkNameAvailability = (name: string, excludeId?: string) =>
  classroomApiService.checkNameAvailability({ name, excludeId });

export const createClassroom = (request: CreateClassroomRequest) =>
  classroomApiService.createClassroom(request);

export const updateClassroom = (id: string, request: UpdateClassroomRequest) =>
  classroomApiService.updateClassroom(id, request);

export const deleteClassroom = (id: string) => classroomApiService.deleteClassroom(id);

// Export the service instance as default
export default classroomApiService;