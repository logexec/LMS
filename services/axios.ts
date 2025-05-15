/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  RepositionFilters,
  RepositionUpdateData,
  RequestFilters,
  RequestUpdateData,
} from "./../utils/types";
import axios from "axios";
import { toast } from "sonner";

// Create a simple cache mechanism
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  timeout: 60000, // 60-second timeout (Default 30-second timeout)
});

// Interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Error en la conexión con el servidor";

    // Only show toast if not handling error manually
    if (!error.config?.skipErrorToast) {
      toast.error(errorMessage);
    }

    return Promise.reject(error);
  }
);

// Enhanced function for caching GET requests
const cachedGet = async (
  url: string,
  params: Record<string, any> = {},
  enableCache = true
) => {
  // Create a unique cache key based on the URL and params
  const queryString = Object.keys(params)
    .map((key) => `${key}=${params[key]}`)
    .join("&");
  const cacheKey = `${url}?${queryString}`;

  // Check if we have a valid cached response
  if (enableCache && cache.has(cacheKey)) {
    const cachedResponse = cache.get(cacheKey)!;
    const now = Date.now();

    // If cache is still valid, return it
    if (now - cachedResponse.timestamp < CACHE_TTL) {
      return cachedResponse.data;
    } else {
      // Remove expired cache
      cache.delete(cacheKey);
    }
  }

  // Otherwise make the API call
  const response = await api.get(url, { params });

  // Cache the result if caching is enabled
  if (enableCache) {
    cache.set(cacheKey, {
      data: response.data,
      timestamp: Date.now(),
    });
  }

  return response.data;
};

// Clear cache function (useful for when data is known to be stale)
const clearCache = (urlPattern?: string) => {
  if (urlPattern) {
    // Clear specific pattern
    for (const key of cache.keys()) {
      if (key.includes(urlPattern)) {
        cache.delete(key);
      }
    }
  } else {
    // Clear all cache
    cache.clear();
  }
};

/**
 * API para interacción con el SRI (Nuevas funcionalidades)
 */
export const sriApi = {
  getAllDocuments: async () => {
    const response = await api.get("/sri-documents");
    return response.data;
  },

  generateDocuments: async (rows: Record<string, string>[]) => {
    const response = await api.post("/generate-documents", {
      data: rows,
    });
    clearCache("/generate-documents");
    return response.data;
  },

  batchUpdateDocuments: async (documents: any[]) => {
    // Filtrar solo documentos con cambios y asegurar que los valores sean numéricos
    const docsToUpdate = documents.map((doc) => ({
      id: doc.id,
      valor_sin_impuestos:
        doc.valor_sin_impuestos === "" ? null : Number(doc.valor_sin_impuestos),
      iva: doc.iva === "" ? null : Number(doc.iva),
      importe_total:
        doc.importe_total === "" ? null : Number(doc.importe_total),
      identificacion_receptor: doc.identificacion_receptor,
    }));

    console.log("Datos formateados para actualizar:", docsToUpdate);

    const response = await api.patch("/sri-documents/batch", {
      documents: docsToUpdate,
    });

    return response.data;
  },

  downloadMultipleDocuments: async (docIds: number[]) => {
    try {
      const response = await api.post(
        "/sri-documents/download-multiple",
        {
          document_ids: docIds,
        },
        {
          responseType: "blob",
        }
      );

      const filename = `documentos_sri_${new Date()
        .toISOString()
        .slice(0, 10)}.zip`;
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();

      return true;
    } catch (error) {
      console.error("Error al descargar documentos:", error);
      throw error;
    }
  },

  // Nuevas funciones de consulta SRI

  /**
   * Consulta información de un contribuyente por RUC
   */
  consultarContribuyente: async (ruc: string) => {
    try {
      const response = await api.post("/sri/consultar-contribuyente", { ruc });
      return response.data;
    } catch (error) {
      console.error("Error al consultar contribuyente:", error);
      return {
        success: false,
        message: "Error al consultar el contribuyente",
      };
    }
  },

  /**
   * Consulta información de un comprobante por clave de acceso
   */
  consultarComprobante: async (claveAcceso: string) => {
    try {
      const response = await api.post("/sri/consultar-comprobante", {
        claveAcceso,
      });
      return response.data;
    } catch (error) {
      console.error("Error al consultar comprobante:", error);
      return {
        success: false,
        message: "Error al consultar el comprobante",
      };
    }
  },

  /**
   * Valida un comprobante en el SRI
   */
  validarComprobante: async (claveAcceso: string) => {
    try {
      const response = await api.post("/sri/validar-comprobante", {
        claveAcceso,
      });
      return response.data;
    } catch (error) {
      console.error("Error al validar comprobante:", error);
      return {
        success: false,
        message: "Error al validar el comprobante",
      };
    }
  },

  /**
   * Obtiene información completa a partir de la clave de acceso
   */
  obtenerInfoDesdeClaveAcceso: async (claveAcceso: string) => {
    try {
      // Show loading toast
      const toastId = toast.loading("Consultando información desde el SRI...");

      const response = await api.post("/sri/obtener-info-desde-clave", {
        claveAcceso,
      });

      // Dismiss loading toast on success
      toast.dismiss(toastId);

      if (response.data.success) {
        toast.success("Información obtenida correctamente");
      } else {
        toast.error(response.data.message || "Error al obtener información");
      }

      return response.data;
    } catch (error) {
      console.error("Error al obtener info desde clave de acceso:", error);
      toast.error("Error al consultar información del SRI");
      return {
        success: false,
        message: "Error al obtener información desde el SRI",
      };
    }
  },

  /**
   * Actualiza un documento con información del RUC
   */
  actualizarDocumentoDesdeRuc: async (documentId: number) => {
    try {
      const response = await api.post("/sri/actualizar-documento-desde-ruc", {
        documentId,
      });
      return response.data;
    } catch (error) {
      console.error("Error al actualizar documento desde RUC:", error);
      return {
        success: false,
        message: "Error al actualizar documento desde RUC",
      };
    }
  },

  /**
   * Actualiza un documento con información completa desde la clave de acceso
   */
  actualizarDocumentoDesdeClaveAcceso: async (documentId: number) => {
    try {
      const response = await api.post("/sri/actualizar-documento-desde-clave", {
        documentId,
      });
      return response.data;
    } catch (error) {
      console.error("Error al actualizar documento desde clave:", error);
      return {
        success: false,
        message: "Error al actualizar documento desde clave de acceso",
      };
    }
  },

  /**
   * Actualiza todos los documentos pendientes con información del SRI
   */
  actualizarTodosDocumentos: async (
    limit: number = 50,
    force: boolean = false
  ) => {
    try {
      const response = await api.post("/sri/actualizar-todos-documentos", {
        limit,
        force,
      });
      return response.data;
    } catch (error) {
      console.error("Error al actualizar todos los documentos:", error);
      return {
        success: false,
        message: "Error al actualizar todos los documentos",
      };
    }
  },
};

