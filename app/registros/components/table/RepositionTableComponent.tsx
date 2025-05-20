/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
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
  CircleXIcon,
  Columns3Icon,
  EllipsisIcon,
  FilterIcon,
  ListFilterIcon,
  LoaderCircle,
} from "lucide-react";

import { cn } from "@/lib/utils";
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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { toast } from "sonner";
import { repositionsApi } from "@/services/axios";
import { Reposition, TableContextProvider } from "@/contexts/TableContext";
import RepositionDetailsTableComponent from "./RepositionDetailsTableComponent";
import PayRepositionComponent from "../PayRepositionComponent";
import RejectRepositionComponent from "../RejectRepositionComponent";
import { useAuth } from "@/hooks/useAuth";

type Period = "last_week" | "last_month" | "all";
type Status = "rejected" | "pending" | "paid" | "all";

const Statuses = {
  pending: "Pendiente",
  paid: "Pagada",
  rejected: "Rechazada",
};

// Custom filter function for multi-column searching
const multiColumnFilterFn: FilterFn<Reposition> = (
  row,
  columnId,
  filterValue
) => {
  // Si filterValue es un array (como en el caso del filtro de proyecto), manejarlo de manera diferente
  if (Array.isArray(filterValue)) {
    const value = row.getValue(columnId);
    return filterValue.includes(value);
  }

  // Para búsquedas de texto globales
  const searchableRowContent = Object.values(row.original)
    .map((value) => {
      if (value instanceof Date) {
        return value.toLocaleDateString("es-EC");
      }
      return String(value ?? "");
    })
    .join(" ")
    .toLowerCase();

  const searchTerm = String(filterValue ?? "").toLowerCase();
  return searchableRowContent.includes(searchTerm);
};

// RowActions component optimized with React.memo
const RowActions = React.memo(({ row }: { row: Row<Reposition> }) => {
  const user = useAuth().user;
  const allowedUsers = [
    "claudia.pereira@logex.ec",
    "omar.rubio@logex.ec",
    "jk@logex.ec",
    "michelle.quintana@logex.ec",
    "nicolas.iza@logex.ec",
    "lorena.herrera@logex.ec",
    "luis.espinosa@logex.ec",
    "diego.merisalde@logex.ec",
    "ricardo.estrella@logex.ec",
  ];

  if (user && !allowedUsers.includes(user.email)) return;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={
          row.original.status === "paid" || row.original.status === "rejected"
        }
        className={`${
          (row.original.status === "paid" ||
            row.original.status === "rejected") &&
          "cursor-not-allowed"
        } disabled:cursor-not-allowed`}
      >
        <EllipsisIcon size={16} aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            <PayRepositionComponent
              item={row.original}
              type={
                row.original.detail![0].startsWith("D") ? "discount" : "expense"
              }
            />
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onSelect={(e) => e.preventDefault()}
        >
          <RejectRepositionComponent
            item={row.original}
            type={
              row.original.detail![0].startsWith("D") ? "discount" : "expense"
            }
          />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
});
RowActions.displayName = "RowActions";

// Memoized formatters to prevent recreating functions in render cycles
const formatDate = (date: string | Date) =>
  (date instanceof Date ? date : new Date(date)).toLocaleDateString("es-EC", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });

const formatCurrency = (amount: number | string) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(typeof amount === "string" ? parseFloat(amount) : amount);

