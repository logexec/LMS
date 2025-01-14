"use client";

import Cookies from "js-cookie";

export interface LoginResponse {
  access_token: string;
  jwt_token: string;
  token_type: string;
  user: {
    id: string;
    name: string;
    email: string;
    proyecto: string;
    area: string;
    permisos: string[];
  };
}

export interface UserCredentials {
  email: string;
  password: string;
}

export async function login(
  credentials: UserCredentials
): Promise<LoginResponse> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    credentials: "include",
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Error en la autenticación");
  }

  const data = await response.json();

  // Guardar tokens en cookies
  Cookies.set("access_token", data.access_token, { expires: 1 });
  Cookies.set("jwt_token", data.jwt_token, { expires: 1 });
  localStorage.setItem("user", JSON.stringify(data.user));

  return data;
}

export async function logout(): Promise<void> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/logout`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Cookies.get("access_token")}`,
        "X-JWT-Token": Cookies.get("jwt_token") || "",
      },
    });

    if (!response.ok) {
      throw new Error("Error al cerrar sesión");
    }
  } finally {
    // Limpiar cookies y localStorage
    Cookies.remove("access_token");
    Cookies.remove("jwt_token");
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
    Cookies.set("access_token", data.access_token, { expires: 1 });
    Cookies.set("jwt_token", data.jwt_token, { expires: 1 });
  } catch (error) {
    console.error("Error refreshing token:", error);
    throw error;
  }
}
