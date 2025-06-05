
import apiService from './api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'admin' | 'teacher' | 'student';
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<User> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock authentication
    if (credentials.email === 'admin@school.com' && credentials.password === 'password') {
      return {
        id: '1',
        name: 'John Administrator',
        email: 'admin@school.com',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
        role: 'admin',
      };
    }
    
    throw new Error('Invalid credentials');
  }

  async logout(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  async register(userData: any): Promise<User> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      id: Date.now().toString(),
      name: userData.name,
      email: userData.email,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      role: 'admin',
    };
  }
}

export default new AuthService();
