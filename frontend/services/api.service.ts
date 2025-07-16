/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import {
  AccountProps,
  RequestProps,
  ResponsibleProps,
  TransportProps,
} from "@/utils/types";
import api from "./axios";

// Variable global para controlar llamadas duplicadas
const fetchInProgress = {
  accounts: false,
  responsibles: false,
  vehicles: false,
  requests: false,
  repositions: false,
};

export async function checkApiStatus() {
  try {
    const response = await api.get(
      `${process.env.NEXT_PUBLIC_API_URL}/serverstatus`
    );

    if (response.status === 503) {
      if (!window.location.pathname.includes("maintenance")) {
        window.location.href = `/maintenance`;
      }
    }
    if (response.status === 200) {
      if (window.location.pathname.includes("maintenance")) {
        window.location.href = "/registros/nuevo";
      }
    }
  } catch (error) {
    console.error(error);
  }
}

export const apiService = {
  // Users
  getUsers: async (): Promise<any[]> => {
    try {
      checkApiStatus();
      const { data } = await api.get<Record<string, any>>(`/users`);
      // Si data es un array, devolvemos directo, si no, tomamos valores
      return Array.isArray(data)
        ? data
        : Object.values(data as Record<string, any>);
    } catch (error) {
      console.error("❌ Error in getUsers:", error);
      throw error;
    }
  },
  createUser: (payload: any): Promise<any> =>
    api.post(`/users`, payload).then((res) => res.data),
  updateUser: (id: string, payload: any): Promise<any> =>
    api.put(`/users/${id}`, payload).then((res) => res.data),
  deleteUser: (id: string): Promise<any> =>
    api.delete(`/users/${id}`).then((res) => res.data),
  updateUserPermissions: (id: string, permissions: string[]): Promise<any> =>
    api
      .patch(`/users/${id}/permissions`, { permissions })
      .then((res) => res.data),

  // Roles
  getRoles: (): Promise<any> => api.get(`/roles`).then((res) => res.data),

  // Permissions
  getPermissions: (): Promise<any> =>
    api.get(`/permissions`).then((res) => res.data),

  // Projects
  getProjects: async (projectIds?: string[]): Promise<any[]> => {
    try {
      checkApiStatus();
      const params: Record<string, string> = {};
      if (projectIds?.length) params.projects = projectIds.join(",");
      const { data } = await api.get<any[]>(`/projects`, { params });

      // Si es array, retornamos, sino extraemos valores filtrados
      if (Array.isArray(data)) return data;
      const values = Object.values(data as Record<string, any>);
      return values.filter((item) => typeof item === "object" && item);
    } catch (error) {
      console.error("❌ Error in getProjects:", error);
      throw error;
    }
  },

  getProjectsByUser: async (userId: string): Promise<any[]> => {
    const { data } = await api.get<any[]>(`/projects`, {
      params: { user_id: userId },
    });
    return data;
  },

  updateUserProjects: async (
    userId: string,
    projectIds: string[]
  ): Promise<any> => {
    try {
      checkApiStatus();
      const { data } = await api.patch(`/users/${userId}/projects`, {
        projectIds,
      });
      return data;
    } catch (error) {
      console.error("Error updating projects:", error);
      throw error;
    }
  },

  // Reposiciones
  getRepositionFile: async (repositionId: string): Promise<Blob | null> => {
    try {
      checkApiStatus();
      const response = await api.get<Blob>(
        `/reposiciones/${repositionId}/file`,
        { responseType: "blob" }
      );
      if (response.status !== 200) {
        if (response.status === 404) {
          console.warn(`Archivo no encontrado para reposición ${repositionId}`);
          return null;
        }
        throw new Error(`Error fetching file for reposition ${repositionId}`);
      }
      return response.data;
    } catch (error) {
      console.error("Error in getRepositionFile:", error);
      throw error;
    }
  },

  getUser: async (userId: string): Promise<any> => {
    const { data } = await api.get(`/users/${userId}`);
    return data;
  },

  updateUserProfile: async (userId: string, payload: any): Promise<any> => {
    const { data } = await api.patch(`/users/${userId}`, payload);
    return data;
  },

  // Accounts
  createAccount: async (formData: AccountProps): Promise<AccountProps> => {
    const { data } = await api.post<AccountProps>(`/accounts`, formData);
    return data;
  },

  getAccounts: async (
    accountType?: string,
    accountAffects?: string
  ): Promise<AccountProps[]> => {
    checkApiStatus();
    const params: Record<string, string> = {};
    if (accountType) params.account_type = accountType;
    if (accountAffects) params.account_affects = accountAffects;
    const { data } = await api.get<AccountProps[]>(`/accounts`, { params });
    return data;
  },

  updateAccount: async (
    accountId: string,
    payload: Partial<
      Pick<
        AccountProps,
        "name" | "account_type" | "account_status" | "generates_income"
      >
    >
  ): Promise<AccountProps> => {
    const { data } = await api.patch<AccountProps>(
      `/accounts/${accountId}`,
      payload
    );
    return data;
  },

  deleteAccount: async (id: string): Promise<void> => {
    await api.delete(`/accounts/${id}`);
  },

  // Sistema_onix
  getPersonnel: async (): Promise<ResponsibleProps[]> => {
    checkApiStatus();
    const { data } = await api.get<ResponsibleProps[]>(`/responsibles`, {
      params: { fields: "id,nombre_completo" },
    });
    return data;
  },

  updateData: async (): Promise<any> => {
    checkApiStatus();
    const { data } = await api.patch(`/update-data`);
    return data;
  },

  // Descargar plantilla
  downloadTemplate: async (
    context: "discounts" | "expenses" | "income"
  ): Promise<{ success: boolean; message: string }> => {
    checkApiStatus();
    const endpoint =
      context === "expenses"
        ? "/download-expenses-template"
        : context === "discounts"
        ? "/download-discounts-template"
        : "/download-discounts-template?isIncome=true";

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            `Error ${response.status}: ${response.statusText}`
        );
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download =
        context === "discounts"
          ? "Plantilla_Descuentos.xlsx"
          : context === "expenses"
          ? "Plantilla_Gastos.xlsx"
          : "Plantilla_Ingresos.xlsx";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return { success: true, message: "Plantilla descargada correctamente" };
    } catch (error) {
      console.error(`Error descargando plantilla (${context}):`, error);
      throw error;
    }
  },

  // Importar plantilla
  importExcelData: async (
    file: File,
    context: "discounts" | "expenses" | "income"
  ): Promise<any> => {
    checkApiStatus();
    const formData = new FormData();
    formData.append("file", file);
    formData.append("context", context);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/requests/import`,
        {
          method: "POST",
          body: formData,
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.errors) {
          throw new Error(JSON.stringify(errorData.errors));
        }
        throw new Error(errorData.message || "Error desconocido");
      }

      return await response.json();
    } catch (error) {
      console.error(`Error importando datos (${context}):`, error);
      throw error;
    }
  },

  importLoanExcelData: async (file: File, context = "loan"): Promise<any> => {
    checkApiStatus();
    const formData = new FormData();
    formData.append("file", file);
    formData.append("context", context);

    console.log("Enviando archivo:", {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    });

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/loans/import`,
        {
          method: "POST",
          body: formData,
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error de respuesta:", errorData);

        if (errorData.errors) {
          const errorMessages: string[] = [];
          for (const key in errorData.errors) {
            const item = errorData.errors[key];
            if (Array.isArray(item)) {
              errorMessages.push(...item);
            } else {
              errorMessages.push(item);
            }
          }
          throw new Error(JSON.stringify(errorMessages));
        }
        throw new Error(errorData.message || "Error desconocido");
      }

      return await response.json();
    } catch (error) {
      console.error(`Error importando datos (${context}):`, error);
      throw error;
    }
  },

  // Préstamos
  createLoan: async (formData: FormData): Promise<any> => {
    try {
      checkApiStatus();
      const response = await api.post(`/loans`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.status !== 200) {
        throw new Error(JSON.stringify(response.data) || "Error desconocido");
      }

      return response.data;
    } catch (error) {
      console.error(
        error instanceof Error ? `❌ Error in createLoan: ${error}` : error
      );
      throw error;
    }
  },

  updateRequest: async (
    id: string,
    data: Partial<RequestProps>
  ): Promise<any> => {
    try {
      checkApiStatus();
      const response = await api.put(`/requests/${id}`, data);
      return response.data;
    } catch (error) {
      console.error("❌ Error in updateRequest:", error);
      throw error;
    }
  },

  deleteRequest: async (id: string): Promise<any> => {
    try {
      checkApiStatus();
      const response = await api.delete(`/requests/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error in deleteRequest:", error);
      throw error;
    }
  },

  // Funciones optimizadas para los dropdowns
  fetchAccounts: async (): Promise<AccountProps[]> => {
    checkApiStatus();
    if (fetchInProgress.accounts) {
      console.log("Fetch accounts already in progress, skipping");
      return [];
    }
    fetchInProgress.accounts = true;
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/accounts`,
        {
          credentials: "include",
        }
      );
      if (!response.ok) return [];
      const text = await response.text();
      if (!text) return [];
      let data: any;
      try {
        data = JSON.parse(text);
      } catch {
        return [];
      }
      const arr = Array.isArray(data.data)
        ? data.data
        : Array.isArray(data)
        ? data
        : [];
      const unique = new Map<string, AccountProps>();
      arr.forEach((item: any) => {
        if (item?.name && !unique.has(item.name)) {
          unique.set(item.name, { id: item.id, name: item.name });
        }
      });
      return Array.from(unique.values());
    } finally {
      fetchInProgress.accounts = false;
    }
  },

  fetchResponsibles: async (): Promise<ResponsibleProps[]> => {
    checkApiStatus();
    if (fetchInProgress.responsibles) return [];
    fetchInProgress.responsibles = true;
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/responsibles?fields=id,nombre_completo`,
        { credentials: "include" }
      );
      if (!response.ok) return [];
      const text = await response.text();
      if (!text) return [];
      let data: any;
      try {
        data = JSON.parse(text);
      } catch {
        return [];
      }
      const arr = Array.isArray(data.data)
        ? data.data
        : Array.isArray(data)
        ? data
        : [];
      const unique = new Map<string, ResponsibleProps>();
      arr.forEach((item: any) => {
        if (item?.nombre_completo && !unique.has(item.nombre_completo)) {
          unique.set(item.nombre_completo, {
            id: item.id,
            nombre_completo: item.nombre_completo,
            proyecto: item.proyecto,
          });
        }
      });
      return Array.from(unique.values());
    } finally {
      fetchInProgress.responsibles = false;
    }
  },

  fetchVehicles: async (): Promise<TransportProps[]> => {
    checkApiStatus();
    if (fetchInProgress.vehicles) return [];
    fetchInProgress.vehicles = true;
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/requests?fields=vehicle_plate,vehicle_number`,
        { credentials: "include" }
      );
      if (!response.ok) return [];
      const text = await response.text();
      if (!text) return [];
      let data: any;
      try {
        data = JSON.parse(text);
      } catch {
        return [];
      }
      const arr = Array.isArray(data.data)
        ? data.data
        : Array.isArray(data)
        ? data
        : [];
      const unique = new Map<string, TransportProps>();
      arr.forEach((item: any) => {
        if (item?.vehicle_plate && !unique.has(item.vehicle_plate)) {
          unique.set(item.vehicle_plate, {
            vehicle_plate: item.vehicle_plate,
            vehicle_number: item.vehicle_number ?? "",
          });
        }
      });
      return Array.from(unique.values());
    } finally {
      fetchInProgress.vehicles = false;
    }
  },

  // Requests
  fetchRequests: async (type: string): Promise<any[]> => {
    try {
      checkApiStatus();
      if (fetchInProgress.requests) return [];
      fetchInProgress.requests = true;
      const { data } = await api.get<any[]>(`/requests`, {
        params: { type },
      });
      return Array.isArray(data) ? data : Object.values(data);
    } catch (error) {
      console.error("❌ Error in fetchRequests:", error);
      throw error;
    } finally {
      fetchInProgress.requests = false;
    }
  },
};

export default apiService;
