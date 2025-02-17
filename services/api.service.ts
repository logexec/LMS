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
  getProjects: async () => {
    return await fetchWithAuth(`/projects`);
  },

  updateUserProjects: async (userId: string, projectIds: string[]) => {
    return await fetchWithAuth(`/users/${userId}/projects`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        project_ids: projectIds,
      }),
    });
  },
};

export default apiService;
