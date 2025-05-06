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
  type?: "discount" | "expense" | "income";
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
          method: "PATCH",
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
    requestIds: string[],
    attachment: File,
    formData?: FormData
  ): Promise<void> => {
    try {
      // Usar el FormData proporcionado si existe, de lo contrario crear uno nuevo
      const data = new FormData();

      // Solo llenar el FormData si es uno nuevo
      data.append("file", attachment, attachment.name);
      data.append("attachment", attachment, attachment.name);
      requestIds.forEach((id) => data.append("request_ids[]", id));

      console.log(
        "En handleCreateReposicion, usando FormData:",
        formData ? "recibido" : "creado nuevo"
      );

      // Para ver qué contiene el FormData
      for (const pair of data.entries()) {
        if (pair[1] instanceof File) {
          console.log(pair[0] + ": File", {
            name: pair[1].name,
            type: pair[1].type,
            size: pair[1].size,
          });
        } else {
          console.log(pair[0] + ": " + pair[1]);
        }
      }

      const response = await window.fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/reposiciones`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
            // IMPORTANTE: NO incluir Content-Type aquí
          },
          credentials: "include",
          body: data,
        }
      );

      if (!response.ok) {
        // Mostrar el cuerpo de la respuesta para diagnóstico
        const errorBody = await response.json();
        console.error("Error response from server:", errorBody);
        throw new Error(errorBody.message || "Error al crear la reposición");
      }

      toast.success("Reposición creada correctamente");
    } catch (error) {
      console.error("Error completo:", error);
      toast.error(
        error instanceof Error ? error.message : "Error al crear la reposición"
      );
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
          method: "PATCH",
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
    <div className="container mx-auto">
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
          type={type}
          onUpdateReposicion={handleUpdateReposicion}
        />
      )}
    </div>
  );
}
