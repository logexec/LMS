"use client";

import { useState, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  RowSelectionState,
  flexRender,
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
import { ChevronDown, SendHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Loader from "@/app/Loader";
import {
  getRequestColumns,
  getReposicionColumns,
} from "@/app/registros/components/tableColumns";
import {
  DataTableProps,
  RequestProps,
  ReposicionProps,
  AccountProps,
  ResponsibleProps,
  TransportProps,
} from "@/utils/types";

const fetchData = async (
  mode: "requests" | "reposiciones",
  type?: "discount" | "expense"
) => {
  let url = `${process.env.NEXT_PUBLIC_API_URL}/${mode}`;
  if (mode === "requests" && type) {
    url += `?type=${type}&&status=pending`;
  }

  const response = await fetch(url, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Error fetching ${mode}`);
  }

  return response.json();
};

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
  const [data, setData] = useState<TData[]>([]);
  const [accounts, setAccounts] = useState<AccountProps[]>([]);
  const [responsibles, setResponsibles] = useState<ResponsibleProps[]>([]);
  const [vehicles, setVehicles] = useState<TransportProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  useEffect(() => {
    const loadData = async () => {
      try {
        const [mainData, accountsData, responsiblesData, vehiclesData] =
          await Promise.all([
            fetchData(mode, type),
            fetchAccounts(),
            fetchResponsibles(),
            fetchVehicles(),
          ]);

        setData(mainData as TData[]);
        setAccounts(accountsData);
        setResponsibles(responsiblesData);
        setVehicles(vehiclesData);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Error al cargar los datos");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [mode, type]);

  // Mapear los datos para las columnas
  const accountMap = accounts.reduce((acc, account) => {
    acc[account.id] = account.name;
    return acc;
  }, {} as Record<string, string>);

  const responsibleMap = responsibles.reduce((acc, responsible) => {
    acc[responsible.id] = responsible.nombre_completo;
    return acc;
  }, {} as Record<string, string>);

  const vehicleMap = vehicles.reduce((acc, vehicle) => {
    acc[vehicle.id] = vehicle.name;
    return acc;
  }, {} as Record<string, string>);

  const columns =
    mode === "requests"
      ? getRequestColumns({
          accountMap,
          responsibleMap,
          vehicleMap,
          onStatusChange,
        })
      : getReposicionColumns({
          accountMap,
          responsibleMap,
          vehicleMap,
          onUpdateReposicion,
        });

  const table = useReactTable({
    data,
    columns: columns as any,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
  });

  const handleSendRequests = async () => {
    try {
      console.log("Iniciando handleSendRequests");

      if (!Object.keys(rowSelection).length) {
        toast.error("Selecciona al menos una solicitud");
        return;
      }

      const selectedRows = table.getSelectedRowModel().rows;
      console.log("Filas seleccionadas:", selectedRows);

      // Verificar que todos los IDs sean válidos
      const requestIds = selectedRows.map((row) => {
        const uniqueId = (row.original as RequestProps).unique_id;
        if (!uniqueId || uniqueId.trim() === "") {
          throw new Error(
            `ID inválido encontrado: ${JSON.stringify(row.original)}`
          );
        }
        return uniqueId;
      });

      // Verificar que todos sean del mismo proyecto
      const proyectos = new Set(
        selectedRows.map((row) => (row.original as RequestProps).project)
      );

      if (proyectos.size > 1) {
        toast.error("Todas las solicitudes deben ser del mismo proyecto");
        return;
      }

      if (!onCreateReposicion) {
        toast.error("Error en la configuración");
        return;
      }

      console.log("Enviando solicitudes:", requestIds);
      await onCreateReposicion(requestIds);

      // Limpiar selección
      setRowSelection({});

      // Recargar datos
      try {
        const [mainData, accountsData, responsiblesData, vehiclesData] =
          await Promise.all([
            fetchData(mode, type),
            fetchAccounts(),
            fetchResponsibles(),
            fetchVehicles(),
          ]);

        setData(mainData as TData[]);
        setAccounts(accountsData);
        setResponsibles(responsiblesData);
        setVehicles(vehiclesData);
      } catch (error) {
        console.error("Error al recargar los datos:", error);
        toast.error("Error al actualizar la tabla");
      }
    } catch (error: any) {
      console.error("Error detallado:", error);
      const errorMessage = error.message || "Error al crear la reposición";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center gap-4">
          <Input
            placeholder="Filtrar por proyecto..."
            value={
              (table.getColumn("project")?.getFilterValue() as string) ?? ""
            }
            onChange={(event) =>
              table.getColumn("project")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Columnas <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
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
          <Button
            onClick={handleSendRequests}
            disabled={!Object.keys(rowSelection).length}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <SendHorizontal className="mr-2 h-4 w-4" />
            Enviar Solicitudes ({Object.keys(rowSelection).length})
          </Button>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="bg-slate-100 hover:bg-slate-100"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center">
                  <Loader
                    fullScreen={false}
                    text={`Consultando ${
                      mode === "requests" ? "Solcititudes" : "Reposiciones"
                    }...`}
                  />
                </TableCell>
              </TableRow>
            )}
            {!isLoading && table.getRowModel().rows?.length
              ? table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="[&>td]:!max-w-[250px] even:bg-slate-100 hover:bg-slate-50"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
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
                      className="h-24 text-center"
                    >
                      Sin resultados.
                    </TableCell>
                  </TableRow>
                )}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center">
                Seleccionando: $
                {table
                  .getSelectedRowModel()
                  .rows.reduce((acc, row) => {
                    const amount =
                      Number((row.original as RequestProps).amount) || 0;
                    return acc + amount;
                  }, 0)
                  .toFixed(2)}{" "}
                (de $
                {table
                  .getRowModel()
                  .rows.reduce((acc, row) => {
                    const amount =
                      Number((row.original as RequestProps).amount) || 0;
                    return acc + amount;
                  }, 0)
                  .toFixed(2)}
                )
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
}

export default RequestsTable;
