/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { JSX, useCallback, useEffect, useState, useMemo } from "react";
import {
  Download,
  Paperclip,
  RefreshCw,
  Search,
  Edit2,
  Loader2,
  SortAsc,
  SortDesc,
} from "lucide-react";
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
import { Dialog } from "@/components/ui/dialog";
import apiService from "@/services/api.service";
import {
  ColumnDef,
  ColumnSizingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";

// Componente EditModal
import EditModal from "./EditModal";

interface RequestDetailsTableProps {
  requests: RequestProps[];
  repositionId?: number | string;
  projectMap: Record<string, string>;
}

// Variable global para controlar si ya se ha realizado la carga
let hasInitialDataBeenFetched = false;

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

  // Almacenamos los datos con un solo fetch
  const [accountsList, setAccountsList] = useState<AccountProps[]>([]);
  const [responsiblesList, setResponsiblesList] = useState<ResponsibleProps[]>(
    []
  );
  const [vehiclesList, setVehiclesList] = useState<TransportProps[]>([]);

  // Estado para modal
  const [selectedRow, setSelectedRow] = useState<RequestProps | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [modalPreparing, setModalPreparing] = useState(false);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnSizing, setColumnSizing] = useState<ColumnSizingState>({});

  // Función para eliminar duplicados
  const removeDuplicates = <T extends Record<string, any>>(
    array: T[],
    key: string
  ): T[] => {
    const uniqueMap = new Map();
    return array.filter((item) => {
      const val = item[key];
      if (val && !uniqueMap.has(val)) {
        uniqueMap.set(val, true);
        return true;
      }
      return false;
    });
  };

  // Fetch del archivo
  const fetchFile = async (
    id: string | number
  ): Promise<FileMetadata | null> => {
    try {
      const response = await apiService.getRepositionFile(id.toString());
      if (response.status === 404) {
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

  // Función para cargar datos una sola vez (con variable estática global)
  const loadData = useCallback(async () => {
    // Bloquear múltiples llamadas
    if (isRefreshing || hasInitialDataBeenFetched) {
      return;
    }

    console.log("Iniciando fetch de datos...");
    setIsRefreshing(true);

    try {
      // Realizar todos los fetches en paralelo
      const [accounts, responsibles, vehicles, file] = await Promise.all([
        apiService.fetchAccounts(),
        apiService.fetchResponsibles(),
        apiService.fetchVehicles(),
        repositionId ? fetchFile(repositionId) : Promise.resolve(null),
      ]);

      console.log(
        `Datos cargados: Cuentas=${accounts.length}, Responsables=${responsibles.length}, Vehículos=${vehicles.length}`
      );

      // Eliminar duplicados usando nuestra función
      const uniqueAccounts = removeDuplicates(accounts, "id");
      const uniqueResponsibles = removeDuplicates(responsibles, "id");
      const uniqueVehicles = removeDuplicates(
        vehicles.filter((v) => v.vehicle_plate),
        "vehicle_plate"
      );

      // Actualizar estado con datos sin duplicados
      setAccountsList(uniqueAccounts);
      setResponsiblesList(uniqueResponsibles);
      setVehiclesList(uniqueVehicles);

      if (file) {
        setFileData(file);
      }

      // Marcar que ya se ha realizado el fetch (global)
      hasInitialDataBeenFetched = true;
    } catch (error) {
      console.error("Error cargando datos:", error);
      toast.error("Error al cargar los datos");
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
    }
  }, [repositionId, isRefreshing]);

  // Solo ejecutamos loadData una vez cuando el componente se monta
  useEffect(() => {
    if (!hasInitialDataBeenFetched) {
      console.log("Realizando fetch inicial");
      loadData();
    } else {
      console.log("Datos ya cargados, omitiendo fetch");
      setIsLoading(false);
    }

    // Limpieza al desmontar el componente - resetear para futuras instancias
    return () => {
      // Mantenemos hasInitialDataBeenFetched como está para que persista entre renders
    };
  }, [loadData]);

  // Filtrado de solicitudes (memoizado)
  const filterRequests = useCallback(
    (requests: RequestProps[], search: string) => {
      if (!search.trim()) return requests;

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
          valuesToSearch.push(new Date(request.request_date).toISOString());
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
          const projectName = Array.isArray(request.project)
            ? request.project.join(" ")
            : request.project.includes(",")
            ? request.project.split(",").join(" ")
            : request.project;

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

  // Actualizar filteredRequests cuando cambie el término de búsqueda o las solicitudes
  useEffect(() => {
    setFilteredRequests(
      searchTerm ? filterRequests(requests, searchTerm) : requests
    );
  }, [searchTerm, requests, filterRequests]);

  // Calcular el monto total (memoizado)
  const totalAmount = useMemo(() => {
    return filteredRequests.reduce((sum, req) => {
      const amount =
        typeof req.amount === "string"
          ? parseFloat(req.amount || "0")
          : typeof req.amount === "number"
          ? req.amount
          : 0;
      return sum + amount;
    }, 0);
  }, [filteredRequests]);

  // Función para manejar clic en botón de editar
  const handleEditClick = (row: RequestProps) => {
    setModalPreparing(true);

    // Retrasar ligeramente para permitir la actualización de UI
    requestAnimationFrame(() => {
      setSelectedRow(row);
      setIsEditModalOpen(true);
      setModalPreparing(false);
    });
  };

  // Función para manejar guardado de cambios
  const handleSave = async (updatedRow: RequestProps) => {
    const rowId = updatedRow.unique_id;
    const originalRequestIndex = filteredRequests.findIndex(
      (r) => r.unique_id === rowId
    );
    if (originalRequestIndex === -1) return;

    // Guardar una copia del estado original
    const originalRequests = [...filteredRequests];

    // Actualización optimista
    setFilteredRequests((prev) =>
      prev.map((r) => (r.unique_id === rowId ? updatedRow : r))
    );

    try {
      await apiService.updateRequest(rowId, updatedRow);
      toast.success("Registro actualizado correctamente");
    } catch (error) {
      // Restaurar el estado original en caso de fallo
      console.error("Error al guardar los cambios:", error);
      toast.error(
        error instanceof Error ? error.message : "Error al guardar los cambios."
      );
      setFilteredRequests(originalRequests);
      toast.error("Error al guardar los cambios");
    } finally {
      setIsEditModalOpen(false);
      setSelectedRow(null);
    }
  };

  // Refrescar datos manualmente
  const handleRefreshData = () => {
    hasInitialDataBeenFetched = false;
    loadData();
  };

  // Columnas para la tabla
  const columns = useMemo<ColumnDef<RequestProps>[]>(
    () => [
      {
        accessorKey: "unique_id",
        header: "ID",
        cell: ({ row }) => (
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger>
                <div className="text-center max-w-[40px] truncate">
                  {row.original.unique_id}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <div>{row.original.unique_id}</div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ),
        size: 40,
        enableResizing: false,
        enableSorting: true,
        sortingFn: "alphanumeric",
      },
      {
        accessorKey: "type",
        header: "Tipo",
        cell: ({ row }) => (
          <div className="truncate text-center max-w-[80px]">
            {row.original.type === "discount" ? "Descuento" : "Gasto"}
          </div>
        ),
        size: 80,
        enableResizing: false,
      },
      {
        accessorKey: "personnel_type",
        header: "Area",
        cell: ({ row }) => (
          <div className="truncate text-center max-w-[80px]">
            {row.original.personnel_type === "nomina" ? "Nómina" : "Transporte"}
          </div>
        ),
        size: 80,
        enableResizing: true,
      },
      {
        accessorKey: "request_date",
        header: "Fecha",
        cell: ({ row }) => (
          <div className="truncate max-w-[150px]">
            {row.original.request_date &&
              new Date(row.original.request_date).toLocaleDateString("es-ES", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
          </div>
        ),
        minSize: 50,
        maxSize: 150,
        size: 100,
        enableResizing: true,
        enableSorting: true,
        sortingFn: "datetime",
      },
      {
        accessorKey: "month",
        header: "Mes/Rol",
        cell: ({ row }) => (
          <div className="text-center truncate max-w-[130px]">
            {row.original.month || "—"}
          </div>
        ),
        minSize: 80,
        maxSize: 130,
        size: 100,
        enableResizing: true,
        enableSorting: true,
        sortingFn: "datetime",
      },
      {
        accessorKey: "status",
        header: "Estado",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
        minSize: 100,
        maxSize: 180,
        size: 120,
        enableResizing: true,
      },
      {
        accessorKey: "invoice_number",
        header: "Factura",
        cell: ({ row }) => (
          <div className="truncate text-center max-w-[180px]">
            {row.original.invoice_number}
          </div>
        ),
        minSize: 100,
        maxSize: 180,
        size: 120,
        enableResizing: true,
        enableSorting: true,
        sortingFn: "auto",
      },
      {
        accessorKey: "account_id",
        header: "Cuenta",
        cell: ({ row, column }) => (
          <div
            className="truncate max-w-[420px]"
            style={{ width: column.getSize() }}
          >
            {row.original.account_id}
          </div>
        ),
        minSize: 100,
        maxSize: 420,
        size: 120,
        enableResizing: true,
        enableSorting: true,
        sortingFn: "text",
      },
      {
        accessorKey: "amount",
        header: "Monto",
        cell: ({ row, column }) => (
          <div
            className="font-semibold text-red-700"
            style={{ width: column.getSize() }}
          >
            $
            {(typeof row.original.amount === "string"
              ? parseFloat(row.original.amount || "0")
              : row.original.amount || 0
            ).toFixed(2)}
          </div>
        ),
        minSize: 80,
        maxSize: 140,
        size: 100,
        enableResizing: true,
        enableSorting: true,
        sortingFn: "auto",
      },
      {
        accessorKey: "project",
        header: "Proyecto",
        cell: ({ row }) => {
          const rawProject = row.original.project;

          const projects = Array.isArray(rawProject)
            ? rawProject
            : typeof rawProject === "string" && rawProject.includes(",")
            ? rawProject.split(",")
            : [rawProject];

          return (
            <div className="flex flex-wrap gap-1">
              {projects.map((proj, index) => (
                <Badge key={index} className="bg-blue-100 text-blue-800">
                  {proj}
                </Badge>
              ))}
            </div>
          );
        },
        size: 100,
        enableSorting: false,
      },
      {
        accessorKey: "responsible_id",
        header: "Responsable",
        cell: ({ row, column }) => (
          <div
            className="truncate w-[100px] max-w-[380px]"
            style={{ width: column.getSize() }}
          >
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger
                  className="text-left cursor-help truncate w-[100px] max-w-[380px]"
                  style={{ width: column.getSize() }}
                >
                  {row.original.responsible_id || "—"}
                </TooltipTrigger>
                <TooltipContent className="shadow-sm border border-gray-300 text-slate-800 bg-white dark:bg-black dark:text-slate-300">
                  {row.original.responsible_id || "—"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        ),
        enableHiding: !filteredRequests.some((r) => r.responsible_id),
        minSize: 100,
        maxSize: 380,
        enableResizing: true,
      },
      {
        accessorKey: "vehicle_plate",
        header: "Placa",
        cell: ({ row }) => (
          <div className="truncate max-w-[100px] text-center">
            {row.original.vehicle_plate || "—"}
          </div>
        ),
        enableHiding: !filteredRequests.some((r) => r.vehicle_plate),
        minSize: 50,
        maxSize: 100,
        enableSorting: true,
        sortingFn: "auto",
      },
      {
        accessorKey: "vehicle_number",
        header: "No. Transporte",
        cell: ({ row, column }) => (
          <div
            className="truncate max-w-[250px] text-center"
            style={{ width: column.getSize() }}
          >
            {row.original.vehicle_number || "—"}
          </div>
        ),
        enableHiding: !filteredRequests.some((r) => r.vehicle_number),
        minSize: 50,
        maxSize: 250,
        enableSorting: true,
        sortingFn: "auto",
      },
      {
        accessorKey: "note",
        header: "Observación",
        cell: ({ row, column }) => (
          <div
            className="truncate max-w-[850px]"
            style={{ width: column.getSize() }}
          >
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger className="text-left cursor-help truncate w-[220px] max-w-[850px]">
                  {row.original.note || "—"}
                </TooltipTrigger>
                <TooltipContent className="shadow-sm border border-gray-300 text-slate-800 bg-white dark:bg-black dark:text-slate-300">
                  {row.original.note || "—"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        ),
        minSize: 80,
        maxSize: 850,
        size: 220,
        enableSorting: true,
        sortingFn: "text",
        enableResizing: true,
      },
      {
        id: "actions",
        header: "Acciones",
        cell: ({ row }) => (
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditClick(row.original)}
                  disabled={modalPreparing}
                >
                  {modalPreparing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Edit2 className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Editar</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ),
        minSize: 80,
        maxSize: 100,
        enableResizing: false,
        enableSorting: false,
      },
    ],
    [filteredRequests, projectMap, modalPreparing]
  );

  // Configurar la tabla
  const table = useReactTable({
    data: filteredRequests,
    columns,
    state: {
      sorting,
      columnSizing,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    onColumnSizingChange: setColumnSizing,
    columnResizeMode: "onChange",
    getSortedRowModel: getSortedRowModel(), // <- importante!
  });
  const handleOpenModal = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-row gap-3">
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
            <AlertDialogTrigger asChild onClick={handleOpenModal}>
              <Button
                className="px-4 py-2 rounded text-sm font-semibold transition-all duration-200 active:scale-[.99] flex flex-row gap-1 shadow-sm disabled:opacity-50 disabled:cursor-progress"
                disabled={!fileData}
              >
                <Paperclip className="h-5 w-5 mr-2" />
                Archivo adjunto
              </Button>
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
                  <div className="relative w-full aspect-9/16 lg:aspect-16/9 h-[70vh] 2xl:h-auto">
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

          <TooltipProvider>
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleRefreshData}
                  disabled={isRefreshing}
                >
                  <RefreshCw
                    className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="shadow-sm border border-gray-300 text-slate-700 bg-white dark:bg-black dark:text-slate-300">
                Actualizar datos
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <div className="max-h-[70vh] max-w-[90vw] overflow-auto">
          <table className="w-full border-collapse min-w-max">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="bg-slate-50">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      colSpan={header.colSpan}
                      style={{ width: header.getSize() }}
                      className="relative group px-4 py-3 text-center text-sm font-semibold text-slate-600 whitespace-nowrap cursor-pointer select-none"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center justify-center gap-1">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {header.column.getIsSorted() === "asc" && (
                          <SortAsc className="inline-block h-4 w-4" />
                        )}
                        {header.column.getIsSorted() === "desc" && (
                          <SortDesc className="inline-block h-4 w-4" />
                        )}
                      </div>

                      {header.column.getCanResize() && (
                        <div
                          onMouseDown={header.getResizeHandler()}
                          onTouchStart={header.getResizeHandler()}
                          className="absolute right-0 top-0 h-full w-1 bg-slate-400 opacity-0 group-hover:opacity-100 cursor-col-resize transition"
                        />
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>

            <tbody>
              <AnimatePresence mode="sync">
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={table.getAllColumns().length}
                      className="text-center py-8"
                    >
                      <Loader fullScreen={false} text="Cargando datos..." />
                    </td>
                  </tr>
                ) : filteredRequests.length === 0 ? (
                  <tr>
                    <td
                      colSpan={table.getAllColumns().length}
                      className="text-center py-8 text-slate-500"
                    >
                      No se encontraron resultados
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <motion.tr
                      key={row.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="border-y hover:bg-slate-50 transition-colors group odd:bg-gray-100"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className="px-4 py-1.5 whitespace-nowrap"
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
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
                  <td
                    colSpan={table.getAllColumns().length - 9}
                    className="px-4 py-3"
                  ></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Modal de edición con lista corta*/}
      {selectedRow && (
        <Dialog
          open={isEditModalOpen}
          onOpenChange={(open) => {
            setIsEditModalOpen(open);
            if (!open) setSelectedRow(null);
          }}
        >
          <EditModal
            key={`edit-modal-${selectedRow.unique_id}-${Date.now()}`} // Clave única para evitar problemas de caché
            row={selectedRow}
            onSave={handleSave}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedRow(null);
            }}
            accounts={accountsList}
            responsibles={responsiblesList}
            vehicles={vehiclesList}
          />
        </Dialog>
      )}
    </motion.div>
  );
};

// Prevenir rerenderizados innecesarios
const RequestDetailsTable = React.memo(RequestDetailsTableComponent);
export default RequestDetailsTable;
