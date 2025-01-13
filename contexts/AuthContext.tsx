// src/contexts/AuthContext.tsx
"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  JSX,
} from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import {
  login as loginService,
  logout as logoutService,
} from "@/services/auth.service";

interface User {
  id: string;
  name: string;
  email: string;
  proyecto: string;
  area: string;
  permisos: string[];
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  hasPermission: (permission: string | string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = Cookies.get("jwt_token");
      if (!token) {
        setIsLoading(false);
        router.push("/login");
        return;
      }

      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        } else {
          router.push("/login");
        }
      } catch (error) {
        console.error("Error checking auth:", error);
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await loginService({ email, password });
      setUser(response.user);
      router.push("/"); // o a donde quieras redirigir después del login
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await logoutService();
      setUser(null);
      Cookies.remove("jwt_token");
      Cookies.remove("access_token");
      localStorage.removeItem("user");
      router.push("/login");
    } finally {
      setIsLoading(false);
    }
  };

  const hasPermission = (permission: string | string[]): boolean => {
    if (!user?.permisos) return false;

    if (Array.isArray(permission)) {
      return permission.some((p) => user.permisos.includes(p));
    }
    return user.permisos.includes(permission);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login: handleLogin,
        logout: handleLogout,
        isLoading,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
