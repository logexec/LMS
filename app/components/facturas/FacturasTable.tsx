/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useDeferredValue,
} from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  SortingState,
  getFilteredRowModel,
  useReactTable,
  Row,
} from "@tanstack/react-table";
import { rankItem } from "@tanstack/match-sorter-utils";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import axios, { AxiosInstance } from "axios";
import ComboBox from "../ui/Combobox";
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronFirstIcon,
  ChevronLastIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  DownloadIcon,
  XIcon,
} from "lucide-react";
import { Factura } from "@/types/factura";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
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
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface Option {
  value: string;
  label: string;
}

const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  timeout: 120_000,
});

interface FacturasTableProps {
  facturas: Factura[];
  loading: boolean;
  updateFactura: (id: number, data: Partial<Factura>) => void;
  fetchFacturas: () => void;
  isCompleteView: boolean;
}
export default function FacturasTable({
  facturas,
  loading,
  updateFactura,
  fetchFacturas,
  isCompleteView,
}: FacturasTableProps) {
  const [filterProyecto, setFilterProyecto] = useState<string>("");
  const [filterCentro, setFilterCentro] = useState<string>("");
  const [filterCuentaContable, setFilterCuentaContable] = useState<string>("");
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const deferredGlobalFilter = useDeferredValue(globalFilter);

  const [proyectosLatinium, setProyectosLatinium] = useState<Option[]>([]);
  const [centrosCosto, setCentrosCosto] = useState<Option[]>([]);
  const [accounts, setAccounts] = useState<Option[]>([]);

  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [edits, setEdits] = useState<Record<number, Partial<Factura>>>({});
  const hasEdits = Object.keys(edits).length > 0;

  const onEditCell = (rowId: number, field: keyof Factura, value: any) => {
    // 1) Guardamos el cambio en edits[rowId]
    setEdits((prev) => ({
      ...prev,
      [rowId]: { ...prev[rowId], [field]: value },
    }));
    // 2) Autoseleccionamos la fila
    setSelectedRows((prev) => (prev.includes(rowId) ? prev : [...prev, rowId]));
  };

  const handleSave = () => {
    const editedRowIds = Object.keys(edits).map((id) => parseInt(id, 10));

    // Si hay varias filas seleccionadas pero solo un conjunto de cambios,
    // aplicamos esos cambios a todas las filas marcadas
    if (selectedRows.length > 1 && editedRowIds.length === 1) {
      const onlyChanges = edits[editedRowIds[0]];
      selectedRows.forEach((rowId) => {
        updateFactura(rowId, onlyChanges!);
      });
      fetchFacturas();
    } else {
      // Casos normales: cada fila con su propio cambio
      editedRowIds.forEach((rowId) => {
        updateFactura(rowId, edits[rowId]!);
      });
    }

    // Limpiamos estado
    setEdits({});
    setSelectedRows([]);
  };

  // Fetch combo options
  useEffect(() => {
    apiClient
      .get<{ data: Option[] }>("/latinium/projects")
      .then((res) => setProyectosLatinium(res.data.data))
      .catch((err) => {
        console.error(err);
        toast.error("No se pudieron cargar los proyectos");
      });

    apiClient
      .get<{ data: Option[] }>("/latinium/centro-costo")
      .then((res) => setCentrosCosto(res.data.data))
      .catch((err) => {
        console.error(err);
        toast.error("No se pudieron cargar los centros de costo");
      });

    apiClient
      .get<{ data: Option[] }>("/latinium/accounts")
      .then((res) => setAccounts(res.data.data))
      .catch((err) => {
        console.error(err);
        toast.error("No se pudieron cargar las cuentas contables");
      });
  }, []);

  const updateAccountantStatus = () => {
    const pendientes = facturas.filter((f) => f.contabilizado === "PENDIENTE");

    apiClient
      .patch("/latinium/estado-contable", { facturas: pendientes })
      .then((res) => {
        toast.success("Estado contable actualizado correctamente.");
        console.log(res);
        fetchFacturas(); // refresca la lista
      })
      .catch((err) => {
        console.error(err);
        toast.error("Error al actualizar el estado contable.");
      });
  };

  // Global fuzzy filter function
  const fuzzyFilter = <TData,>(
    row: Row<TData>,
    columnId: string,
    filterValue: string
  ) => {
    const itemRank = rankItem(row.getValue<any>(columnId), filterValue);
    return itemRank.passed;
  };

  // Aplica primero los filtros locales si estamos en vista "completas"
  const data = useMemo(() => {
    let d = facturas;
    if (isCompleteView) {
      if (filterProyecto) {
        d = d.filter((f) => f.project === filterProyecto);
      }
      if (filterCentro) {
        d = d.filter((f) => f.centro_costo === filterCentro);
      }
      if (filterCuentaContable) {
        d = d.filter((f) => f.cuenta_contable === filterCuentaContable);
      }
    }
    return d;
  }, [
    facturas,
    isCompleteView,
    filterProyecto,
    filterCentro,
    filterCuentaContable,
  ]);

  // Handlers memoizados para selection masiva
  const toggleSelect = useCallback((id: number) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelectedRows((prev) =>
      prev.length === data.length ? [] : data.map((f) => f.id)
    );
  }, [data]);

  // Define columns
  const columns = useMemo<ColumnDef<Factura, any>[]>(
    () => [
      {
        id: "select",
        header: () => (
          <input
            type="checkbox"
            checked={selectedRows.length === data.length}
            onChange={toggleSelectAll}
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={selectedRows.includes(row.original.id)}
            onChange={() => toggleSelect(row.original.id)}
          />
        ),
      },
      { accessorKey: "mes", header: "Mes" },
      {
        accessorKey: "razon_social_emisor",
        header: "Proveedor",
        cell: ({ row }) => (
          <span
            className="inline-flex min-w-16 max-w-48 truncate"
            title={row.original.razon_social_emisor}
          >
            {row.original.razon_social_emisor}
          </span>
        ),
      },
      { accessorKey: "ruc_emisor", header: "RUC" },
      { accessorKey: "secuencial", header: "Secuencial" },
      {
        accessorKey: "fecha_emision",
        header: "Fecha Emisión",
        cell: ({ row }) => (
          <span className="w-max inline-flex px-4">
            {row.original.fecha_emision?.split("T")[0]}
          </span>
        ),
      },
      {
        accessorKey: "clave_acceso",
        header: "Autorización",
        cell: ({ row }) => (
          <span
            className="max-w-24 inline-flex truncate"
            title={row.original.clave_acceso}
          >
            {row.original.clave_acceso}
          </span>
        ),
      },
      {
        accessorFn: (row) => `$${row.importe_total}`,
        id: "importe_total",
        header: "Precio",
      },
      {
        accessorKey: "project",
        header: "Proyecto",
        cell: ({ row }) => {
          const id = row.original.id;
          return (
            <ComboBox
              selected={edits[id]?.project ?? row.original.project}
              options={proyectosLatinium}
              onChange={(val) => onEditCell(id, "project", val)}
            />
          );
        },
      },
      {
        accessorKey: "centro_costo",
        header: "Centro Costo",
        cell: ({ row }) => {
          const id = row.original.id;
          return (
            <ComboBox
              selected={edits[id]?.centro_costo ?? row.original.centro_costo}
              options={centrosCosto}
              onChange={(val) => onEditCell(id, "centro_costo", val)}
            />
          );
        },
      },
      {
        accessorKey: "descripcion",
        id: "descripcion",
        header: "Descripción",
        cell: ({ row }) => (
          <span
            className="max-w-64 inline-flex truncate"
            title={row.original.descripcion!.descripcion}
          >
            {row.original.descripcion!.descripcion}
          </span>
        ),
      },
      {
        accessorKey: "observacion",
        header: "Observación",
        cell: ({ row }) => {
          const id = row.original.id;
          return (
            <Input
              className="min-w-64 max-w-lg"
              defaultValue={
                edits[id]?.observacion ?? row.original.observacion ?? ""
              }
              onBlur={(e) => {
                const val = e.target.value;
                // deferimos el setState para que el próximo click en otro input no se pierda
                setTimeout(() => onEditCell(id, "observacion", val), 0);
              }}
            />
          );
        },
      },
      {
        accessorKey: "contabilizado",
        header: "Contabilizado",
        cell: ({ row }) => (
          <span className="flex justify-center">
            {row.original.contabilizado === "PENDIENTE" ? (
              <XIcon className="h-4 w-4 text-red-500" />
            ) : (
              <CheckIcon className="h-4 w-4 text-green-500" />
            )}
          </span>
        ),
      },
      {
        accessorKey: "cuenta_contable",
        header: "Cuenta Contable",
        cell: ({ row }) => {
          const id = row.original.id;
          return (
            <ComboBox
              selected={
                edits[id]?.cuenta_contable ?? row.original.cuenta_contable
              }
              options={accounts}
              onChange={(val) => onEditCell(id, "cuenta_contable", val)}
            />
          );
        },
      },
      {
        accessorKey: "proveedor_latinium",
        header: "Proveedor Latinium",
        cell: ({ row }) => (
          <span
            className={`w-max inline-flex ${
              !row.original.proveedor_latinium &&
              "text-gray-400 font-normal italic text-sm"
            }`}
          >
            {row.original.proveedor_latinium ??
              "El proveedor no se encuentra registrado en LATINIUM"}
          </span>
        ),
      },
      {
        accessorKey: "nota_latinium",
        header: "Nota Latinium",
        cell: ({ row }) => (
          <span
            className={`w-max inline-flex ${
              !row.original.nota_latinium &&
              "text-gray-400 font-normal italic text-sm"
            }`}
          >
            {row.original.nota_latinium ?? "Faltan datos para generar la nota"}
          </span>
        ),
      },
      {
        header: "Factura PDF",
        id: "download",
        cell: ({ row }) => (
          <Button
            variant="outline"
            title="Descargar Factura"
            onClick={() => {
              window.alert(
                `Si puedes leer este mensaje, es porque olvide de darle funcionalidad para generar la factura en PDF. Con todo, esta factura pertenece a ${row.original.nombre_comercial_emisor}. Su secuencial es ${row.original.secuencial} :)`
              );
            }}
          >
            <DownloadIcon size={4} />
          </Button>
        ),
      },
    ],
    [
      data,
      selectedRows,
      accounts,
      centrosCosto,
      proyectosLatinium,
      toggleSelect,
      toggleSelectAll,
      edits,
    ]
  );

  { /* Para la Paginacion y Organizacion */ }
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 50,
  });

  const [sorting, setSorting] = useState<SortingState>([
    {
      id: "razon_social_emisor", // Columna a ordenar por defecto. || Proveedor
      desc: false,
    },
  ]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    enableSortingRemoval: false,
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    globalFilterFn: fuzzyFilter,
    state: {
      globalFilter: deferredGlobalFilter,
      sorting,
      pagination,
    },
  });

  return (
    <div className="space-y-6">
      {/* filtros */}
      <div className="flex gap-4 flex-wrap pt-3 items-end">
        {isCompleteView && (
          <>
            <div className="relative">
              <small className="absolute -top-5 left-0">Proyecto</small>
              <ComboBox
                selected={filterProyecto}
                options={proyectosLatinium}
                onChange={setFilterProyecto}
              />
            </div>
            <div className="relative">
              <small className="absolute -top-5 left-0">Centro Costo</small>
              <ComboBox
                selected={filterCentro}
                options={centrosCosto}
                onChange={setFilterCentro}
              />
            </div>
            <div className="relative">
              <small className="absolute -top-5 left-0">Cuenta Contable</small>
              <ComboBox
                selected={filterCuentaContable}
                options={accounts}
                onChange={setFilterCuentaContable}
              />
            </div>
          </>
        )}

        {/* Siempre */}
        <div className="relative flex-1 max-w-sm">
          <small className="absolute -top-5 left-0">Buscar</small>
          <Input
            placeholder="Buscar…"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
          />
        </div>

        {isCompleteView && (
          <Button
            variant="outline"
            onClick={() => updateAccountantStatus()}
            className="bg-gray-700 text-white py-2 px-5 font-bold hover:bg-gray-700/85 hover:text-white transition-colors duration-300"
          >
            Actualizar desde Latinium
          </Button>
        )}

        {hasEdits && (
          <Button
            variant="outline"
            onClick={handleSave}
            className="bg-red-500 text-white py-2 px-5 font-bold"
          >
            Guardar cambios ({Object.keys(selectedRows).length} filas)
          </Button>
        )}
      </div>

      {/* tabla */}

      <div className="bg-background overflow-hidden rounded-md border">
        <Table className="min-w-full">
          <TableHeader className="sticky top-0 bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    style={{ width: `${header.getSize()}px` }}
                    className="h-11"
                  >
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
                      tabIndex={header.column.getCanSort() ? 0 : undefined}
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
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={15} className="text-center p-4">
                  Cargando...
                </TableCell>
              </TableRow>
            ) : facturas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={15} className="text-center p-4">
                  No hay facturas
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="even:bg-gray-100">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-4 py-2 align-top">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {/* Pagination */}
      <div className="flex items-center justify-between gap-8">
        {/* Results per page */}
        <div className="flex items-center gap-3">
          <Label htmlFor={"pagination"} className="max-sm:sr-only">
            Filas por p&aacute;gina
          </Label>
          <Select
            value={table.getState().pagination.pageSize.toString()}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger
              id={"pagination"}
              className="w-fit whitespace-nowrap"
            >
              <SelectValue placeholder="Selecciona el numero de resultados" />
            </SelectTrigger>
            <SelectContent className="[&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2">
              {[50, 100, 250, 500].map((pageSize) => (
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
                  aria-label="Página anterior"
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
                  aria-label="Siguiente página"
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
                  aria-label="Ir a la ultima página"
                >
                  <ChevronLastIcon size={16} aria-hidden="true" />
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  );
}
