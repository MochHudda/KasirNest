import { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Edit2, Trash2, UserCheck, UserX, Mail, Shield, Calendar } from 'lucide-react';
import { User } from '../../types';

interface ExtendedUser extends User {
  role: 'admin' | 'manager' | 'staff';
  isActive: boolean;
  lastActive?: Date;
}

interface UserListProps {
  onEditUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
  onToggleStatus: (userId: string, isActive: boolean) => void;
}

export function UserList({ onEditUser, onDeleteUser, onToggleStatus }: UserListProps) {
  const [users, setUsers] = useState<ExtendedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Mock data - replace with actual API call
  useEffect(() => {
    const mockUsers: ExtendedUser[] = [
      {
        uid: '1',
        email: 'admin@kasir.com',
        displayName: 'System Admin',
        emailVerified: true,
        createdAt: new Date('2024-01-15'),
        lastLoginAt: new Date('2024-12-29'),
        role: 'admin',
        isActive: true,
        lastActive: new Date('2024-12-29'),
      },
      {
        uid: '2',
        email: 'manager@kasir.com',
        displayName: 'Store Manager',
        emailVerified: true,
        createdAt: new Date('2024-02-01'),
        lastLoginAt: new Date('2024-12-28'),
        role: 'manager',
        isActive: true,
        lastActive: new Date('2024-12-28'),
      },
      {
        uid: '3',
        email: 'staff1@kasir.com',
        displayName: 'Kasir Utama',
        emailVerified: true,
        createdAt: new Date('2024-03-10'),
        lastLoginAt: new Date('2024-12-25'),
        role: 'staff',
        isActive: true,
        lastActive: new Date('2024-12-25'),
      },
      {
        uid: '4',
        email: 'staff2@kasir.com',
        displayName: 'Kasir Shift 2',
        emailVerified: false,
        createdAt: new Date('2024-11-01'),
        lastLoginAt: new Date('2024-12-20'),
        role: 'staff',
        isActive: false,
        lastActive: new Date('2024-12-20'),
      },
    ];

    // Simulate API call delay
    setTimeout(() => {
      setUsers(mockUsers);
      setLoading(false);
    }, 500);
  }, []);

  const filteredUsers = users.filter(user => {
    if (filter === 'active') return user.isActive;
    if (filter === 'inactive') return !user.isActive;
    return true;
  });

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'manager': return 'bg-blue-100 text-blue-800';
      case 'staff': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            filter === 'all'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          All Users ({users.length})
        </button>
        <button
          onClick={() => setFilter('active')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            filter === 'active'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Active ({users.filter(u => u.isActive).length})
        </button>
        <button
          onClick={() => setFilter('inactive')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            filter === 'inactive'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Inactive ({users.filter(u => !u.isActive).length})
        </button>
      </div>

      {/* Users List */}
      <Card>
        <div className="divide-y divide-gray-200">
          {filteredUsers.map((user) => (
            <div key={user.uid} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 font-semibold text-lg">
                      {(user.displayName || user.email)[0].toUpperCase()}
                    </span>
                  </div>

                  {/* User Info */}
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-gray-900">
                        {user.displayName || 'No Name'}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}
                      >
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                      {user.isActive ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                          <UserCheck className="w-3 h-3" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                          <UserX className="w-3 h-3" />
                          Inactive
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        {user.email}
                      </div>
                      {!user.emailVerified && (
                        <span className="text-amber-600 text-xs">Email not verified</span>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Last active: {formatRelativeTime(user.lastActive || user.lastLoginAt || new Date())}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onEditUser(user)}
                    icon={Edit2}
                  >
                    Edit
                  </Button>
                  
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onToggleStatus(user.uid, !user.isActive)}
                    icon={user.isActive ? UserX : UserCheck}
                  >
                    {user.isActive ? 'Deactivate' : 'Activate'}
                  </Button>

                  {user.role !== 'admin' && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onDeleteUser(user.uid)}
                      icon={Trash2}
                    >
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {filteredUsers.length === 0 && (
            <div className="p-8 text-center">
              <Shield className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No users found</h3>
              <p className="text-gray-500">
                {filter === 'all' 
                  ? 'No users have been created yet.'
                  : `No ${filter} users found.`
                }
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}