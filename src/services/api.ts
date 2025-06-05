
// Mock API service to simulate HTTP requests
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class ApiService {
  private baseDelay = 800; // Simulate network delay

  async get<T>(endpoint: string): Promise<T> {
    await delay(this.baseDelay);
    console.log(`GET ${endpoint}`);
    // In a real app, this would make an actual HTTP request
    throw new Error('Method should be overridden by specific services');
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    await delay(this.baseDelay);
    console.log(`POST ${endpoint}`, data);
    throw new Error('Method should be overridden by specific services');
  }

  async put<T>(endpoint: string, data: any): Promise<T> {
    await delay(this.baseDelay);
    console.log(`PUT ${endpoint}`, data);
    throw new Error('Method should be overridden by specific services');
  }

  async delete<T>(endpoint: string): Promise<T> {
    await delay(this.baseDelay);
    console.log(`DELETE ${endpoint}`);
    throw new Error('Method should be overridden by specific services');
  }
}

export default new ApiService();
