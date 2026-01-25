import apiService from './api';
import { LessonStatusApiPaths } from '@/types/api/lesson';
import type { LessonStatus, UpdateLessonStatusRequest } from '@/domains/settings/types/lessonStatusTypes';

// Re-export types for backward compatibility
export type { LessonStatus, UpdateLessonStatusRequest } from '@/domains/settings/types/lessonStatusTypes';

export class LessonStatusApiService {
  private readonly baseEndpoint = LessonStatusApiPaths.BASE;

  async getAll(): Promise<LessonStatus[]> {
    return apiService.get<LessonStatus[]>(this.baseEndpoint);
  }

  async getById(id: string): Promise<LessonStatus> {
    return apiService.get<LessonStatus>(LessonStatusApiPaths.BY_ID(id));
  }

  // Update only allows description changes
  async update(id: string, lessonStatus: UpdateLessonStatusRequest): Promise<LessonStatus> {
    return apiService.put<LessonStatus>(LessonStatusApiPaths.BY_ID(id), lessonStatus);
  }
}

export default new LessonStatusApiService();

