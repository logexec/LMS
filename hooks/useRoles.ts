/* eslint-disable @typescript-eslint/no-unused-vars */
import { useQuery } from "@tanstack/react-query";
import { apiService } from "@/services/api.service";
import { Role } from "@/types/dialogs";
import { toast } from "sonner";

export function useRoles() {
  return useQuery<Role[]>({
    queryKey: ["roles"],
    queryFn: async () => {
      try {
        const response = await apiService.getRoles();

        if (Array.isArray(response)) {
          return response;
        }

        if (response && typeof response === "object") {
          if (Array.isArray(response.data)) {
            return response.data;
          }

          const rolesArray = Object.entries(response)
            .filter(([key]) => !isNaN(Number(key)))
            .map(([_, value]) => value as Role);

          if (rolesArray.length > 0) {
            return rolesArray;
          }
        }

        console.warn("⚠️ Unexpected roles response format, defaulting to empty array");
        return [];
      } catch (error) {
        console.error("❌ Error fetching roles:", error);
        toast.error("Error al cargar los roles");
        return [];
      }
    },
    staleTime: 60000,
  });
}
