"use client";

import { useCallback, createContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import {
  login as loginService,
  logout as logoutService,
} from "@/services/auth.service";
import { User } from "@/utils/types";

interface AuthContextProps {
  user: User | null;
  isLoading: boolean;
  handleLogin: (
    email: string,
    password: string,
    remember?: boolean
  ) => Promise<void>;
  handleLogout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextProps | undefined>(
  undefined
);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  const handleUnauthorized = useCallback((): void => {
    Cookies.remove("jwt-token");
    localStorage.removeItem("user");
    setUser(null);
    router.push("/login");
  }, [router]);

  useEffect(() => {
    const checkAuth = async () => {
      const token = Cookies.get("jwt-token");
      if (!token) {
        setIsLoading(false);
        handleUnauthorized();
        return;
      }
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const parsedUser: User = JSON.parse(storedUser);
          if (parsedUser.id && parsedUser.email) {
            const formattedUser = formatUserData(parsedUser);
            setUser(formattedUser);
          }
        } else {
          handleUnauthorized();
        }
      } catch (error) {
        console.error("Error checking auth:", error);
        handleUnauthorized();
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, [handleUnauthorized]);

  const handleLogin = async (
    email: string,
    password: string,
    remember: boolean = false
  ): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await loginService(email, password, remember);
      if (response.user) {
        const formattedUser = formatUserData(response.user);
        setUser(formattedUser);
        localStorage.setItem("user", JSON.stringify(formattedUser));
        router.push("/");
      }
    } catch (error) {
      console.error("Error en login:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async (): Promise<void> => {
    try {
      await logoutService();
    } catch (error) {
      console.error("Error en logout:", error);
    } finally {
      Cookies.remove("jwt-token");
      localStorage.removeItem("user");
      setUser(null);
      router.push("/login");
    }
  };

  function formatUserData(userData: User): User {
    return {
      id: userData?.id?.toString() || "",
      name: userData?.name || "Usuario sin nombre",
      email: userData?.email || "Sin correo",
      area: userData?.area || "",
      role: {
        id: userData?.role?.id ?? 0,
        name: userData?.role?.name || "user",
      },
      permissions: Array.isArray(userData.permissions)
        ? userData.permissions.map((p) => ({
            id: p?.id ?? 0,
            name: p?.name || "",
          }))
        : [],
      assignedProjects: userData?.assignedProjects ?? [],
    };
  }

  return (
    <AuthContext.Provider
      value={{ user, isLoading, handleLogin, handleLogout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
