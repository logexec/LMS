import { useQuery } from "@tanstack/react-query";
import { fetchWithAuth } from "@/services/auth.service";

export const useRoles = () => {
  return useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      const response = await fetchWithAuth("/roles");
      return response || [];
    },
  });
};
