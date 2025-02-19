"use client";

import Cookies from "js-cookie";
import { toast } from "sonner";

export interface LoginResponse {
  token: string;
  jwt_token: string;
  token_type: string;
  user: {
    id: string;
    name: string;
    email: string;
    proyecto?: string;
    role: {
      id: number;
      name: string;
    };
    permissions: Array<{
      id: number;
      name: string;
    }>;
    assignedProjects: string[];
  };
}

export const getAuthToken = () => {
  return Cookies.get("jwt-token");
};

export const fetchWithAuth = async (
  endpoint: string,
  options: RequestInit = {}
) => {
  const token = getAuthToken();
  if (!token) {
    handleSessionExpired();
    throw new Error("No token found");
  }

  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json", // Forzar respuesta JSON
    Authorization: `Bearer ${token}`,
    ...options.headers,
  };

  if (options.body && typeof options.body !== "string") {
    options.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`,
      {
        method: options.method || "GET",
        body: options.body,
        headers,
        credentials: "include",
      }
    );

    if (response.status === 401) {
      handleSessionExpired();
      throw new Error("No autorizado");
    }

    const data = await response.json();

    if (
      data.message?.toLowerCase().includes("token") &&
      data.message?.toLowerCase().includes("expired")
    ) {
      handleSessionExpired();
      throw new Error("Sesión expirada");
    }

    return data;
  } catch (error) {
    if (error instanceof Error && error.message.includes("expired")) {
      handleSessionExpired();
    }
    throw error;
  }
};

const handleSessionExpired = () => {
  Cookies.remove("jwt-token");
  Cookies.remove("lms_session");
  localStorage.removeItem("user");
  toast.error("Tu sesión ha expirado. Por favor, inicia sesión nuevamente.");

  // Usar replace en lugar de push para evitar que quede en el historial
  window.location.replace("/login");
};

export const logout = async (): Promise<void> => {
  try {
    const token = getAuthToken();
    if (!token) return;

    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });
  } catch (error) {
    console.error("Error en logout:", error);
  } finally {
    Cookies.remove("jwt-token");
    Cookies.remove("lms_session");
    localStorage.removeItem("user");
    window.location.replace("/login");
  }
};

export const login = async (
  email: string,
  password: string,
  remember: boolean = false
): Promise<LoginResponse> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, remember }),
      credentials: "include",
    });

    if (!response.ok) {
      toast.error(`Error: ${response.statusText}`);
      throw new Error("Error en la autenticación");
    }

    const data = await response.json();
    console.log("User data:", data);

    // Guardar tokens con expiración según remember
    if (data.jwt_token) {
      const options: Cookies.CookieAttributes = {
        secure: true,
        sameSite: "strict",
      };

      if (remember) {
        // Si remember está activo, el token durará 10 horas
        options.expires = 10 / 24; // 10 horas en días
      }

      Cookies.set("jwt-token", data.jwt_token, options);
    }
    return data;
  } catch (error) {
    console.error("Error en el login:", error);
    toast.error("Hubo un problema al tratar de iniciar sesión");
    throw Error;
  }
};

export const refreshToken = async (): Promise<void> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/refresh-token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAuthToken()}`,
        },
        credentials: "include",
      }
    );

    if (!response.ok) throw new Error("Error al renovar el token");

    const data = await response.json();
    if (data.token) Cookies.set("token", data.token);
    if (data.jwt_token) Cookies.set("jwt-token", data.jwt_token);
  } catch (error) {
    console.error("Error refreshing token:", error);
    throw error;
  }
};
