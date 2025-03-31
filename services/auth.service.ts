/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { toast } from "sonner";

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

const baseURL = process.env.NEXT_PUBLIC_BASE_URL;
const apiURL = process.env.NEXT_PUBLIC_API_URL;

if (!baseURL || !apiURL) {
  throw new Error("Missing environment variables for API URLs");
}

const api = axios.create({
  baseURL: apiURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

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
