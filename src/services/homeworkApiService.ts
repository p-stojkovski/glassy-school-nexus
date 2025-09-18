/* eslint-disable @typescript-eslint/no-explicit-any */
import apiService from './api';
import { 
  HomeworkAssignmentResponse,
  CreateHomeworkAssignmentRequest,
  UpdateHomeworkAssignmentRequest,
  PreviousHomeworkResponse,
  HomeworkCompletionSummaryResponse,
  HomeworkApiPaths,
  HomeworkHttpStatus
} from '@/types/api/homework';

// Preserve status/details when rethrowing with a custom message
function makeApiError(original: any, message: string): Error & { status?: number; details?: any } {
  const err: any = new Error(message);
  if (original) {
    err.status = original.status;
    err.details = original.details;
  }
  return err as Error & { status?: number; details?: any };
}

export class HomeworkApiService {

  /**
   * Get homework assignment for a lesson
   * @param lessonId - The lesson ID
   * @returns Promise resolving to homework assignment or null if not found
   */
  async getHomeworkAssignment(lessonId: string): Promise<HomeworkAssignmentResponse | null> {
    try {
      return await apiService.get<HomeworkAssignmentResponse>(HomeworkApiPaths.GET_ASSIGNMENT(lessonId));
    } catch (error: any) {
      if (error.status === HomeworkHttpStatus.NOT_FOUND) {
        // Return null for 404 - no homework assignment exists for this lesson
        return null;
      }
      if (error.status === HomeworkHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to access homework assignments');
      }
      if (error.status === HomeworkHttpStatus.BAD_REQUEST) {
        throw makeApiError(error, 'Invalid lesson ID provided');
      }
      throw makeApiError(error, `Failed to fetch homework assignment: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Create homework assignment for a lesson
   * @param lessonId - The lesson ID
   * @param request - Homework assignment creation data
   * @returns Promise resolving to created homework assignment
   */
  async createHomeworkAssignment(lessonId: string, request: CreateHomeworkAssignmentRequest): Promise<HomeworkAssignmentResponse> {
    try {
      return await apiService.post<HomeworkAssignmentResponse>(HomeworkApiPaths.CREATE_ASSIGNMENT(lessonId), request);
    } catch (error: any) {
      if (error.status === HomeworkHttpStatus.NOT_FOUND) {
        throw makeApiError(error, 'Lesson not found');
      }
      if (error.status === HomeworkHttpStatus.CONFLICT) {
        throw makeApiError(error, 'Homework assignment already exists for this lesson');
      }
      if (error.status === HomeworkHttpStatus.BAD_REQUEST) {
        const details = error.details;
        if (details?.detail?.includes('title')) {
          throw makeApiError(error, 'Assignment title is required and cannot be empty');
        }
        if (details?.detail?.includes('due date')) {
          throw makeApiError(error, 'Due date must be in YYYY-MM-DD format and cannot be in the past');
        }
        if (details?.detail?.includes('assignment type')) {
          throw makeApiError(error, 'Assignment type must be one of: reading, writing, vocabulary, grammar, general');
        }
        if (details?.detail?.includes('teacher')) {
          throw makeApiError(error, 'Current user is not associated with a teacher record');
        }
        throw makeApiError(error, `Validation error: ${details?.detail || 'Invalid homework assignment data'}`);
      }
      if (error.status === HomeworkHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to create homework assignments');
      }
      throw makeApiError(error, `Failed to create homework assignment: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Update homework assignment for a lesson
   * @param lessonId - The lesson ID
   * @param request - Homework assignment update data
   * @returns Promise resolving to updated homework assignment
   */
  async updateHomeworkAssignment(lessonId: string, request: UpdateHomeworkAssignmentRequest): Promise<HomeworkAssignmentResponse> {
    try {
      return await apiService.put<HomeworkAssignmentResponse>(HomeworkApiPaths.UPDATE_ASSIGNMENT(lessonId), request);
    } catch (error: any) {
      if (error.status === HomeworkHttpStatus.NOT_FOUND) {
        throw makeApiError(error, 'Homework assignment not found for this lesson');
      }
      if (error.status === HomeworkHttpStatus.BAD_REQUEST) {
        const details = error.details;
        if (details?.detail?.includes('title')) {
          throw makeApiError(error, 'Assignment title is required and cannot be empty');
        }
        if (details?.detail?.includes('due date')) {
          throw makeApiError(error, 'Due date must be in YYYY-MM-DD format');
        }
        if (details?.detail?.includes('assignment type')) {
          throw makeApiError(error, 'Assignment type must be one of: reading, writing, vocabulary, grammar, general');
        }
        throw makeApiError(error, `Validation error: ${details?.detail || 'Invalid homework assignment data'}`);
      }
      if (error.status === HomeworkHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to update homework assignments');
      }
      throw makeApiError(error, `Failed to update homework assignment: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Delete homework assignment for a lesson
   * @param lessonId - The lesson ID
   * @returns Promise resolving when deletion is complete
   */
  async deleteHomeworkAssignment(lessonId: string): Promise<void> {
    try {
      await apiService.delete<void>(HomeworkApiPaths.DELETE_ASSIGNMENT(lessonId));
    } catch (error: any) {
      if (error.status === HomeworkHttpStatus.NOT_FOUND) {
        throw makeApiError(error, 'Homework assignment not found for this lesson');
      }
      if (error.status === HomeworkHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to delete homework assignments');
      }
      throw makeApiError(error, `Failed to delete homework assignment: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Get homework assignment from previous lesson in the same class
   * @param lessonId - The current lesson ID
   * @returns Promise resolving to previous homework information
   */
  async getPreviousHomework(lessonId: string): Promise<PreviousHomeworkResponse> {
    try {
      return await apiService.get<PreviousHomeworkResponse>(HomeworkApiPaths.GET_PREVIOUS_HOMEWORK(lessonId));
    } catch (error: any) {
      if (error.status === HomeworkHttpStatus.NOT_FOUND) {
        throw makeApiError(error, 'Lesson not found');
      }
      if (error.status === HomeworkHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to access homework information');
      }
      if (error.status === HomeworkHttpStatus.BAD_REQUEST) {
        throw makeApiError(error, 'Invalid lesson ID provided');
      }
      throw makeApiError(error, `Failed to fetch previous homework: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Check if a lesson has homework assigned
   * @param lessonId - The lesson ID
   * @returns Promise resolving to boolean indicating if homework exists
   */
  async hasHomeworkAssignment(lessonId: string): Promise<boolean> {
    try {
      const assignment = await this.getHomeworkAssignment(lessonId);
      return assignment !== null;
    } catch (error: any) {
      // If there's an error other than the lesson not being found, 
      // assume no homework to avoid breaking the UI
      if (error.status === HomeworkHttpStatus.NOT_FOUND || error.message?.includes('Lesson not found')) {
        throw error; // Re-throw lesson not found errors
      }
      console.warn('Error checking homework assignment existence:', error);
      return false;
    }
  }

  /**
   * Get homework completion summary for a lesson
   * @param lessonId - The lesson ID
   * @returns Promise resolving to homework completion statistics
   */
  async getHomeworkCompletionSummary(lessonId: string): Promise<HomeworkCompletionSummaryResponse> {
    try {
      return await apiService.get<HomeworkCompletionSummaryResponse>(HomeworkApiPaths.GET_HOMEWORK_COMPLETION_SUMMARY(lessonId));
    } catch (error: any) {
      if (error.status === HomeworkHttpStatus.NOT_FOUND) {
        throw makeApiError(error, 'Lesson not found');
      }
      if (error.status === HomeworkHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to access homework completion data');
      }
      if (error.status === HomeworkHttpStatus.BAD_REQUEST) {
        throw makeApiError(error, 'Invalid lesson ID provided');
      }
      throw makeApiError(error, `Failed to fetch homework completion summary: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Get homework assignment with previous homework information
   * Used for comprehensive homework management views
   * @param lessonId - The lesson ID
   * @returns Promise resolving to homework assignment and previous homework data
   */
  async getHomeworkWithPrevious(lessonId: string): Promise<{
    currentAssignment: HomeworkAssignmentResponse | null;
    previousHomework: PreviousHomeworkResponse;
  }> {
    try {
      const [currentAssignment, previousHomework] = await Promise.all([
        this.getHomeworkAssignment(lessonId),
        this.getPreviousHomework(lessonId)
      ]);

      return {
        currentAssignment,
        previousHomework
      };
    } catch (error: any) {
      throw makeApiError(error, `Failed to fetch homework data: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Create or update homework assignment (upsert operation)
   * @param lessonId - The lesson ID
   * @param request - Homework assignment data
   * @returns Promise resolving to homework assignment (created or updated)
   */
  async upsertHomeworkAssignment(lessonId: string, request: CreateHomeworkAssignmentRequest | UpdateHomeworkAssignmentRequest): Promise<HomeworkAssignmentResponse> {
    try {
      // First try to get existing assignment
      const existing = await this.getHomeworkAssignment(lessonId);
      
      if (existing) {
        // Update existing assignment
        return await this.updateHomeworkAssignment(lessonId, request as UpdateHomeworkAssignmentRequest);
      } else {
        // Create new assignment
        return await this.createHomeworkAssignment(lessonId, request as CreateHomeworkAssignmentRequest);
      }
    } catch (error: any) {
      throw makeApiError(error, `Failed to save homework assignment: ${error.message || 'Unknown error'}`);
    }
  }
}

// Export singleton instance
export const homeworkApiService = new HomeworkApiService();