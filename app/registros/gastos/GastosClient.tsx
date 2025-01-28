"use client";
import RequestsTable from "../components/RequestsTable";
import { Status } from "@/utils/types";
import { toast } from "sonner";

const GastosClient = () => {
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
        <h1 className="title">Gastos</h1>
      </div>
      <section className="w-full row-start-2 py-4 px-2">
        <RequestsTable
          mode="requests"
          type="expense"
          onStatusChange={handleStatusChange}
        />
      </section>
    </div>
  );
};

export default GastosClient;
