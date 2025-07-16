/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  RepositionFilters,
  RepositionUpdateData,
  RequestFilters,
  RequestUpdateData,
} from "@/utils/types";
import axios from "axios";
import { toast } from "sonner";

// Create a simple cache mechanism
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

// Create axios instance with base configuration
const api = axios.create({
  // baseURL: process.env.NEXT_PUBLIC_API_URL,
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
  timeout: 120000, // Aumentado a 2 minutos para solicitudes masivas
});

// Interceptor global de respuestas
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const data = error.response?.data || {};

    const isAuthError =
      status === 401 ||
      (status === 500 &&
        typeof data.exception === "string" &&
        data.exception.includes("AuthenticationException")) ||
      data.message === "Unauthenticated.";

    if (isAuthError) {
      // 1) Limpio el user
      localStorage.removeItem("user");
      // 2) Marco la expiración para el login
      localStorage.setItem("sessionExpired", "1");
      // 3) Redirijo al login
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

// —> INTERCEPTOR: lee la cookie XSRF-TOKEN y la pone en el header
api.interceptors.request.use((config) => {
  const m = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
  if (m) {
    config.headers = config.headers ?? {};
    config.headers["X-XSRF-TOKEN"] = decodeURIComponent(m[1]);
  }
  return config;
});

// Interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const cfg = error.config || {};
    const url = cfg.url || "";
    const data = cfg.data;

    // Detectar batch operaciones cuando venga FormData con batch_data
    const isBatchOperation =
      url.includes("/requests") &&
      ((typeof data === "string" && data.includes("batch_data")) ||
        (data instanceof FormData && data.has("batch_data")));

    if (!isBatchOperation) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Error en la conexión con el servidor";
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
  const queryString = Object.keys(params)
    .map((key) => `${key}=${params[key]}`)
    .join("&");
  const cacheKey = `${url}?${queryString}`;

  if (enableCache && cache.has(cacheKey)) {
    const cachedResponse = cache.get(cacheKey)!;
    const now = Date.now();

    if (now - cachedResponse.timestamp < CACHE_TTL) {
      return cachedResponse.data;
    } else {
      cache.delete(cacheKey);
    }
  }

  const response = await api.get(url, { params });

  if (enableCache) {
    cache.set(cacheKey, {
      data: response.data,
      timestamp: Date.now(),
    });
  }

  return response.data;
};

// Clear cache function
const clearCache = (urlPattern?: string) => {
  if (urlPattern) {
    for (const key of cache.keys()) {
      if (key.includes(urlPattern)) {
        cache.delete(key);
      }
    }
  } else {
    cache.clear();
  }
};

