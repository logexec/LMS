"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiService } from "@/services/api.service";
import UserProfileComponent from "./UserComponent";
import { useAuth } from "@/hooks/useAuth";

const UserPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const currentUser = String(user?.id);

  const initialUserData = currentUser
    ? {
        id: user!.id,
        name: user!.nombre,
        email: user!.email,
        dob: user!.dob,
        phone: user!.phone,
        role: user!.rol,
      }
    : undefined;

  const {
    data: userData = initialUserData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["user", currentUser],
    queryFn: () => apiService.getUser(currentUser!),
    initialData: initialUserData,
    enabled: !!currentUser,
    staleTime: 5 * 60 * 1000,
  });

  if (!user || !currentUser) {
    return <p>No estás autenticado. Por favor, inicia sesión.</p>;
  }

  if (isLoading && !userData) return <p>Estamos cargando tus datos...</p>;
  if (error) return <p>Error al cargar usuario: {(error as Error).message}</p>;

  return (
    <UserProfileComponent
      {...userData}
      onProfileUpdate={() =>
        queryClient.invalidateQueries({ queryKey: ["user", currentUser] })
      }
    />
  );
};

export default UserPage;
