import React, { createContext, useContext, useState, useEffect, useRef, ReactNode, useCallback } from 'react';
import { User, UserRole } from '@/types';
import { authAPI } from '@/lib/api';

type UserRoleType = 'user' | 'seller' | 'admin' | 'delivery';

interface RoleSession {
  user: User | null;
  token: string | null;
}

interface AuthContextType {
  // Role-specific sessions
  userSession: RoleSession;
  sellerSession: RoleSession;
  adminSession: RoleSession;
  deliverySession: RoleSession;
  
  // Helper getters
  user: User | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  currentRole: UserRoleType | null;
  
  // Actions
  login: (email: string, password: string, role?: UserRoleType) => Promise<any>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    phone: string;
    businessName?: string;
    address?: string;
  }) => Promise<void>;
  logout: (role?: UserRoleType) => void;
  logoutAll: () => void;
  updateUser: (user: Partial<User>, role?: UserRoleType) => void;
  
  // Check if specific role is logged in
  isRoleLoggedIn: (role: UserRoleType) => boolean;
  getRoleUser: (role: UserRoleType) => User | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Storage keys for each role
const STORAGE_KEYS = {
  user: { token: 'userToken', user: 'userData' },
  seller: { token: 'sellerToken', user: 'sellerData' },
  admin: { token: 'adminToken', user: 'adminData' },
  delivery: { token: 'deliveryToken', user: 'deliveryData' },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  // Initialize sessions from localStorage - SEPARATE FOR EACH ROLE
  const [userSession, setUserSession] = useState<RoleSession>(() => {
    try {
      const token = localStorage.getItem(STORAGE_KEYS.user.token);
      const user = localStorage.getItem(STORAGE_KEYS.user.user);
      return { token, user: user ? JSON.parse(user) : null };
    } catch { return { token: null, user: null }; }
  });

  const [sellerSession, setSellerSession] = useState<RoleSession>(() => {
    try {
      const token = localStorage.getItem(STORAGE_KEYS.seller.token);
      const user = localStorage.getItem(STORAGE_KEYS.seller.user);
      return { token, user: user ? JSON.parse(user) : null };
    } catch { return { token: null, user: null }; }
  });

  const [adminSession, setAdminSession] = useState<RoleSession>(() => {
    try {
      const token = localStorage.getItem(STORAGE_KEYS.admin.token);
      const user = localStorage.getItem(STORAGE_KEYS.admin.user);
      return { token, user: user ? JSON.parse(user) : null };
    } catch { return { token: null, user: null }; }
  });

  const [deliverySession, setDeliverySession] = useState<RoleSession>(() => {
    try {
      const token = localStorage.getItem(STORAGE_KEYS.delivery.token);
      const user = localStorage.getItem(STORAGE_KEYS.delivery.user);
      return { token, user: user ? JSON.parse(user) : null };
    } catch { return { token: null, user: null }; }
  });

  const [isLoading, setIsLoading] = useState(false);
  const initRef = useRef(false);

  const hydrateRoleFromStorage = useCallback((role: UserRoleType) => {
    try {
      const token = localStorage.getItem(STORAGE_KEYS[role].token);
      const raw = localStorage.getItem(STORAGE_KEYS[role].user);
      if (!token) {
        const empty = { token: null, user: null };
        if (role === 'user') setUserSession(empty);
        else if (role === 'seller') setSellerSession(empty);
        else if (role === 'admin') setAdminSession(empty);
        else if (role === 'delivery') setDeliverySession(empty);
        return;
      }
      const user = raw ? (JSON.parse(raw) as User) : null;
      const sess = { token, user };
      if (role === 'user') setUserSession(sess);
      else if (role === 'seller') setSellerSession(sess);
      else if (role === 'admin') setAdminSession(sess);
      else if (role === 'delivery') setDeliverySession(sess);
    } catch {
      /* ignore */
    }
  }, []);

  // 🔹 Load profiles on refresh for ALL roles with tokens (each request uses THAT role's JWT)
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const loadProfile = async (role: UserRoleType) => {
      const token = localStorage.getItem(STORAGE_KEYS[role].token);
      if (!token) return;

      try {
        const res: any = await authAPI.getProfileWithToken(token);
        const userData = res.user || res;
        localStorage.setItem(STORAGE_KEYS[role].user, JSON.stringify(userData));

        if (role === 'user') setUserSession({ token, user: userData });
        else if (role === 'seller') setSellerSession({ token, user: userData });
        else if (role === 'admin') setAdminSession({ token, user: userData });
        else if (role === 'delivery') setDeliverySession({ token, user: userData });
      } catch {
        localStorage.removeItem(STORAGE_KEYS[role].token);
        localStorage.removeItem(STORAGE_KEYS[role].user);
        if (role === 'user') setUserSession({ token: null, user: null });
        else if (role === 'seller') setSellerSession({ token: null, user: null });
        else if (role === 'admin') setAdminSession({ token: null, user: null });
        else if (role === 'delivery') setDeliverySession({ token: null, user: null });
      }
    };

    loadProfile('user');
    loadProfile('seller');
    loadProfile('admin');
    loadProfile('delivery');
  }, []);

  // When another tab updates localStorage, re-hydrate so open tabs reflect login/logout per role
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (!e.key) return;
      const entry = Object.entries(STORAGE_KEYS).find(([, v]) => v.token === e.key || v.user === e.key);
      if (!entry) return;
      const role = entry[0] as UserRoleType;
      hydrateRoleFromStorage(role);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [hydrateRoleFromStorage]);

  // 🔹 LOGIN - Separate tokens for each role
  const login = async (email: string, password: string, role: UserRoleType = 'user') => {
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

      // Store in role-specific keys
      localStorage.setItem(STORAGE_KEYS[role].token, response.token);
      localStorage.setItem(STORAGE_KEYS[role].user, JSON.stringify(response.user));

      // Update session state
      const newSession = { token: response.token, user: response.user };
      if (role === 'user') setUserSession(newSession);
      else if (role === 'seller') setSellerSession(newSession);
      else if (role === 'admin') setAdminSession(newSession);
      else if (role === 'delivery') setDeliverySession(newSession);

      return response;
    } finally {
      setIsLoading(false);
    }
  };

  // 🔹 REGISTER (only for users)
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
      localStorage.setItem(STORAGE_KEYS.user.token, response.token);
      localStorage.setItem(STORAGE_KEYS.user.user, JSON.stringify(response.user));
      setUserSession({ token: response.token, user: response.user });
    } finally {
      setIsLoading(false);
    }
  };

  // 🔹 LOGOUT - Only logout specific role
  const logout = (role?: UserRoleType) => {
    // Determine which role to logout based on URL if not specified
    let targetRole = role;
    if (!targetRole && typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path.startsWith('/admin')) targetRole = 'admin';
      else if (path.startsWith('/seller')) targetRole = 'seller';
      else if (path.startsWith('/delivery')) targetRole = 'delivery';
      else targetRole = 'user';
    }
    targetRole = targetRole || 'user';
    
    // Safety check - ensure targetRole is valid
    if (!STORAGE_KEYS[targetRole]) {
      console.error('Invalid role for logout:', targetRole);
      return;
    }
    
    localStorage.removeItem(STORAGE_KEYS[targetRole].token);
    localStorage.removeItem(STORAGE_KEYS[targetRole].user);
    
    if (targetRole === 'user') setUserSession({ token: null, user: null });
    else if (targetRole === 'seller') setSellerSession({ token: null, user: null });
    else if (targetRole === 'admin') setAdminSession({ token: null, user: null });
    else if (targetRole === 'delivery') setDeliverySession({ token: null, user: null });
  };

  // 🔹 LOGOUT ALL - Clear everything
  const logoutAll = () => {
    Object.values(STORAGE_KEYS).forEach(keys => {
      localStorage.removeItem(keys.token);
      localStorage.removeItem(keys.user);
    });
    setUserSession({ token: null, user: null });
    setSellerSession({ token: null, user: null });
    setAdminSession({ token: null, user: null });
    setDeliverySession({ token: null, user: null });
  };

  // 🔹 UPDATE USER for specific role
  const updateUser = (updates: Partial<User>, role?: UserRoleType) => {
    const targetRole = role || 'user';
    
    if (targetRole === 'user' && userSession.user) {
      const updated = { ...userSession.user, ...updates };
      localStorage.setItem(STORAGE_KEYS.user.user, JSON.stringify(updated));
      setUserSession({ ...userSession, user: updated });
    } else if (targetRole === 'seller' && sellerSession.user) {
      const updated = { ...sellerSession.user, ...updates };
      localStorage.setItem(STORAGE_KEYS.seller.user, JSON.stringify(updated));
      setSellerSession({ ...sellerSession, user: updated });
    } else if (targetRole === 'admin' && adminSession.user) {
      const updated = { ...adminSession.user, ...updates };
      localStorage.setItem(STORAGE_KEYS.admin.user, JSON.stringify(updated));
      setAdminSession({ ...adminSession, user: updated });
    } else if (targetRole === 'delivery' && deliverySession.user) {
      const updated = { ...deliverySession.user, ...updates };
      localStorage.setItem(STORAGE_KEYS.delivery.user, JSON.stringify(updated));
      setDeliverySession({ ...deliverySession, user: updated });
    }
  };

  // 🔹 Helper: Check if role is logged in
  const isRoleLoggedIn = (role: UserRoleType): boolean => {
    if (role === 'user') return !!userSession.token;
    if (role === 'seller') return !!sellerSession.token;
    if (role === 'admin') return !!adminSession.token;
    if (role === 'delivery') return !!deliverySession.token;
    return false;
  };

  // 🔹 Helper: Get user for specific role
  const getRoleUser = (role: UserRoleType): User | null => {
    if (role === 'user') return userSession.user;
    if (role === 'seller') return sellerSession.user;
    if (role === 'admin') return adminSession.user;
    if (role === 'delivery') return deliverySession.user;
    return null;
  };

  // Current user based on URL path
  const getCurrentRole = (): UserRoleType | null => {
    if (typeof window === 'undefined') return null;
    const path = window.location.pathname;
    if (path.startsWith('/admin')) return 'admin';
    if (path.startsWith('/delivery')) return 'delivery';
    if (path.startsWith('/seller')) {
      if (path === '/seller/login' || path === '/seller/register') return 'seller';
      const rest = path.replace(/^\/seller\/?/, '');
      const first = rest.split('/')[0] ?? '';
      if (/^[a-f\d]{24}$/i.test(first)) return 'user';
      return 'seller';
    }
    if (
      path === '/' ||
      path.startsWith('/home') ||
      path.startsWith('/cart') ||
      path.startsWith('/checkout') ||
      path.startsWith('/orders') ||
      path.startsWith('/login') ||
      path.startsWith('/register') ||
      path.startsWith('/wallet') ||
      path.startsWith('/wishlist') ||
      path.startsWith('/notifications') ||
      path.startsWith('/settings')
    )
      return 'user';
    return 'user';
  };

  const currentRole = getCurrentRole();
  const user = currentRole === 'user' ? userSession.user 
    : currentRole === 'seller' ? sellerSession.user 
    : currentRole === 'admin' ? adminSession.user 
    : currentRole === 'delivery' ? deliverySession.user
    : userSession.user;
  const isLoggedIn = !!user;

  return (
    <AuthContext.Provider
      value={{
        userSession,
        sellerSession,
        adminSession,
        deliverySession,
        user,
        isLoading,
        isLoggedIn,
        currentRole,
        login,
        register,
        logout,
        logoutAll,
        updateUser,
        isRoleLoggedIn,
        getRoleUser,
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