// API functions for requests - OPTIMIZADO PARA MASIVOS
export const requestsApi = {
  // Fetch requests with filters
  fetchRequests: async (
    filters: RequestFilters = {},
    forceRefresh: boolean = false
  ) => {
    const params: Record<string, string> = {};

    if (filters.period) params.period = filters.period;
    if (filters.project) params.project = filters.project;
    if (filters.type) params.type = filters.type;
    if (filters.status) params.status = filters.status;

    const data = await cachedGet("/requests", params, !forceRefresh);

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
      result = data.filter(
        (item: any) =>
          !item.unique_id.startsWith("P-") && !item.unique_id.startsWith("I-")
      );
    }

    return result;
  },

  // Create single request - NUEVO MÉTODO UNIFICADO
  createRequest: async (requestData: any) => {
    try {
      const response = await api.post("/requests", requestData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      clearCache("/requests");
      return response.data;
    } catch (error: any) {
      console.error("Error creating single request:", error);
      // No mostrar toast automático, dejar que el componente lo maneje
      throw error;
    }
  },

  // Create batch requests - NUEVO MÉTODO PARA MASIVOS
  createBatchRequests: async (
    batchData: any[],
    onProgress?: (progress: {
      current: number;
      total: number;
      percentage: number;
    }) => void
  ) => {
    try {
      // Validar datos de entrada
      if (!Array.isArray(batchData) || batchData.length === 0) {
        throw new Error("Los datos del lote deben ser un array no vacío");
      }

      // Límite más realista para operaciones masivas
      const maxBatchSize = 1000; // Aumentado para permitir descuentos masivos
      if (batchData.length > maxBatchSize) {
        throw new Error(
          `El lote excede el máximo de ${maxBatchSize} registros. Actual: ${batchData.length}`
        );
      }

      console.log(`Enviando lote de ${batchData.length} registros`);

      // CORRECCIÓN: Usar el endpoint correcto para batch
      const response = await api.post(
        "/requests",
        {
          batch_data: batchData,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 600000, // 10 minutos para lotes muy grandes
          onUploadProgress: (progressEvent) => {
            if (onProgress && progressEvent.total) {
              const percentage = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              onProgress({
                current: progressEvent.loaded,
                total: progressEvent.total,
                percentage,
              });
            }
          },
        }
      );

      console.log(`Lote procesado exitosamente:`, response.data);
      clearCache("/requests");
      return response.data;
    } catch (error: any) {
      console.error("Error creating batch requests:", error);

      // Mejorar el manejo de errores
      if (!onProgress) {
        if (error.code === "ECONNABORTED") {
          toast.error(
            "Tiempo de espera agotado. El lote es muy grande, intenta dividirlo."
          );
        } else if (error.response?.status === 413) {
          toast.error(
            "El lote es demasiado grande. Reduce el número de registros."
          );
        } else if (error.response?.status === 422) {
          const errorData = error.response.data;
          const errorMessage = errorData.message || "Datos inválidos";
          toast.error(`Error de validación: ${errorMessage}`);

          // Log detalles de errores de validación para debugging
          if (errorData.results?.errors) {
            console.error(
              "Errores de validación detallados:",
              errorData.results.errors
            );
          }
        } else if (error.response?.status === 500) {
          toast.error("Error interno del servidor. Contacta al administrador.");
        } else {
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            "Error desconocido";
          toast.error(`Error al procesar lote: ${errorMessage}`);
        }
      }

      throw error;
    }
  },
  createBatchRequestsChunked: async (
    batchData: any[],
    chunkSize: number = 200,
    onProgress?: (progress: {
      current: number;
      total: number;
      percentage: number;
      chunk: number;
      totalChunks: number;
    }) => void
  ) => {
    const chunks = [];
    for (let i = 0; i < batchData.length; i += chunkSize) {
      chunks.push(batchData.slice(i, i + chunkSize));
    }

    const results = [];
    let processedItems = 0;

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];

      try {
        console.log(
          `Procesando chunk ${i + 1}/${chunks.length} (${chunk.length} items)`
        );

        const chunkResult = await api.post(
          "/requests/batch",
          {
            batch_data: chunk,
          },
          {
            headers: { "Content-Type": "application/json" },
            timeout: 300000, // 5 minutos por chunk
          }
        );

        results.push(chunkResult.data);
        processedItems += chunk.length;

        // Reportar progreso
        if (onProgress) {
          onProgress({
            current: processedItems,
            total: batchData.length,
            percentage: Math.round((processedItems / batchData.length) * 100),
            chunk: i + 1,
            totalChunks: chunks.length,
          });
        }

        // Pausa entre chunks para no sobrecargar el servidor
        if (i < chunks.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 segundo
        }
      } catch (error) {
        console.error(`Error en chunk ${i + 1}:`, error);
        throw new Error(
          `Error en chunk ${i + 1}: ${
            error instanceof Error ? error.message : "Error desconocido"
          }`
        );
      }
    }

    clearCache("/requests");

    // Consolidar resultados
    return {
      message: `${chunks.length} chunks procesados exitosamente`,
      chunks: results.length,
      total_items: processedItems,
      results: results,
    };
  },

  // Create requests with FormData (for file uploads) - MEJORADO
  createRequestWithFile: async (formData: FormData) => {
    try {
      const response = await api.post("/requests", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 60000,
      });

      clearCache("/requests");
      return response.data;
    } catch (error: any) {
      console.error("Error creating request with file:", error);
      // No mostrar toast automático, dejar que el componente lo maneje
      throw error;
    }
  },

  // Delete a request
  deleteRequest: async (id: string) => {
    const response = await api.delete(`/requests/${id}`);
    clearCache("/requests");
    return response.data;
  },

  // Update a request
  updateRequest: async (id: string, data: RequestUpdateData) => {
    const response = await api.patch(`/requests/${id}`, data);
    clearCache("/requests");
    clearCache(`/requests/${id}`);
    return response.data;
  },

  // Delete multiple requests
  deleteMultipleRequests: async (ids: string[]) => {
    if (ids.length === 1) {
      return requestsApi.deleteRequest(ids[0]);
    }

    const response = await api.post("/requests/batch-delete", {
      request_ids: ids,
    });
    clearCache("/requests");
    return response.data;
  },

  // Create reposition (send requests)
  createReposicion: async (requestIds: string[], file: File) => {
    const result = await onFileSubmit(requestIds, file);
    return result;
  },
};

