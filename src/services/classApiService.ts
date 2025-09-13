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
} from '@/types/api/class';

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
}

export const classApiService = new ClassApiService();

// Convenience exports matching project style
export const getAllClasses = () => classApiService.getAllClasses();
export const getClassById = (id: string) => classApiService.getClassById(id);
export const searchClasses = (params?: ClassSearchParams) => classApiService.searchClasses(params);
export const createClass = (request: CreateClassRequest) => classApiService.createClass(request);
export const updateClass = (id: string, request: UpdateClassRequest) => classApiService.updateClass(id, request);
export const deleteClass = (id: string) => classApiService.deleteClass(id);

