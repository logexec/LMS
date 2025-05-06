/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  FilterFn,
  flexRender,
  getCoreRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  Row,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import {
  ChevronDownIcon,
  ChevronFirstIcon,
  ChevronLastIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  CircleAlertIcon,
  CircleXIcon,
  Columns3Icon,
  EllipsisIcon,
  FilterIcon,
  ListFilterIcon,
  LoaderCircle,
  TrashIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FaPaperPlane } from "react-icons/fa6";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { toast } from "sonner";
import { SubmitFileDialog } from "../SubmitFileDialog";
import axios from "axios";
import { getAuthToken } from "@/services/auth.service";
import DeleteButtonComponent from "../DeleteButtonComponent";
import { requestsApi } from "@/services/axios";
import { TableContextProvider } from "@/contexts/TableContext";
import EditRequestComponent from "../EditRequestComponent";

type Request = {
  id: string;
  unique_id: string;
  request_date: Date;
  invoice_number: string;
  account_id: string;
  amount: string;
  project: string;
  responsible_id?: string;
  cedula_responsable?: string;
  vehicle_plate?: string;
  vehicle_number?: string;
  note: string;
};

type Period = "last_week" | "last_month" | "all";

// Custom filter function for multi-column searching
const multiColumnFilterFn: FilterFn<Request> = (row, columnId, filterValue) => {
  const searchableRowContent =
    `${row.original.responsible_id} ${row.original.project} ${row.original.vehicle_plate} ${row.original.unique_id} ${row.original.note}`.toLowerCase();
  const searchTerm = (filterValue ?? "").toLowerCase();
  return searchableRowContent.includes(searchTerm);
};

const projectFilterFn: FilterFn<Request> = (
  row,
  columnId,
  filterValue: string[]
) => {
  if (!filterValue?.length) return true;
  const project = row.getValue(columnId) as string;
  return filterValue.includes(project);
};

const columns: ColumnDef<Request>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    size: 28,
    enableSorting: false,
    enableHiding: false,
  },
  {
    header: "ID",
    accessorKey: "unique_id",
    cell: ({ row }) => (
      <div className="font-normal">{row.getValue("unique_id")}</div>
    ),
    size: 90,
    filterFn: multiColumnFilterFn,
    enableHiding: false,
  },
  {
    header: "Fecha",
    accessorKey: "request_date",
    cell: ({ row }) => (
      <div className="font-normal">
        {new Date(row.original.request_date).toLocaleDateString("es-EC", {
          year: "numeric",
          month: "short",
          day: "2-digit",
        })}
      </div>
    ),
    size: 120,
    filterFn: multiColumnFilterFn,
    enableHiding: false,
  },
  {
    header: "Cuenta",
    accessorKey: "account_id",
    size: 200,
  },
  {
    header: "Valor",
    accessorKey: "amount",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);
      return (
        <Badge
          variant="outline"
          className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
        >
          {formatted}
        </Badge>
      );
    },
    size: 100,
  },
  {
    header: "Proyecto",
    accessorKey: "project",
    cell: ({ row }) => (
      <Badge variant={"secondary"}>{row.getValue("project")}</Badge>
    ),
    size: 100,
    filterFn: projectFilterFn,
  },
  {
    header: "Responsable",
    accessorKey: "responsible_id",
    cell: ({ row }) => (
      <div className="flex flex-col space-y-0">
        <span className="truncate font-medium text-[15px] capitalize">
          {row.original.responsible_id || "—"}
        </span>
        <div className="text-gray-500 font-medium text-xs flex flex-row space-x-1.5">
          <span className="text-gray-700 dark:text-gray-300 font-normal">
            Cédula Responsable:
          </span>
          <span>{row.original.cedula_responsable}</span>
        </div>
      </div>
    ),
    size: 300,
  },
  {
    header: "Vehículo",
    accessorKey: "vehicle_plate",
    cell: ({ row }) => (
      <div className="flex flex-col space-y-0">
        {row.original.vehicle_plate ? (
          <div className="flex flex-row space-x-2">
            <span className="text-gray-700 dark:text-gray-300 font-normal">
              Placa:
            </span>
            <span className="font-medium">{row.original.vehicle_plate}</span>
          </div>
        ) : (
          <span className="text-gray-500">—</span>
        )}
        {row.original.vehicle_number && (
          <div className="flex flex-row space-x-1">
            <span className="text-gray-700 dark:text-gray-300 font-normal">
              No. Transporte:
            </span>
            <span className="font-medium">{row.original.vehicle_number}</span>
          </div>
        )}
      </div>
    ),
  },
  {
    header: "Observación",
    accessorKey: "note",
    size: 200,
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => <RowActions row={row} />,
    size: 60,
    enableHiding: false,
  },
];

