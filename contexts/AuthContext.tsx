"use client";
import { createContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { login, logout } from "@/services/auth.service";
import { User } from "@/utils/types";
import { toast } from "sonner";

export const AuthContext = createContext<
  | {
      user: User | null;
      isLoading: boolean;
      handleLogin: (
        email: string,
        password: string,
        remember?: boolean
      ) => Promise<void>;
      handleLogout: () => Promise<void>;
    }
  | undefined
>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  const handleLogin = async (
    email: string,
    password: string,
    remember: boolean = false
  ) => {
    setIsLoading(true);
    try {
      const { user } = await login(email, password, remember);
      setUser(user);
      localStorage.setItem("user", JSON.stringify(user));
      router.replace("/");
    } catch (error) {
      console.error(error instanceof Error ? error.message : error);
      toast.error("Hubo un problema al tratar de iniciar sesión.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    localStorage.removeItem("user");
    router.replace("/login");
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, handleLogin, handleLogout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