// Helper function for handling different request types
export const createRequestHelper = {
  // For individual form submissions
  individual: async (data: FormData | Record<string, any>): Promise<any> => {
    if (data instanceof FormData) {
      // Si realmente hubiera adjunto:
      return await requestsApi.createRequestWithFile(data);
    }
    // Caso normal (descuento/ingreso): envía JSON
    return await requestsApi.createRequest(data);
  },

  // For mass form submissions (JSON data) - CORREGIDO
  batch: async (
    batchData: any[],
    onProgress?: (progress: {
      current: number;
      total: number;
      percentage: number;
    }) => void
  ) => {
    return await requestsApi.createBatchRequests(batchData, onProgress);
  },

  // AGREGADO: Método chunked que faltaba
  createBatchRequests: async (
    batchData: any[],
    onProgress?: (progress: {
      current: number;
      total: number;
      percentage: number;
    }) => void
  ) => {
    return await requestsApi.createBatchRequests(batchData, onProgress);
  },

  // AGREGADO: Método chunked que faltaba
  createBatchRequestsChunked: async (
    batchData: any[],
    chunkSize: number = 200,
    onProgress?: (progress: {
      current: number;
      total: number;
      percentage: number;
      chunk: number;
      totalChunks: number;
    }) => void
  ) => {
    return await requestsApi.createBatchRequestsChunked(
      batchData,
      chunkSize,
      onProgress
    );
  },

  // For single JSON submissions
  single: async (requestData: any) => {
    return await requestsApi.createRequest(requestData);
  },
};

// Existing file upload function (kept for compatibility)
export const onFileSubmit = async (
  requestIds: string[],
  file: File,
  retries = 2
): Promise<any> => {
  const formData = new FormData();
  formData.append("attachment", file);
  formData.append("file", file);
  requestIds.forEach((id) => formData.append("request_ids[]", id));

  const config = {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    timeout: 60000,
  };

  let lastError;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await api.post("/reposiciones", formData, config);
      clearCache("/reposiciones");
      return response.data;
    } catch (error) {
      lastError = error;
      console.error(
        `File upload error (attempt ${attempt + 1}/${retries + 1}):`,
        error
      );

      if (axios.isAxiosError(error)) {
        console.error("Response data:", error.response?.data);
      }

      if (attempt === retries) {
        throw error;
      }

      await new Promise((resolve) =>
        setTimeout(resolve, 1000 * Math.pow(2, attempt))
      );
    }
  }

  throw lastError;
};

// API functions for repositions (unchanged)
export const repositionsApi = {
  fetchRepositions: async (
    filters: RepositionFilters = {},
    forceRefresh: boolean = false
  ) => {
    const params: Record<string, string> = {};

    if (filters.mode) params.mode = filters.mode;
    if (filters.period) params.period = filters.period;
    if (filters.status) params.status = filters.status;

    const data = await cachedGet("/reposiciones", params, !forceRefresh);

    if (filters.mode === "income") {
      return data.filter((item: any) => {
        const hasDiscountRequests = item.requests?.some((req: any) =>
          req.unique_id?.startsWith("D-")
        );
        return !hasDiscountRequests;
      });
    }
    return data;
  },

  getRepositionDetails: async (reposicionId: number) => {
    const response = await api.get(`reposiciones/${reposicionId}`);
    clearCache(`/reposiciones/${reposicionId}`);
    clearCache(`/reposiciones`);
    return response.data.requests;
  },

  updateReposition: async (id: string, data: RepositionUpdateData) => {
    const response = await api.patch(`/reposiciones/${id}`, data);
    clearCache("/reposiciones");
    clearCache(`/reposiciones/${id}`);
    return response.data;
  },
};

