import { useState } from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { LogIn, User, Lock } from 'lucide-react';

interface LoginPageProps {
  onLogin: () => void;
}

// Hardcoded credentials for now
const ADMIN_USERNAME = 'AdminUser';
const ADMIN_PASSWORD = 'SuperAdmin';

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simulate loading delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      // Check hardcoded credentials
      if (username.trim() === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        // Store login state in localStorage
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('currentUser', JSON.stringify({
          username: ADMIN_USERNAME,
          role: 'admin',
          loginTime: new Date().toISOString()
        }));
        onLogin();
      } else {
        setError('Invalid username or password. Please try again.');
      }
    } catch (err: any) {
      setError('Login failed. Please try again.');
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
            <span className="text-white text-2xl font-bold">A</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">ApparelPos</h1>
          <p className="text-gray-600">Basic Apparel for the Whole Family</p>
        </div>

        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4 mr-2" />
                    Username
                  </label>
                  <Input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    required
                  />
                </div>

                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <Lock className="w-4 h-4 mr-2" />
                    Password
                  </label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                loading={loading}
                icon={LogIn}
              >
                Sign In
              </Button>
            </form>

            <div className="mt-6 text-center">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                <p className="text-xs text-blue-700 font-medium">Demo Credentials:</p>
                <p className="text-xs text-blue-600">Username: AdminUser</p>
                <p className="text-xs text-blue-600">Password: SuperAdmin</p>
              </div>
              <p className="text-sm text-gray-600">
                Contact your administrator for access credentials
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            © 2025 ApparelPos. Basic Apparel for the Whole Family.
          </p>
        </div>
      </div>
    </div>
  );
}