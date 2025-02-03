"use client";

import { getAuthToken } from "@/services/auth.service";
import { RequestsTable } from "./table/RequestsTable";
import {
  RequestProps,
  ReposicionProps,
  Status,
  ReposicionUpdateData,
} from "@/utils/types";
import { toast } from "sonner";
import React from "react";

interface ClientTableProps {
  mode: "requests" | "reposiciones";
  type?: "discount" | "expense";
  title?: string;
}

export default function ClientTable({ mode, type, title }: ClientTableProps) {
  // Para solicitudes individuales
  const handleStatusChange = async (
    id: number,
    status: Status
  ): Promise<void> => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/requests/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
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

  // Para crear reposición
  const handleCreateReposicion = async (
    requestIds: string[]
  ): Promise<void> => {
    try {
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
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al crear la reposición");
      }

      const data = await response.json();
      toast.success("Reposición creada correctamente");
    } catch (error: any) {
      toast.error(error.message || "Error al crear la reposición");
      throw error;
    }
  };

  // Para actualizar reposición
  const handleUpdateReposicion = async (
    id: number,
    updateData: ReposicionUpdateData,
    previousStatus: Status
  ): Promise<void> => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/reposiciones/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(updateData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Error al actualizar la reposición"
        );
      }

      toast.success("Reposición actualizada correctamente");
    } catch (error) {
      console.error("Error:", error);
      // Si hay error, intentamos revertir al estado anterior
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reposiciones/${id}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ status: previousStatus }),
        });
      } catch (revertError) {
        console.error("Error al revertir cambios:", revertError);
      }
      toast.error("Error al actualizar la reposición");
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
          onStatusChange={handleStatusChange}
          onCreateReposicion={handleCreateReposicion}
        />
      ) : (
        <RequestsTable<ReposicionProps>
          mode={mode}
          onUpdateReposicion={handleUpdateReposicion}
        />
      )}
    </div>
  );
}
