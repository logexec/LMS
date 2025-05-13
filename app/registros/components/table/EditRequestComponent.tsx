/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { PencilIcon } from "lucide-react";
import { Request } from "@/contexts/TableContext";
import EditModal from "./EditModal";
import { requestsApi, clearCache } from "@/services/axios";
import { toast } from "sonner";
import { useContext } from "react";
import { TableContext } from "@/contexts/TableContext";
import axios from "axios";

interface EditRequestComponentProps {
  row: Request;
}

// Definiciones de tipos para los datos de formulario
interface AccountProps {
  id: string;
  name: string;
}

interface ResponsibleProps {
  id: string;
  nombre_completo: string;
}

interface TransportProps {
  vehicle_plate: string;
  vehicle_number: string;
}

const EditRequestComponent: React.FC<EditRequestComponentProps> = ({ row }) => {
  const [accounts, setAccounts] = useState<AccountProps[]>([]);
  const [responsibles, setResponsibles] = useState<ResponsibleProps[]>([]);
  const [vehicles, setVehicles] = useState<TransportProps[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { refreshData } = useContext(TableContext);

  // Cargar datos necesarios para el formulario cuando se abre el diálogo
  useEffect(() => {
    if (isOpen) {
      const fetchFormData = async () => {
        setIsLoading(true);
        try {
          // Obtener datos directamente usando axios en lugar de apiService
          const [accountsResponse, responsiblesResponse, vehiclesResponse] =
            await Promise.all([
              axios.get(`${process.env.NEXT_PUBLIC_API_URL}/accounts`, {
                withCredentials: true,
              }),
              axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/responsibles?fields=id,nombre_completo`,
                { withCredentials: true }
              ),
              axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/requests?fields=vehicle_plate,vehicle_number`,
                { withCredentials: true }
              ),
            ]);

          // Procesar datos de cuentas
          const accountsData =
            accountsResponse.data?.data || accountsResponse.data || [];
          const uniqueAccounts = new Map<string, AccountProps>();
          accountsData.forEach((item: any) => {
            if (item && item.name && !uniqueAccounts.has(item.name)) {
              uniqueAccounts.set(item.name, {
                id: item.id,
                name: item.name,
              });
            }
          });

          // Procesar datos de responsables
          const responsiblesData =
            responsiblesResponse.data?.data || responsiblesResponse.data || [];
          const uniqueResponsibles = new Map<string, ResponsibleProps>();
          responsiblesData.forEach((item: any) => {
            if (
              item &&
              item.nombre_completo &&
              !uniqueResponsibles.has(item.nombre_completo)
            ) {
              uniqueResponsibles.set(item.nombre_completo, {
                id: item.id,
                nombre_completo: item.nombre_completo,
              });
            }
          });

          // Procesar datos de vehículos
          const vehiclesData =
            vehiclesResponse.data?.data || vehiclesResponse.data || [];
          const uniqueVehicles = new Map<string, TransportProps>();
          vehiclesData.forEach((item: any) => {
            if (
              item &&
              item.vehicle_plate &&
              !uniqueVehicles.has(item.vehicle_plate)
            ) {
              uniqueVehicles.set(item.vehicle_plate, {
                vehicle_plate: item.vehicle_plate,
                vehicle_number: item.vehicle_number || "",
              });
            }
          });

          setAccounts(Array.from(uniqueAccounts.values()));
          setResponsibles(Array.from(uniqueResponsibles.values()));
          setVehicles(Array.from(uniqueVehicles.values()));
        } catch (error) {
          console.error("Error loading form data:", error);
          toast.error(
            "No se pudieron cargar los datos necesarios para el formulario."
          );
        } finally {
          setIsLoading(false);
        }
      };

      fetchFormData();
    }
  }, [isOpen]);

  const handleSave = async (updatedRow: Request) => {
    try {
      setIsLoading(true);

      // Preparamos los datos para la actualización
      const updateData = {
        request_date: updatedRow.request_date,
        invoice_number: updatedRow.invoice_number,
        account_id: updatedRow.account_id,
        amount:
          typeof updatedRow.amount === "number"
            ? String(updatedRow.amount) // Usamos String() en lugar de toString()
            : updatedRow.amount,
        project: updatedRow.project,
        responsible_id: updatedRow.responsible_id,
        vehicle_plate: updatedRow.vehicle_plate,
        vehicle_number: updatedRow.vehicle_number,
        note: updatedRow.note,
      };

      // Usamos requestsApi para actualizar
      await requestsApi.updateRequest(String(updatedRow.id), updateData);

      // Limpiamos la caché relacionada
      clearCache(`/reposiciones`);
      clearCache(`/requests`);

      toast.success("Solicitud actualizada correctamente");

      // Cerramos el modal
      setIsOpen(false);

      // Actualizamos los datos de la tabla
      if (refreshData) {
        refreshData();
      }
    } catch (error) {
      console.error("Error updating request:", error);
      toast.error(
        "No se pudo actualizar la solicitud. Por favor, inténtalo de nuevo."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Verificamos si la solicitud puede ser editada
  const canEdit = row.status !== "paid" && row.status !== "rejected";
  console.log(
    "Estado de la solicitud (no reposición) en la Base de Datos: ",
    row.status
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger
        className={`${
          !canEdit ? "opacity-50 cursor-not-allowed" : ""
        } flex flex-row space-x-2 justify-center items-center`}
        disabled={!canEdit || isLoading}
      >
        <PencilIcon className="size-4" />
        <span>Editar</span>
        <span className="sr-only">Editar solicitud</span>
      </DialogTrigger>

      {isOpen && (
        <EditModal
          row={row}
          onSave={handleSave}
          onClose={() => setIsOpen(false)}
          accounts={accounts}
          responsibles={responsibles}
          vehicles={vehicles}
        />
      )}
    </Dialog>
  );
};

export default EditRequestComponent;