function RowActions({ row }: { row: Row<Request> }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex justify-end">
          <Button
            size="icon"
            variant="ghost"
            className="shadow-none"
            aria-label="Editar solicitud"
          >
            <EllipsisIcon size={16} aria-hidden="true" />
          </Button>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            <EditRequestComponent
              row={row.original}
              triggerElement={
                <span className="flex items-center w-full">Editar</span>
              }
            />
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onSelect={(e) => e.preventDefault()}
        >
          <DeleteButtonComponent row={row.original} /> Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function RequestsTableComponent({
  mode,
}: {
  mode: "discount" | "expense";
}) {
  const id = useId();
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const inputRef = useRef<HTMLInputElement>(null);

  const [sorting, setSorting] = useState<SortingState>([
    {
      id: "unique_id",
      desc: true,
    },
  ]);

  const [data, setData] = useState<Request[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState<boolean>(false);
  const [period, setPeriod] = useState<Period>("last_month");

  // Función para refrescar los datos
  const refreshData = async () => {
    try {
      setIsLoading(true);
      const freshData = await requestsApi.fetchRequests({
        type: mode,
        period: period,
      });
      setData(freshData);
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast.error("No se pudieron actualizar los datos. Inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    async function fetchRequests() {
      try {
        setIsLoading(true);
        const data = await requestsApi.fetchRequests({
          type: mode,
          period: period,
        });
        setData(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchRequests();
  }, [mode, period]);

  const contextValue = {
    data,
    setData,
    refreshData,
    isLoading,
    mode,
  };

  const handleDeleteMultiple = async () => {
    const selectedRows = table.getSelectedRowModel().rows;
    const selectedIds = selectedRows.map((row) => row.original.unique_id);

    if (selectedIds.length === 0) {
      toast.error("Selecciona al menos una solicitud para eliminar");
      return;
    }

    try {
      setIsLoading(true);

      // Actualización optimista - Eliminar filas de la UI
      setData((prevData) =>
        prevData.filter((item) => !selectedIds.includes(item.unique_id))
      );

      // Eliminar en la API
      await requestsApi.deleteMultipleRequests(selectedIds);

      // Limpiar selección
      table.resetRowSelection();

      // Mostrar mensaje de éxito
      toast.success(
        `${selectedIds.length} ${
          selectedIds.length === 1
            ? "solicitud eliminada"
            : "solicitudes eliminadas"
        } correctamente`
      );
    } catch (error) {
      console.error("Error deleting multiple requests:", error);

      // Revertir eliminación optimista en caso de error
      refreshData();

      toast.error(
        "No se pudieron eliminar las solicitudes. Inténtalo de nuevo."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitRequests = async (file: File) => {
    try {
      setIsSubmitting(true);

      // Obtener IDs de las filas seleccionadas
      const selectedRows = table.getSelectedRowModel().rows;
      const requestIds = selectedRows.map((row) => row.original.unique_id);

      if (requestIds.length === 0) {
        toast.error("Selecciona al menos una solicitud");
        return;
      }

      // Crear FormData manualmente
      const formData = new FormData();

      // Importante: Añadir el archivo con el nombre original
      formData.append("attachment", file, file.name);

      // Añadir los IDs como array de PHP
      requestIds.forEach((id) => formData.append("request_ids[]", id));

      // Depuración del FormData
      console.log("FormData creado:");
      for (const pair of formData.entries()) {
        if (pair[1] instanceof File) {
          console.log(pair[0] + ": File", {
            name: pair[1].name,
            type: pair[1].type,
            size: pair[1].size,
          });
        } else {
          console.log(pair[0] + ": " + pair[1]);
        }
      }

      // Usar axios para enviar la solicitud
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/reposiciones`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
            // Importante: No especificar Content-Type, para que axios lo configure automáticamente con el boundary correcto
          },
          withCredentials: true,
        }
      );

      // Manejar respuesta exitosa
      if (response.status === 201) {
        toast.success("Solicitudes enviadas correctamente");

        // Actualizar la tabla eliminando las filas enviadas
        setData((prevData) =>
          prevData.filter((item) => !requestIds.includes(item.unique_id))
        );

        // Limpiar selección
        table.resetRowSelection();

        // Cerrar diálogo
        setShowSubmitDialog(false);
      }
    } catch (error) {
      console.error("Error in handleSubmitRequests:", error);

      // Manejar errores de axios
      if (axios.isAxiosError(error)) {
        const errorData = error.response?.data;
        console.error("Error response:", errorData);

        // Mostrar mensaje de error más específico
        if (errorData?.message) {
          toast.error(errorData.message);
        } else if (error.message) {
          toast.error(error.message);
        } else {
          toast.error("Error al enviar las solicitudes");
        }
      } else {
        toast.error(
          error instanceof Error ? error.message : "Error desconocido"
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    enableSortingRemoval: false,
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    state: {
      sorting,
      pagination,
      columnFilters,
      columnVisibility,
    },
  });

  // Get unique status values
  const uniqueStatusValues = useMemo(() => {
    const projectColumn = table.getColumn("project");

    if (!projectColumn) return [];

    const values = Array.from(projectColumn.getFacetedUniqueValues().keys());

    return values.sort();
  }, [table.getColumn("project")?.getFacetedUniqueValues()]);

  // Get counts for each project
  const projectCounts = useMemo(() => {
    const projectColumn = table.getColumn("project");
    if (!projectColumn) return new Map();
    return projectColumn.getFacetedUniqueValues();
  }, [table.getColumn("project")?.getFacetedUniqueValues()]);

  const selectedProjects = useMemo(() => {
    const filterValue = table
      .getColumn("project")
      ?.getFilterValue() as string[];
    return filterValue ?? [];
  }, [table.getColumn("project")?.getFilterValue()]);

  const handleStatusChange = (checked: boolean, value: string) => {
    const filterValue = table
      .getColumn("project")
      ?.getFilterValue() as string[];
    const newFilterValue = filterValue ? [...filterValue] : [];

    if (checked) {
      newFilterValue.push(value);
    } else {
      const index = newFilterValue.indexOf(value);
      if (index > -1) {
        newFilterValue.splice(index, 1);
      }
    }

    table
      .getColumn("project")
      ?.setFilterValue(newFilterValue.length ? newFilterValue : undefined);
  };

  return (
    <TableContextProvider value={contextValue}>
      <div className="space-y-4">
        <h3 className="font-medium text-xl border-b pb-2">
          {mode === "discount" ? "Descuentos" : "Gastos"}
        </h3>
        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Filter by name or email */}
            <div className="relative">
              <Input
                id={`${id}-input`}
                ref={inputRef}
                className={cn(
                  "peer min-w-60 ps-9",
                  Boolean(
                    table.getColumn("responsible_id")?.getFilterValue()
                  ) && "pe-9"
                )}
                value={
                  (table.getColumn("responsible_id")?.getFilterValue() ??
                    "") as string
                }
                onChange={(e) =>
                  table
                    .getColumn("responsible_id")
                    ?.setFilterValue(e.target.value)
                }
                placeholder="Filtrar por nombre o proyecto..."
                type="text"
                aria-label="Filtrar por nombre o proyecto"
              />
              <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
                <ListFilterIcon size={16} aria-hidden="true" />
              </div>
              {Boolean(table.getColumn("responsible_id")?.getFilterValue()) && (
                <button
                  className="text-muted-foreground/80 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none focus:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Clear filter"
                  onClick={() => {
                    table.getColumn("responsible_id")?.setFilterValue("");
                    if (inputRef.current) {
                      inputRef.current.focus();
                    }
                  }}
                >
                  <CircleXIcon size={16} aria-hidden="true" />
                </button>
              )}
            </div>
            {/* Filter by project */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <FilterIcon
                    className="-ms-1 opacity-60"
                    size={16}
                    aria-hidden="true"
                  />
                  Proyecto
                  {selectedProjects.length > 0 && (
                    <span className="bg-background text-muted-foreground/70 -me-1 inline-flex h-5 max-h-full items-center rounded border px-1 font-[inherit] text-[0.625rem] font-medium">
                      {selectedProjects.length}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto min-w-36 p-3" align="start">
                <div className="space-y-3">
                  <div className="text-muted-foreground text-xs font-medium">
                    Filtros
                  </div>
                  <div className="space-y-3">
                    {uniqueStatusValues.map((value, i) => (
                      <div key={value} className="flex items-center gap-2">
                        <Checkbox
                          id={`${id}-${i}`}
                          checked={selectedProjects.includes(value)}
                          onCheckedChange={(checked: boolean) =>
                            handleStatusChange(checked, value)
                          }
                        />
                        <Label
                          htmlFor={`${id}-${i}`}
                          className="flex grow justify-between gap-2 font-normal"
                        >
                          {value}{" "}
                          <span className="text-muted-foreground ms-2 text-xs">
                            {projectCounts.get(value)}
                          </span>
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            {/* Toggle columns visibility */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Columns3Icon
                    className="-ms-1 opacity-60"
                    size={16}
                    aria-hidden="true"
                  />
                  Ver
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Mostrar columnas</DropdownMenuLabel>
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                        onSelect={(event) => event.preventDefault()}
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
            {/* Filter by date */}
            <ToggleGroup
              variant="outline"
              className="flex flex-row"
              type="single"
            >
              <ToggleGroupItem
                className="capitalize px-1.5"
                value="last_week"
                onChange={() => setPeriod("last_week")}
              >
                última semana
              </ToggleGroupItem>
              <ToggleGroupItem
                className="capitalize"
                value="last_month"
                onChange={() => setPeriod("last_month")}
              >
                último mes
              </ToggleGroupItem>
              <ToggleGroupItem
                className="capitalize"
                value="all"
                onChange={() => setPeriod("all")}
              >
                Ver todo
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
          <div className="flex items-center gap-3">
            {/* Delete button */}
            {table.getSelectedRowModel().rows.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button className="ml-auto" variant="destructive">
                    <TrashIcon
                      className="-ms-1 opacity-60"
                      size={16}
                      aria-hidden="true"
                    />
                    Eliminar
                    <span className="bg-background text-muted-foreground/70 -me-1 inline-flex h-5 max-h-full items-center rounded border px-1 font-[inherit] text-[0.625rem] font-medium">
                      {table.getSelectedRowModel().rows.length}
                    </span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <div className="flex flex-col gap-2 max-sm:items-center sm:flex-row sm:gap-4">
                    <div
                      className="flex size-9 shrink-0 items-center justify-center rounded-full border"
                      aria-hidden="true"
                    >
                      <CircleAlertIcon className="opacity-80" size={16} />
                    </div>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        ¿Estás realmente seguro?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta acción no se puede deshacer. Esto eliminará
                        permanentemente{" "}
                        {table.getSelectedRowModel().rows.length}{" "}
                        {table.getSelectedRowModel().rows.length === 1
                          ? "solicitud seleccionada"
                          : "solicitudes seleccionadas"}
                        .
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={isLoading}>
                      Cancelar
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={(e) => {
                        e.preventDefault();
                        handleDeleteMultiple();
                      }}
                      disabled={isLoading}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {isLoading ? (
                        <>
                          <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                          Eliminando...
                        </>
                      ) : (
                        "Eliminar"
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            {/* Botón de "Enviar Solicitud" */}
            <Button
              className="ml-auto"
              variant="outline"
              onClick={() => {
                if (table.getSelectedRowModel().rows.length === 0) {
                  toast.error("Selecciona al menos una solicitud para enviar");
                  return;
                }
                setShowSubmitDialog(true);
              }}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <FaPaperPlane
                  className="-ms-1 opacity-60"
                  size={16}
                  aria-hidden="true"
                />
              )}
              {isSubmitting ? "Enviando..." : "Enviar Solicitud"}
              <span className="bg-background text-muted-foreground/70 -me-1 inline-flex h-5 max-h-full items-center rounded border px-1 font-[inherit] text-[0.625rem] font-medium">
                {table.getSelectedRowModel().rows.length}
              </span>
            </Button>

            {/* Añade el componente de diálogo */}
            <SubmitFileDialog
              open={showSubmitDialog}
              onOpenChange={setShowSubmitDialog}
              onSubmit={handleSubmitRequests}
              isSubmitting={isSubmitting}
              count={table.getSelectedRowModel().rows.length}
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-background overflow-hidden rounded-md border">
          <Table className="table-fixed">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent">
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead
                        key={header.id}
                        style={{ width: `${header.getSize()}px` }}
                        className="h-11"
                      >
                        {header.isPlaceholder ? null : header.column.getCanSort() ? (
                          <div
                            className={cn(
                              header.column.getCanSort() &&
                                "flex h-full cursor-pointer items-center justify-between gap-2 select-none"
                            )}
                            onClick={header.column.getToggleSortingHandler()}
                            onKeyDown={(e) => {
                              // Enhanced keyboard handling for sorting
                              if (
                                header.column.getCanSort() &&
                                (e.key === "Enter" || e.key === " ")
                              ) {
                                e.preventDefault();
                                header.column.getToggleSortingHandler()?.(e);
                              }
                            }}
                            tabIndex={
                              header.column.getCanSort() ? 0 : undefined
                            }
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            {{
                              asc: (
                                <ChevronUpIcon
                                  className="shrink-0 opacity-60"
                                  size={16}
                                  aria-hidden="true"
                                />
                              ),
                              desc: (
                                <ChevronDownIcon
                                  className="shrink-0 opacity-60"
                                  size={16}
                                  aria-hidden="true"
                                />
                              ),
                            }[header.column.getIsSorted() as string] ?? null}
                          </div>
                        ) : (
                          flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )
                        )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="flex flex-row items-center justify-center text-center mx-auto space-x-2"
                  >
                    <LoaderCircle className="animate-spin" />
                    <span>Cargando datos...</span>
                  </TableCell>
                </TableRow>
              )}
              {table.getRowModel().rows?.length
                ? table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="last:py-0">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                : !isLoading && (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="h-24 text-center text-slate-400 datk:text-sate-600"
                      >
                        Sin resultados.
                      </TableCell>
                    </TableRow>
                  )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between gap-8">
          {/* Results per page */}
          <div className="flex items-center gap-3">
            <Label htmlFor={id} className="max-sm:sr-only">
              Filas por página
            </Label>
            <Select
              value={table.getState().pagination.pageSize.toString()}
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger id={id} className="w-fit whitespace-nowrap">
                <SelectValue placeholder="Select number of results" />
              </SelectTrigger>
              <SelectContent className="[&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2">
                {[5, 10, 25, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={pageSize.toString()}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Page number information */}
          <div className="text-muted-foreground flex grow justify-end text-sm whitespace-nowrap">
            <p
              className="text-muted-foreground text-sm whitespace-nowrap"
              aria-live="polite"
            >
              <span className="text-foreground">
                {table.getState().pagination.pageIndex *
                  table.getState().pagination.pageSize +
                  1}
                -
                {Math.min(
                  Math.max(
                    table.getState().pagination.pageIndex *
                      table.getState().pagination.pageSize +
                      table.getState().pagination.pageSize,
                    0
                  ),
                  table.getRowCount()
                )}
              </span>{" "}
              de{" "}
              <span className="text-foreground">
                {table.getRowCount().toString()}
              </span>
            </p>
          </div>

          {/* Pagination buttons */}
          <div>
            <Pagination>
              <PaginationContent>
                {/* First page button */}
                <PaginationItem>
                  <Button
                    size="icon"
                    variant="outline"
                    className="disabled:pointer-events-none disabled:opacity-50"
                    onClick={() => table.firstPage()}
                    disabled={!table.getCanPreviousPage()}
                    aria-label="Ir a la primera página"
                  >
                    <ChevronFirstIcon size={16} aria-hidden="true" />
                  </Button>
                </PaginationItem>
                {/* Previous page button */}
                <PaginationItem>
                  <Button
                    size="icon"
                    variant="outline"
                    className="disabled:pointer-events-none disabled:opacity-50"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                    aria-label="Ir a la página anterior"
                  >
                    <ChevronLeftIcon size={16} aria-hidden="true" />
                  </Button>
                </PaginationItem>
                {/* Next page button */}
                <PaginationItem>
                  <Button
                    size="icon"
                    variant="outline"
                    className="disabled:pointer-events-none disabled:opacity-50"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                    aria-label="Ir a la siguiente página"
                  >
                    <ChevronRightIcon size={16} aria-hidden="true" />
                  </Button>
                </PaginationItem>
                {/* Last page button */}
                <PaginationItem>
                  <Button
                    size="icon"
                    variant="outline"
                    className="disabled:pointer-events-none disabled:opacity-50"
                    onClick={() => table.lastPage()}
                    disabled={!table.getCanNextPage()}
                    aria-label="Go to last page"
                  >
                    <ChevronLastIcon size={16} aria-hidden="true" />
                  </Button>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      </div>
    </TableContextProvider>
  );
}
