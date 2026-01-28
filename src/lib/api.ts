// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Mock delay for simulating API calls
const mockDelay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Generic API request helper
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('token');
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || 'Request failed');
  }

  return response.json();
}

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    await mockDelay();
    // Mock response - replace with actual API call
    return {
      token: 'mock-jwt-token',
      user: {
        _id: '1',
        name: 'John Doe',
        email,
        phone: '+91 9876543210',
        role: 'customer' as const,
        wallet: 500,
        referralCode: 'JOHN123',
        isVerified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };
  },
  
  register: async (data: { name: string; email: string; password: string; phone: string }) => {
    await mockDelay();
    return {
      token: 'mock-jwt-token',
      user: {
        _id: '1',
        name: data.name,
        email: data.email,
        phone: data.phone,
        role: 'customer' as const,
        wallet: 0,
        referralCode: 'USER' + Math.random().toString(36).substring(7).toUpperCase(),
        isVerified: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };
  },
  
  sellerLogin: async (email: string, password: string) => {
    await mockDelay();
    return {
      token: 'mock-seller-jwt-token',
      user: {
        _id: '2',
        name: 'Priya Kitchen',
        email,
        phone: '+91 9876543211',
        role: 'seller' as const,
        wallet: 15000,
        referralCode: 'PRIYA123',
        isVerified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };
  },
  
  adminLogin: async (email: string, password: string) => {
    await mockDelay();
    return {
      token: 'mock-admin-jwt-token',
      user: {
        _id: '3',
        name: 'Admin User',
        email,
        phone: '+91 9876543212',
        role: 'admin' as const,
        wallet: 0,
        referralCode: 'ADMIN123',
        isVerified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };
  },
};

// Export mock delay for use in other mock APIs
export { mockDelay, apiRequest, API_BASE_URL };
