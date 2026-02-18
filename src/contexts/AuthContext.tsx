import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User } from "@/types";
import { authAPI } from "@/lib/api";

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
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 🔹 Load user on refresh using token
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await authAPI.getProfile(); // /auth/me
        setUser(res.user);
      } catch (err) {
        console.log("Token expired");
        localStorage.removeItem("token");
        setUser(null);
      }

      setIsLoading(false);
    };

    loadUser();
  }, []);

  // 🔹 UNIVERSAL LOGIN (seller/admin/user sab yahi se)
  const login = async (email: string, password: string) => {
    setIsLoading(true);

    try {
      const res = await authAPI.login(email, password);

      localStorage.setItem("token", res.token);
      setUser(res.user);

      return res; // ⭐ VERY IMPORTANT role check ke liye
    } catch (err) {
      console.error("Login failed", err);
      throw err;
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
      await authAPI.register(data);
      // register ke baad login nahi — user manually login kare
    } catch (err) {
      console.error("Register failed", err);
      throw err;
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
