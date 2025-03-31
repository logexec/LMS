/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import axios from "axios";
import { toast } from "sonner";
import { AccountProps } from "@/utils/types";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true, // Para Sanctum
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Interceptor para manejar errores de autenticación
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
  getUsers: async () => {
    const { data } = await api.get("/users");
    return Array.isArray(data) ? data : Object.values(data);
  },
  createUser: (data: any) => api.post("/users", data),
  updateUser: (id: string, data: any) => api.put(`/users/${id}`, data),
  deleteUser: (id: string) => api.delete(`/users/${id}`),
  updateUserPermissions: (id: string, permissions: string[]) =>
    api.put(`/users/${id}/permissions`, { permissions }),
  getUser: (id: string) => api.get(`/users/${id}`),
  updateUserProfile: (id: string, data: any) => api.patch(`/users/${id}`, data),

  // Roles
  getRoles: () => api.get("/roles"),

  // Permissions
  getPermissions: () => api.get("/permissions"),

  // Projects
  getProjects: async (projectIds?: string[]) => {
    const params = projectIds?.length ? { projects: projectIds.join(",") } : {};
    const { data } = await api.get("/projects", { params });
    return Array.isArray(data) ? data : Object.values(data);
  },
  getProjectsByUser: (userId: string) => api.get(`/projects?user_id=${userId}`),
  updateUserProjects: (userId: string, projectIds: string[]) =>
    api.post(`/users/${userId}/projects`, { projectIds }),

  // Accounts
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

  // Sistema Onix
  getPersonnel: () => api.get("/responsibles?fields=id,nombre_completo"),
  getPersonnelCount: async () => {
    const { data } = await api.get("/responsibles?action=count");
    return data; // { data: number }
  },
  getVehiclesCount: async () => {
    const { data } = await api.get("/transports?action=count");
    return data.data; // { data: number }
  },

  // Templates
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

  // Loans
  createLoan: (formData: FormData) => api.post("/loans", formData),

  // Reposiciones
  getRepositionFile: async (repositionId: string) => {
    const { data } = await api.get(`/reposiciones/${repositionId}/file`);
    return data.data; // { file_url, file_name }
  },
};

export default apiService;
