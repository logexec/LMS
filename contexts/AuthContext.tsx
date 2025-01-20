"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import {
  login as loginService,
  logout as logoutService,
} from "@/services/auth.service";

interface Permission {
  id: number;
  name: string;
}

interface Role {
  id: number;
  name: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  proyecto?: string;
  area?: string;
  role: Role;
  permissions: Permission[];
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  hasPermission: (permission: string | string[]) => boolean;
  hasRole: (role: string | string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function formatUserData(userData: any): User {
  // Asegurarse de que role tenga la estructura correcta
  const role: Role = {
    id: typeof userData.role === "object" ? userData.role.id : 0,
    name:
      typeof userData.role === "object"
        ? userData.role.name
        : userData.role || "user",
  };

  // Asegurarse de que permissions tenga la estructura correcta
  let permissions: Permission[] = [];
  if (Array.isArray(userData.permissions)) {
    permissions = userData.permissions.map(
      (p: Permission | string | { id?: number; name?: string }) => {
        if (typeof p === "object" && "id" in p && "name" in p) {
          return { id: p.id || 0, name: p.name || "" };
        }
        return { id: 0, name: typeof p === "string" ? p : String(p) };
      }
    );
  } else if (Array.isArray(userData.permisos)) {
    permissions = userData.permisos.map((p: string) => ({ id: 0, name: p }));
  }

  return {
    id: userData.id.toString(),
    name: userData.name,
    email: userData.email,
    proyecto: userData.proyecto,
    area: userData.area,
    role,
    permissions,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
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
          const parsedUser = JSON.parse(storedUser);
          const formattedUser = formatUserData(parsedUser);
          setUser(formattedUser);
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
      const formattedUser = formatUserData(response.user);
      setUser(formattedUser);
      localStorage.setItem("user", JSON.stringify(formattedUser));
      router.push("/");
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
    if (!user?.permissions) return false;

    const userPermissions = user.permissions.map((p) => p.name);

    if (Array.isArray(permission)) {
      return permission.some((p) => userPermissions.includes(p));
    }
    return userPermissions.includes(permission);
  };

  const hasRole = (role: string | string[]): boolean => {
    if (!user?.role) return false;

    if (Array.isArray(role)) {
      return role.includes(user.role.name);
    }
    return user.role.name === role;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login: handleLogin,
        logout: handleLogout,
        isLoading,
        hasPermission,
        hasRole,
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
