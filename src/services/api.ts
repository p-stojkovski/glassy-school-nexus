/* eslint-disable @typescript-eslint/no-explicit-any */

interface ApiError {
  message: string;
  status: number;
  details?: any;
}

class ApiService {
  private baseURL = 'https://localhost:5001';
  private refreshPromise: Promise<void> | null = null;

  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('accessToken');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorMessage = 'Network error';
      let errorDetails: any = null;

      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorData.message || `HTTP ${response.status}`;
        errorDetails = errorData;
      } catch {
        errorMessage = `HTTP ${response.status} - ${response.statusText}`;
      }

      const apiError: ApiError = {
        message: errorMessage,
        status: response.status,
        details: errorDetails,
      };

      // Handle unauthorized responses
      if (response.status === 401) {
        // Try to refresh token if it's not a login/refresh request
        const url = new URL(response.url);
        const isAuthEndpoint = url.pathname.includes('/api/auth');
        
        if (!isAuthEndpoint) {
          try {
            await this.refreshToken();
            // Don't throw here, let the caller retry
            return Promise.reject({ shouldRetry: true, error: apiError });
          } catch {
            // Refresh failed, clear tokens and force login
            this.clearTokens();
            window.location.reload();
          }
        }
      }

      throw apiError;
    }

    // Handle no content responses
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return undefined as T;
    }

    try {
      return await response.json();
    } catch {
      // If JSON parsing fails, return empty object
      return {} as T;
    }
  }

  private async refreshToken(): Promise<void> {
    // Prevent multiple simultaneous refresh attempts
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this._refreshToken();
    
    try {
      await this.refreshPromise;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async _refreshToken(): Promise<void> {
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(`${this.baseURL}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refreshToken,
      }),
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    const tokenData = await response.json();
    
    localStorage.setItem('accessToken', tokenData.accessToken);
    localStorage.setItem('refreshToken', tokenData.refreshToken);
  }

  private clearTokens(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.makeRequest<T>('GET', endpoint);
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.makeRequest<T>('POST', endpoint, data);
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.makeRequest<T>('PUT', endpoint, data);
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.makeRequest<T>('DELETE', endpoint);
  }

  private async makeRequest<T>(
    method: string,
    endpoint: string,
    data?: any,
    isRetry = false
  ): Promise<T> {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;
    
    const options: RequestInit = {
      method,
      headers: this.getAuthHeaders(),
    };

    if (data && method !== 'GET') {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, options);
      return await this.handleResponse<T>(response);
    } catch (error: any) {
      // Handle retry for 401 errors after token refresh
      if (error.shouldRetry && !isRetry) {
        return this.makeRequest<T>(method, endpoint, data, true);
      }
      throw error.error || error;
    }
  }

  // Auth-specific methods
  async login(email: string, password: string) {
    return this.post('/api/auth/login', { email, password });
  }

  async logout(refreshToken: string) {
    try {
      await this.post('/api/auth/revoke', { refreshToken });
    } finally {
      this.clearTokens();
    }
  }

  async getCurrentUser() {
    return this.get('/api/auth/me');
  }

  isTokenExpired(): boolean {
    const token = localStorage.getItem('accessToken');
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch {
      return true;
    }
  }

  hasValidToken(): boolean {
    return !!localStorage.getItem('accessToken') && !this.isTokenExpired();
  }
}

export default new ApiService();