// Factory function for column definitions
const createColumns = (): ColumnDef<Reposition>[] => [
  {
    header: "ID",
    accessorKey: "id",
    cell: ({ row }) => (
      <div className="font-semibold text-slate-800 dark:text-slate-200">
        {row.getValue("id")}
      </div>
    ),
    size: 75,
    filterFn: multiColumnFilterFn,
    enableHiding: false,
  },
  {
    header: "Fecha",
    accessorKey: "fecha_reposicion",
    cell: ({ row }) => (
      <div className="font-normal">
        {formatDate(row.original.fecha_reposicion || "")}
      </div>
    ),
    size: 120,
    filterFn: multiColumnFilterFn,
    enableHiding: false,
  },
  {
    header: "Total",
    accessorKey: "total_reposicion",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("total_reposicion"));
      return (
        <Badge variant="secondary" className="cursor-default">
          {formatCurrency(amount)}
        </Badge>
      );
    },
    filterFn: multiColumnFilterFn,
    size: 90,
  },
  {
    header: "Estado",
    accessorKey: "status",
    cell: ({ row }) => (
      <Badge
        variant="outline"
        className={`${
          row.original.status === "pending"
            ? "bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300"
            : row.original.status === "rejected"
            ? "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300"
            : "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
        }`}
      >
        {Statuses[row.original.status]}
      </Badge>
    ),
    size: 100,
    filterFn: multiColumnFilterFn,
  },
  {
    header: "Proyecto",
    accessorKey: "project",
    cell: ({ row }) => {
      const rawValue = row.getValue("project") as string;
      const projects = rawValue.split(",");
      const display =
        projects.length > 1
          ? `${projects[0]} y ${projects.length - 1} más`
          : projects[0];

      return <Badge variant="secondary">{display}</Badge>;
    },
    size: 100,
    filterFn: multiColumnFilterFn,
  },
  {
    header: "Mes/Rol",
    accessorKey: "month",
    cell: ({ row }) => {
      const monthValue = row.original.month;

      const isValidDate =
        typeof monthValue === "string" && /^\d{4}-\d{2}$/.test(monthValue);

      const date = isValidDate
        ? (() => {
            const [year, month] = monthValue.split("-");
            return `${month}/${year}`;
          })()
        : "—";

      return (
        <div className="flex flex-col space-y-0">
          <span className="truncate font-medium text-[15px]">{date}</span>
        </div>
      );
    },
    filterFn: multiColumnFilterFn,
    size: 150,
  },
  {
    header: "Descontar en",
    accessorKey: "when",
    cell: ({ row }) => (
      <div className="flex flex-col space-y-0">
        {row.original.when ? (
          <span className="font-medium capitalize">{row.original.when}</span>
        ) : (
          <span className="text-gray-500 text-start">N/A</span>
        )}
      </div>
    ),
    filterFn: multiColumnFilterFn,
    size: 120,
  },
  {
    header: "Tipo",
    cell: ({ row }) => {
      const firstItem = row.original.detail![0];
      const typeOfRequest = firstItem.startsWith("I")
        ? "Ingreso"
        : firstItem.startsWith("P")
        ? "Préstamo"
        : firstItem.startsWith("D")
        ? "Descuento"
        : "Gasto";
      const requestColors = firstItem.startsWith("I")
        ? "text-emerald-600 dark:text-emerald-400"
        : firstItem.startsWith("P")
        ? "text-orange-600 dark:text-orange-400"
        : firstItem.startsWith("D")
        ? "text-amber-600 dark:text-amber-400"
        : "text-rose-600 dark:text-rose-400";

      return (
        <span className={`${requestColors} font-medium`}>{typeOfRequest}</span>
      );
    },
    size: 100,
  },
  {
    header: "Detalles",
    cell: ({ row }) => {
      const reposition_id = row.original.id;
      const total_reposition = parseFloat(row.getValue("total_reposicion"));
      return (
        <RepositionDetailsTableComponent
          reposition={reposition_id}
          total={total_reposition}
        />
      );
    },
    size: 125,
  },
  {
    header: "Observación",
    accessorKey: "note",
    cell: ({ row }) => <span className="text-sm">{row.getValue("note")}</span>,
    size: 200,
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => <RowActions row={row} />,
    size: 60,
    enableHiding: false,
    filterFn: multiColumnFilterFn,
  },
];

