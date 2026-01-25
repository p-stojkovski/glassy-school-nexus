import apiService from './api';
import type { Subject, CreateSubjectRequest, UpdateSubjectRequest } from '@/domains/settings/types/subjectTypes';

// Re-export types for backward compatibility
export type { Subject, CreateSubjectRequest, UpdateSubjectRequest } from '@/domains/settings/types/subjectTypes';

export class SubjectApiService {
  private readonly baseEndpoint = '/api/subjects';

  async getAll(): Promise<Subject[]> {
    return apiService.get<Subject[]>(this.baseEndpoint);
  }

  async getById(id: number): Promise<Subject> {
    return apiService.get<Subject>(`${this.baseEndpoint}/${id}`);
  }

  async create(subject: CreateSubjectRequest): Promise<Subject> {
    return apiService.post<Subject>(this.baseEndpoint, subject);
  }

  async update(id: number, subject: UpdateSubjectRequest): Promise<Subject> {
    return apiService.put<Subject>(`${this.baseEndpoint}/${id}`, subject);
  }

  async delete(id: number): Promise<void> {
    return apiService.delete<void>(`${this.baseEndpoint}/${id}`);
  }

  async isKeyAvailable(key: string): Promise<boolean> {
    try {
      const response = await apiService.get<{ available: boolean }>(`${this.baseEndpoint}/key-available?key=${encodeURIComponent(key)}`);
      return response.available;
    } catch {
      return false;
    }
  }
}

export default new SubjectApiService();

