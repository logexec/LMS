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
    attachment: File
  ): Promise<void> => {
    try {
      const formData = new FormData();
      formData.append("attachment", attachment);
      requestIds.forEach((id) => formData.append("request_ids[]", id));

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/reposiciones`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
          credentials: "include",
          body: formData,
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Error al crear la reposición");
      }

      toast.success("Reposición creada correctamente");
    } catch (error) {
      console.error("Error creating reposición:", error);
      throw error instanceof Error
        ? error
        : new Error("Error al crear la reposición");
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
