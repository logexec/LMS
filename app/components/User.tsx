"use client";

import { useEffect, useState } from "react";
import Loader from "../Loader";

interface Pivot {
  user_id: string;
  permission_id: string;
}

interface Permission {
  id: string;
  name: string;
  pivot: Pivot[];
}

interface UsersProps {
  id: string;
  role_id: string;
  name: string;
  email: string;
  permissions: Permission[];
}

const fetchUsers = async (): Promise<UsersProps[]> => {
  const response = await fetch("http://localhost:8000/api/users", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch users");
  }

  const data = await response.json();
  return data;
};

const User = () => {
  const [users, setUsers] = useState<UsersProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const users = await fetchUsers();
        setUsers(users);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return <Loader fullScreen={false} text="Cargando usuarios..." />;
  }

  return <>{users.length}</>;
};

export default User;
