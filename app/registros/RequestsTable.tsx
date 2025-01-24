"use client";
import React, { useEffect, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Check, ChevronDown, Pencil, ScanSearch, Trash, X } from "lucide-react";
import { flexRender } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Loader from "@/app/Loader";

enum Status {
  "pending",
  "approved",
  "rejected",
  "review",
}

interface RequestProps {
  id?: number;
  unique_id?: string;
  type: "discount" | "expense";
  status?: Status;
  date?: string;
  invoice_number?: string;
  account_id?: number;
  amount?: number;
  project?: string;
  responsible_id?: string | null;
  transport_id?: string | null;
  attachment_path?: string;
  note?: string;
  created_at?: string;
  updated_at?: string;
}

interface AccountProps {
  id: number;
  name: string;
  account_number: string;
  account_type: string;
}

interface ResponsibleProps {
  id: string;
  nombres: string;
}

interface ResponsibleProps {
  id: string;
  name: string;
}

const fetchRequests = async (
  type: "discount" | "expense"
): Promise<RequestProps[]> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/requests?type=${type}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch requests");
  }

  return response.json();
};

const fetchAccounts = async (): Promise<AccountProps[]> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/accounts`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch accounts");
  }

  return response.json();
};

const fetchResponsibles = async (): Promise<ResponsibleProps[]> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/responsibles?fields=id,nombres`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch responsibles");
  }

  return response.json();
};

const fetchVehicles = async (): Promise<ResponsibleProps[]> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/transports?fields=id,name`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch responsibles");
  }

  return response.json();
};

const RequestsTable: React.FC<RequestProps> = ({ type }) => {
  const [data, setData] = useState<RequestProps[]>([]);
  const [accounts, setAccounts] = useState<AccountProps[]>([]);
  const [responsibles, setResponsibles] = useState<ResponsibleProps[]>([]);
  const [vehicles, setVehicles] = useState<ResponsibleProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [requests, accounts, responsibles, transports] =
          await Promise.all([
            fetchRequests(type),
            fetchAccounts(),
            fetchResponsibles(),
            fetchVehicles(),
          ]);

        setData(requests);
        setAccounts(accounts);
        setResponsibles(responsibles);
        setVehicles(transports);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Mapea las cuentas a un objeto para hacer la búsqueda más eficiente
  const accountMap = accounts.reduce((acc, account) => {
    acc[account.id] = account.name;
    return acc;
  }, {} as { [key: string]: string });

  // Manejador para el fetch de responsables
  const responsibleMap = responsibles.reduce((acc, responsible) => {
    // Convertir a string para asegurar consistencia en las keys
    acc[String(responsible.id)] = responsible.nombres;
    return acc;
  }, {} as { [key: string]: string });

  // Manejador para el fetch de transporte
  const vehicleMap = vehicles.reduce((acc, vehicle) => {
    // Convertir a string para asegurar consistencia en las keys
    acc[String(vehicle.id)] = vehicle.name;
    return acc;
  }, {} as { [key: string]: string });

  const columns = [
    {
      accessorKey: "id",
      header: "ID",
      cell: (info: any) => info.getValue(),
    },
    {
      accessorKey: "updated_at",
      header: "Fecha",
      cell: (info: any) => info.getValue().split("T")[0],
    },
    {
      accessorKey: "invoice_number",
      header: "Factura o Vale",
      cell: (info: any) => info.getValue(),
    },
    {
      accessorKey: "account_id",
      header: "Cuenta",
      cell: (info: any) => (
        <p className="capitalize select-none">{accountMap[info.getValue()]}</p>
      ),
    },
    {
      accessorKey: "amount",
      header: "Valor",
      cell: (info: any) => info.getValue(),
    },
    {
      accessorKey: "project",
      header: "Proyecto",
      cell: (info: any) => info.getValue(),
    },
    {
      accessorKey: "responsible_id",
      header: "Responsable",
      cell: (info: any) => {
        const id = info.getValue();
        return id.length > 1
          ? responsibleMap[String(id)] || "No encontrado"
          : "No aplica";
      },
    },
    {
      accessorKey: "transport_id",
      header: "Placa",
      cell: (info: any) => {
        const id = info.getValue();
        return id
          ? `${vehicleMap[String(id)].slice(0, 3)}-${vehicleMap[
              String(id)
            ].slice(3, 7)}` || "No encontrado"
          : "No aplica";
      },
    },
    {
      accessorKey: "attachment",
      header: "Adjunto",
      cell: (info: any) => info.getValue(),
    },
    {
      accessorKey: "note",
      header: "Observación",
      cell: (info: any) => info.getValue(),
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: (info: any) => (
        <>
          <p
            className={`font-semibold rounded-full px-2 text-center border ${
              info.getValue() === "pending"
                ? "text-orange-700 bg-orange-50 border-orange-400"
                : info.getValue() === "rejected"
                ? "text-red-700 bg-red-50 border-red-400"
                : info.getValue() === "review"
                ? "text-indigo-700 bg-indigo-50 border-indigo-400"
                : "text-emerald-700 bg-emerald-50 border-emerald-400"
            }`}
          >
            {info.getValue() === "pending"
              ? "Pendiente"
              : info.getValue() === "rejected"
              ? "Rechazado"
              : info.getValue() === "review"
              ? "Revisar"
              : "Aprobado"}
          </p>
        </>
      ),
    },
    {
      accessorKey: "actions",
      header: "Acciones",
      cell: (info: any) => (
        <div className="flex flex-row flex-wrap items-center gap-1 w-36">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  className="text-white bg-red-600 hover:bg-red-700 size-7"
                  onClick={() => {
                    console.log("Informacion de info", info.row.original);
                  }}
                >
                  <X />
                  <span className="sr-only">Rechazar</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="bg-red-600 font-medium px-1.5 py-0.5 rounded-xl">
                  Rechazar
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button className="text-white bg-indigo-600 hover:bg-indigo-700 size-7">
                  <ScanSearch />
                  <span className="sr-only">Revisón</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="bg-indigo-600 font-medium px-1.5 py-0.5 rounded-xl">
                  Revisón
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button className="text-white bg-emerald-600 hover:bg-emerald-700 size-7">
                  <Check />
                  <span className="sr-only">Aprobar</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="bg-emerald-600 font-medium px-1.5 pt-0.5 pb-1 rounded-xl">
                  Aprobar
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  });

  if (isLoading) {
    return <Loader fullScreen={false} text="Consultando solicitudes..." />;
  }

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filtrar por proyecto..."
          value={(table.getColumn("project")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("project")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columnas <ChevronDown />
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
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
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
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="[&>td]:!max-w-[250px]"
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
            ) : (
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
};

export default RequestsTable;
