/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React from "react";
import { getAuthToken } from "@/services/auth.service";
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
}: TableContainerProps) {
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

  const handleCreateReposicion = async (
    requestIds: string[],
    attachment: File,
    formData?: FormData
  ): Promise<void> => {
    try {
      // Usar el FormData proporcionado si existe, de lo contrario crear uno nuevo
      const data = formData || new FormData();

      // Solo llenar el FormData si es uno nuevo
      if (!formData) {
        data.append("attachment", attachment, attachment.name);
        requestIds.forEach((id) => data.append("request_ids[]", id));
      }

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

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/reposiciones`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
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

  const handleUpdateReposicion = async (
    id: number,
    updateData: ReposicionUpdateData,
    _previousStatus: Status // Prefijo _ para indicar que no se usa actualmente
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

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Error al actualizar la reposición");
      }

      toast.success("Reposición actualizada correctamente");
    } catch (error) {
      console.error("Error updating reposición:", error);
      throw error instanceof Error
        ? error
        : new Error("Error al actualizar la reposición");
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
        <div className="grid grid-cols-4 gap-4">
          <div className="col-span-4">
            <RequestsTable<ReposicionProps>
              mode={mode}
              status={[
                Status.pending,
                Status.review,
                Status.paid,
                Status.rejected,
              ]}
              onUpdateReposicion={handleUpdateReposicion}
            />
          </div>
        </div>
      )}
    </div>
  );
}
