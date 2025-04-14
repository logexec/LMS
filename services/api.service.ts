/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { fetchWithAuth, fetchWithAuthFormData } from "@/services/auth.service";
import {
  AccountProps,
  RequestProps,
  ResponsibleProps,
  TransportProps,
} from "@/utils/types";

// Variable global para controlar llamadas duplicadas
const fetchInProgress = {
  accounts: false,
  responsibles: false,
  vehicles: false,
};

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
  getUser: async (userId: string) => {
    const response = await fetchWithAuth(`/users/${userId}`);
    if (!response.ok) throw new Error("Error al obtener usuario");
    return response;
  },
  updateUserProfile: async (userId: string, data: any) => {
    const response = await fetchWithAuth(`/users/${userId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Error al actualizar perfil");
    return response;
  },

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
    data: {
      name?: string;
      type?: string;
      account_status?: string;
      generates_income?: boolean;
    }
  ) =>
    fetchWithAuth(`/accounts/${accountId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteAccount: async (id: string) => {
    const response = await fetchWithAuth(`/accounts/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Error al eliminar cuenta");
    return response;
  },

  //Sistema_onix
  getPersonnel: () => {
    return fetchWithAuth(`/responsibles?fields=id,nombre_completo`, {
      credentials: "include",
    });
  },

  updateData: () => {
    return fetchWithAuth(`/update-data`, {
      credentials: "include",
    });
  },

  // Descargar plantilla
  downloadTemplate: async (context: "discounts" | "expenses" | "income") => {
    const endpoint =
      context === "expenses"
        ? "/download-expenses-template"
        : "/download-discounts-template";

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`,
        {
          method: "GET",
          credentials: "include", // Incluye cookies para autenticación
          headers: {
            // Añade headers si es necesario
          },
        }
      );

      if (!response.ok) {
        // Leer el cuerpo de la respuesta como JSON en caso de error
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
      throw error; // Relanzar el error para que handleDownloadTemplate lo capture
    }
  },
  // Importar plantilla
  importExcelData: async (
    file: File,
    context: "discounts" | "expenses" | "income"
  ) => {
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
          throw new Error(JSON.stringify(errorData.errors)); // Pasar lista de errores
        }
        throw new Error(errorData.message || "Error desconocido");
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error(`Error importando datos (${context}):`, error);
      throw error;
    }
  },

  // Préstamos
  createLoan: async (formData: FormData) => {
    try {
      const response = await fetchWithAuthFormData("/loans", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText: any = await response.text();
        console.log("Error response from backend:", errorText);
        let errorData;
        try {
          errorData = errorText.error;
        } catch {
          errorData = { message: errorText || "Error desconocido" };
        }
        throw errorData; // Lanzar el objeto parseado o texto plano
      }

      return response;
    } catch (error) {
      console.error(
        error instanceof Error ? `❌ Error in createLoan: ${error}` : error
      );
      throw error; // Propagamos el error como objeto o string
    }
  },

  updateRequest: async (id: string, data: Partial<RequestProps>) => {
    try {
      const response = await fetchWithAuth(`/requests/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response;
        throw new Error(
          errorData.error || `Error ${response.status}: ${response.statusText}`
        );
      }

      return response; // Devuelve el objeto actualizado
    } catch (error) {
      console.error("❌ Error in updateRequest:", error);
      throw error;
    }
  },

  deleteRequest: async (id: string) => {
    try {
      const response = await fetchWithAuth(`/requests/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errorData = await response;
        throw new Error(
          errorData.error || `Error ${response.status}: ${response.statusText}`
        );
      }
      return response;
    } catch (error) {
      console.error("Error in deleteRequest:", error);
      throw error;
    }
  },

  // Funciones optimizadas para los dropdowns
  fetchAccounts: async (): Promise<AccountProps[]> => {
    // Prevenir duplicados
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

      if (!response.ok) {
        console.error("Error fetching accounts:", response.status);
        return [];
      }

      const text = await response.text();

      if (!text) {
        console.error("Empty response from accounts API");
        return [];
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error("Error parsing accounts JSON:", e);
        return [];
      }

      const result =
        data?.data && Array.isArray(data.data)
          ? data.data
          : Array.isArray(data)
          ? data
          : [];

      // Deduplicate by name (since account_id field stores name value)
      const uniqueMap = new Map();
      result.forEach((item: any) => {
        if (item && item.name && !uniqueMap.has(item.name)) {
          uniqueMap.set(item.name, {
            id: item.id,
            name: item.name,
          });
        }
      });

      return Array.from(uniqueMap.values()) as AccountProps[];
    } catch (error) {
      console.error("Error in fetchAccounts:", error);
      return [];
    } finally {
      // Reset fetch flag
      fetchInProgress.accounts = false;
    }
  },

  fetchResponsibles: async (): Promise<ResponsibleProps[]> => {
    // Prevenir duplicados
    if (fetchInProgress.responsibles) {
      console.log("Fetch responsibles already in progress, skipping");
      return [];
    }

    fetchInProgress.responsibles = true;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/responsibles?fields=id,nombre_completo`,
        { credentials: "include" }
      );

      if (!response.ok) {
        console.error("Error fetching responsibles:", response.status);
        return [];
      }

      const text = await response.text();

      if (!text) {
        console.error("Empty response from responsibles API");
        return [];
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error("Error parsing responsibles JSON:", e);
        return [];
      }

      const result =
        data?.data && Array.isArray(data.data)
          ? data.data
          : Array.isArray(data)
          ? data
          : [];

      // Deduplicate by nombre_completo (since responsible_id field stores nombre_completo value)
      const uniqueMap = new Map();
      result.forEach((item: any) => {
        if (
          item &&
          item.nombre_completo &&
          !uniqueMap.has(item.nombre_completo)
        ) {
          uniqueMap.set(item.nombre_completo, {
            id: item.id,
            nombre_completo: item.nombre_completo,
          });
        }
      });

      return Array.from(uniqueMap.values()) as ResponsibleProps[];
    } catch (error) {
      console.error("Error in fetchResponsibles:", error);
      return [];
    } finally {
      // Reset fetch flag
      fetchInProgress.responsibles = false;
    }
  },

  fetchVehicles: async (): Promise<TransportProps[]> => {
    // Prevenir duplicados
    if (fetchInProgress.vehicles) {
      console.log("Fetch vehicles already in progress, skipping");
      return [];
    }

    fetchInProgress.vehicles = true;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/requests?fields=vehicle_plate,vehicle_number`,
        { credentials: "include" }
      );

      if (!response.ok) {
        console.error("Error fetching vehicles:", response.status);
        return [];
      }

      const text = await response.text();

      if (!text) {
        console.error("Empty response from vehicles API");
        return [];
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error("Error parsing vehicles JSON:", e);
        return [];
      }

      const result =
        data?.data && Array.isArray(data.data)
          ? data.data
          : Array.isArray(data)
          ? data
          : [];

      // Filter items with vehicle_plate and deduplicate
      const uniqueMap = new Map();
      result.forEach((item: any) => {
        if (item && item.vehicle_plate && !uniqueMap.has(item.vehicle_plate)) {
          uniqueMap.set(item.vehicle_plate, {
            vehicle_plate: item.vehicle_plate,
            vehicle_number: item.vehicle_number || "",
          });
        }
      });

      return Array.from(uniqueMap.values()) as TransportProps[];
    } catch (error) {
      console.error("Error in fetchVehicles:", error);
      return [];
    } finally {
      // Reset fetch flag
      fetchInProgress.vehicles = false;
    }
  },
};

export default apiService;
