/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { fetchWithAuth } from "@/services/auth.service";

export const apiService = {
  // Users
  getUsers: () => fetchWithAuth(`/users`),
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
    console.log("📞 API Call: getProjects", { projectIds });
    try {
      const queryParams = projectIds?.length
        ? `?projects=${projectIds.join(",")}`
        : "";

      const endpoint = `/projects/${queryParams}`;
      console.log(`📞 API Endpoint: ${endpoint}`);

      const response = await fetchWithAuth(endpoint);
      console.log("📦 Raw projects API response:", response);

      // Garantizar que siempre devolvemos un array
      if (Array.isArray(response)) {
        return response;
      } else if (response && typeof response === "object") {
        if (Array.isArray(response.data)) {
          return response.data;
        }
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
};

export default apiService;
