import api from "@/services/axios";
import { Permission, Role, SortConfig } from "@/utils/types";
import { User, UserFormData, ApiResponseRaw, ApiResponse } from "@/utils/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

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

  const response = await api.get(`${API_BASE_URL}/users`, {
    params: {
      queryParams,
    },
  });

  if (response.status !== 200) {
    throw new Error(response.statusText || "Error al cargar usuarios");
  }

  const responseData: ApiResponseRaw = await response.data;
  return responseData;
};

export const createUser = async (userData: UserFormData): Promise<User> => {
  const response = await api.post(`${API_BASE_URL}/users`, {
    body: JSON.stringify(userData),
  });

  if (response.status !== 200) {
    throw new Error("Error al crear usuario");
  }

  return response.data;
};

export const updateUser = async (
  id: string | number,
  userData: UserFormData
): Promise<User> => {
  const response = await api.put(`${API_BASE_URL}/users/`, {
    params: {
      id
    },
    body: JSON.stringify(userData),
  });

  if (response.status !== 200) {
    throw new Error("Error al actualizar usuario");
  }

  return response.data;
};

export const deleteUser = async (id: string | number): Promise<void> => {
  const response = await api.delete(`${API_BASE_URL}/users/`, {
    params: {
      id
    }
  });

  if (response.status !== 200) {
    throw new Error("Error al eliminar usuario");
  }
};

export const fetchRoles = async (): Promise<Role[]> => {
  const response = await api.get(`${API_BASE_URL}/roles`);

  if (response.status !== 200) {
    throw new Error("Error al cargar roles");
  }

  return response.data;
};

export const fetchPermissions = async (): Promise<Permission[]> => {
  const response = await api.get(`${API_BASE_URL}/permissions`);

  if (response.status !== 200) {
    throw new Error("Error al cargar permisos");
  }

  return response.data;
};
