/* eslint-disable @typescript-eslint/no-unused-vars */
import { useQuery } from "@tanstack/react-query";
import { apiService } from "@/services/api.service";
import { toast } from "sonner";

export interface Role {
  id: string;
  name: string;
}

export function useRoles() {
  return useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      try {
        const response = await apiService.getRoles();

        // Verificar si la respuesta es directamente un array
        if (Array.isArray(response)) {
          return response;
        }

        // Si es un objeto con estructura numerada (como el que mostraste)
        if (response && typeof response === "object") {
          // Si tiene la propiedad 'data' que es un array
          if (Array.isArray(response.data)) {
            return response.data;
          }

          // Si es un objeto con índices numéricos
          const rolesArray = Object.entries(response)
            .filter(([key]) => !isNaN(Number(key)))
            .map(([_, value]) => value as Role);

          if (rolesArray.length > 0) {
            return rolesArray;
          }
        }

        console.warn(
          "⚠️ Unexpected roles response format, defaulting to empty array"
        );
        return [];
      } catch (error) {
        console.error("❌ Error fetching roles:", error);
        toast.error("Error al cargar los roles");
        return []; // Siempre devolver array vacío en caso de error
      }
    },
    staleTime: 60000, // 1 minuto
  });
}
