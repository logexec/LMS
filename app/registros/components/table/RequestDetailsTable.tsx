"use client";

import React, { JSX, useCallback, useEffect, useState, useMemo } from "react";
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
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
  Tooltip,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
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
  projectMap: Record<string, string>;
}

export const fetchAccounts = async (): Promise<AccountProps[]> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/accounts`,
      {
        credentials: "include",
      }
    );
    const text = await response.text();
    if (!response.ok) {
      throw new Error(`Error fetching accounts: ${response.status} - ${text}`);
    }
    const data = JSON.parse(text);
    const result =
      data.data && Array.isArray(data.data)
        ? data.data
        : Array.isArray(data)
        ? data
        : [];
    return result;
  } catch (error) {
    console.error("fetchAccounts error:", error);
    return [];
  }
};

export const fetchResponsibles = async (): Promise<ResponsibleProps[]> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/responsibles?fields=id,nombre_completo`,
      { credentials: "include" }
    );
    const text = await response.text();
    if (!response.ok) {
      throw new Error(
        `Error fetching responsibles: ${response.status} - ${text}`
      );
    }
    const data = JSON.parse(text);
    const result =
      data.data && Array.isArray(data.data)
        ? data.data
        : Array.isArray(data)
        ? data
        : [];
    return result;
  } catch (error) {
    console.error("fetchResponsibles error:", error);
    return [];
  }
};

