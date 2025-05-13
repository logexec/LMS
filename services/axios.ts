/* eslint-disable @typescript-eslint/no-explicit-any */

import axios from "axios";
import { toast } from "sonner";

// Create a simple cache mechanism
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  timeout: 30000, // Default 30-second timeout
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
  // Add more fields if needed
}

export interface RepositionFilters {
  period?: "last_week" | "last_month" | "all";
  project?: string;
  type?: "expense" | "discount" | "income" | "all";
  status?: "rejected" | "pending" | "paid" | "all";
  mode?: "all" | "income";
}

export interface RepositionUpdateData {
  total?: number;
  date?: Date;
  note: string;
  status: "rejected" | "paid";
  when?: string;
  month?: string;
}

/**
 * API for SRI document generation
 */
export const sriApi = {
  generateDocuments: async (folder: string, rows: Record<string, string>[]) => {
    const response = await api.post("/generate-documents", {
      folder,
      data: rows,
    });
    clearCache("/generate-documents");
    return response.data;
  },
};

/**
 * Enhanced file upload function with retry capability
 */
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

// Export the enhanced API instance and cache utilities
export default api;
export { clearCache };
