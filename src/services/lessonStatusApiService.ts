import apiService from './api';
import { 
  LessonStatusResponse, 
  UpdateLessonStatusRequest,
  LessonStatusApiPaths,
  LessonStatusName
} from '@/types/api/lesson';

export interface LessonStatus {
  id: string;
  name: LessonStatusName;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

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

