import { api, auth } from '../config/firebase';
import { User } from '../types';

export class AuthService {
  // Sign up new user
  static async signUp(email: string, password: string, displayName?: string, username?: string): Promise<{ user: User; token: string }> {
    try {
      const response = await api.post('/auth/register', {
        username: username || email.split('@')[0],
        email,
        password,
        displayName
      });

      if (response.success) {
        // Store token and user data
        auth.setToken(response.data.token);
        auth.setCurrentUser(response.data.user);
        
        return {
          user: response.data.user,
          token: response.data.token
        };
      }

      throw new Error('Registration failed');
    } catch (error: any) {
      throw new Error(error.message || 'Registration failed');
    }
  }

  // Sign in user
  static async signIn(email: string, password: string): Promise<{ user: User; token: string; store?: any }> {
    try {
      const response = await api.post('/auth/login', {
        email,
        password
      });

      if (response.success) {
        // Store token and user data
        auth.setToken(response.data.token);
        auth.setCurrentUser(response.data.user);
        
        return {
          user: response.data.user,
          token: response.data.token,
          store: response.data.store
        };
      }

      throw new Error('Login failed');
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    }
  }

  // Get current user
  static async getCurrentUser(): Promise<User | null> {
    try {
      if (!auth.isAuthenticated()) {
        return null;
      }

      const response = await api.get('/auth/me');
      
      if (response.success) {
        const user = response.data;
        auth.setCurrentUser(user);
        return user;
      }

      return null;
    } catch (error) {
      console.error('Get current user error:', error);
      // Clear invalid token
      this.signOut();
      return null;
    }
  }

  // Sign out user
  static async signOut(): Promise<void> {
    try {
      // Call logout endpoint (optional)
      if (auth.isAuthenticated()) {
        await api.post('/auth/logout');
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage
      auth.removeToken();
      auth.removeCurrentUser();
    }
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    return auth.isAuthenticated();
  }

  // Listen for auth state changes (for compatibility with existing code)
  static onAuthStateChanged(callback: (user: User | null) => void): () => void {
    // For initial state
    const currentUser = auth.getCurrentUser();
    callback(currentUser);

    // Return unsubscribe function
    return () => {
      // No-op for now, as we don't have real-time auth state
    };
  }

  // Update user profile
  static async updateProfile(displayName?: string, photoURL?: string): Promise<User> {
    try {
      if (!auth.isAuthenticated()) {
        throw new Error('User not authenticated');
      }

      const response = await api.put('/auth/profile', {
        displayName,
        photoURL
      });

      if (response.success) {
        const updatedUser = response.data;
        auth.setCurrentUser(updatedUser);
        return updatedUser;
      }

      throw new Error('Profile update failed');
    } catch (error: any) {
      throw new Error(error.message || 'Profile update failed');
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
  static onAuthStateChange(callback: (user: FirebaseUser | null) => void): () => void {
    return onAuthStateChanged(auth, callback);
  }

  // Get user data from Firestore
  static async getUserData(uid: string): Promise<User | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        return userDoc.data() as User;
      }
      return null;
    } catch (error: any) {
      console.error('Error getting user data:', error);
      return null;
    }
  }
}