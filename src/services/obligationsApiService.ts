/**
 * Obligations API Service
 * Handles student obligation generation and management
 */

import apiService from './api';
import type {
  GenerateBulkObligationsRequest,
  GenerateBulkObligationsResponse,
} from '@/types/api/obligations';
import { ObligationsApiPaths, ObligationsHttpStatus } from '@/types/api/obligations';

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

export class ObligationsApiService {
  /**
   * Generate bulk obligations for enrolled students in a class.
   * Creates payment obligations based on fee templates for the specified period.
   */
  async generateBulkObligations(
    classId: string,
    request: GenerateBulkObligationsRequest
  ): Promise<GenerateBulkObligationsResponse> {
    try {
      const response = await apiService.post<GenerateBulkObligationsResponse>(
        ObligationsApiPaths.GENERATE_BULK(classId),
        request
      );
      return response;
    } catch (error: unknown) {
      const apiError = error as ApiError;
      if (apiError.status === ObligationsHttpStatus.NOT_FOUND) {
        throw makeApiError(apiError, 'Class not found');
      }
      if (apiError.status === ObligationsHttpStatus.BAD_REQUEST) {
        throw makeApiError(apiError, apiError.message || 'Invalid obligation data');
      }
      if (apiError.status === ObligationsHttpStatus.UNAUTHORIZED) {
        throw makeApiError(apiError, 'Authentication required to generate obligations');
      }
      const errorMsg = apiError.message || 'Unknown error';
      throw makeApiError(
        apiError,
        'Failed to generate obligations: ' + errorMsg
      );
    }
  }
}

// Export singleton instance
const obligationsApiService = new ObligationsApiService();
export default obligationsApiService;

// Convenience exports for direct function calls
export const generateBulkObligations = (
  classId: string,
  request: GenerateBulkObligationsRequest
) => obligationsApiService.generateBulkObligations(classId, request);
