"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  SortingState,
  VisibilityState,
  RowSelectionState,
  flexRender,
  Row,
  PaginationState,
} from "@tanstack/react-table";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  TableFooter,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  RefreshCw,
  Filter,
  ChevronLeft,
  ChevronRight,
  SortAscIcon,
  SortDescIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { getColumns } from "./columnConfig";
import { ReposicionProvider } from "./ReposicionContext";
import {
  DataTableProps,
  ReposicionProps,
  ReposicionUpdateData,
  RequestProps,
  Status,
} from "@/utils/types";
import {
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
  Tooltip,
} from "@/components/ui/tooltip";
import {
  fetchAccounts,
  fetchResponsibles,
  fetchVehicles,
} from "./RequestDetailsTable";
import { fetchWithAuth, getAuthToken } from "@/services/auth.service";
import { SubmitFile } from "./SubmitFile";
import { Switch } from "@/components/ui/switch";

interface MappableData {
  project?: string | number;
  project_name?: string;
  account?: { id: string | number; name: string } | string | number; // Puede ser objeto o ID
  responsible?:
    | { id: string | number; nombre_completo: string }
    | string
    | number; // Puede ser objeto o ID
  vehicle?: string | number;
}

interface TableState {
  sorting: SortingState;
  globalFilter: string;
  pagination: PaginationState;
}

const TableSkeleton = () => (
  <>
    {[...Array(5)].map((_, i) => (
      <TableRow key={i} className="animate-pulse">
        {[...Array(10)].map((_, j) => (
          <TableCell key={j}>
            <Skeleton className="h-8 w-full" />
          </TableCell>
        ))}
      </TableRow>
    ))}
  </>
);

export function RequestsTable<
  TData extends (RequestProps | ReposicionProps) & MappableData
