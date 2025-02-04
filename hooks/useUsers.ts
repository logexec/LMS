import useSWR from "swr";
import { useState } from "react";

interface Permission {
  id: string;
  name: string;
}

interface Role {
  id: string;
  name: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role_id: string;
  permissions: Permission[];
}

interface UseUsersReturn {
  data: User[] | undefined;
  roles: Role[] | undefined;
  isLoading: boolean;
  error: any;
  createUser: (data: any) => Promise<void>;
  updateUser: (id: string, data: any) => Promise<void>;
  updatePermissions: (id: string, permissions: string[]) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  mutate: () => Promise<any>;
}

const fetcher = async (url: string) => {
  const response = await fetch(url, {
    credentials: "include",
  });
  if (!response.ok) throw new Error("Network response was not ok");
  return response.json();
};

export function useUsers(): UseUsersReturn {
  const [isLoading, setIsLoading] = useState(false);

  const {
    data: users,
    error,
    mutate,
  } = useSWR<User[]>(`${process.env.NEXT_PUBLIC_API_URL}/users`, fetcher);

  const { data: roles } = useSWR<Role[]>(
    `${process.env.NEXT_PUBLIC_API_URL}/roles`,
    fetcher
  );

  const createUser = async (data: any) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Error creating user");

      await mutate();
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (id: string, data: any) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) throw new Error("Error updating user");

      await mutate();
    } finally {
      setIsLoading(false);
    }
  };

  const updatePermissions = async (id: string, permissions: string[]) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${id}/permissions`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ permissions }),
        }
      );

      if (!response.ok) throw new Error("Error updating permissions");

      await mutate();
    } finally {
      setIsLoading(false);
    }
  };

  const deleteUser = async (id: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok) throw new Error("Error deleting user");

      await mutate();
    } finally {
      setIsLoading(false);
    }
  };

  return {
    data: users,
    roles,
    isLoading,
    error,
    createUser,
    updateUser,
    updatePermissions,
    deleteUser,
    mutate,
  };
}
