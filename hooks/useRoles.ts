import { useQuery } from "@tanstack/react-query";
import { apiService } from "@/services/api.service";
import { toast } from "sonner";

export interface Role {
  id: string | number;
  name: string;
}

export function useRoles() {
  return useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      try {
        const response = await apiService.getRoles();
        // Normalizar la respuesta
        const roles = Array.isArray(response)
          ? response
          : Array.isArray(response.data)
          ? response.data
          : Object.values(response).filter((item): item is Role =>
              Boolean(
                item &&
                  typeof item === "object" &&
                  "id" in item &&
                  "name" in item
              )
            );

        return roles.map((role) => ({
          id: role.id.toString(), // Normalizar id como string
          name: role.name || "Sin nombre",
        }));
      } catch (error) {
        console.error("❌ Error fetching roles:", error);
        toast.error("Error al cargar los roles");
        return [];
      }
    },
    staleTime: 60000, // 1 minuto
  });
}
