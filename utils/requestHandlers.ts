import { getAuthToken } from "@/services/auth.service";
import { Status, ReposicionFormData } from "@/utils/types";
import { toast } from "sonner";

export const useRequestHandlers = (type: "expense" | "discount") => {
  const handleStatusChange = async (id: number, newStatus: Status) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/requests/${id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Error al actualizar el estado de la ${
            type === "expense" ? "solicitud de gasto" : "solicitud de descuento"
          }`
        );
      }

      toast.success(`Estado actualizado correctamente`);
      return true;
    } catch (error) {
      console.error("Error:", error);
      toast.error(
        `Error al actualizar el estado de la ${
          type === "expense" ? "solicitud de gasto" : "solicitud de descuento"
        }`
      );
      return false;
    }
  };

  const handleSendRequests = async (
    requestIds: string[],
    formData: ReposicionFormData
  ) => {
    try {
      // Primero verificamos que todas las solicitudes estén pagadas
      const requestsResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/requests?ids=${requestIds.join(
          ","
        )}`,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
          credentials: "include",
        }
      );

      if (!requestsResponse.ok) {
        throw new Error("Error al verificar el estado de las solicitudes");
      }

      const requests = await requestsResponse.json();
      const hasUnpaidRequests = requests.some(
        (req: any) => req.status !== "paid"
      );

      if (hasUnpaidRequests) {
        toast.error(
          "Todas las solicitudes deben estar pagadas para crear una reposición"
        );
        return false;
      }

      // Crear la reposición
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/reposiciones`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            request_ids: requestIds,
            ...formData,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Error al crear la reposición");
      }

      toast.success("Reposición creada correctamente");
      return true;
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al crear la reposición");
      return false;
    }
  };

  return {
    handleStatusChange,
    handleSendRequests,
  };
};

export const useReposicionHandlers = () => {
  const handleReposicionStatusChange = async (
    id: number,
    newStatus: Status
  ) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/reposiciones/${id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Error al actualizar el estado de la reposición");
      }

      // El backend se encargará de actualizar el estado de todas las solicitudes asociadas
      toast.success("Estado de la reposición actualizado correctamente");
      return true;
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al actualizar el estado de la reposición");
      return false;
    }
  };

  return {
    handleReposicionStatusChange,
  };
};
