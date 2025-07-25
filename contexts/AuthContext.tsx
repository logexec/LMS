/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { createContext, useEffect, useState } from "react";
import { User } from "@/types/user";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import api from "@/lib/api";

interface AuthContextProps {
  user: User | null;
  setUser: (user: User | null) => void;
  loading: boolean;
  login: (email: string, password: string, remember?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (permission: string | string[]) => boolean;
}

export const AuthContext = createContext<AuthContextProps | undefined>(
  undefined
);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  const hasPermission = (permission: string) => {
    if (!user) return false;
    const userPerms = user.permissions.map((p) => p.name);
    // Permiso implícito si es admin
    if (user.rol === "admin") return true;

    if (Array.isArray(permission)) {
      return permission.some((perm) => userPerms.includes(perm));
    }
  };

  const getUser = async () => {
    try {
      const res = await api.get("/user");
      setUser(res.user);
    } catch (err) {
      console.error(err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUser();
  }, []);

  const login = async (email: string, password: string, remember = false) => {
    setLoading(true);
    try {
      await api.post("/login", { email, password, remember });
      await getUser();
      toast.success("Bienvenido");
      router.push("/");
    } catch (error: any) {
      toast.error(error.message || "Credenciales incorrectas");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await api.post("/logout");
      setUser(null);
      router.push("/login");
    } catch (error) {
      console.error("Error al cerrar sesión: ", error);
      toast.error("Error al cerrar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, setUser, loading, login, logout, hasPermission }}
    >
      {children}
    </AuthContext.Provider>
  );
};