export const fetchVehicles = async (): Promise<TransportProps[]> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/requests?fields=vehicle_plate,vehicle_number`,
      { credentials: "include" }
    );
    const text = await response.text();
    if (!response.ok) {
      throw new Error(`Error fetching vehicles: ${response.status} - ${text}`);
    }
    const data = JSON.parse(text);
    const result =
      data.data && Array.isArray(data.data)
        ? data.data
        : Array.isArray(data)
        ? data
        : [];
    return result;
  } catch (error) {
    console.error("fetchVehicles error:", error);
    return [];
  }
};

export interface FileMetadata {
  file_url: string;
  file_name: string;
}

const StatusBadge = ({ status }: { status: string }): JSX.Element => {
  const statusConfig: Record<string, { color: string; text: string }> = {
    paid: { color: "bg-green-100 text-green-800", text: "Pagado" },
    pending: { color: "bg-yellow-100 text-orange-800", text: "Pendiente" },
    rejected: { color: "bg-red-100 text-red-800", text: "Rechazado" },
    review: { color: "bg-sky-100 text-sky-800", text: "Revisar" },
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
  projectMap,
}: RequestDetailsTableProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [filteredRequests, setFilteredRequests] =
    useState<RequestProps[]>(requests);
  const [fileData, setFileData] = useState<FileMetadata | undefined>(undefined);

  const fetchFile = async (
    id: string | number
  ): Promise<FileMetadata | null> => {
    try {
      const response = await apiService.getRepositionFile(id.toString());
      if (response.status === 404) {
        console.warn("Archivo no encontrado para la reposición", id);
        return null;
      }
      if (!response.ok) {
        throw new Error("Error fetching file");
      }
      return response as FileMetadata;
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
        ...(repositionId ? [fetchFile(repositionId)] : []),
      ]);

      if (repositionId) {
        const fileResult = results[3];
        if (fileResult.status === "fulfilled") {
          setFileData(fileResult.value || undefined);
        } else if (fileResult.status === "rejected") {
          console.error("Error fetching file:", fileResult.reason);
        }
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

  const filterRequests = useCallback(
    (requests: RequestProps[], search: string) => {
      const searchLower = search.toLowerCase();
      return requests.filter((request) => {
        const valuesToSearch: string[] = [];

        if (request.unique_id) valuesToSearch.push(request.unique_id);
        if (request.type) {
          valuesToSearch.push(
            request.type === "discount" ? "Descuento" : "Gasto"
          );
        }
        if (request.personnel_type) {
          valuesToSearch.push(
            request.personnel_type === "nomina" ? "Nómina" : "Transporte"
          );
        }
        if (request.request_date) {
          valuesToSearch.push(
            new Date(request.request_date).toLocaleDateString("es-ES", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })
          );
        }
        if (request.status) {
          const statusText =
            {
              paid: "Pagado",
              pending: "Pendiente",
              rejected: "Rechazado",
              review: "Revisar",
              in_reposition: "En Reposición",
            }[request.status] || request.status;
          valuesToSearch.push(statusText);
        }
        if (request.invoice_number)
          valuesToSearch.push(request.invoice_number.toString());
        if ("account" in request && request.account) {
          const account = String(request.account);
          valuesToSearch.push(account);
        }
        if (request.amount) {
          valuesToSearch.push(
            `$${new Intl.NumberFormat("es-ES").format(request.amount)}`
          );
        }
        if (request.project) {
          const projectName = request.project;
          valuesToSearch.push(projectName);
        }
        if (request.responsible_id) {
          const responsibleName = request.responsible_id;
          valuesToSearch.push(responsibleName);
        }
        if (request.vehicle_plate) {
          const vehiclePlate: string = request.vehicle_plate;
          valuesToSearch.push(vehiclePlate);
        }
        if (request.vehicle_number) {
          const vehicleNumber = request.vehicle_number;
          valuesToSearch.push(vehicleNumber);
        }
        if (request.note) valuesToSearch.push(request.note);

        return valuesToSearch.some((value) =>
          value.toLowerCase().includes(searchLower)
        );
      });
    },
    []
  );

  useEffect(() => {
    setFilteredRequests(filterRequests(requests, searchTerm));
  }, [searchTerm, requests, filterRequests]);

  // Versión corregida de totalAmount usando useMemo para evitar recálculos innecesarios
  const totalAmount = useMemo(() => {
    return filteredRequests.reduce((sum, req) => {
      // Asegurarse de que amount se parsee correctamente a número
      const amount =
        typeof req.amount === "string"
          ? parseFloat(req.amount || "0")
          : typeof req.amount === "number"
          ? req.amount
          : 0;

      return sum + amount;
    }, 0);
  }, [filteredRequests]);

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
                  <div className="relative w-full aspect-[9/16] lg:aspect-[16/9] h-[70vh] 2xl:h-auto">
                    <object
                      key={fileData.file_name}
                      data={fileData.file_url}
                      className="absolute inset-0 w-full h-full"
                      type={
                        fileData.file_name.split(".").pop() === "pdf"
                          ? "application/pdf"
                          : fileData.file_name.split(".").pop() === "jpg"
                          ? "image/jpg"
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
                Mes/Rol
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
              {filteredRequests.some((request) => request.vehicle_plate) && (
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">
                  Placa
                </th>
              )}
              {filteredRequests.some((request) => request.vehicle_number) && (
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">
                  No. Transporte
                </th>
              )}
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">
                Observación
              </th>
            </tr>
          </thead>
          <tbody className="max-h-[90vh] overflow-hidden">
            <AnimatePresence mode="sync">
              {isLoading ? (
                <tr>
                  <td colSpan={14} className="text-center py-8">
                    <Loader fullScreen={false} text="Cargando datos..." />
                  </td>
                </tr>
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={14} className="text-center py-8 text-slate-500">
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
                    className="border-b hover:bg-slate-50 transition-colors group overflow-auto"
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
                      {request.month
                        ? request.month
                        : request.status === "in_reposition"
                        ? "Sin asignar"
                        : "No aplica"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={request.status} />
                    </td>
                    <td className="px-4 py-3">{request.invoice_number}</td>
                    <td className="px-4 py-3">
                      {request.account_id && request.account_id}
                    </td>
                    <td className="px-4 py-3 font-semibold text-red-700">
                      {(typeof request.amount === "string"
                        ? parseFloat(request.amount || "0")
                        : request.amount || 0
                      ).toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      {projectMap[request.project] || request.project}
                    </td>
                    {filteredRequests.some((r) => r.responsible_id) && (
                      <td className="px-4 py-3">
                        {request.responsible_id && request.responsible_id}
                      </td>
                    )}
                    {filteredRequests.some((r) => r.vehicle_plate) && (
                      <td className="px-4 py-3">
                        {request.vehicle_plate || "No encontrado"}
                      </td>
                    )}
                    {filteredRequests.some((r) => r.vehicle_number) && (
                      <td className="px-4 py-3">
                        {request.vehicle_number || "No encontrado"}
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
          {filteredRequests.length > 0 && (
            <tfoot>
              <tr className="bg-slate-50">
                <td
                  colSpan={8}
                  className="px-4 py-3 text-right font-semibold text-slate-600"
                >
                  Total:
                </td>
                <td className="px-4 py-3 font-semibold text-red-700">
                  ${new Intl.NumberFormat("es-ES").format(totalAmount)}
                </td>
                <td colSpan={5} className="px-4 py-3"></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </motion.div>
  );
};

const RequestDetailsTable = React.memo(RequestDetailsTableComponent);
export default RequestDetailsTable;
