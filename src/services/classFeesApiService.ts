/**
 * Class Fees API Service
 * Handles class fee template CRUD operations
 */

import apiService from './api';
import type {
  ClassFeeTemplate,
  CreateClassFeeTemplateRequest,
  UpdateClassFeeTemplateRequest,
  GetClassFeeTemplatesResponse,
  CreateClassFeeTemplateResponse,
} from '@/types/api/classFees';
import { ClassFeesApiPaths, ClassFeesHttpStatus } from '@/types/api/classFees';

interface ApiError {
  message: string;
  status: number;
  details?: unknown;
}

function makeApiError(
  original: ApiError | undefined,
  message: string
): Error & { status?: number; details?: unknown } {
  const err: Error & { status?: number; details?: unknown } = new Error(message);
  if (original) {
    err.status = original.status;
    err.details = original.details;
  }
  return err;
}

export class ClassFeesApiService {
  /**
   * Get all fee templates for a class.
   */
  async getTemplates(classId: string): Promise<ClassFeeTemplate[]> {
    try {
      const response = await apiService.get<GetClassFeeTemplatesResponse>(
        ClassFeesApiPaths.TEMPLATES_BY_CLASS(classId)
      );
      return response.templates;
    } catch (error: unknown) {
      const apiError = error as ApiError;
      if (apiError.status === ClassFeesHttpStatus.NOT_FOUND) {
        throw makeApiError(apiError, 'Class not found');
      }
      if (apiError.status === ClassFeesHttpStatus.UNAUTHORIZED) {
        throw makeApiError(apiError, 'Authentication required to view fee templates');
      }
      throw makeApiError(apiError, `Failed to fetch fee templates: ${apiError.message || 'Unknown error'}`);
    }
  }

  /**
   * Create a new fee template for a class.
   */
  async createTemplate(
    classId: string,
    request: CreateClassFeeTemplateRequest
  ): Promise<string> {
    try {
      const response = await apiService.post<CreateClassFeeTemplateResponse>(
        ClassFeesApiPaths.TEMPLATES_BY_CLASS(classId),
        request
      );
      return response.id;
    } catch (error: unknown) {
      const apiError = error as ApiError;
      if (apiError.status === ClassFeesHttpStatus.NOT_FOUND) {
        throw makeApiError(apiError, 'Class not found');
      }
      if (apiError.status === ClassFeesHttpStatus.BAD_REQUEST) {
        throw makeApiError(apiError, apiError.message || 'Invalid fee template data');
      }
      if (apiError.status === ClassFeesHttpStatus.CONFLICT) {
        throw makeApiError(apiError, 'A fee template with this name already exists');
      }
      if (apiError.status === ClassFeesHttpStatus.UNAUTHORIZED) {
        throw makeApiError(apiError, 'Authentication required to create fee templates');
      }
      throw makeApiError(apiError, `Failed to create fee template: ${apiError.message || 'Unknown error'}`);
    }
  }

  /**
   * Update an existing fee template.
   */
  async updateTemplate(
    classId: string,
    templateId: string,
    request: UpdateClassFeeTemplateRequest
  ): Promise<void> {
    try {
      await apiService.put(
        ClassFeesApiPaths.TEMPLATE_BY_ID(classId, templateId),
        request
      );
    } catch (error: unknown) {
      const apiError = error as ApiError;
      if (apiError.status === ClassFeesHttpStatus.NOT_FOUND) {
        throw makeApiError(apiError, 'Fee template not found');
      }
      if (apiError.status === ClassFeesHttpStatus.BAD_REQUEST) {
        throw makeApiError(apiError, apiError.message || 'Invalid fee template data');
      }
      if (apiError.status === ClassFeesHttpStatus.CONFLICT) {
        throw makeApiError(apiError, 'A fee template with this name already exists');
      }
      if (apiError.status === ClassFeesHttpStatus.UNAUTHORIZED) {
        throw makeApiError(apiError, 'Authentication required to update fee templates');
      }
      throw makeApiError(apiError, `Failed to update fee template: ${apiError.message || 'Unknown error'}`);
    }
  }

  /**
   * Delete a fee template.
   */
  async deleteTemplate(classId: string, templateId: string): Promise<void> {
    try {
      await apiService.delete(ClassFeesApiPaths.TEMPLATE_BY_ID(classId, templateId));
    } catch (error: unknown) {
      const apiError = error as ApiError;
      if (apiError.status === ClassFeesHttpStatus.NOT_FOUND) {
        throw makeApiError(apiError, 'Fee template not found');
      }
      if (apiError.status === ClassFeesHttpStatus.UNAUTHORIZED) {
        throw makeApiError(apiError, 'Authentication required to delete fee templates');
      }
      throw makeApiError(apiError, `Failed to delete fee template: ${apiError.message || 'Unknown error'}`);
    }
  }
}

// Export singleton instance
const classFeesApiService = new ClassFeesApiService();
export default classFeesApiService;

// Convenience exports for direct function calls
export const getTemplates = (classId: string) =>
  classFeesApiService.getTemplates(classId);

export const createTemplate = (classId: string, request: CreateClassFeeTemplateRequest) =>
  classFeesApiService.createTemplate(classId, request);

export const updateTemplate = (
  classId: string,
  templateId: string,
  request: UpdateClassFeeTemplateRequest
) => classFeesApiService.updateTemplate(classId, templateId, request);

export const deleteTemplate = (classId: string, templateId: string) =>
  classFeesApiService.deleteTemplate(classId, templateId);
