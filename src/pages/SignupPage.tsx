import { useState } from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { UserPlus, User, Lock, Mail, Phone, ArrowLeft, Eye, EyeOff } from 'lucide-react';

interface SignupPageProps {
  onSignup: () => void;
  onBackToLogin: () => void;
}

interface FormData {
  fullName: string;
  username: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  fullName?: string;
  username?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

export default function SignupPage({ onSignup, onBackToLogin }: SignupPageProps) {
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Validation functions
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,9}$/;
    return phoneRegex.test(phone.replace(/\s+/g, ''));
  };

  const validatePassword = (password: string): boolean => {
    return password.length >= 6;
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Full name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Nama lengkap harus diisi';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Nama lengkap minimal 2 karakter';
    }

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = 'Username harus diisi';
    } else if (formData.username.trim().length < 3) {
      newErrors.username = 'Username minimal 3 karakter';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username hanya boleh huruf, angka, dan underscore';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email harus diisi';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }

    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = 'Nomor telepon harus diisi';
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Format nomor telepon tidak valid (gunakan format Indonesia)';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password harus diisi';
    } else if (!validatePassword(formData.password)) {
      newErrors.password = 'Password minimal 6 karakter';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Konfirmasi password harus diisi';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Password tidak sama';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Check if username already exists (mock check)
      const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const usernameExists = existingUsers.some((user: any) => user.username === formData.username);
      const emailExists = existingUsers.some((user: any) => user.email === formData.email);

      if (usernameExists) {
        setErrors({ username: 'Username sudah terdaftar' });
        return;
      }

      if (emailExists) {
        setErrors({ email: 'Email sudah terdaftar' });
        return;
      }

      // Save user data
      const newUser = {
        id: Date.now().toString(),
        fullName: formData.fullName.trim(),
        username: formData.username.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        role: 'staff',
        createdAt: new Date().toISOString(),
        isActive: true
      };

      existingUsers.push(newUser);
      localStorage.setItem('registeredUsers', JSON.stringify(existingUsers));

      // Auto login the new user
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('currentUser', JSON.stringify({
        ...newUser,
        loginTime: new Date().toISOString()
      }));

      onSignup();
    } catch (error) {
      setErrors({ general: 'Terjadi kesalahan. Silakan coba lagi.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Brand */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-bold">K</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">KasirNest</h1>
          <p className="text-gray-600">Daftar Akun Baru</p>
        </div>

        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSignup} className="space-y-4">
              {/* Back to Login Button */}
              <div className="mb-6">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  icon={ArrowLeft}
                  onClick={onBackToLogin}
                  className="text-gray-600 hover:text-gray-800"
                >
                  Kembali ke Login
                </Button>
              </div>

              {errors.general && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{errors.general}</p>
                </div>
              )}

              <div className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4 mr-2" />
                    Nama Lengkap
                  </label>
                  <Input
                    type="text"
                    value={formData.fullName}
                    onChange={handleInputChange('fullName')}
                    placeholder="Masukkan nama lengkap"
                    className={errors.fullName ? 'border-red-300 focus:border-red-500' : ''}
                  />
                  {errors.fullName && (
                    <p className="mt-1 text-xs text-red-600">{errors.fullName}</p>
                  )}
                </div>

                {/* Username */}
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4 mr-2" />
                    Username
                  </label>
                  <Input
                    type="text"
                    value={formData.username}
                    onChange={handleInputChange('username')}
                    placeholder="Masukkan username"
                    className={errors.username ? 'border-red-300 focus:border-red-500' : ''}
                  />
                  {errors.username && (
                    <p className="mt-1 text-xs text-red-600">{errors.username}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <Mail className="w-4 h-4 mr-2" />
                    Email
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange('email')}
                    placeholder="Masukkan alamat email"
                    className={errors.email ? 'border-red-300 focus:border-red-500' : ''}
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <Phone className="w-4 h-4 mr-2" />
                    Nomor Telepon
                  </label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange('phone')}
                    placeholder="Contoh: 08123456789"
                    className={errors.phone ? 'border-red-300 focus:border-red-500' : ''}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-xs text-red-600">{errors.phone}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <Lock className="w-4 h-4 mr-2" />
                    Password
                  </label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleInputChange('password')}
                      placeholder="Masukkan password (minimal 6 karakter)"
                      className={`pr-10 ${errors.password ? 'border-red-300 focus:border-red-500' : ''}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-xs text-red-600">{errors.password}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <Lock className="w-4 h-4 mr-2" />
                    Konfirmasi Password
                  </label>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={handleInputChange('confirmPassword')}
                      placeholder="Ulangi password"
                      className={`pr-10 ${errors.confirmPassword ? 'border-red-300 focus:border-red-500' : ''}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full"
                  loading={loading}
                  icon={UserPlus}
                  disabled={loading}
                >
                  {loading ? 'Mendaftarkan Akun...' : 'Daftar Sekarang'}
                </Button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                <p className="text-xs text-blue-700 font-medium">Tips Keamanan:</p>
                <p className="text-xs text-blue-600">• Gunakan password yang kuat</p>
                <p className="text-xs text-blue-600">• Pastikan email yang digunakan aktif</p>
                <p className="text-xs text-blue-600">• Username tidak dapat diubah setelah dibuat</p>
              </div>
              
              <p className="text-sm text-gray-600">
                Sudah punya akun?{' '}
                <button
                  type="button"
                  onClick={onBackToLogin}
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  Login di sini
                </button>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            © 2025 KasirNest. Sistem Kasir Modern untuk Bisnis Anda.
          </p>
        </div>
      </div>
    </div>
  );
}