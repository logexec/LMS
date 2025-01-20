import { Permission, Role, SortConfig } from "@/utils/types";
import { User, UserFormData, ApiResponseRaw, ApiResponse } from "@/utils/types";

const API_BASE_URL = "http://127.0.0.1:8000/api";

export const fetchUsers = async (
  page: number = 1,
  sortConfig?: SortConfig<User>
): Promise<ApiResponse> => {
  const queryParams = new URLSearchParams({
    page: page.toString(),
  });

  if (sortConfig) {
    queryParams.append("sort_by", String(sortConfig.key));
    queryParams.append("sort_direction", sortConfig.direction);
  }

  const response = await fetch(`${API_BASE_URL}/users?${queryParams}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(response.statusText || "Error al cargar usuarios");
  }

  const responseData: ApiResponseRaw = await response.json();
  return responseData;
};

export const createUser = async (userData: UserFormData): Promise<User> => {
  const response = await fetch(`${API_BASE_URL}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    throw new Error("Error al crear usuario");
  }

  return response.json();
};

export const updateUser = async (
  id: string | number,
  userData: UserFormData
): Promise<User> => {
  const response = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    throw new Error("Error al actualizar usuario");
  }

  return response.json();
};

export const deleteUser = async (id: string | number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Error al eliminar usuario");
  }
};

export const fetchRoles = async (): Promise<Role[]> => {
  const response = await fetch(`${API_BASE_URL}/roles`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Error al cargar roles");
  }

  return response.json();
};

export const fetchPermissions = async (): Promise<Permission[]> => {
  const response = await fetch(`${API_BASE_URL}/permissions`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Error al cargar permisos");
  }

  return response.json();
};
