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
    proyecto?: string;
    role: {
      id: number;
      name: string;
    };
    permissions: Array<{
      id: number;
      name: string;
    }>;
  };
}

export const login = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Error en la autenticación");
    }

    const data = await response.json();

    // Guardar tokens
    if (data.token) Cookies.set("token", data.token);
    if (data.jwt_token) Cookies.set("jwt-token", data.jwt_token);

    return data;
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
  if (!token) throw new Error("No token found");

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...options.headers,
  };

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`,
    {
      ...options,
      headers,
      credentials: "include",
    }
  );

  if (response.status === 401) {
    Cookies.remove("jwt-token");
    Cookies.remove("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
    throw new Error("No autorizado");
  }

  return response.json();
};

export const logout = async (): Promise<void> => {
  try {
    await fetchWithAuth("/logout", { method: "POST" });
  } finally {
    Cookies.remove("jwt-token");
    Cookies.remove("token");
    Cookies.remove("lms_session");
    localStorage.removeItem("user");
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
