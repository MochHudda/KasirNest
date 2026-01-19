import { 
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  collection, 
  query, 
  orderBy, 
  serverTimestamp,
  where
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';

export interface UserData {
  uid: string;
  email: string;
  displayName: string;
  role: 'admin' | 'manager' | 'staff';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  storeId?: string;
}

export interface CreateUserData {
  email: string;
  password: string;
  displayName: string;
  role: 'admin' | 'manager' | 'staff';
  isActive?: boolean;
  storeId?: string;
}

export interface UpdateUserData {
  displayName?: string;
  role?: 'admin' | 'manager' | 'staff';
  isActive?: boolean;
}

class UserService {
  private readonly COLLECTION_NAME = 'users';

  /**
   * Create a new user with email and password
   */
  async createUser(userData: CreateUserData): Promise<UserData> {
    try {
      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userData.email,
        userData.password
      );
      
      const user = userCredential.user;

      // Update display name in Firebase Auth
      await updateProfile(user, {
        displayName: userData.displayName
      });

      // Send email verification
      await sendEmailVerification(user);

      // Create user document in Firestore
      const userDocData: UserData = {
        uid: user.uid,
        email: userData.email,
        displayName: userData.displayName,
        role: userData.role,
        isActive: userData.isActive ?? true,
        createdAt: new Date(),
        updatedAt: new Date(),
        storeId: userData.storeId
      };

      await setDoc(doc(db, this.COLLECTION_NAME, user.uid), {
        ...userDocData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      return userDocData;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Get all users for the current store
   */
  async getUsers(storeId?: string): Promise<UserData[]> {
    try {
      let q = query(
        collection(db, this.COLLECTION_NAME),
        orderBy('createdAt', 'desc')
      );

      if (storeId) {
        q = query(
          collection(db, this.COLLECTION_NAME),
          where('storeId', '==', storeId),
          orderBy('createdAt', 'desc')
        );
      }

      const querySnapshot = await getDocs(q);
      const users: UserData[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        users.push({
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          lastLoginAt: data.lastLoginAt?.toDate()
        } as UserData);
      });

      return users;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  /**
   * Get a specific user by ID
   */
  async getUser(userId: string): Promise<UserData | null> {
    try {
      const userDoc = await getDoc(doc(db, this.COLLECTION_NAME, userId));
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        return {
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          lastLoginAt: data.lastLoginAt?.toDate()
        } as UserData;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  /**
   * Update user information
   */
  async updateUser(userId: string, updateData: UpdateUserData): Promise<void> {
    try {
      const userDocRef = doc(db, this.COLLECTION_NAME, userId);
      
      await updateDoc(userDocRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });

      // If display name is being updated, also update Firebase Auth profile
      if (updateData.displayName && auth.currentUser?.uid === userId) {
        await updateProfile(auth.currentUser, {
          displayName: updateData.displayName
        });
      }
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  /**
   * Toggle user active status
   */
  async toggleUserStatus(userId: string, isActive: boolean): Promise<void> {
    try {
      await this.updateUser(userId, { isActive });
    } catch (error) {
      console.error('Error toggling user status:', error);
      throw error;
    }
  }

  /**
   * Delete a user (soft delete by deactivating)
   */
  async deleteUser(userId: string, hardDelete: boolean = false): Promise<void> {
    try {
      if (hardDelete) {
        // Delete from Firestore
        await deleteDoc(doc(db, this.COLLECTION_NAME, userId));
        
        // Note: Deleting from Firebase Auth requires admin SDK
        // In a real application, this should be done via a cloud function
        console.warn('Hard delete from Firebase Auth requires admin privileges');
      } else {
        // Soft delete - just deactivate the user
        await this.updateUser(userId, { isActive: false });
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  /**
   * Update last login time
   */
  async updateLastLogin(userId: string): Promise<void> {
    try {
      const userDocRef = doc(db, this.COLLECTION_NAME, userId);
      await updateDoc(userDocRef, {
        lastLoginAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating last login:', error);
      throw error;
    }
  }

  /**
   * Get users by role
   */
  async getUsersByRole(role: 'admin' | 'manager' | 'staff', storeId?: string): Promise<UserData[]> {
    try {
      let q = query(
        collection(db, this.COLLECTION_NAME),
        where('role', '==', role),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc')
      );

      if (storeId) {
        q = query(
          collection(db, this.COLLECTION_NAME),
          where('role', '==', role),
          where('isActive', '==', true),
          where('storeId', '==', storeId),
          orderBy('createdAt', 'desc')
        );
      }

      const querySnapshot = await getDocs(q);
      const users: UserData[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        users.push({
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          lastLoginAt: data.lastLoginAt?.toDate()
        } as UserData);
      });

      return users;
    } catch (error) {
      console.error('Error fetching users by role:', error);
      throw error;
    }
  }

  /**
   * Check if current user has permission to perform action
   */
  async hasPermission(
    currentUserId: string, 
    action: 'create' | 'read' | 'update' | 'delete',
    targetUserId?: string
  ): Promise<boolean> {
    try {
      const currentUser = await this.getUser(currentUserId);
      if (!currentUser || !currentUser.isActive) return false;

      // Admin can do everything
      if (currentUser.role === 'admin') return true;

      // Manager can manage staff but not other managers/admins
      if (currentUser.role === 'manager') {
        if (action === 'read') return true;
        
        if (targetUserId) {
          const targetUser = await this.getUser(targetUserId);
          return targetUser?.role === 'staff';
        }
        
        return action === 'create'; // Can create staff accounts
      }

      // Staff can only read
      return action === 'read';
    } catch (error) {
      console.error('Error checking permissions:', error);
      return false;
    }
  }
}

export const userService = new UserService();