"use client";

import { RequestsTable } from "./table/RequestsTable";
import {
  RequestProps,
  ReposicionProps,
  Status,
  ReposicionUpdateData,
} from "@/utils/types";
import { toast } from "sonner";

interface TableContainerProps {
  mode: "requests" | "reposiciones";
  type?: "discount" | "expense";
  status?: Status | Status[];
  title: string;
}

export default function TableContainer({
  mode,
  type,
  title,
  status,
}: TableContainerProps) {
  // Para solicitudes individuales en tabla de gastos/descuentos
  const handleStatusChange = async (
    id: number,
    status: Status
  ): Promise<void> => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/requests/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ status }),
        }
      );

      if (!response.ok) {
        throw new Error("Error al actualizar el estado");
      }

      toast.success("Estado actualizado correctamente");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al actualizar el estado");
    }
  };

  // Para crear reposición desde gastos/descuentos
  const handleCreateReposicion = async (
    requestIds: string[]
  ): Promise<void> => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/reposiciones`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            request_ids: requestIds,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Error al crear la reposición");
      }

      toast.success("Reposición creada correctamente");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al crear la reposición");
    }
  };

  // Para actualizar estado de reposición (y sus solicitudes asociadas)
  const handleUpdateReposicion = async (
    id: number,
    data: ReposicionUpdateData,
    previousStatus: Status
  ): Promise<void> => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/reposiciones/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Error al actualizar la reposición"
        );
      }

      // No mostramos toast aquí porque se manejará en el componente de la tabla
    } catch (error) {
      console.error("Error:", error);
      // Si hay un error, intentamos revertir al estado anterior
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reposiciones/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ status: previousStatus }),
        });
      } catch (revertError) {
        console.error("Error al revertir cambios:", revertError);
      }
      throw error;
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-5">{title}</h1>
      {mode === "requests" ? (
        <RequestsTable<RequestProps>
          mode={mode}
          type={type}
          status={[Status.pending]}
          onStatusChange={handleStatusChange}
          onCreateReposicion={handleCreateReposicion}
        />
      ) : (
        <RequestsTable<ReposicionProps>
          mode={mode}
          status={[Status.pending, Status.review, Status.paid, Status.rejected]}
          onUpdateReposicion={handleUpdateReposicion}
        />
      )}
    </div>
  );
}