>({
  mode,
  type,
  onStatusChange,
  onCreateReposicion,
  onUpdateReposicion,
}: DataTableProps<TData>) {
  const [data, setData] = useState<TData[]>([]);
  const [tableState, setTableState] = useState<TableState>({
    sorting: [],
    globalFilter: "",
    pagination: { pageIndex: 0, pageSize: 10 },
  });
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadAllData, setLoadAllData] = useState(false);

  const [dataMaps, setDataMaps] = useState({
    accountMap: {} as Record<string, string>,
    responsibleMap: {} as Record<string, string>,
    vehicleMap: {} as Record<string, string>,
    projectMap: {} as Record<string, string>, // Mantenemos por si se necesita en otro lugar
  });

  const hasFetchedRef = useRef(false);

  const fetchProjects = async (): Promise<Record<string, string>> => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/projects`,
        {
          headers: { Authorization: `Bearer ${getAuthToken()}` },
          credentials: "include",
        }
      );
      if (!response.ok) throw new Error("Error al cargar proyectos");
      const data = await response.json();
      const projects = Array.isArray(data.data)
        ? data.data
        : Array.isArray(data)
        ? data
        : [];
      return projects.reduce(
        (
          acc: Record<string, string>,
          project: { id: string; name: string }
        ) => {
          acc[project.id] = project.name || project.id;
          return acc;
        },
        {}
      );
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast.error("Error al cargar proyectos");
      return {};
    }
  };

  useEffect(() => {
    const loadDataMaps = async () => {
      try {
        const [accounts, responsibles, vehicles, projects] = await Promise.all([
          fetchAccounts(),
          fetchResponsibles(),
          fetchVehicles(),
          fetchProjects(),
        ]);

        const safeAccounts = Array.isArray(accounts) ? accounts : [];
        const safeResponsibles = Array.isArray(responsibles)
          ? responsibles
          : [];
        const safeVehicles = Array.isArray(vehicles) ? vehicles : [];

        setDataMaps({
          accountMap: safeAccounts.reduce((acc, account) => {
            acc[account.id || ""] = account.name || "";
            return acc;
          }, {} as Record<string, string>),
          responsibleMap: safeResponsibles.reduce((acc, responsible) => {
            acc[responsible.id || ""] = responsible.nombre_completo || "";
            return acc;
          }, {} as Record<string, string>),
          vehicleMap: safeVehicles.reduce((acc, vehicle) => {
            acc[vehicle.vehicle_plate || ""] = vehicle.vehicle_plate || "";
            return acc;
          }, {} as Record<string, string>),
          projectMap: projects,
        });
      } catch (error) {
        console.error("Error loading data maps:", error);
        toast.error("Error al cargar los datos de referencia");
        setDataMaps({
          accountMap: {},
          responsibleMap: {},
          vehicleMap: {},
          projectMap: {},
        });
      }
    };

    loadDataMaps();
  }, []);

  const columns = useMemo(
    () => getColumns<TData>(mode, { ...dataMaps, onStatusChange }),
    [mode, dataMaps, onStatusChange]
  );

  const buildQueryUrl = useCallback(
    (period: "last_3_months" | "all") => {
      const params = new URLSearchParams({ period });
      if (type && mode === "requests") params.append("type", type);
      return `/${mode}?${params.toString()}`;
    },
    [mode, type]
  );

  const fetchData = useCallback(
    async (period: "last_3_months" | "all") => {
      try {
        setIsRefreshing(true);
        const response = await fetchWithAuth(buildQueryUrl(period));
        if (response && response.ok === true && typeof response === "object") {
          delete response.ok;
        }

        let fetchedData: TData[] = [];
        if (Array.isArray(response)) {
          fetchedData = response;
        } else if (
          response &&
          typeof response === "object" &&
          response.data &&
          Array.isArray(response.data)
        ) {
          fetchedData = response.data;
        } else if (response && typeof response === "object") {
          if (response.message && response.error) {
            console.error(
              "Server returned an error:",
              response.message,
              response.error
            );
            throw new Error(response.message || "Error del servidor");
          }
          const numericKeys = Object.keys(response).filter(
            (k) => !isNaN(Number(k))
          );
          if (numericKeys.length > 0) {
            fetchedData = numericKeys.map((key) => response[key] as TData);
          } else {
            const values = Object.values(response);
            fetchedData = values.filter(
              (val) =>
                val &&
                typeof val === "object" &&
                !Array.isArray(val) &&
                ((mode === "requests" && "unique_id" in val) ||
                  (mode === "reposiciones" && "fecha_reposicion" in val))
            ) as TData[];
          }
        }

        if (fetchedData.length === 0)
          console.warn("No data found in response!");

        // Si estamos en el modo "requests", filtrar para mostrar solo las pendientes
        if (mode === "requests") {
          fetchedData = fetchedData.filter(
            (item) => (item as RequestProps).status === "pending"
          ) as TData[];
        }

        setData(fetchedData);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error(
          error instanceof Error ? error.message : "Error al cargar los datos"
        );
        setData([]);
      } finally {
        setIsRefreshing(false);
        setIsLoading(false);
      }
    },
    [buildQueryUrl, mode]
  );

  useEffect(() => {
    const period = loadAllData ? "all" : "last_3_months";
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchData(period);
    } else {
      fetchData(period);
    }
  }, [fetchData, loadAllData]);

  const handleUpdateData = useCallback(
    ({
      rowIndex,
      columnId,
      value,
    }: {
      rowIndex: number;
      columnId: string;
      value: unknown;
    }) => {
      setData((old) => {
        const newData = [...old];
        newData[rowIndex] = { ...newData[rowIndex], [columnId]: value };
        return newData;
      });
    },
    []
  );

  const customGlobalFilterFn = useCallback(
    (row: Row<TData>, columnId: string, filterValue: string): boolean => {
      const search = filterValue.toLowerCase();
      const actionColumns = ["acciones", "actions"];

      const rowData = row.original;
      const mappedValues: string[] = [];

      // Proyecto
      if ("project_name" in rowData && rowData.project_name) {
        mappedValues.push(String(rowData.project_name));
      } else if ("project" in rowData && rowData.project) {
        mappedValues.push(
          dataMaps.projectMap[String(rowData.project)] ||
            String(rowData.project)
        );
      }

      // Cuenta
      if ("account" in rowData && rowData.account) {
        if (typeof rowData.account === "object" && "name" in rowData.account) {
          mappedValues.push(String(rowData.account.name)); // Usar el nombre si es un objeto
        } else {
          const accountId = String(rowData.account);
          const accountName = dataMaps.accountMap[accountId] || accountId;
          mappedValues.push(accountName); // Traducir ID a nombre si es necesario
        }
      }

      // Responsable
      if ("responsible" in rowData && rowData.responsible) {
        if (
          typeof rowData.responsible === "object" &&
          "nombre_completo" in rowData.responsible
        ) {
          mappedValues.push(String(rowData.responsible.nombre_completo));
        } else {
          const responsibleId = String(rowData.responsible);
          const responsibleName =
            dataMaps.responsibleMap[responsibleId] || responsibleId;
          mappedValues.push(responsibleName); // Filtramos por nombre, no por ID
        }
      }

      // Vehículo
      if ("vehicle" in rowData && rowData.vehicle) {
        const vehicleId = String(rowData.vehicle);
        mappedValues.push(dataMaps.vehicleMap[vehicleId] || vehicleId);
      }

      // Valores renderizados de las columnas
      const searchableColumns = row
        .getAllCells()
        .filter((cell) => !actionColumns.includes(cell.column.id))
        .map((cell) => {
          const value = cell.getValue();
          const renderedValue = flexRender(
            cell.column.columnDef.cell,
            cell.getContext()
          );
          return String(value ?? renderedValue ?? "").toLowerCase();
        });

      const allValues = [
        ...searchableColumns,
        ...mappedValues.map((val) => val.toLowerCase()),
      ];

      return allValues.some((value) => value.includes(search));
    },
    [dataMaps]
  );

  const table = useReactTable<TData>({
    data,
    columns,
    state: {
      sorting: tableState.sorting,
      columnVisibility,
      rowSelection,
      globalFilter: tableState.globalFilter,
      pagination: tableState.pagination,
    },
    meta: { updateData: handleUpdateData },
    onSortingChange: (updater) =>
      setTableState((prev) => ({
        ...prev,
        sorting:
          typeof updater === "function" ? updater(prev.sorting) : updater,
      })),
    onGlobalFilterChange: (globalFilter) =>
      setTableState((prev) => ({
        ...prev,
        globalFilter: globalFilter as string,
      })),
    onPaginationChange: (updater) =>
      setTableState((prev) => ({
        ...prev,
        pagination:
          typeof updater === "function" ? updater(prev.pagination) : updater,
      })),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: customGlobalFilterFn,
    manualPagination: false,
    manualSorting: false,
    manualFiltering: false,
  });

  const handleSendRequests = async (
    requestIds: string[],
    attachment: File
  ): Promise<Response | null> => {
    try {
      setIsLoading(true);
      if (!requestIds.length) {
        toast.error("Selecciona al menos una solicitud");
        return null;
      }
      if (!onCreateReposicion) {
        toast.error(
          "Error en la configuración: onCreateReposicion no está definido. Contacta a soporte."
        );
        return null;
      }

      // Llamamos a la función onCreateReposicion que recibimos como prop
      await onCreateReposicion(requestIds, attachment);

      // Actualización optimista: eliminar las solicitudes enviadas de la tabla
      setData((prevData) => {
        return prevData.filter((item) => {
          if (!("unique_id" in item)) return true;
          const id = (item as RequestProps).unique_id;
          return !requestIds.includes(id);
        });
      });

      // Limpiar selección
      setRowSelection({});
      toast.success("Solicitudes enviadas correctamente");

      // Creamos y devolvemos un objeto Response mock ya que necesitamos devolver Response | null
      return new Response(null, { status: 201 });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al crear la reposición"
      );
      console.error("Error in handleSendRequests:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    setIsLoading(true);
    hasFetchedRef.current = false;
    fetchData(loadAllData ? "all" : "last_3_months");
  };

  const handleRowUpdate = useCallback(
    (id: number, updatedData: Partial<TData>) => {
      setData((prevData) =>
        prevData.map((item) =>
          "id" in item && item.id === id ? { ...item, ...updatedData } : item
        )
      );
    },
    []
  );

  const updateRequestsInReposicion = useCallback(
    (reposicionId: number, requestData: Partial<RequestProps>) => {
      setData((prevData) => {
        return prevData.map((item) => {
          // Si no es una reposición o no es la que buscamos, devolver sin cambios
          if (
            mode !== "reposiciones" ||
            !("id" in item) ||
            item.id !== reposicionId
          ) {
            return item;
          }

          // Es la reposición que buscamos, actualizar sus solicitudes
          const reposicion = item as unknown as ReposicionProps;
          if (!reposicion.requests || !Array.isArray(reposicion.requests)) {
            return item;
          }

          // Actualizar todas las solicitudes de la reposición
          const updatedRequests = reposicion.requests.map((req) => ({
            ...req,
            ...requestData,
          }));

          return {
            ...item,
            requests: updatedRequests,
          };
        });
      });
    },
    [mode]
  );

  return (
    <ReposicionProvider
      onUpdateReposicion={async (
        id: number,
        updateData: ReposicionUpdateData,
        prevStatus: Status
      ): Promise<void> => {
        try {
          if (onUpdateReposicion) {
            await onUpdateReposicion(id, updateData, prevStatus);

            // Actualización optimista de la reposición
            handleRowUpdate(id, updateData as Partial<TData>);

            // Si estamos actualizando el estado, también actualizar el estado de las solicitudes
            if (updateData.status) {
              // Garantizar que el status sea del tipo correcto Status
              const requestStatus: Partial<RequestProps> = {
                status: updateData.status as Status,
              };

              // Actualizar optimistamente las solicitudes en la reposición
              updateRequestsInReposicion(id, requestStatus);
            }

            // Si estamos actualizando el mes o el momento de pago, actualizar eso en las solicitudes
            if (updateData.month) {
              updateRequestsInReposicion(id, { month: updateData.month });
            }

            if (updateData.when) {
              updateRequestsInReposicion(id, { when: updateData.when });
            }
          }
        } catch (error) {
          console.error("Error updating reposicion:", error);
          toast.error("Error al actualizar la reposición");
        }
      }}
      updateRequestsInReposicion={updateRequestsInReposicion}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full space-y-4"
      >
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex-1 w-full sm:w-auto flex gap-2 items-center">
            <div className="relative flex-1 sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-600 h-4 w-4" />
              <Input
                placeholder="Buscar..."
                value={tableState.globalFilter}
                onChange={(e) =>
                  setTableState((prev) => ({
                    ...prev,
                    globalFilter: e.target.value,
                  }))
                }
                className="pl-9 pr-4"
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={loadAllData}
                onCheckedChange={(checked) => setLoadAllData(checked)}
                disabled={isLoading || isRefreshing}
              />
              <span className="text-sm text-slate-600">
                {loadAllData ? "Todas las solicitudes" : "Últimos 3 meses"}
              </span>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                  >
                    <RefreshCw
                      className={`h-4 w-4 ${
                        isRefreshing ? "animate-spin" : ""
                      }`}
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Actualizar datos</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8 px-2">
                        <Filter className="h-4 w-4 mr-2" />
                        Filtros
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent>Gestionar columnas</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <DropdownMenuContent align="end" className="w-48">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {mode === "requests" && (
            <SubmitFile
              onCreateReposicion={handleSendRequests}
              selectedRequests={table
                .getSelectedRowModel()
                .rows.map((row) => row.original.unique_id)
                .filter((id): id is string => id !== undefined)}
              isLoading={isLoading}
            />
          )}
        </div>

        <div className="rounded-lg border shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900"
                >
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="font-semibold text-slate-600"
                    >
                      {!header.isPlaceholder && (
                        <div
                          className="flex items-center gap-2 cursor-pointer"
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {header.column.getCanSort() && (
                            <span>
                              {
                                {
                                  asc: <SortAscIcon size={18} />,
                                  desc: <SortDescIcon size={18} />,
                                }[header.column.getIsSorted() as string]
                              }
                            </span>
                          )}
                        </div>
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              <AnimatePresence mode="sync">
                {isLoading ? (
                  <TableSkeleton />
                ) : table.getRowModel().rows.length > 0 ? (
                  table.getRowModel().rows.map((row) => (
                    <motion.tr
                      key={row.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={`transition-colors ${
                        row.getIsSelected()
                          ? "bg-slate-100 dark:bg-slate-900"
                          : "even:bg-slate-100 even:dark:bg-slate-900"
                      } hover:bg-slate-100 dark:hover:bg-slate-900`}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="py-3 px-4">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </motion.tr>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={table.getAllColumns().length}
                      className="h-24 text-center text-slate-500"
                    >
                      No se encontraron resultados
                    </TableCell>
                  </TableRow>
                )}
              </AnimatePresence>
            </TableBody>
            {table.getRowModel().rows.length > 0 && (
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={table.getAllColumns().length}>
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-2">
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        Mostrando {table.getRowModel().rows.length} de{" "}
                        {table.getFilteredRowModel().rows.length} resultados
                        {table.getFilteredRowModel().rows.length !==
                          data.length && ` (Total: ${data.length})`}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => table.previousPage()}
                          disabled={!table.getCanPreviousPage()}
                          className="h-8 w-8 p-0 sm:w-auto sm:px-3"
                        >
                          <ChevronLeft className="h-4 w-4" />
                          <span className="hidden sm:inline ml-2">
                            Anterior
                          </span>
                        </Button>
                        <span className="text-sm text-slate-600">
                          Página {table.getState().pagination.pageIndex + 1} de{" "}
                          {table.getPageCount()}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => table.nextPage()}
                          disabled={!table.getCanNextPage()}
                          className="h-8 w-8 p-0 sm:w-auto sm:px-3"
                        >
                          <span className="hidden sm:inline mr-2">
                            Siguiente
                          </span>
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              </TableFooter>
            )}
          </Table>
        </div>
      </motion.div>
    </ReposicionProvider>
  );
}
