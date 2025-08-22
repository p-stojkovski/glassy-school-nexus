import apiService from './api';
import { UserRole } from '@/types/enums';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

// Backend response interfaces
interface AuthenticationResponse {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  accessToken: string;
  refreshToken: string;
  expiresInMinutes: number;
}

interface CurrentUserResponse {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<User> {
    try {
      const response: AuthenticationResponse = await apiService.login(
        credentials.email,
        credentials.password
      );

      // Store tokens
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);

      // Convert backend response to frontend User format
      const user: User = {
        id: response.userId,
        firstName: response.firstName,
        lastName: response.lastName,
        email: response.email,
        role: response.role.toLowerCase() as UserRole,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${response.firstName}`,
      };

      return user;
    } catch (error: unknown) {
      // Handle API errors and provide user-friendly messages
      if (error && typeof error === 'object' && 'status' in error) {
        const apiError = error as { status: number; message?: string };
        if (apiError.status === 401) {
          throw new Error('Invalid email or password');
        } else if (apiError.status >= 500) {
          throw new Error('Server error. Please try again later.');
        } else {
          throw new Error(apiError.message || 'Login failed. Please try again.');
        }
      } else {
        const errorMessage = error instanceof Error ? error.message : 'Login failed. Please try again.';
        throw new Error(errorMessage);
      }
    }
  }

  async logout(): Promise<void> {
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (refreshToken) {
      try {
        await apiService.logout(refreshToken);
      } catch (error) {
        // Log error but don't throw - we still want to clear local tokens
        console.warn('Logout API call failed:', error);
      }
    }

    // Always clear local tokens
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  async logoutFromAllDevices(): Promise<void> {
    try {
      // Call the backend endpoint to revoke all refresh tokens for this user
      await apiService.post('/api/auth/revoke-all');
    } catch (error) {
      // Log error but don't throw - we still want to clear local tokens
      console.warn('Logout from all devices API call failed:', error);
    }

    // Always clear local tokens regardless of API success
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      if (!apiService.hasValidToken()) {
        return null;
      }

      const response: CurrentUserResponse = await apiService.getCurrentUser();

      const user: User = {
        id: response.userId,
        firstName: response.firstName,
        lastName: response.lastName,
        email: response.email,
        role: response.role.toLowerCase() as UserRole,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${response.firstName}`,
      };

      return user;
    } catch (error) {
      console.warn('Failed to get current user:', error);
      return null;
    }
  }

  async register(userData: RegistrationData): Promise<User> {
    try {
      const response: AuthenticationResponse = await apiService.post('/api/auth/register', {
        email: userData.email,
        password: userData.password,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role || UserRole.Student,
      });

      // Store tokens
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);

      // Convert backend response to frontend User format
      const user: User = {
        id: response.userId,
        firstName: response.firstName,
        lastName: response.lastName,
        email: response.email,
        role: response.role.toLowerCase() as UserRole,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${response.firstName}`,
      };

      return user;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'status' in error) {
        const apiError = error as { status: number; message?: string };
        if (apiError.status === 409) {
          throw new Error('An account with this email already exists');
        } else if (apiError.status >= 500) {
          throw new Error('Server error. Please try again later.');
        } else {
          throw new Error(apiError.message || 'Registration failed. Please try again.');
        }
      } else {
        const errorMessage = error instanceof Error ? error.message : 'Registration failed. Please try again.';
        throw new Error(errorMessage);
      }
    }
  }

  isAuthenticated(): boolean {
    return apiService.hasValidToken();
  }

  // Helper method to get full name for backward compatibility
  getFullName(user: User): string {
    return `${user.firstName} ${user.lastName}`.trim();
  }
}

export default new AuthService();
