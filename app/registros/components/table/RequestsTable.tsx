/* eslint-disable @typescript-eslint/no-explicit-any */

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
  TableOptions,
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
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { getColumns } from "./columnConfig";
import { ReposicionProvider } from "./ReposicionContext";
import debounce from "lodash/debounce";
import {
  AccountProps,
  DataTableProps,
  ReposicionProps,
  RequestProps,
  ResponsibleProps,
  TransportProps,
} from "@/utils/types";
import {
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@radix-ui/react-tooltip";
import { Tooltip } from "@/components/ui/tooltip";
import {
  fetchAccounts,
  fetchResponsibles,
  fetchVehicles,
} from "./RequestDetailsTable";
import { getAuthToken } from "@/services/auth.service";
import { SubmitFile } from "./SubmitFile";

interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  has_more: boolean;
}

interface TableState {
  pagination: PaginationState;
  sorting: SortingState;
  globalFilter: string;
}

interface TableOptionsWithMeta<TData>
  extends Omit<TableOptions<TData>, "meta"> {
  meta: {
    updateData: (args: {
      rowIndex: number;
      columnId: string;
      value: any;
    }) => void;
  };
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

  // Estado para los maps
  const [dataMaps, setDataMaps] = useState({
    accountMap: {} as Record<string, string>,
    responsibleMap: {} as Record<string, string>,
    vehicleMap: {} as Record<string, string>,
  });

  useEffect(() => {
    const loadDataMaps = async () => {
      try {
        const [accounts, responsibles, vehicles] = await Promise.all([
          fetchAccounts(),
          fetchResponsibles(),
          fetchVehicles(),
        ]);

        setDataMaps({
          accountMap: accounts.reduce(
            (acc: Record<string, string>, account: AccountProps) => {
              acc[account.id] = account.name;
              return acc;
            },
            {}
          ),
          responsibleMap: responsibles.reduce(
            (acc: Record<string, string>, responsible: ResponsibleProps) => {
              acc[responsible.id] = responsible.nombre_completo;
              return acc;
            },
            {}
          ),
          vehicleMap: vehicles.reduce(
            (acc: Record<string, string>, vehicle: TransportProps) => {
              acc[vehicle.id] = vehicle.name;
              return acc;
            },
            {}
          ),
        });
      } catch (error) {
        console.error("Error loading data maps:", error);
        toast.error("Error al cargar los datos de referencia");
      }
    };

    loadDataMaps();
  }, []);

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

      return mode === "requests"
        ? `${
            process.env.NEXT_PUBLIC_API_URL
          }/${mode}?status=pending&&${params.toString()}`
        : `${process.env.NEXT_PUBLIC_API_URL}/${mode}?${params.toString()}`;
    },
    [mode, type]
  );

  const fetchData = useCallback(
    async (tableState: TableState) => {
      try {
        setIsRefreshing(true);
        const response = await fetch(buildQueryUrl(tableState), {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Error al cargar los datos");
        }

        const result = await response.json();

        const normalizedData = {
          data: Array.isArray(result.data)
            ? result.data
            : Array.isArray(result)
            ? result
            : [],
          meta: result.meta || {
            current_page: 1,
            last_page: 1,
            per_page: 10,
            total: Array.isArray(result) ? result.length : 0,
            has_more: false,
          },
        };

        setData(normalizedData.data);
        setMeta(normalizedData.meta);

        // toast.success("Datos actualizados correctamente");
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error(
          error instanceof Error ? error.message : "Error al cargar los datos"
        );

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
    [buildQueryUrl]
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

  // Memoizar las columnas con el tipo correcto
  const columns = useMemo(
    () =>
      getColumns<TData>(mode, {
        ...dataMaps,
        onStatusChange,
      }),
    [mode, dataMaps, onStatusChange]
  );

  const handleUpdateData = useCallback(
    ({
      rowIndex,
      columnId,
      value,
    }: {
      rowIndex: number;
      columnId: string;
      value: any;
    }) => {
      setData((old) => {
        const newData = [...old];
        newData[rowIndex] = {
          ...newData[rowIndex],
          [columnId]: value,
        };
        return newData;
      });
    },
    []
  );

  // Configuración de la tabla con tipos explícitos
  const table = useReactTable<TData>({
    data,
    columns,
    state: {
      sorting: tableState.sorting,
      pagination: tableState.pagination,
      columnVisibility,
      rowSelection,
      globalFilter: tableState.globalFilter,
    },
    meta: {
      updateData: handleUpdateData,
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
  } as TableOptionsWithMeta<TData>);

  const handleSendRequests = async (
    requestIds: string[],
    selectedFile: File
  ) => {
    try {
      if (!Object.keys(rowSelection).length) {
        toast.error("Selecciona al menos una solicitud");
        return;
      }

      const selectedRows = table.getSelectedRowModel().rows;
      const requestIds = selectedRows.map(
        (row) => (row.original as RequestProps).unique_id
      );

      if (!onCreateReposicion) {
        toast.error("Error en la configuración. Contacta a soporte.");
        return;
      }

      await onCreateReposicion(requestIds, selectedFile);
      setRowSelection({});
      await fetchData(tableState);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al crear la reposición"
      );
      console.error(error);
    }
  };

  const handleRefresh = () => {
    fetchData(tableState);
  };

  return (
    <ReposicionProvider onUpdateReposicion={onUpdateReposicion}>
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
              selectedRequests={Object.keys(rowSelection)}
            />
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
                            : "even:bg-slate-100"
                        }
                        hover:bg-slate-100
                      `}
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
            {meta && data && data.length > 0 && (
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={table.getAllColumns().length}>
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-2">
                      <div className="text-sm text-slate-600">
                        Mostrando {meta.per_page * (meta.current_page - 1) + 1}{" "}
                        a{" "}
                        {Math.min(
                          meta.per_page * meta.current_page,
                          meta.total
                        )}{" "}
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
                          <span className="hidden sm:inline ml-2">
                            Anterior
                          </span>
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
