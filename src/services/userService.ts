import { api } from '../config/firebase';
import { User, ApiResponse } from '../types';

export class UserService {
  // Get all users for current store
  static async getUsers(): Promise<ApiResponse<User[]>> {
    try {
      const response = await api.get('/users');
      
      return {
        success: true,
        data: response.data,
        message: 'Users retrieved successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to get users'
      };
    }
  }

  // Get single user
  static async getUser(userId: string): Promise<ApiResponse<User>> {
    try {
      const response = await api.get(`/users/${userId}`);
      
      return {
        success: true,
        data: response.data,
        message: 'User retrieved successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to get user'
      };
    }
  }

  // Update user role in store
  static async updateUserRole(userId: string, role: string): Promise<ApiResponse<void>> {
    try {
      await api.put(`/users/${userId}/role`, { role });
      
      return {
        success: true,
        message: 'User role updated successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to update user role'
      };
    }
  }

  // Remove user from store
  static async removeUser(userId: string): Promise<ApiResponse<void>> {
    try {
      await api.delete(`/users/${userId}`);
      
      return {
        success: true,
        message: 'User removed successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to remove user'
      };
    }
  }

  // Invite user to store
  static async inviteUser(email: string, role: string): Promise<ApiResponse<void>> {
    try {
      await api.post('/users/invite', { email, role });
      
      return {
        success: true,
        message: 'User invitation sent successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to send invitation'
      };
    }
  }

  // Get user permissions
  static async getUserPermissions(userId: string): Promise<ApiResponse<string[]>> {
    try {
      const response = await api.get(`/users/${userId}/permissions`);
      
      return {
        success: true,
        data: response.data,
        message: 'User permissions retrieved successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to get user permissions'
      };
    }
  }

  // Update user permissions
  static async updateUserPermissions(userId: string, permissions: string[]): Promise<ApiResponse<void>> {
    try {
      await api.put(`/users/${userId}/permissions`, { permissions });
      
      return {
        success: true,
        message: 'User permissions updated successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to update user permissions'
      };
    }
  }

  // Subscribe to users (for real-time updates compatibility)
  static subscribeToUsers(callback: (users: User[]) => void): () => void {
    // For now, just fetch users once
    this.getUsers().then(result => {
      if (result.success && result.data) {
        callback(result.data);
      }
    });

    // Return unsubscribe function
    return () => {
      // No-op for now
    };
  }
}