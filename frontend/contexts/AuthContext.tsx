/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { createContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  login as loginService,
  logout as logoutService,
} from "@/services/auth.service";
import { User } from "@/utils/types";
import { toast } from "sonner";
import api from "@/services/axios";

interface AuthContextProps {
  user: User | null;
  isLoading: boolean;
  handleLogin: (email: string, pwd: string) => Promise<void>;
  handleLogout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextProps | undefined>(
  undefined
);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Trae /user al iniciar o tras limpiar localStorage
  const fetchUser = async () => {
    try {
      const { data } = await api.get<{ user: User }>("/user");
      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
    } catch (error: any) {
      // Si no fue 401 (el 401 ya lo maneja el interceptor), mostramos error genérico
      if (error.response?.status !== 401) {
        toast.error("Error cargando datos de usuario");
      }
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored && stored !== "undefined" && stored !== "null") {
      try {
        setUser(JSON.parse(stored));
        setIsLoading(false);
        return;
      } catch {
        localStorage.removeItem("user");
      }
    }
    fetchUser();
  }, []);

  const handleLogin = async (email: string, pwd: string) => {
    setIsLoading(true);
    try {
      const data = await loginService(email, pwd);
      setUser(data.user);
      router.replace("/");
    } catch {
      toast.error("No se pudo iniciar sesión");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logoutService();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, handleLogin, handleLogout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
