"use client";

import React, { JSX, useCallback, useEffect, useState } from "react";
import { Download, Paperclip, RefreshCw, Search } from "lucide-react";
import {
  AccountProps,
  RequestProps,
  ResponsibleProps,
  TransportProps,
} from "@/utils/types";
import { toast } from "sonner";
import Loader from "@/app/Loader";
import { motion, AnimatePresence } from "motion/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { getAuthToken } from "@/services/auth.service";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import apiService from "@/services/api.service";

interface RequestDetailsTableProps {
  requests: RequestProps[];
  repositionId?: number | string;
}

export const fetchAccounts = async (): Promise<AccountProps[]> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/accounts`, {
    headers: {
      Authorization: `Bearer ${getAuthToken()}`,
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Error fetching accounts");
  }

  return response.json();
};

export const fetchResponsibles = async (): Promise<ResponsibleProps[]> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/responsibles?fields=id,nombre_completo`,
    {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
      credentials: "include",
    }
  );

  if (!response.ok) {
    throw new Error("Error fetching responsibles");
  }

  return response.json();
};

export const fetchVehicles = async (): Promise<TransportProps[]> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/transports?fields=id,name`,
    {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
      credentials: "include",
    }
  );

  if (!response.ok) {
    throw new Error("Error fetching vehicles");
  }

  return response.json();
};

export interface FileMetadata {
  file_url: string;
  file_name: string;
}

const StatusBadge = ({ status }: { status: string }): JSX.Element => {
  const statusConfig: Record<string, { color: string; text: string }> = {
    paid: {
      color: "bg-green-100 text-green-800",
      text: "Pagado",
    },
    pending: {
      color: "bg-yellow-100 text-orange-800",
      text: "Pendiente",
    },
    rejected: {
      color: "bg-red-100 text-red-800",
      text: "Rechazado",
    },
    review: {
      color: "bg-sky-100 text-sky-800",
      text: "Revisar",
    },
    in_reposition: {
      color: "bg-indigo-100 text-indigo-800",
      text: "En Reposición",
    },
  };

  const config = statusConfig[status] || {
    color: "bg-gray-100 text-gray-800",
    text: status,
  };

  return (
    <Badge
      variant="outline"
      className={`${config.color} transition-all duration-200 hover:scale-105`}
    >
      {config.text}
    </Badge>
  );
};

const RequestDetailsTableComponent = ({
  requests,
  repositionId,
}: RequestDetailsTableProps) => {
  const [accounts, setAccounts] = useState<AccountProps[]>([]);
  const [responsibles, setResponsibles] = useState<ResponsibleProps[]>([]);
  const [vehicles, setVehicles] = useState<TransportProps[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [filteredRequests, setFilteredRequests] =
    useState<RequestProps[]>(requests);
  const [fileData, setFileData] = useState<FileMetadata>();

  const fetchFile = async (id: string | number) => {
    try {
      const response = await apiService.getRepositionFile(id.toString());
      if (response.status === 404) {
        console.warn("Archivo no encontrado para la reposición", id);
        return null;
      }
      if (!response.ok) {
        throw new Error("Error fetching file");
      }
      return response;
    } catch (error) {
      console.error("Error fetching file:", error);
      return null;
    }
  };

  const loadData = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const results = await Promise.allSettled([
        fetchAccounts(),
        fetchResponsibles(),
        fetchVehicles(),
        fetchFile(repositionId!),
      ]);

      if (results[0].status === "fulfilled") setAccounts(results[0].value);
      else toast.error("Error al cargar cuentas");

      if (results[1].status === "fulfilled") setResponsibles(results[1].value);
      else toast.error("Error al cargar responsables");

      if (results[2].status === "fulfilled") setVehicles(results[2].value);
      else toast.error("Error al cargar vehículos");

      if (results[3].status === "fulfilled") setFileData(results[3].value);
      else {
        console.error("Error fetching file:", results[3].reason);
        setFileData(undefined);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Error al cargar los datos");
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
    }
  }, [repositionId]);

  const [hasLoaded, setHasLoaded] = useState(false);
  useEffect(() => {
    if (!hasLoaded) {
      loadData().then(() => setHasLoaded(true));
    }
  }, [loadData, hasLoaded]);

  useEffect(() => {
    const filtered = requests.filter((request) =>
      Object.values(request).some(
        (value) =>
          value &&
          value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setFilteredRequests(filtered);
  }, [searchTerm, requests]);

  const accountMap = accounts.reduce<Record<string, string>>((acc, account) => {
    acc[account.id] = account.name;
    return acc;
  }, {});

  const responsibleMap = responsibles.reduce<Record<string, string>>(
    (acc, responsible) => {
      acc[responsible.id] = responsible.nombre_completo;
      return acc;
    },
    {}
  );

  const vehicleMap = vehicles.reduce<Record<string, string>>((acc, vehicle) => {
    acc[vehicle.id] = vehicle.name;
    return acc;
  }, {});

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-row gap-3 w-96">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4"
            />
          </div>
          <AlertDialog>
            <AlertDialogTrigger
              className="px-4 py-2 rounded text-sm font-semibold transition-all duration-200 active:scale-[.99] flex flex-row gap-1 shadow disabled:opacity-50 disabled:cursor-progress"
              disabled={!fileData}
            >
              <Paperclip className="h-5 w-5 mr-2" />
              Archivo adjunto
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-white max-h-[90vh] max-w-6xl">
              <AlertDialogHeader>
                <AlertDialogTitle>Respaldo de reposición</AlertDialogTitle>
              </AlertDialogHeader>
              <div>
                {fileData === null ? (
                  <p className="text-center">
                    No se encontró archivo adjunto para esta reposición.
                  </p>
                ) : fileData ? (
                  <div className="relative w-full aspect-[9/16] lg:aspect-[16/9] h-[60vh] md:h-auto">
                    <object
                      key={fileData.file_name}
                      data={fileData.file_name}
                      className="absolute inset-0 w-full h-full"
                      type={
                        fileData.file_name.split(".").pop() === "pdf"
                          ? "application/pdf"
                          : fileData.file_name.split(".").pop() === "jpg"
                          ? "application/jpg"
                          : fileData.file_name.split(".").pop() === "jpeg"
                          ? "image/jpeg"
                          : fileData.file_name.split(".").pop() === "png"
                          ? "image/png"
                          : "application/octet-stream"
                      }
                    >
                      <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center">
                        <p className="text-center mb-4">
                          No se puede mostrar el contenido del archivo
                        </p>
                        <a
                          href={fileData.file_url}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-red-600 text-white rounded-md flex flex-row gap-2 items-center"
                        >
                          <Download /> Descargar documento adjunto
                        </a>
                      </div>
                    </object>
                  </div>
                ) : (
                  <p className="text-center">Cargando archivo...</p>
                )}
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel>Cerrar</AlertDialogCancel>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={loadData}
                disabled={isRefreshing}
              >
                <RefreshCw
                  className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Actualizar datos</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="overflow-auto rounded-lg border shadow-sm">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-50">
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">
                ID
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">
                Tipo
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">
                Area
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">
                Fecha
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">
                Estado
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">
                Factura
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">
                Cuenta
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">
                Monto
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">
                Proyecto
              </th>
              {filteredRequests.some((request) => request.responsible_id) && (
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">
                  Responsable
                </th>
              )}
              {filteredRequests.some((request) => request.transport_id) && (
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">
                  Transporte
                </th>
              )}
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">
                Observación
              </th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence mode="sync">
              {isLoading ? (
                <tr>
                  <td colSpan={12} className="text-center py-8">
                    <Loader fullScreen={false} text="Cargando datos..." />
                  </td>
                </tr>
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={12} className="text-center py-8 text-slate-500">
                    No se encontraron resultados
                  </td>
                </tr>
              ) : (
                filteredRequests.map((request) => (
                  <motion.tr
                    key={request.unique_id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="border-b hover:bg-slate-50 transition-colors group"
                  >
                    <td className="px-4 py-3">{request.unique_id}</td>
                    <td className="px-4 py-3">
                      {request.type === "discount" ? "Descuento" : "Gasto"}
                    </td>
                    <td className="px-4 py-3">
                      {request.personnel_type === "nomina"
                        ? "Nómina"
                        : "Transporte"}
                    </td>
                    <td className="px-4 py-3">
                      {request.request_date &&
                        new Date(request.request_date).toLocaleDateString(
                          "es-ES",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          }
                        )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={request.status} />
                    </td>
                    <td className="px-4 py-3">{request.invoice_number}</td>
                    <td className="px-4 py-3">
                      {request.account_id && accountMap[request.account_id]}
                    </td>
                    <td className="px-4 py-3 font-semibold text-red-700">
                      ${new Intl.NumberFormat("es-ES").format(request.amount)}
                    </td>
                    <td className="px-4 py-3">{request.project}</td>
                    {filteredRequests.some((r) => r.responsible_id) && (
                      <td className="px-4 py-3">
                        {request.responsible_id &&
                          responsibleMap[request.responsible_id]}
                      </td>
                    )}
                    {filteredRequests.some((r) => r.transport_id) && (
                      <td className="px-4 py-3">
                        {request.transport_id &&
                          vehicleMap[request.transport_id]}
                      </td>
                    )}
                    <td className="px-4 py-3 max-w-xs truncate">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger className="text-left">
                            {request.note}
                          </TooltipTrigger>
                          <TooltipContent>{request.note}</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </td>
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

const RequestDetailsTable = React.memo(RequestDetailsTableComponent);

export default RequestDetailsTable;
