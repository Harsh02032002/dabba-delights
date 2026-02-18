import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { User, UserRole } from '@/types';
import { authAPI } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<any>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    phone: string;
    businessName?: string;
    address?: string;
  }) => Promise<void>;
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

  // 🔹 Load user on refresh using token
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

  // 🔹 UNIVERSAL LOGIN (seller/admin/user sab yahi se)
  const login = async (email: string, password: string) => {
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

  // 🔹 REGISTER
  const register = async (data: {
    name: string;
    email: string;
    password: string;
    phone: string;
    businessName?: string;
    address?: string;
  }) => {
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

  // 🔹 LOGOUT
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  // 🔹 UPDATE USER
  const updateUser = (updates: Partial<User>) => {
    if (user) setUser({ ...user, ...updates });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isLoggedIn: !!user,
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

// hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
