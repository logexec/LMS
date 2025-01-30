"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  SortingState,
  VisibilityState,
  RowSelectionState,
  PaginationState,
  flexRender,
  ColumnDef,
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
  ChevronDown,
  SendHorizontal,
  Search,
  RefreshCw,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Loader from "@/app/Loader";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getRequestColumns, getReposicionColumns } from "./tableColumns";
import debounce from "lodash/debounce";
import { DataTableProps, ReposicionProps, RequestProps } from "@/utils/types";

interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  has_more: boolean;
}

interface ServerResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

interface TableState {
  pagination: PaginationState;
  sorting: SortingState;
  globalFilter: string;
}

const TableSkeleton = () => (
  <>
    {[...Array(5)].map((_, i) => (
      <TableRow key={i} className="animate-pulse">
        {[...Array(8)].map((_, j) => (
          <TableCell key={j}>
            <Skeleton className="h-8 w-full" />
          </TableCell>
        ))}
      </TableRow>
    ))}
  </>
);

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

export function RequestsTable<TData extends RequestProps | ReposicionProps>({
  mode,
  type,
  onStatusChange,
  onCreateReposicion,
  onUpdateReposicion,
}: DataTableProps<TData>) {
  // Estados para la tabla
  const [data, setData] = useState<TData[]>([]);
  const [tableState, setTableState] = useState<TableState>({
    pagination: {
      pageIndex: 0,
      pageSize: 10,
    },
    sorting: [],
    globalFilter: "",
  });
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Estado para los datos de relaciones
  const [dataMaps, setDataMaps] = useState({
    accountMap: {} as Record<string, string>,
    responsibleMap: {} as Record<string, string>,
    vehicleMap: {} as Record<string, string>,
  });

  // Memoizar las columnas
  const columns = useMemo(() => {
    if (mode === "requests") {
      return getRequestColumns({
        ...dataMaps,
        onStatusChange,
      }) as ColumnDef<TData>[];
    }
    return getReposicionColumns({
      ...dataMaps,
      onUpdateReposicion,
    }) as ColumnDef<TData>[];
  }, [mode, dataMaps, onStatusChange, onUpdateReposicion]);

  // Función para construir la URL
  const buildQueryUrl = useCallback(
    (state: TableState) => {
      const params = new URLSearchParams({
        page: (state.pagination.pageIndex + 1).toString(),
        per_page: state.pagination.pageSize.toString(),
        search: state.globalFilter,
      });

      if (state.sorting.length > 0) {
        params.append("sort_by", state.sorting[0].id);
        params.append("sort_order", state.sorting[0].desc ? "desc" : "asc");
      }

      if (type && mode === "requests") {
        params.append("type", type);
      }

      return `${process.env.NEXT_PUBLIC_API_URL}/${mode}?${params.toString()}`;
    },
    [mode, type]
  );

  const processData = useCallback(
    (rawData: any[]) => {
      if (mode === "reposiciones") {
        return rawData.map((item) => ({
          ...item,
          // Asegurarse de que detail sea un array
          detail: Array.isArray(item.detail) ? item.detail : [],
          // Asegurarse de que requests sea un array
          requests: Array.isArray(item.requests) ? item.requests : [],
          // Formatear fecha
          fecha_reposicion: new Date(item.fecha_reposicion).toLocaleDateString(
            "es-ES"
          ),
          responsible_id:
            typeof item.responsible_id === "string" && item.responsible_id,
          account_id:
            typeof item.account_id === "number"
              ? item.account_id
              : parseInt(item.account_id),
          // Formatear monto
          total_reposicion:
            typeof item.total_reposicion === "number"
              ? item.total_reposicion
              : parseFloat(item.total_reposicion) || 0,
        }));
      }
      return rawData;
    },
    [mode]
  );

  const fetchData = useCallback(
    async (tableState: TableState) => {
      try {
        setIsRefreshing(true);

        // Fetch table data and related data in parallel
        const [tableResponse, accounts, responsibles, vehicles] =
          await Promise.all([
            fetch(buildQueryUrl(tableState), {
              credentials: "include",
            }),
            fetchAccounts(),
            fetchResponsibles(),
            fetchVehicles(),
          ]);

        if (!tableResponse.ok) {
          throw new Error("Error al cargar los datos");
        }

        const result = await tableResponse.json();

        // Process table data
        const normalizedData = {
          data: Array.isArray(result.data)
            ? processData(result.data)
            : Array.isArray(result)
            ? processData(result)
            : [],
          meta: result.meta || {
            current_page: 1,
            last_page: 1,
            per_page: 10,
            total: Array.isArray(result) ? result.length : 0,
            has_more: false,
          },
        };

        // Update data maps
        setDataMaps({
          accountMap: accounts.reduce(
            (acc: Record<string, string>, account: any) => {
              acc[account.id] = account.name;
              return acc;
            },
            {}
          ),
          responsibleMap: responsibles.reduce(
            (acc: Record<string, string>, responsible: any) => {
              acc[responsible.id] = responsible.nombre_completo;
              return acc;
            },
            {}
          ),
          vehicleMap: vehicles.reduce(
            (acc: Record<string, string>, vehicle: any) => {
              acc[vehicle.id] = vehicle.name;
              return acc;
            },
            {}
          ),
        });

        setData(normalizedData.data);
        setMeta(normalizedData.meta);

        toast.success("Datos actualizados correctamente");
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Error al cargar los datos");

        setData([]);
        setMeta({
          current_page: 1,
          last_page: 1,
          per_page: 10,
          total: 0,
          has_more: false,
        });
      } finally {
        setIsRefreshing(false);
        setIsLoading(false);
      }
    },
    [buildQueryUrl, processData]
  );

  // Debounce para la búsqueda global
  const debouncedFetch = useMemo(
    () => debounce((state: TableState) => fetchData(state), 300),
    [fetchData]
  );

  // Effect para cargar datos cuando cambian los parámetros
  useEffect(() => {
    debouncedFetch(tableState);
    return () => {
      debouncedFetch.cancel();
    };
  }, [tableState, debouncedFetch]);

  // Configuración de la tabla
  const table = useReactTable<TData>({
    data,
    columns,
    pageCount: meta?.last_page ?? -1,
    state: {
      sorting: tableState.sorting,
      pagination: tableState.pagination,
      columnVisibility,
      rowSelection,
      globalFilter: tableState.globalFilter,
    },
    onSortingChange: (sorting) => {
      setTableState((prev) => ({ ...prev, sorting: sorting as SortingState }));
    },
    onPaginationChange: (pagination) => {
      setTableState((prev) => ({
        ...prev,
        pagination: pagination as PaginationState,
      }));
    },
    onGlobalFilterChange: (globalFilter) => {
      setTableState((prev) => ({
        ...prev,
        globalFilter: globalFilter as string,
      }));
    },
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
  });

  const handleSendRequests = async () => {
    try {
      if (!Object.keys(rowSelection).length) {
        toast.error("Selecciona al menos una solicitud");
        return;
      }

      const selectedRows = table.getSelectedRowModel().rows;
      const requestIds = selectedRows.map((row) => {
        const uniqueId = (row.original as RequestProps).unique_id;
        if (!uniqueId || uniqueId.trim() === "") {
          throw new Error(
            `ID inválido encontrado: ${JSON.stringify(row.original)}`
          );
        }
        return uniqueId;
      });

      const proyectos = new Set(
        selectedRows.map((row) => (row.original as RequestProps).project)
      );

      if (proyectos.size > 1) {
        toast.error("Todas las solicitudes deben ser del mismo proyecto");
        return;
      }

      if (!onCreateReposicion) {
        toast.error(
          "Hay un error en la configuración. Por favor, contacta a soporte para solucionar este problema."
        );
        return;
      }

      await onCreateReposicion(requestIds);
      setRowSelection({});
      await fetchData(tableState);
      handleRefresh();
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(error.message || "Error al crear la reposición");
    }
  };

  const handleRefresh = () => {
    fetchData(tableState);
  };

  const renderAdditionalControls = () => {
    if (mode === "reposiciones") {
      return (
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
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full space-y-4"
    >
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex-1 w-full sm:w-auto flex gap-2 items-center">
          <div className="relative flex-1 sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
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
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => fetchData(tableState)}
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

        {renderAdditionalControls()}

        {mode === "requests" && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleSendRequests}
                  disabled={!Object.keys(rowSelection).length}
                  className="bg-emerald-600 hover:bg-emerald-700 transition-colors whitespace-nowrap"
                >
                  <SendHorizontal className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Enviar</span>
                  <Badge
                    variant="outline"
                    className="ml-2 text-white bg-emerald-700"
                  >
                    {Object.keys(rowSelection).length}
                  </Badge>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Enviar solicitudes seleccionadas</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      <div className="rounded-lg border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="bg-slate-50 hover:bg-slate-50"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="font-semibold text-slate-600"
                  >
                    {!header.isPlaceholder && (
                      <div className="flex items-center gap-2">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
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
              ) : data && data.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <motion.tr
                    key={row.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={`
                      transition-colors
                      ${
                        row.getIsSelected()
                          ? "bg-slate-100"
                          : "even:bg-slate-50"
                      }
                      hover:bg-slate-100
                    `}
                  >
                    {row.getVisibleCells().map((cell) => {
                      if (
                        mode === "reposiciones" &&
                        cell.column.id === "detail"
                      ) {
                        return (
                          <TableCell key={cell.id} className="py-3 px-4">
                            <Badge variant="secondary">
                              {Array.isArray(cell.getValue())
                                ? (cell.getValue() as string[]).length
                                : 0}{" "}
                              solicitudes
                            </Badge>
                          </TableCell>
                        );
                      }
                      return (
                        <TableCell key={cell.id} className="py-3 px-4">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      );
                    })}
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
          {meta && data && data.length > 0 && (
            <TableFooter>
              <TableRow>
                <TableCell colSpan={table.getAllColumns().length}>
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-2">
                    <div className="text-sm text-slate-600">
                      Mostrando {meta.per_page * (meta.current_page - 1) + 1} a{" "}
                      {Math.min(meta.per_page * meta.current_page, meta.total)}{" "}
                      de {meta.total} resultados
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
                        <span className="hidden sm:inline ml-2">Anterior</span>
                      </Button>

                      <span className="text-sm text-slate-600">
                        Página {meta.current_page} de {meta.last_page}
                      </span>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                        className="h-8 w-8 p-0 sm:w-auto sm:px-3"
                      >
                        <span className="hidden sm:inline mr-2">Siguiente</span>
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
  );
}

export default RequestsTable;
