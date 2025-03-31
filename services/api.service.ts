"use client";

import axios from "axios";
import { toast } from "sonner";
import { AccountProps } from "@/utils/types";

export interface Role {
  id: string | number;
  name: string;
}

export interface Permission {
  id: string;
  name: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role | null;
  permissions: Permission[];
  projects: string[]; // UUIDs como strings
  phone?: string | null;
}

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("user");
      toast.error("Sesión expirada. Por favor, inicia sesión nuevamente.");
      window.location.replace("/login");
    }
    return Promise.reject(error.response?.data || error);
  }
);

export const apiService = {
  // Users
  getUsers: async (): Promise<User[]> => {
    const { data } = await api.get<{ data: User[] }>("/users");
    return data.data;
  },
  createUser: async (data: {
    name: string;
    email: string;
    password?: string;
    role_id: string;
    dob?: string;
    permissions: string[];
    projectIds: string[];
  }) => {
    const response = await api.post<User>("/users", data);
    return response.data;
  },
  updateUser: async (
    id: string,
    data: { name: string; email: string; role_id: string; dob?: string }
  ) => {
    const response = await api.put<User>(`/users/${id}`, data);
    return response.data;
  },
  deleteUser: async (id: string) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
  updateUserPermissions: async (id: string, permissions: string[]) => {
    const response = await api.put(`/users/${id}/permissions`, { permissions });
    return response.data;
  },
  getUser: async (id: string) => {
    const { data } = await api.get<User>(`/users/${id}`);
    return data;
  },
  getCurrentUser: async () => {
    const { data } = await api.get<User>("/me");
    return data;
  },
  updateUserProfile: async (id: string, data: Partial<User>) => {
    const response = await api.patch<User>(`/users/${id}`, data);
    return response.data;
  },

  // Roles
  getRoles: async (): Promise<Role[]> => {
    const { data } = await api.get<{ data: Role[] }>("/roles");
    return data.data;
  },

  // Permissions
  getPermissions: async (): Promise<Permission[]> => {
    const { data } = await api.get<{ data: Permission[] }>("/permissions");
    return data.data;
  },

  // Projects
  getProjects: async (projectIds?: string[]): Promise<Project[]> => {
    const params = projectIds?.length ? { projects: projectIds.join(",") } : {};
    const { data } = await api.get<{ data: Project[] }>("/projects", {
      params,
    });
    return data.data;
  },
  getProjectsByUser: async (userId: string): Promise<Project[]> => {
    const { data } = await api.get<{ data: Project[] }>(
      `/projects?user_id=${userId}`
    );
    return data.data;
  },
  updateUserProjects: async (userId: string, projectIds: string[]) => {
    const response = await api.post(`/users/${userId}/projects`, {
      projectIds,
    });
    return response.data;
  },

  // Accounts (sin cambios por ahora)
  createAccount: (formData: AccountProps) => api.post("/accounts", formData),
  getAccounts: (accountType?: string, accountAffects?: string) => {
    const params = new URLSearchParams();
    if (accountType) params.append("account_type", accountType);
    if (accountAffects) params.append("account_affects", accountAffects);
    return api.get(`/accounts?${params.toString()}`);
  },
  updateAccount: (
    accountId: string,
    data: {
      name?: string;
      type?: string;
      account_status?: string;
      generates_income?: boolean;
    }
  ) => api.put(`/accounts/${accountId}`, data),
  deleteAccount: (id: string) => api.delete(`/accounts/${id}`),

  // Sistema Onix (sin cambios por ahora)
  getPersonnel: () => api.get("/responsibles?fields=id,nombre_completo"),
  getPersonnelCount: async () => {
    const { data } = await api.get("/responsibles?action=count");
    return data;
  },
  getVehiclesCount: async () => {
    const { data } = await api.get("/transports?action=count");
    return data.data;
  },

  // Templates (sin cambios por ahora)
  downloadTemplate: async (context: "discounts" | "expenses") => {
    const endpoint =
      context === "discounts"
        ? "/download-discounts-template"
        : "/download-expenses-template";
    const response = await api.get(endpoint, { responseType: "blob" });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.download =
      context === "discounts"
        ? "Plantilla_Descuentos.xlsx"
        : "Plantilla_Gastos.xlsx";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    return { success: true, message: "Plantilla descargada correctamente" };
  },
  importExcelData: async (file: File, context: "discounts" | "expenses") => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("context", context);
    const { data } = await api.post("/requests/import", formData);
    return data;
  },

  // Loans (sin cambios por ahora)
  createLoan: (formData: FormData) => api.post("/loans", formData),

  // Reposiciones (sin cambios por ahora)
  getRepositionFile: async (repositionId: string) => {
    const { data } = await api.get(`/reposiciones/${repositionId}/file`);
    return data.data;
  },
};

export default apiService;
