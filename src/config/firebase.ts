// API Configuration for MySQL Backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const api = {
  baseURL: API_BASE_URL,
  
  // Helper function to make authenticated requests
  request: async (endpoint: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('auth_token');
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP Error: ${response.status}`);
    }

    return response.json();
  },

  // HTTP Methods
  get: (endpoint: string, options?: RequestInit) => 
    api.request(endpoint, { method: 'GET', ...options }),
    
  post: (endpoint: string, data?: any, options?: RequestInit) =>
    api.request(endpoint, { 
      method: 'POST', 
      body: JSON.stringify(data), 
      ...options 
    }),
    
  put: (endpoint: string, data?: any, options?: RequestInit) =>
    api.request(endpoint, { 
      method: 'PUT', 
      body: JSON.stringify(data), 
      ...options 
    }),
    
  delete: (endpoint: string, options?: RequestInit) =>
    api.request(endpoint, { method: 'DELETE', ...options }),
};

// Auth utilities
export const auth = {
  getToken: () => localStorage.getItem('auth_token'),
  setToken: (token: string) => localStorage.setItem('auth_token', token),
  removeToken: () => localStorage.removeItem('auth_token'),
  isAuthenticated: () => !!localStorage.getItem('auth_token'),
  
  getCurrentUser: () => {
    const userStr = localStorage.getItem('current_user');
    return userStr ? JSON.parse(userStr) : null;
  },
  
  setCurrentUser: (user: any) => {
    localStorage.setItem('current_user', JSON.stringify(user));
  },
  
  removeCurrentUser: () => {
    localStorage.removeItem('current_user');
  }
};

export default { api, auth };