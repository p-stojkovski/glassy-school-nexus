/* eslint-disable @typescript-eslint/no-explicit-any */
import apiService from './api';
import {
  LoginRequest,
  LoginResponse,
  UserProfile,
  AuthTokens,
  RefreshTokenRequest,
  ChangePasswordRequest,
  UpdateProfileRequest,
  PermissionCheckRequest,
  PermissionCheckResponse,
  SessionInfo,
  AuthApiPaths,
  AuthHttpStatus,
} from '@/types/api/auth';

// Preserve status/details when rethrowing with a custom message
function makeApiError(original: any, message: string): Error & { status?: number; details?: any } {
  const err: any = new Error(message);
  if (original) {
    err.status = original.status;
    err.details = original.details;
  }
  return err as Error & { status?: number; details?: any };
}

export class AuthApiService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  /**
   * Login with email and password
   */
  async login(request: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await apiService.post<LoginResponse>(AuthApiPaths.LOGIN, request);

      // Store tokens
      this.accessToken = response.tokens.accessToken;
      this.refreshToken = response.tokens.refreshToken;

      // Store in localStorage for persistence
      localStorage.setItem('accessToken', response.tokens.accessToken);
      localStorage.setItem('refreshToken', response.tokens.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.user));

      return response;
    } catch (error: any) {
      if (error.status === AuthHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Invalid email or password');
      }
      if (error.status === AuthHttpStatus.BAD_REQUEST) {
        throw makeApiError(error, 'Invalid login request');
      }
      if (error.status === AuthHttpStatus.FORBIDDEN) {
        throw makeApiError(error, 'Account is locked or disabled');
      }
      throw makeApiError(error, `Login failed: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Logout and clear session
   */
  async logout(): Promise<void> {
    try {
      await apiService.post<void>(AuthApiPaths.LOGOUT, {});
    } catch (error: any) {
      console.warn('Logout request failed:', error);
      // Clear local state even if API call fails
    } finally {
      // Clear tokens
      this.accessToken = null;
      this.refreshToken = null;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken?: string): Promise<AuthTokens> {
    try {
      const token = refreshToken || this.refreshToken;
      if (!token) {
        throw new Error('No refresh token available');
      }

      const request: RefreshTokenRequest = { refreshToken: token };
      const response = await apiService.post<AuthTokens>(AuthApiPaths.REFRESH, request);

      // Update stored tokens
      this.accessToken = response.accessToken;
      this.refreshToken = response.refreshToken;
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);

      return response;
    } catch (error: any) {
      if (error.status === AuthHttpStatus.UNAUTHORIZED) {
        // Refresh token expired, need to login again
        this.clearTokens();
        throw makeApiError(error, 'Session expired. Please login again.');
      }
      throw makeApiError(error, `Token refresh failed: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Get current user profile
   */
  async getCurrentProfile(): Promise<UserProfile> {
    try {
      return await apiService.get<UserProfile>(AuthApiPaths.PROFILE);
    } catch (error: any) {
      if (error.status === AuthHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required');
      }
      throw makeApiError(error, `Failed to fetch profile: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(request: UpdateProfileRequest): Promise<UserProfile> {
    try {
      return await apiService.put<UserProfile>(AuthApiPaths.PROFILE_UPDATE, request);
    } catch (error: any) {
      if (error.status === AuthHttpStatus.BAD_REQUEST) {
        const details = error.details;
        if (details?.detail?.includes('email')) {
          throw makeApiError(error, 'Email already in use');
        }
        throw makeApiError(error, `Validation error: ${details?.detail || 'Invalid profile data'}`);
      }
      if (error.status === AuthHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to update profile');
      }
      throw makeApiError(error, `Failed to update profile: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Change user password
   */
  async changePassword(request: ChangePasswordRequest): Promise<void> {
    try {
      await apiService.post<void>(AuthApiPaths.CHANGE_PASSWORD, request);
    } catch (error: any) {
      if (error.status === AuthHttpStatus.BAD_REQUEST) {
        const details = error.details;
        if (details?.detail?.includes('current password')) {
          throw makeApiError(error, 'Current password is incorrect');
        }
        if (details?.detail?.includes('requirements')) {
          throw makeApiError(error, 'Password does not meet security requirements');
        }
        throw makeApiError(error, `Validation error: ${details?.detail || 'Invalid password'}`);
      }
      if (error.status === AuthHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to change password');
      }
      throw makeApiError(error, `Failed to change password: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Check if user has specific permission
   */
  async checkPermission(request: PermissionCheckRequest): Promise<PermissionCheckResponse> {
    try {
      return await apiService.post<PermissionCheckResponse>(AuthApiPaths.CHECK_PERMISSION, request);
    } catch (error: any) {
      if (error.status === AuthHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required');
      }
      if (error.status === AuthHttpStatus.FORBIDDEN) {
        return { allowed: false, reason: 'Permission denied' };
      }
      throw makeApiError(error, `Permission check failed: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Get list of active sessions
   */
  async getSessions(): Promise<SessionInfo[]> {
    try {
      return await apiService.get<SessionInfo[]>(AuthApiPaths.SESSIONS);
    } catch (error: any) {
      if (error.status === AuthHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to view sessions');
      }
      throw makeApiError(error, `Failed to fetch sessions: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Revoke a specific session
   */
  async revokeSession(sessionId: string): Promise<void> {
    try {
      await apiService.delete<void>(AuthApiPaths.SESSIONS_BY_ID(sessionId));
    } catch (error: any) {
      if (error.status === AuthHttpStatus.NOT_FOUND) {
        throw makeApiError(error, 'Session not found');
      }
      if (error.status === AuthHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to revoke session');
      }
      throw makeApiError(error, `Failed to revoke session: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Get stored access token
   */
  getAccessToken(): string | null {
    return this.accessToken || localStorage.getItem('accessToken');
  }

  /**
   * Set access token
   */
  setAccessToken(token: string): void {
    this.accessToken = token;
    localStorage.setItem('accessToken', token);
  }

  /**
   * Get stored refresh token
   */
  getRefreshToken(): string | null {
    return this.refreshToken || localStorage.getItem('refreshToken');
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  /**
   * Clear all stored tokens and user data
   */
  private clearTokens(): void {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  /**
   * Get stored user profile
   */
  getStoredUser(): any {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  }

  /**
   * Initialize from stored tokens
   */
  initializeFromStorage(): void {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');

    if (accessToken) {
      this.accessToken = accessToken;
    }
    if (refreshToken) {
      this.refreshToken = refreshToken;
    }
  }
}

// Export singleton instance
export const authApiService = new AuthApiService();

// Initialize from storage on load
authApiService.initializeFromStorage();

// Convenience exports
export const login = (request: LoginRequest) => authApiService.login(request);

export const logout = () => authApiService.logout();

export const refreshAccessToken = (refreshToken?: string) =>
  authApiService.refreshAccessToken(refreshToken);

export const getCurrentProfile = () => authApiService.getCurrentProfile();

export const updateProfile = (request: UpdateProfileRequest) =>
  authApiService.updateProfile(request);

export const changePassword = (request: ChangePasswordRequest) =>
  authApiService.changePassword(request);

export const checkPermission = (request: PermissionCheckRequest) =>
  authApiService.checkPermission(request);

export const getSessions = () => authApiService.getSessions();

export const revokeSession = (sessionId: string) => authApiService.revokeSession(sessionId);

export const getAccessToken = () => authApiService.getAccessToken();

export const setAccessToken = (token: string) => authApiService.setAccessToken(token);

export const isAuthenticated = () => authApiService.isAuthenticated();

// Export default
export default authApiService;
