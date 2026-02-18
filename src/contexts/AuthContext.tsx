import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { User, UserRole } from '@/types';
import { authAPI } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, role?: 'customer' | 'seller' | 'admin') => Promise<void>;
  register: (data: { name: string; email: string; password: string; phone: string }) => Promise<void>;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const [isLoading, setIsLoading] = useState(false);
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    // Token exists but no user → try to restore (non-blocking)
    const token = localStorage.getItem('token');
    if (token && !user) {
      authAPI.getProfile()
        .then((res: any) => {
          const u = res.user || res;
          setUser(u);
          localStorage.setItem('user', JSON.stringify(u));
        })
        .catch(() => {
          // Do NOT logout on single failed auth/me — token may still be valid
          // Only clear if 401 explicitly
        });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const login = async (email: string, password: string, role: 'customer' | 'seller' | 'admin' = 'customer') => {
    setIsLoading(true);
    try {
      let response: any;
      if (role === 'seller') {
        response = await authAPI.sellerLogin(email, password);
      } else if (role === 'admin') {
        response = await authAPI.adminLogin(email, password);
      } else {
        response = await authAPI.login(email, password);
      }
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      setUser(response.user);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: { name: string; email: string; password: string; phone: string }) => {
    setIsLoading(true);
    try {
      const response: any = await authAPI.register(data);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      setUser(response.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
