import apiService from './api';
import { UserRole } from '@/types/enums';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegistrationData {
  name: string;
  email: string;
  password: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<User> {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock authentication
    if (
      credentials.email === 'admin@school.com' &&
      credentials.password === 'password'
    ) {
      return {
        id: '1',
        name: 'John Administrator',
        email: 'admin@school.com',
        role: UserRole.Admin,
      };
    }

    throw new Error('Invalid credentials');
  }

  async logout(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  async register(userData: RegistrationData): Promise<User> {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return {
      id: Date.now().toString(),
      name: userData.name,
      email: userData.email,
      role: UserRole.Admin,
    };
  }
}

export default new AuthService();
