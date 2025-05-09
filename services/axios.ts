/* eslint-disable @typescript-eslint/no-explicit-any */

import axios from "axios";
import { toast } from "sonner";

// Crear una instancia de axios con configuración base
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

// Interceptor para agregar token de autorización
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Error en la conexión con el servidor";

    // No mostrar toast si estamos manejando el error manualmente
    if (!error.config?.skipErrorToast) {
      toast.error(errorMessage);
    }

    return Promise.reject(error);
  }
);

// Tipo para filtros de solicitudes
export interface RequestFilters {
  period?: "last_week" | "last_month" | "all";
  project?: string;
  type?: "expense" | "discount" | "income";
  status?: "pending" | "rejected" | "approved";
}

export interface RequestUpdateData {
  invoice_number?: string;
  amount?: string;
  note?: string;
  // Puedes añadir más campos aquí si es necesario
}

/**
 * Función especialmente diseñada para la subida de archivos
 * Intenta con múltiples enfoques para maximizar compatibilidad
 */
export const onFileSubmit = async (
  requestIds: string[],
  file: File
): Promise<any> => {
  // Crear FormData
  const formData = new FormData();

  // Agregar el archivo con ambos nombres para mayor compatibilidad
  formData.append("attachment", file);
  formData.append("file", file);

  // Verificar que el archivo se haya agregado correctamente
  console.log("File appended:", file.name, file.size);

  // Agregar los IDs de solicitud
  requestIds.forEach((id) => formData.append("request_ids[]", id));

  // Configuración específica para subida de archivos
  const config = {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    skipErrorToast: true,
  };

  try {
    // Realizar la petición con timeout extendido
    const response = await api.post("/reposiciones", formData, {
      ...config,
      timeout: 30000, // 30 segundos
    });
    return response.data;
  } catch (error) {
    console.error("File upload error:", error);
    // Log del error para diagnóstico
    if (axios.isAxiosError(error)) {
      console.error("Response data:", error.response?.data);
    }
    throw error;
  }
};

// Funciones de API para requests
export const requestsApi = {
  // Obtener solicitudes con filtros
  fetchRequests: async (filters: RequestFilters = {}) => {
    const params = new URLSearchParams();

    if (filters.period) params.append("period", filters.period);
    if (filters.project) params.append("project", filters.project);
    if (filters.type) params.append("type", filters.type);
    if (filters.status) params.append("status", filters.status);

    const response = await api.get(`/requests?${params.toString()}`);

    // Obtener el email del usuario desde localStorage
    const user = JSON.parse(localStorage.getItem("user")!);
    const email = user?.email || null;

    // Lista de emails que NO deben filtrarse (excepciones)
    const exemptEmails = [
      "ricardo.estrella@logex.ec",
      "jk@logex.ec",
      "diego.merisalde@logex.ec",
      "michelle.quintana@logex.ec",
      "nicolas.iza@logex.ec",
    ];

    // Filtrar solo si el email no está en la lista de excepciones
    let result = response.data;
    if (!exemptEmails.includes(email)) {
      result = response.data.filter(
        (data: any) => !data.unique_id.startsWith("P-")
      );
    }

    return result;
  },

  // Eliminar una solicitud
  deleteRequest: async (id: string) => {
    const response = await api.delete(`/requests/${id}`);
    return response.data;
  },

  // Crear reposición (enviar solicitudes)
  createReposicion: async (requestIds: string[], file: File) => {
    const formData = new FormData();
    formData.append("attachment", file, file.name);
    requestIds.forEach((id) => formData.append("request_ids[]", id));

    const config = {
      headers: {
        // No especificar Content-Type para que axios lo configure automáticamente
        "Content-Type": "multipart/form-data",
      },
      skipErrorToast: true, // Manejamos los errores manualmente
    };

    const response = await api.post("/reposiciones", formData, config);
    return response.data;
  },

  // Actualizar una solicitud
  updateRequest: async (id: string, data: RequestUpdateData) => {
    const response = await api.patch(`/requests/${id}`, data);
    return response.data;
  },

  // Eliminar múltiples solicitudes
  deleteMultipleRequests: async (ids: string[]) => {
    // Si solo hay una ID, usar el endpoint singular para mantener compatibilidad
    if (ids.length === 1) {
      return requestsApi.deleteRequest(ids[0]);
    }

    // Para múltiples IDs, usar el endpoint de eliminación por lotes
    const response = await api.post("/requests/batch-delete", {
      request_ids: ids,
    });
    return response.data;
  },
};

export default api;
