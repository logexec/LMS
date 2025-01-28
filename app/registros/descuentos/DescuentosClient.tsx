import React from "react";
import RequestsTable from "../components/RequestsTable";
import { toast } from "sonner";
import { Status } from "@/utils/types";

const DescuentosClient = () => {
  const handleStatusChange = async (id: number, status: Status) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/requests/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      if (!response.ok) throw new Error("Error al actualizar el estado");

      toast.success("Estado actualizado correctamente");
    } catch (error) {
      toast.error("Error al actualizar el estado");
    }
  };

  return (
    <div className="grid grid-rows-[auto_1fr] w-full h-full">
      <div className="flex flex-row justify-between px-5 items-center">
        <h1 className="title">Descuentos</h1>
      </div>
      <section className="w-full row-start-2 py-4 px-2">
        <RequestsTable
          mode="requests"
          type="discount"
          onStatusChange={handleStatusChange}
        />
      </section>
    </div>
  );
};

export default DescuentosClient;