export default function RepositionTableComponent({
  mode,
}: {
  mode: "all" | "income";
}) {
  const id = useId();
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const inputRef = useRef<HTMLInputElement>(null);

  const [sorting, setSorting] = useState<SortingState>([
    {
      id: "id",
      desc: true,
    },
  ]);

  const [data, setData] = useState<Reposition[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [period, setPeriod] = useState<Period>("last_week");
  const [status, setStatus] = useState<Status>("pending");

  // Memoized column definitions
  const columns = useMemo(() => createColumns(), []);

  // Use useCallback for functions to prevent unnecessary re-renders
  const refreshData = useCallback(async () => {
    try {
      setIsLoading(true);
      const freshData = await repositionsApi.fetchRepositions({
        mode: mode,
        period: period,
        status: status,
      });
      setData(freshData);
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast.error("No se pudieron actualizar los datos. Inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  }, [mode, period, status]);

  // Fetch data when dependencies change
  useEffect(() => {
    let isMounted = true;

    async function fetchRepositions() {
      try {
        setIsLoading(true);
        const fetchedData = await repositionsApi.fetchRepositions({
          mode: mode,
          period: period,
          status: status,
        });

        if (isMounted) {
          setData(fetchedData);
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchRepositions();

    return () => {
      isMounted = false;
    };
  }, [mode, period, status]);

  // Memoize context value to prevent unnecessary re-renders of children
  const contextValue = useMemo(
    () => ({
      data,
      setData,
      refreshData,
      isLoading,
      mode,
    }),
    [data, refreshData, isLoading, mode]
  );

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
    globalFilterFn: multiColumnFilterFn,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      pagination,
      columnFilters,
      columnVisibility,
      globalFilter,
    },
  });

  // Memoize filter-related values to prevent unnecessary calculations
  const uniqueStatusValues = useMemo(() => {
    const projectColumn = table.getColumn("project");
    if (!projectColumn) return [];
    const values = Array.from(projectColumn.getFacetedUniqueValues().keys());
    return values.sort();
  }, [table.getColumn("project")?.getFacetedUniqueValues()]);

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

  // Handler with useCallback
  const handleStatusChange = useCallback(
    (checked: boolean, value: string) => {
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
    },
    [table]
  );

  // Total amount calculation with useMemo
  const totalAmount = useMemo(
    () =>
      data.reduce((sum, row) => sum + (Number(row.total_reposicion) || 0), 0),
    [data]
  );

  return (
    <TableContextProvider value={contextValue}>
      <div className="space-y-4">
        <h3 className="font-medium text-xl border-b pb-2">
          {mode === "all"
            ? "Solicitudes de Reposiciones"
            : "Solicitudes de Reposiciones (Ingresos)"}
        </h3>
        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Filter by name */}
            <div className="relative">
              <Input
                id={`${id}-input`}
                ref={inputRef}
                className={cn(
                  "peer min-w-60 ps-9",
                  Boolean(globalFilter) && "pe-9"
                )}
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                placeholder="Buscar en todas las columnas..."
                type="text"
                aria-label="Buscar en todas las columnas"
              />
              <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
                <ListFilterIcon size={16} aria-hidden="true" />
              </div>
              {Boolean(table.getColumn("month")?.getFilterValue()) && (
                <button
                  className="text-muted-foreground/80 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none focus:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Clear filter"
                  onClick={() => {
                    table.getColumn("month")?.setFilterValue("");
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
                        {column.columnDef.header?.toString()}
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
              value={period}
              onValueChange={(value) => setPeriod(value as Period)}
            >
              <ToggleGroupItem
                className="capitalize px-[18px]"
                value="last_week"
              >
                última semana
              </ToggleGroupItem>
              <ToggleGroupItem className="capitalize px-2" value="last_month">
                último mes
              </ToggleGroupItem>
              <ToggleGroupItem className="capitalize" value="all">
                Ver todo
              </ToggleGroupItem>
            </ToggleGroup>
            {/* Filter by status */}
            <ToggleGroup
              variant="outline"
              className="flex flex-row"
              type="single"
              value={status}
              onValueChange={(value) => setStatus(value as Status)}
            >
              <ToggleGroupItem className="capitalize px-4" value="pending">
                Pendientes
              </ToggleGroupItem>
              <ToggleGroupItem className="capitalize px-2" value="paid">
                Pagadas
              </ToggleGroupItem>
              <ToggleGroupItem className="capitalize px-4" value="rejected">
                Rechazadas
              </ToggleGroupItem>
              <ToggleGroupItem className="capitalize" value="all">
                Todas
              </ToggleGroupItem>
            </ToggleGroup>
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
                  <TableCell colSpan={columns.length}>
                    <div className="flex items-center justify-center mx-auto space-x-2 w-max">
                      <LoaderCircle className="animate-spin text-red-700 size-4" />
                      <span className="text-gray-800 dark:text-gray-300 animate-pulse">
                        Cargando reposiciones...
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              )}
              {table.getRowModel().rows?.length && !isLoading
                ? table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      className={`${
                        row.original.status === "rejected" ||
                        (row.original.status === "paid" && "opacity-50")
                      }`}
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
          <div
            className="flex grow justify-center text-sm whitespace-nowrap"
            aria-live="polite"
          >
            <span className="font-normal">
              <div className="flex space-x-1 text-slate-600 dark:text-slate-400">
                <div>
                  Total:{" "}
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {formatCurrency(totalAmount)}
                  </span>
                </div>
              </div>
            </span>
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
