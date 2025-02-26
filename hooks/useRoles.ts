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
        console.log("🔍 Fetching roles...");
        const response = await apiService.getRoles();
        console.log("📦 Raw roles response:", response);

        // Verificar si la respuesta es directamente un array
        if (Array.isArray(response)) {
          console.log("✅ Roles response is a direct array");
          return response;
        }

        // Si es un objeto con estructura numerada (como el que mostraste)
        if (response && typeof response === "object") {
          // Si tiene la propiedad 'data' que es un array
          if (Array.isArray(response.data)) {
            console.log("✅ Roles has a data property that is an array");
            return response.data;
          }

          // Si es un objeto con índices numéricos
          const rolesArray = Object.entries(response)
            .filter(([key]) => !isNaN(Number(key)))
            .map(([_, value]) => value as Role);

          if (rolesArray.length > 0) {
            console.log("✅ Roles extracted from object with numeric keys");
            return rolesArray;
          }
        }

        console.log(
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
