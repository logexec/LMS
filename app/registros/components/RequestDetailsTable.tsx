"use client";
import { Download } from "lucide-react";
import {
  AccountProps,
  RequestProps,
  ResponsibleProps,
  TransportProps,
} from "@/utils/types";
import { useEffect } from "react";
import { useState } from "react";
import { toast } from "sonner";
import Loader from "@/app/Loader";

interface RequestDetailsTableProps {
  requests: RequestProps[];
}

const fetchAccounts = async () => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/accounts`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Error fetching accounts");
  }

  return response.json();
};

const fetchResponsibles = async () => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/responsibles?fields=id,nombre_completo`,
    {
      credentials: "include",
    }
  );

  if (!response.ok) {
    throw new Error("Error fetching responsibles");
  }

  return response.json();
};

const fetchVehicles = async () => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/transports?fields=id,name`,
    {
      credentials: "include",
    }
  );

  if (!response.ok) {
    throw new Error("Error fetching vehicles");
  }

  return response.json();
};

const RequestDetailsTable = ({ requests }: RequestDetailsTableProps) => {
  const [accounts, setAccounts] = useState<AccountProps[]>([]);
  const [responsibles, setResponsibles] = useState<ResponsibleProps[]>([]);
  const [vehicles, setVehicles] = useState<TransportProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [accountsData, responsiblesData, vehiclesData] =
          await Promise.all([
            fetchAccounts(),
            fetchResponsibles(),
            fetchVehicles(),
          ]);
        setAccounts(accountsData);
        setResponsibles(responsiblesData);
        setVehicles(vehiclesData);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Error al cargar los datos");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [requests]);

  // Mapear los datos para las columnas
  const accountMap = accounts.reduce((acc, account) => {
    acc[account.id] = account.name;
    return acc;
  }, {} as Record<string, string>);

  const responsibleMap = responsibles.reduce((acc, responsible) => {
    acc[responsible.id] = responsible.nombre_completo;
    return acc;
  }, {} as Record<string, string>);

  const vehicleMap = vehicles.reduce((acc, vehicle) => {
    acc[vehicle.id] = vehicle.name;
    return acc;
  }, {} as Record<string, string>);

  return (
    <div className="overflow-auto">
      <table className="w-full border-collapse my-4">
        <thead>
          <tr className="bg-slate-100">
            <th className="px-4 py-2 text-left">ID</th>
            <th className="px-4 py-2 text-left">Tipo</th>
            <th className="px-4 py-2 text-left">Area</th>
            <th className="px-4 py-2 text-left">Fecha de solicitud</th>
            <th className="px-4 py-2 text-left">Estado</th>
            <th className="px-4 py-2 text-left">Número de Factura</th>
            <th className="px-4 py-2 text-left">Cuenta</th>
            <th className="px-4 py-2 text-left">Monto</th>
            <th className="px-4 py-2 text-left">Proyecto</th>
            {requests.some((request) => request.responsible_id) && (
              <th className="px-4 py-2 text-left">Responsable</th>
            )}
            {requests.some((request) => request.transport_id) && (
              <th className="px-4 py-2 text-left">Transporte</th>
            )}
            <th className="px-4 py-2 text-left">Archivo Adjunto</th>
            <th className="px-4 py-2 text-left">Observación</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((request) => (
            <tr
              key={request.unique_id}
              className="border-b hover:bg-slate-50 text-left"
            >
              <td className="px-4 min-w-28 w-max">{request.unique_id}</td>
              <td className="px-4 min-w-fit">
                {request.type === "discount" ? "Descuento" : "Gasto"}
              </td>
              <td className="px-4 w-max">
                {request.personnel_type === "nomina" ? "Nómina" : "Transporte"}
              </td>
              <td className="px-4 min-w-36 w-max">
                {request.request_date &&
                  new Date(request.request_date).toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "2-digit",
                    year: "numeric",
                  })}
              </td>
              <td
                className={`min-w-24 w-fit rounded-full flex items-center justify-center my-9 border font-medium ${
                  request.status === "approved"
                    ? "text-green-600 border-green-600 bg-green-100"
                    : request.status === "pending"
                    ? "text-yellow-600 border-yellow-600 bg-yellow-100"
                    : request.status === "rejected"
                    ? "text-red-600 border-red-600 bg-red-100"
                    : request.status === "review"
                    ? "text-sky-600 border-sky-600 bg-sky-100"
                    : "text-indigo-600 border-indigo-600 bg-indigo-100"
                }`}
              >
                {request.status === "approved"
                  ? "Aprobado"
                  : request.status === "pending"
                  ? "Pendiente"
                  : request.status === "rejected"
                  ? "Rechazado"
                  : request.status === "review"
                  ? "Revisar"
                  : "Reposición"}
              </td>
              <td className="px-4 min-w-36 w-max">{request.invoice_number}</td>
              <td className="px-4 min-w-48 w-max">
                {request.account_id && !isLoading ? (
                  accountMap[request.account_id]
                ) : (
                  <Loader fullScreen={false} text="Cargando..." />
                )}
              </td>
              <td className="px-4 min-w-36 w-max text-left font-semibold text-red-700">
                ${new Intl.NumberFormat().format(request.amount)}
              </td>
              <td className="px-4 min-w-36 w-max">{request.project}</td>
              {requests.some((request) => request.responsible_id) && (
                <td className="px-4 min-w-36 w-max">
                  {request.responsible_id && !isLoading ? (
                    responsibleMap[request.responsible_id]
                  ) : (
                    <Loader fullScreen={false} text="Cargando..." />
                  )}
                </td>
              )}
              {requests.some((request) => request.transport_id) && (
                <td className="px-4 min-w-36 w-max">
                  {request.transport_id && !isLoading ? (
                    vehicleMap[request.transport_id]
                  ) : (
                    <Loader fullScreen={false} text="Cargando..." />
                  )}
                </td>
              )}
              <td className="px-4 min-w-36 w-max text-center">
                <a
                  href={`${process.env.NEXT_PUBLIC_API_URL}/${request.attachment_path}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-600 hover:text-sky-800 flex gap-2 items-center justify-center hover:underline hover:underline-offset-4"
                >
                  <Download className="inline h-5 w-5 mr-1" />
                  Descargar
                </a>
              </td>
              <td className="px-4 min-w-36 w-max">{request.note}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RequestDetailsTable;
