import { useState } from 'react';
import { UserForm } from '../components/UserForm';
import { UserList } from '../components/UserList';
import { Button } from '../components/ui/Button';
import { User } from '../types';
import { Plus } from 'lucide-react';

export default function UsersPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setShowForm(true);
  };

  const handleSaveUser = (userData: any) => {
    console.log('User saved:', userData);
    setShowForm(false);
    setEditingUser(null);
    // TODO: Call userService to save/update user
    // Refresh user list
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      // TODO: Call userService.deleteUser
      console.log('Delete user:', userId);
    }
  };

  const handleToggleUserStatus = async (userId: string, isActive: boolean) => {
    // TODO: Call userService to activate/deactivate user
    console.log(`${isActive ? 'Activate' : 'Deactivate'} user:`, userId);
  };

  return (
    <div>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 lg:mb-8">
        <div>
          <h1 className="text-xl lg:text-2xl font-semibold text-gray-900 mb-2">User Management</h1>
          <p className="text-sm lg:text-base text-gray-600">Manage user accounts and permissions for your store.</p>
        </div>
        <Button onClick={() => setShowForm(true)} icon={Plus} className="self-start sm:self-auto">
          <span className="hidden sm:inline">Add New User</span>
          <span className="sm:hidden">Add User</span>
        </Button>
      </div>

      {showForm ? (
        <div className="mb-8">
          <UserForm
            userId={editingUser?.uid}
            initialData={editingUser ? {
              email: editingUser.email,
              displayName: editingUser.displayName || '',
              role: 'staff', // Default role
              isActive: true,
            } : undefined}
            onSave={handleSaveUser}
            onCancel={() => {
              setShowForm(false);
              setEditingUser(null);
            }}
          />
        </div>
      ) : (
        <UserList
          onEditUser={handleEditUser}
          onDeleteUser={handleDeleteUser}
          onToggleStatus={handleToggleUserStatus}
        />
      )}
    </div>
  );
}