// SRI API (existing functionality preserved)
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
    const docsToUpdate = documents.map((doc) => ({
      id: doc.id,
      valor_sin_impuestos:
        doc.valor_sin_impuestos === "" ? null : Number(doc.valor_sin_impuestos),
      iva: doc.iva === "" ? null : Number(doc.iva),
      importe_total:
        doc.importe_total === "" ? null : Number(doc.importe_total),
      identificacion_receptor: doc.identificacion_receptor,
    }));

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

  obtenerInfoDesdeClaveAcceso: async (claveAcceso: string) => {
    try {
      const toastId = toast.loading("Consultando información desde el SRI...");

      const response = await api.post("/sri/obtener-info-desde-clave", {
        claveAcceso,
      });

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

  consultarComprobanteSri: async (claveAcceso: string) => {
    try {
      const toastId = toast.loading("Consultando comprobante en el SRI...");

      const response = await api.post("/comprobantes/consultar", {
        claveAcceso,
      });

      toast.dismiss(toastId);

      if (response.data.success) {
        toast.success("Información de comprobante obtenida correctamente");
      } else {
        toast.error(
          response.data.message ||
            "Error al obtener información del comprobante"
        );
      }

      return response.data;
    } catch (error) {
      console.error("Error al consultar comprobante:", error);
      toast.error("Error al consultar información del comprobante en el SRI");
      return {
        success: false,
        message: "Error al obtener información del comprobante",
      };
    }
  },

  guardarComprobanteSri: async (claveAcceso: string) => {
    try {
      const toastId = toast.loading(
        "Guardando comprobante en la base de datos..."
      );

      const response = await api.post("/comprobantes/guardar", {
        claveAcceso,
      });

      toast.dismiss(toastId);

      if (response.data.success) {
        toast.success("Comprobante guardado correctamente");
      } else {
        toast.error(response.data.message || "Error al guardar el comprobante");
      }

      return response.data;
    } catch (error) {
      console.error("Error al guardar comprobante:", error);
      toast.error("Error al guardar el comprobante");
      return {
        success: false,
        message: "Error al guardar el comprobante",
      };
    }
  },

  guardarVariosComprobantesSri: async (clavesAcceso: string[]) => {
    try {
      if (clavesAcceso.length === 0) {
        toast.warning("No hay claves de acceso para guardar");
        return {
          success: false,
          message: "No hay claves de acceso para guardar",
        };
      }

      const toastId = toast.loading(
        `Guardando ${clavesAcceso.length} comprobantes en la base de datos...`
      );

      const response = await api.post("/comprobantes/guardar-varios", {
        clavesAcceso,
      });

      toast.dismiss(toastId);

      if (response.data.success) {
        toast.success(
          `${response.data.documentos.length} comprobantes guardados correctamente`
        );
      } else {
        toast.error(
          response.data.message || "Error al guardar los comprobantes"
        );
      }

      return response.data;
    } catch (error) {
      console.error("Error al guardar comprobantes:", error);
      toast.error("Error al guardar los comprobantes");
      return {
        success: false,
        message: "Error al guardar los comprobantes",
      };
    }
  },
};

// Reports API (existing functionality preserved)
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

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `reporte-${type}-${period}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();

    return true;
  },

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

// Contribuyentes API (existing functionality preserved)
export const contribuyentesApi = {
  getResumenContribuyentes: async () => {
    const response = await api.get("/contribuyentes");
    return response.data;
  },

  actualizarContribuyentes: async () => {
    const response = await api.post("/contribuyentes/actualizar");
    return response.data;
  },

  validarRuc: async (ruc: string) => {
    const response = await api.post("/contribuyentes/validar-ruc", { ruc });
    return response.data;
  },

  validarAutorizacion: async (autorizacion: string) => {
    const response = await api.post("/contribuyentes/validar-autorizacion", {
      autorizacion,
    });
    return response.data;
  },
};

export default api;
export { clearCache };
