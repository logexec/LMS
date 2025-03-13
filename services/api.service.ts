/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { fetchWithAuth } from "@/services/auth.service";
import { AccountProps } from "@/utils/types";

export const apiService = {
  // Users
  getUsers: async () => {
    try {
      const response = await fetchWithAuth(`/users`);
      // Si la respuesta es un objeto con claves numéricas, lo convertimos a arreglo
      if (
        response &&
        typeof response === "object" &&
        !Array.isArray(response)
      ) {
        const usersArray = Object.keys(response)
          .filter((key) => !isNaN(parseInt(key))) // Solo claves numéricas
          .map((key) => response[key]);
        return usersArray;
      }
      // Si ya es un arreglo, lo devolvemos directamente
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error("❌ Error in getUsers:", error);
      throw error;
    }
  },
  getUser: (user: string) =>
    fetchWithAuth(`/users/${user}`, {
      credentials: "include",
    }),
  createUser: (data: any) =>
    fetchWithAuth(`/users`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateUser: (id: string, data: any) =>
    fetchWithAuth(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteUser: (id: string) =>
    fetchWithAuth(`/users/${id}`, {
      method: "DELETE",
    }),
  updateUserPermissions: (id: string, permissions: string[]) =>
    fetchWithAuth(`/users/${id}/permissions`, {
      method: "PUT",
      body: JSON.stringify({ permissions }),
    }),

  // Roles
  getRoles: () =>
    fetchWithAuth("/roles", {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    }),

  // Permissions
  getPermissions: () => fetchWithAuth(`/permissions`),

  // Projects
  getProjects: async (projectIds?: string[]) => {
    try {
      const queryParams = projectIds?.length
        ? `?projects=${projectIds.join(",")}`
        : "";

      const endpoint = `/projects${queryParams}`;
      const response = await fetchWithAuth(endpoint);

      if (Array.isArray(response)) {
        return response;
      } else if (response && typeof response === "object") {
        const values = Object.values(response);

        // Filtrar posibles valores que no sean objetos del array esperado
        const filteredValues = values.filter(
          (item) => typeof item === "object" && item !== null
        );

        return filteredValues;
      }

      console.warn(
        "⚠️ Unexpected response format in getProjects, defaulting to empty array"
      );
      return [];
    } catch (error) {
      console.error("❌ Error in getProjects:", error);
      throw error;
    }
  },

  getProjectsByUser: async (userId: string) => {
    return await fetchWithAuth(`/projects?user_id=${userId}`);
  },

  updateUserProjects: async (userId: string, projectIds: string[]) => {
    try {
      return await fetchWithAuth(`/users/${userId}/projects`, {
        method: "POST",
        body: JSON.stringify({ projectIds }),
      });
    } catch (error) {
      console.error("Error updating projects:", error);
      throw error;
    }
  },

  getRepositionFile: async (repositionId: string) => {
    try {
      const response = await fetchWithAuth(
        `/reposiciones/${repositionId}/file`
      );
      if (!response.ok) {
        if (response.status === 404) {
          console.warn(`Archivo no encontrado para reposición ${repositionId}`);
          return null;
        }
        throw new Error(`Error fetching file for reposition ${repositionId}`);
      }
      return response;
    } catch (error) {
      console.error("Error in getRepositionFile:", error);
      throw error;
    }
  },

  updateUserProfile: (
    userId: string,
    data: { dob?: string; phone?: string; password?: string }
  ) =>
    fetchWithAuth(`/users/${userId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  // Accounts
  createAccount: async (formData: AccountProps) => {
    return fetchWithAuth("/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
  },

  getAccounts: (accountType?: string, accountAffects?: string) => {
    const queryParams = new URLSearchParams();

    if (accountType) {
      queryParams.append("account_type", accountType);
    }

    if (accountAffects) {
      queryParams.append("account_affects", accountAffects);
    }

    return fetchWithAuth(`/accounts?${queryParams.toString()}`, {
      credentials: "include",
    });
  },

  updateAccount: (
    accountId: string,
    data: { name?: string; type?: string; account_status?: string }
  ) =>
    fetchWithAuth(`/accounts/${accountId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  //Sistema_onix
  getPersonnel: () => {
    return fetchWithAuth(`/responsibles?fields=id,nombre_completo`, {
      credentials: "include",
    });
  },

  // Descargar plantilla
  downloadTemplate: async (context: "discounts" | "expenses") => {
    const endpoint =
      context === "discounts"
        ? "/download-discounts-template"
        : "/download-expenses-template";

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`,
        {
          method: "GET",
          credentials: "include", // Incluye cookies para autenticación
          headers: {
            // Añade headers de autenticación si fetchWithAuth los usa
            // Ejemplo: "Authorization": `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Error al descargar la plantilla");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
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
    } catch (error) {
      console.error(`Error descargando plantilla (${context}):`, error);
      throw error;
    }
  },

  // Importar plantilla
  importExcelData: async (file: File, context: "discounts" | "expenses") => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("context", context);

    try {
      const response = await fetchWithAuth("/requests/import", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al importar el archivo");
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error(`Error importando datos (${context}):`, error);
      throw error;
    }
  },
};

export default apiService;
