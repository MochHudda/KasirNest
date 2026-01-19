import { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';

interface UserFormData {
  email: string;
  displayName: string;
  role: 'admin' | 'manager' | 'staff';
  isActive: boolean;
  password?: string;
}

interface UserFormProps {
  userId?: string;
  initialData?: UserFormData;
  onSave: (data: UserFormData) => void;
  onCancel: () => void;
}

export function UserForm({ userId, initialData, onSave, onCancel }: UserFormProps) {
  const [formData, setFormData] = useState<UserFormData>(
    initialData || {
      email: '',
      displayName: '',
      role: 'staff',
      isActive: true,
      password: '',
    }
  );

  const [errors, setErrors] = useState<Partial<UserFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = Boolean(userId);

  const validateForm = (): boolean => {
    const newErrors: Partial<UserFormData> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.displayName.trim()) {
      newErrors.displayName = 'Display name is required';
    }

    if (!isEditing && !formData.password) {
      newErrors.password = 'Password is required for new users';
    }

    if (!isEditing && formData.password && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Error saving user:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof UserFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {isEditing ? 'Edit User' : 'Add New User'}
        </h2>
        <p className="text-gray-600 mt-1">
          {isEditing 
            ? 'Update user information and permissions' 
            : 'Create a new user account for your store'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email */}
        <div>
          <Input
            label="Email Address"
            type="email"
            placeholder="user@example.com"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            error={errors.email}
            required
          />
        </div>

        {/* Display Name */}
        <div>
          <Input
            label="Display Name"
            placeholder="Full Name"
            value={formData.displayName}
            onChange={(e) => handleInputChange('displayName', e.target.value)}
            error={errors.displayName}
            required
          />
        </div>

        {/* Password (only for new users) */}
        {!isEditing && (
          <div>
            <Input
              label="Password"
              type="password"
              placeholder="Minimum 6 characters"
              value={formData.password || ''}
              onChange={(e) => handleInputChange('password', e.target.value)}
              error={errors.password}
              required
            />
          </div>
        )}

        {/* Role */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            User Role
          </label>
          <select
            value={formData.role}
            onChange={(e) => handleInputChange('role', e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="staff">Staff - Basic access to POS and inventory</option>
            <option value="manager">Manager - Full access except user management</option>
            <option value="admin">Admin - Full access to all features</option>
          </select>
        </div>

        {/* Active Status */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) => handleInputChange('isActive', e.target.checked)}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
            Active user (can login and access the system)
          </label>
        </div>

        {/* Form Actions */}
        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? 'Saving...' : (isEditing ? 'Update User' : 'Create User')}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}