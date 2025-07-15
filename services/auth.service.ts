/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { toast } from "sonner";
import { createRequestHelper } from "./axios"; // Import the new API

export interface LoginResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: { id: number; name: string };
    permissions: Array<{ id: number; name: string }>;
    assignedProjects: string[];
    dob?: string;
    phone?: string;
  };
}

export const getAuthToken = () => {
  return Cookies.get("jwt-token");
};

// DEPRECATED: Use createRequestHelper from axios.ts instead
export const fetchWithAuth = async (
  endpoint: string,
  options: RequestInit = {}
) => {
  console.warn("⚠️ fetchWithAuth is deprecated. Use axios.ts API methods instead.");
  
  const token = getAuthToken();
  if (!token) {
    handleSessionExpired();
    throw new Error("No token found");
  }

  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
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

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      if (
        data.message?.toLowerCase().includes("token") &&
        data.message?.toLowerCase().includes("expired")
      ) {
        handleSessionExpired();
        throw new Error("Sesión expirada");
      }
      return { ...data, ok: response.ok };
    }
    return {
      ok: response.ok,
      status: response.status,
      message: response.ok ? "Operación exitosa" : "Error en la operación",
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes("expired")) {
      handleSessionExpired();
    }
    throw {
      message: error instanceof Error ? error.message : "Error desconocido",
      isAuthError:
        error instanceof Error && error.message.includes("autorizado"),
    };
  }
};

// DEPRECATED: Use createRequestHelper.individual from axios.ts instead
export const fetchWithAuthFormData = async (
  endpoint: string,
  options: RequestInit = {}
) => {
  console.warn("⚠️ fetchWithAuthFormData is deprecated. Use createRequestHelper.individual from axios.ts instead.");
  
  // For /requests endpoint, redirect to new API
  if (endpoint === "/requests" && options.method === "POST") {
    try {
      if (options.body instanceof FormData) {
        return await createRequestHelper.individual(options.body);
      } else {
        throw new Error("Expected FormData for individual request");
      }
    } catch (error) {
      // Convert axios error to expected format
      throw error;
    }
  }

  // Fallback to original implementation for other endpoints
  const token = getAuthToken();
  if (!token) {
    handleSessionExpired();
    throw new Error("No token found");
  }

  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (options.headers) {
    Object.entries(options.headers).forEach(([key, value]) => {
      if (typeof value === "string") {
        headers[key] = value;
      }
    });
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`,
      {
        method: options.method || "GET",
        body: options.body,
        headers: {
          ...headers,
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      }
    );

    if (response.status === 401) {
      handleSessionExpired();
      throw new Error("No autorizado");
    }

    return response;
  } catch (error) {
    if (error instanceof Error && error.message.includes("expired")) {
      handleSessionExpired();
    }
    throw {
      message: error instanceof Error ? error.message : "Error desconocido",
      isAuthError:
        error instanceof Error && error.message.includes("autorizado"),
    };
  }
};

const handleSessionExpired = () => {
  Cookies.remove("jwt-token");
  Cookies.remove("lms_session");
  localStorage.removeItem("user");
  toast.error("Tu sesión ha expirado. Por favor, inicia sesión nuevamente.");
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
    // Obtener el token CSRF desde la URL base (sin /api)
    await axios.get(`${baseURL}/sanctum/csrf-cookie`, {
      withCredentials: true,
    });

    // Hacer la solicitud de login a la API
    const response = await api.post("/login", {
      email,
      password,
      remember,
    });

    const data: LoginResponse = { user: response.data.data };
    localStorage.setItem("user", JSON.stringify(data.user));
    return data;
  } catch (error: any) {
    toast.error(error.response?.data?.message || "Error en la autenticación");
    throw error;
  }
};

export const logout = async (): Promise<void> => {
  try {
    await api.post("/logout");
    localStorage.removeItem("user");
    window.location.replace("/login");
  } catch (error: any) {
    toast.error(error.response?.data?.message || "Error al cerrar sesión");
    throw error;
  }
};