/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { fetchWithAuth } from "@/services/auth.service";

export const apiService = {
  // Users
  getUsers: () => fetchWithAuth(`/users`),
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
};

export default apiService;
