"use client";

import { useQuery } from "@tanstack/react-query";
import { apiService } from "@/services/api.service";
import UserProfileComponent from "./UserComponent";
import { useAuth } from "@/hooks/useAuth";

const UserPage = () => {
  const currentUser = useAuth().user!.id;
  const {
    data: user,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["user", currentUser],
    queryFn: () => apiService.getUser(currentUser),
  });

  if (isLoading) return <p>Estamos cargando tus datos...</p>;
  if (error) return <p>Error al cargar usuario</p>;
  if (!user) return <p>No se encontró el usuario</p>;

  return <UserProfileComponent {...user} />;
};

export default UserPage;