/**
 * API for reports
 */
export const reportsApi = {
  generateReport: async (type: string, period: string) => {
    const response = await api.post(
      "/reports/generate",
      {
        type,
        period,
      },
      {
        responseType: "blob",
      }
    );

    // Crear un enlace para descargar el archivo
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `reporte-${type}-${period}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();

    return true;
  },

  // Nuevas funciones para reportes específicos del SRI
  reporteIva: async (periodo: string) => {
    const response = await api.get(`/sri/reportes/iva/${periodo}`);
    return response.data;
  },

  reporteRetenciones: async (periodo: string) => {
    const response = await api.get(`/sri/reportes/retenciones/${periodo}`);
    return response.data;
  },

  reporteContribuyentes: async (periodo: string) => {
    const response = await api.get(`/sri/reportes/contribuyentes/${periodo}`);
    return response.data;
  },

  generarAts: async (periodo: string) => {
    const response = await api.get(`/sri/reportes/generar-ats/${periodo}`, {
      responseType: "blob",
    });

    // Crear un enlace para descargar el archivo XML
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `ATS_${periodo}.xml`);
    document.body.appendChild(link);
    link.click();
    link.remove();

    return true;
  },
};

/**
 * API para gestión de contribuyentes
 */
export const contribuyentesApi = {
  /**
   * Obtiene un resumen de todos los contribuyentes
   */
  getResumenContribuyentes: async () => {
    const response = await api.get("/contribuyentes");
    return response.data;
  },

  /**
   * Actualiza la información de todos los contribuyentes desde el SRI
   */
  actualizarContribuyentes: async () => {
    const response = await api.post("/contribuyentes/actualizar");
    return response.data;
  },

  /**
   * Valida el RUC ecuatoriano
   */
  validarRuc: async (ruc: string) => {
    const response = await api.post("/contribuyentes/validar-ruc", { ruc });
    return response.data;
  },

  /**
   * Valida una autorización de comprobante
   */
  validarAutorizacion: async (autorizacion: string) => {
    const response = await api.post("/contribuyentes/validar-autorizacion", {
      autorizacion,
    });
    return response.data;
  },
};

export const onFileSubmit = async (
  requestIds: string[],
  file: File,
  retries = 2
): Promise<any> => {
  // Create FormData
  const formData = new FormData();

  // Add file with both names for better compatibility
  formData.append("attachment", file);
  formData.append("file", file);

  // Add request IDs
  requestIds.forEach((id) => formData.append("request_ids[]", id));

  // Config for file uploads
  const config = {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    skipErrorToast: true,
    timeout: 60000, // 60-second timeout for uploads
  };

  // Implementation with retry logic
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await api.post("/reposiciones", formData, config);
      // Clear cache of repositions on successful upload
      clearCache("/reposiciones");
      return response.data;
    } catch (error) {
      lastError = error;
      console.error(
        `File upload error (attempt ${attempt + 1}/${retries + 1}):`,
        error
      );

      // Log response data for diagnosis
      if (axios.isAxiosError(error)) {
        console.error("Response data:", error.response?.data);
      }

      // If this was the last attempt, throw the error
      if (attempt === retries) {
        throw error;
      }

      // Wait before retrying (exponential backoff)
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 * Math.pow(2, attempt))
      );
    }
  }

  throw lastError;
};

// API functions for requests
export const requestsApi = {
  // Fetch requests with filters
  fetchRequests: async (filters: RequestFilters = {}, useCache = true) => {
    const params: Record<string, string> = {};

    if (filters.period) params.period = filters.period;
    if (filters.project) params.project = filters.project;
    if (filters.type) params.type = filters.type;
    if (filters.status) params.status = filters.status;

    const data = await cachedGet("/requests", params, useCache);

    // Get user email from localStorage
    const user = JSON.parse(localStorage.getItem("user")!);
    const email = user?.email || null;

    // List of emails exempt from filtering
    const exemptEmails = [
      "ricardo.estrella@logex.ec",
      "jk@logex.ec",
      "diego.merisalde@logex.ec",
      "michelle.quintana@logex.ec",
      "nicolas.iza@logex.ec",
      "luis.espinosa@logex.ec",
    ];

    // Filter only if email is not in exempt list
    let result = data;
    if (!exemptEmails.includes(email)) {
      result = data.filter((item: any) => !item.unique_id.startsWith("P-"));
    }

    return result;
  },

  // Delete a request
  deleteRequest: async (id: string) => {
    const response = await api.delete(`/requests/${id}`);
    // Clear relevant caches
    clearCache("/requests");
    return response.data;
  },

  // Create reposition (send requests)
  createReposicion: async (requestIds: string[], file: File) => {
    const result = await onFileSubmit(requestIds, file);
    return result;
  },

  // Update a request
  updateRequest: async (id: string, data: RequestUpdateData) => {
    const response = await api.patch(`/requests/${id}`, data);
    // Clear relevant caches
    clearCache("/requests");
    clearCache(`/requests/${id}`);
    return response.data;
  },

  // Delete multiple requests
  deleteMultipleRequests: async (ids: string[]) => {
    // If only one ID, use singular endpoint for compatibility
    if (ids.length === 1) {
      return requestsApi.deleteRequest(ids[0]);
    }

    // For multiple IDs, use batch delete endpoint
    const response = await api.post("/requests/batch-delete", {
      request_ids: ids,
    });
    // Clear cache after batch delete
    clearCache("/requests");
    return response.data;
  },
};

// API functions for repositions
export const repositionsApi = {
  // Fetch repositions with filters
  fetchRepositions: async (
    filters: RepositionFilters = {},
    useCache = true
  ) => {
    const params: Record<string, string> = {};

    if (filters.mode) params.mode = filters.mode;
    if (filters.period) params.period = filters.period;
    if (filters.status) params.status = filters.status;

    const data = await cachedGet("/reposiciones", params, useCache);

    if (filters.mode === "income") {
      return data.filter((item: any) => !item.detail.includes("D-"));
    }

    // Filter to remove loans and income
    return data;
  },

  // Get reposition details (used by RepositionDetailsTableComponent)
  getRepositionDetails: async (reposicionId: number) => {
    // We intentionally don't cache this call as it's only triggered on user action
    const response = await api.get(`reposiciones/${reposicionId}`);
    clearCache(`/reposiciones/${reposicionId}`);
    clearCache(`/reposiciones`);
    return response.data.requests;
  },

  // Update a reposition
  updateReposition: async (id: string, data: RepositionUpdateData) => {
    const response = await api.patch(`/reposiciones/${id}`, data);
    // Clear relevant caches
    clearCache("/reposiciones");
    clearCache(`/reposiciones/${id}`);
    return response.data;
  },
};

export default api;
export { clearCache };
