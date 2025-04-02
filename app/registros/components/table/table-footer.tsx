/* eslint-disable @typescript-eslint/no-explicit-any */
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
  account?: { id: string | number; name: string } | string | number;
  responsible?:
    | { id: string | number; nombre_completo: string }
    | string
    | number;
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

const findAmountColumnIndex = (
  table: { getVisibleLeafColumns: () => Array<{ id: string }> },
  mode: "requests" | "reposiciones"
): number => {
  const visibleColumns = table.getVisibleLeafColumns();
  const keyToFind = mode === "requests" ? "amount" : "total_reposicion";
  const index = visibleColumns.findIndex((col) => col.id === keyToFind);
  return index !== -1 ? index : Math.floor(visibleColumns.length / 2);
};

const TableFooterWithTotals = ({
  table,
  data,
  mode,
}: {
  table: any;
  data: any[];
  mode: "requests" | "reposiciones";
}) => {
  const filteredRows = table.getFilteredRowModel().rows;
  const selectedRows = table.getSelectedRowModel().rows;
  const allRows = table.getRowModel().rows;

  const totalAmount = useMemo(() => {
    return data
      .filter((item) => item.status === "pending")
      .reduce((sum: number, item: any) => {
        const value = mode === "requests" ? item.amount : item.total_reposicion;
        return (
          sum +
          (typeof value === "string" ? parseFloat(value || "0") : value || 0)
        );
      }, 0);
  }, [data, mode]);

  const filteredAmount = useMemo(() => {
    return filteredRows
      .filter((row: any) => row.original.status === "pending")
      .reduce((sum: number, row: any) => {
        const value =
          mode === "requests"
            ? row.original.amount
            : row.original.total_reposicion;
        return (
          sum +
          (typeof value === "string" ? parseFloat(value || "0") : value || 0)
        );
      }, 0);
  }, [filteredRows, mode]);

  const selectedAmount = useMemo(() => {
    if (selectedRows.length === 0) return 0;
    return selectedRows.reduce((sum: number, row: any) => {
      const value =
        mode === "requests"
          ? row.original.amount
          : row.original.total_reposicion;
      return (
        sum +
        (typeof value === "string" ? parseFloat(value || "0") : value || 0)
      );
    }, 0);
  }, [selectedRows, mode]);

  const amountIndex = useMemo(
    () => findAmountColumnIndex(table, mode),
    [table, mode]
  );

  const isFiltered = filteredRows.length < data.length;
  const hasSelection = selectedAmount > 0;

  const displayText = hasSelection
    ? isFiltered
      ? `Seleccionado: $${selectedAmount.toFixed(
          2
        )} (de $${filteredAmount.toFixed(
          2
        )} filtrado, total $${totalAmount.toFixed(2)})`
      : `Seleccionado: $${selectedAmount.toFixed(2)} (de $${totalAmount.toFixed(
          2
        )})`
    : isFiltered
    ? `Mostrando: $${filteredAmount.toFixed(2)} (de $${totalAmount.toFixed(2)})`
    : `Total: $${totalAmount.toFixed(2)}`;

  return (
    <TableFooter>
      <TableRow>
        <TableCell colSpan={amountIndex}>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Mostrando {allRows.length} de {filteredRows.length} resultados
            {isFiltered && ` (Total: ${data.length})`}
          </div>
        </TableCell>
        <TableCell colSpan={table.getVisibleLeafColumns().length - amountIndex}>
          <div className="flex flex-wrap items-center gap-4">
            <div className="font-medium whitespace-nowrap">
              <span
                className={hasSelection ? "text-blue-600" : "text-slate-800"}
              >
                {displayText}
              </span>
            </div>
            <div className="flex items-center gap-2 ml-4">
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
                <span className="hidden sm:inline mr-2">Siguiente</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </TableCell>
      </TableRow>
    </TableFooter>
  );
};

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
    projectMap: {} as Record<string, string>,
  });

  const [editingField, setEditingField] = useState<{
    id: string;
    field: keyof RequestProps;
  } | null>(null);

  const [editedValues, setEditedValues] = useState<{
    [key: string]: Partial<RequestProps>;
  }>({});

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

  const handleDoubleClick = useCallback(
    (id: string, field: keyof RequestProps) => {
      if (mode !== "requests") return;
      if (field === "unique_id") return;

      const foundItem = data.find((item) => {
        return "unique_id" in item && item.unique_id === id;
      });

      if (foundItem && "unique_id" in foundItem) {
        const requestItem = foundItem as RequestProps;
        const fieldValue = requestItem[field];

        setEditingField({ id, field });
        setEditedValues((prev) => ({
          ...prev,
          [id]: {
            ...prev[id],
            [field]: fieldValue,
          },
        }));
      }
    },
    [data, mode, setEditingField, setEditedValues]
  );

  const handleInputChange = useCallback(
    (id: string, field: keyof RequestProps, value: any) => {
      setEditedValues((prev) => ({
        ...prev,
        [id]: { ...prev[id], [field]: value },
      }));
    },
    []
  );

  const handleSave = useCallback(
    async (id: string) => {
      const updatedData = editedValues[id];
      if (!updatedData) return;

      try {
        setIsLoading(true);
        const response = await fetchWithAuth(`/requests/${id}`, {
          method: "PUT",
          body: JSON.stringify(updatedData),
        });

        if (response && response.ok) {
          setData((prev) =>
            prev.map((item: any) =>
              "unique_id" in item && item.unique_id === id
                ? { ...item, ...updatedData }
                : item
            )
          );
          toast.success("Solicitud actualizada correctamente");
        } else {
          throw new Error("No se pudo actualizar la solicitud");
        }
      } catch (error) {
        console.error("Error al actualizar la solicitud:", error);
        toast.error("Error al actualizar la solicitud");
      } finally {
        setIsLoading(false);
        setEditingField(null);
        setEditedValues((prev) => {
          const newValues = { ...prev };
          delete newValues[id];
          return newValues;
        });
      }
    },
    [editedValues, setData, setIsLoading, setEditingField, setEditedValues]
  );

  const handleKeyDown = useCallback(
    (
      event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
      id: string
    ) => {
      if (event.key === "Enter") {
        event.preventDefault();
        handleSave(id);
      } else if (event.key === "Escape") {
        setEditingField(null);
        setEditedValues((prev) => {
          const newValues = { ...prev };
          delete newValues[id];
          return newValues;
        });
      }
    },
    [handleSave]
  );

  const columns = useMemo(
    () =>
      getColumns<TData>(mode, {
        ...dataMaps,
        onStatusChange,
        handleDoubleClick,
        handleInputChange,
        handleKeyDown,
        handleSave,
        editingField,
        editedValues,
      }),
    [
      mode,
      dataMaps,
      onStatusChange,
      handleDoubleClick,
      handleInputChange,
      handleKeyDown,
      handleSave,
      editingField,
      editedValues,
    ]
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
      const rowData = row.original;
      const searchableValues = Object.values(rowData)
        .map((value) => String(value ?? "").toLowerCase())
        .filter(Boolean);

      const cellValues = row
        .getAllCells()
        .filter((cell) => !["acciones", "actions"].includes(cell.column.id))
        .map((cell) => {
          const value = cell.getValue();
          const rendered = flexRender(
            cell.column.columnDef.cell,
            cell.getContext()
          );
          return String(value ?? rendered ?? "").toLowerCase();
        });

      return [...searchableValues, ...cellValues].some((value) =>
        value.includes(search)
      );
    },
    []
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

  useEffect(() => {
    console.log("Table State Updated:", {
      globalFilter: tableState.globalFilter,
      rowSelection,
      filteredRows: table.getFilteredRowModel().rows.length,
      selectedRows: table.getSelectedRowModel().rows.length,
    });
  }, [tableState.globalFilter, rowSelection, table]);

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

      await onCreateReposicion(requestIds, attachment);

      setData((prevData) => {
        return prevData.filter((item) => {
          if (!("unique_id" in item)) return true;
          const id = (item as RequestProps).unique_id;
          return !requestIds.includes(id);
        });
      });

      setRowSelection({});
      toast.success("Solicitudes enviadas correctamente");

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
          if (
            mode !== "reposiciones" ||
            !("id" in item) ||
            item.id !== reposicionId
          ) {
            return item;
          }

          const reposicion = item as unknown as ReposicionProps;
          if (!reposicion.requests || !Array.isArray(reposicion.requests)) {
            return item;
          }

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
            handleRowUpdate(id, updateData as Partial<TData>);
            if (updateData.status) {
              const requestStatus: Partial<RequestProps> = {
                status: updateData.status as Status,
              };
              updateRequestsInReposicion(id, requestStatus);
            }
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
              <TableFooterWithTotals
                table={table}
                data={data}
                mode={mode}
                key={`${table.getFilteredRowModel().rows.length}-${
                  table.getSelectedRowModel().rows.length
                }`}
              />
            )}
          </Table>
        </div>
      </motion.div>
    </ReposicionProvider>
  );
}
