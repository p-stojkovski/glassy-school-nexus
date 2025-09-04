import apiService from './apiWithInterceptor';

export interface DiscountType {
  id: number;
  key: string;
  name: string;
  description?: string;
  requiresAmount: boolean;
  sortOrder: number;
  isActive: boolean;
}

export interface CreateDiscountTypeRequest {
  key: string;
  name: string;
  description?: string;
  requiresAmount: boolean;
  sortOrder: number;
}

export interface UpdateDiscountTypeRequest {
  key: string;
  name: string;
  description?: string;
  requiresAmount: boolean;
  sortOrder: number;
}

export class DiscountTypeApiService {
  private readonly baseEndpoint = '/api/discount-types';

  async getAll(): Promise<DiscountType[]> {
    return apiService.get<DiscountType[]>(this.baseEndpoint);
  }

  async getById(id: number): Promise<DiscountType> {
    return apiService.get<DiscountType>(`${this.baseEndpoint}/${id}`);
  }

  async create(discountType: CreateDiscountTypeRequest): Promise<DiscountType> {
    return apiService.post<DiscountType>(this.baseEndpoint, discountType);
  }

  async update(id: number, discountType: UpdateDiscountTypeRequest): Promise<DiscountType> {
    return apiService.put<DiscountType>(`${this.baseEndpoint}/${id}`, discountType);
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

export default new DiscountTypeApiService();
