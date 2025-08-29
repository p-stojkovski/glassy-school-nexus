/* eslint-disable @typescript-eslint/no-explicit-any */

import { store } from '@/store';
import { startRequest, endRequest, showLoaderAfterDelay } from '@/store/slices/loadingSlice';
import { shouldSkipGlobalLoading } from './loadingConfig';

interface ApiError {
  message: string;
  status: number;
  details?: any;
}

interface RequestOptions {
  // Skip global loading for this request
  skipGlobalLoading?: boolean;
  // Custom operation ID for tracking specific loading states
  operationId?: string;
  // Custom headers
  headers?: Record<string, string>;
}

class ApiServiceWithInterceptor {
  private baseURL = 'https://localhost:65383';
  private refreshPromise: Promise<void> | null = null;
  
  // Track request start times for minimum duration
  private requestStartTimes = new Map<string, number>();

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

  // Loading interceptor wrapper
  private async withLoadingInterceptor<T>(
    requestFn: () => Promise<T>,
    options?: RequestOptions,
    endpoint?: string,
    method?: string
  ): Promise<T> {
    const requestId = Math.random().toString(36).substring(7);
    const startTime = Date.now();
    
    // Check if loading should be skipped based on configuration or options
    const shouldSkipLoading = 
      options?.skipGlobalLoading || 
      (endpoint && shouldSkipGlobalLoading(endpoint, method));
    
    let delayTimeoutId: NodeJS.Timeout | null = null;
    
    // Start loading tracking if not skipped
    if (!shouldSkipLoading) {
      this.requestStartTimes.set(requestId, startTime);
      
      // Start the request tracking (but don't show loader immediately)
      store.dispatch(startRequest({ operationId: options?.operationId }));
      
      // Set up delayed loading display
      const showDelay = store.getState().loading.showDelay;
      delayTimeoutId = setTimeout(() => {
        store.dispatch(showLoaderAfterDelay());
      }, showDelay);
    }

    try {
      const result = await requestFn();
      
      // Ensure minimum duration to prevent flicker if loader was shown
      if (!shouldSkipLoading && store.getState().loading.showGlobalLoader) {
        const elapsedTime = Date.now() - startTime;
        const minDuration = store.getState().loading.minDuration;
        
        if (elapsedTime < minDuration) {
          await new Promise(resolve => setTimeout(resolve, minDuration - elapsedTime));
        }
      }
      
      return result;
    } finally {
      // Clean up delay timeout if still pending
      if (delayTimeoutId) {
        clearTimeout(delayTimeoutId);
      }
      
      // End loading
      if (!shouldSkipLoading) {
        this.requestStartTimes.delete(requestId);
        store.dispatch(endRequest({ operationId: options?.operationId }));
      }
    }
  }

  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.withLoadingInterceptor(
      () => this.makeRequest<T>('GET', endpoint, undefined, options),
      options,
      endpoint,
      'GET'
    );
  }

  async post<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.withLoadingInterceptor(
      () => this.makeRequest<T>('POST', endpoint, data, options),
      options,
      endpoint,
      'POST'
    );
  }

  async put<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.withLoadingInterceptor(
      () => this.makeRequest<T>('PUT', endpoint, data, options),
      options,
      endpoint,
      'PUT'
    );
  }

  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.withLoadingInterceptor(
      () => this.makeRequest<T>('DELETE', endpoint, undefined, options),
      options,
      endpoint,
      'DELETE'
    );
  }

  private async makeRequest<T>(
    method: string,
    endpoint: string,
    data?: any,
    options?: RequestOptions,
    isRetry = false
  ): Promise<T> {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;
    
    const requestOptions: RequestInit = {
      method,
      headers: {
        ...this.getAuthHeaders(),
        ...(options?.headers || {})
      },
    };

    if (data && method !== 'GET') {
      requestOptions.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, requestOptions);
      return await this.handleResponse<T>(response);
    } catch (error: any) {
      // Handle retry for 401 errors after token refresh
      if (error.shouldRetry && !isRetry) {
        return this.makeRequest<T>(method, endpoint, data, options, true);
      }
      throw error.error || error;
    }
  }

  // Auth-specific methods with loading skipped by default
  async login(email: string, password: string) {
    return this.post('/api/auth/login', { email, password }, { skipGlobalLoading: true });
  }

  async logout(refreshToken: string) {
    try {
      await this.post('/api/auth/revoke', { refreshToken }, { skipGlobalLoading: true });
    } finally {
      this.clearTokens();
    }
  }

  async getCurrentUser() {
    return this.get('/api/auth/me', { skipGlobalLoading: true });
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
}

// Export singleton instance
const apiServiceWithInterceptor = new ApiServiceWithInterceptor();
export default apiServiceWithInterceptor;

// Export type for use in other files
export type { RequestOptions };
