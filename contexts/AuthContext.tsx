"use client";

import { useCallback, createContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import {
  login as loginService,
  logout as logoutService,
} from "@/services/auth.service";
import { User } from "@/utils/types";
import { toast } from "sonner";

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

interface RawAssignedProjectsObject {
  id: number;
  user_id: number;
  projects: string[];
}

type RawAssignedProjects = RawAssignedProjectsObject | string[];

// Define la interfaz para los datos crudos del usuario
interface RawUser {
  id: number | string;
  name?: string;
  email?: string;
  area?: string;
  role?: {
    id: number;
    name: string;
  };
  permissions?: {
    id: number;
    name: string;
  }[];
  assignedProjects?: RawAssignedProjects;
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
        router.replace("/");
      }
    } catch (error) {
      toast.error("Hubo un problema al tratar de iniciar sesión.");
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
      router.replace("/login");
    }
  };

  function formatUserData(userData: RawUser): User {
    let formattedAssignedProjects: {
      id: number;
      user_id: number;
      projects: string[];
    } = {
      id: 0,
      user_id: 0,
      projects: [],
    };

    // Si assignedProjects es un arreglo de strings, lo transformamos en objeto
    if (Array.isArray(userData.assignedProjects)) {
      formattedAssignedProjects = {
        id: 0,
        user_id: 0,
        projects: userData.assignedProjects,
      };
    }
    // Si es un objeto, extraemos sus propiedades
    else if (
      userData.assignedProjects &&
      typeof userData.assignedProjects === "object"
    ) {
      formattedAssignedProjects = {
        id: userData.assignedProjects.id ?? 0,
        user_id: userData.assignedProjects.user_id ?? 0,
        projects: Array.isArray(userData.assignedProjects.projects)
          ? userData.assignedProjects.projects
          : [],
      };
    }

    return {
      id: userData.id.toString(),
      name: userData.name || "Usuario sin nombre",
      email: userData.email || "No hay un correo asignado",
      area: userData.area || "Sin área especificada",
      role: {
        id: userData.role?.id ?? 0,
        name: userData.role?.name || "user",
      },
      permissions: userData.permissions
        ? userData.permissions.map((p) => ({
            id: p.id,
            name: p.name,
          }))
        : [],
      assignedProjects: formattedAssignedProjects,
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
