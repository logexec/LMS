"use client";

import Cookies from "js-cookie";

export interface LoginResponse {
  token: string;
  jwt_token: string;
  token_type: string;
  user: {
    id: string;
    name: string;
    email: string;
    proyecto: string;
    role: string | number;
    permissions: string[];
  };
}

export interface UserCredentials {
  email: string;
  password: string;
}

export const login = async (email: string, password: string) => {
  try {
    const response = await fetch("http://localhost:8000/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
      credentials: "include", // Importante para enviar cookies
    });

    const text = await response.text();

    if (response.ok) {
      const data = JSON.parse(text);
      return data;
    } else {
      throw new Error("Error en la autenticación");
    }
  } catch (error) {
    console.error("Error en el login:", error);
    throw error;
  }
};

export const getAuthToken = () => {
  return Cookies.get("jwt-token");
};

export const fetchWithAuth = async (
  endpoint: string,
  options: RequestInit = {}
) => {
  const token = getAuthToken();

  const headers = {
    ...options.headers,
    Authorization: `Bearer ${token}`,
  };

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`,
    {
      ...options,
      headers,
    }
  );

  if (response.status === 401) {
    throw new Error("No autorizado");
  }

  return response.json();
};

export async function logout(): Promise<void> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/logout`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Cookies.get("token")}`,
        "X-JWT-Token": Cookies.get("jwt_token") || "",
      },
    });

    if (!response.ok) {
      throw new Error("Error al cerrar sesión");
    }
  } finally {
    // Limpiar cookies y localStorage
    Cookies.remove("lms_session");
    Cookies.remove("token");
    localStorage.removeItem("user");
  }
}

export function getStoredUser() {
  if (typeof window === "undefined") return null;

  const userStr = localStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
}

// Función para verificar si el token está por expirar
export function isTokenExpiring(): boolean {
  const jwt = Cookies.get("jwt_token");
  if (!jwt) return true;

  try {
    const [, payload] = jwt.split(".");
    const { exp } = JSON.parse(atob(payload));
    const now = Math.floor(Date.now() / 1000);

    return exp - now < 120; // menos de 2 minutos
  } catch {
    return true;
  }
}

// Función para manejar la renovación del token
export async function refreshToken(): Promise<void> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/refresh-token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: Cookies.get("jwt_token"),
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Error al renovar el token");
    }

    const data = await response.json();
    Cookies.set("token", data.token, { expires: 1 });
    Cookies.set("jwt_token", data.jwt_token, { expires: 1 });
  } catch (error) {
    console.error("Error refreshing token:", error);
    throw error;
  }
}
