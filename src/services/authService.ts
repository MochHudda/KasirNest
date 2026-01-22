import { api } from '../utils/api';
import { User, ApiResponse } from '../types';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  storeName: string;
  storeType: string;
}

export class AuthService {
  // Sign in with email and password
  static async signInWithEmailAndPassword(credentials: LoginCredentials): Promise<ApiResponse<User>> {
    try {
      const response = await api.post('/auth/login', credentials);
      
      // Store token and user data
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      return {
        success: true,
        data: response.data.user,
        message: 'Login successful'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Login failed'
      };
    }
  }

  // Create new user account
  static async createUserWithEmailAndPassword(signupData: SignupData): Promise<ApiResponse<User>> {
    try {
      const response = await api.post('/auth/register', signupData);
      
      // Store token and user data
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      return {
        success: true,
        data: response.data.user,
        message: 'Account created successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Registration failed'
      };
    }
  }

  // Get current user from storage/token
  static async getCurrentUser(): Promise<User | null> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return null;
      }

      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      // If token is invalid, clear storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return null;
    }
  }

  // Update user profile
  static async updateProfile(userId: string, updateData: Partial<User>): Promise<ApiResponse<User>> {
    try {
      const response = await api.put(`/auth/profile/${userId}`, updateData);
      
      // Update stored user data
      localStorage.setItem('user', JSON.stringify(response.data));
      
      return {
        success: true,
        data: response.data,
        message: 'Profile updated successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Profile update failed'
      };
    }
  }

  // Sign out user
  static async signOut(): Promise<void> {
    try {
      // Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
}