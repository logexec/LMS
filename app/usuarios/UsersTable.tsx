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
import { ChevronDown, Pencil, Trash } from "lucide-react";
import { flexRender } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Loader from "../Loader";

interface Pivot {
  user_id: string;
  permission_id: string;
}

interface Permission {
  id: string;
  name: string;
  pivot: Pivot[];
}

interface Role {
  id: string;
  name: string;
}

interface UsersProps {
  id: string;
  role_id: string;
  name: string;
  email: string;
  permissions: Permission[];
}

const fetchUsers = async (): Promise<UsersProps[]> => {
  const response = await fetch("http://localhost:8000/api/users", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch users");
  }

  const data = await response.json();
  return data;
};

const fetchRoles = async (): Promise<Role[]> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/roles`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch roles");
  }

  const data = await response.json();
  return data;
};

const UsersTable: React.FC = () => {
  const [data, setData] = useState<UsersProps[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const users = await fetchUsers();
        setData(users);

        const roles = await fetchRoles();
        setRoles(roles);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Mapea los roles a un objeto para hacer la búsqueda más eficiente
  const roleMap = roles.reduce((acc, role) => {
    acc[role.id] = role.name;
    return acc;
  }, {} as { [key: string]: string });

  const formatPermissionName = (permission: string): string => {
    const permissionMap: { [key: string]: string } = {
      manage_users: "Administrar Usuarios",
      view_users: "Ver Usuarios",
      create_users: "Crear Usuarios",
      edit_users: "Editar Usuarios",
      delete_users: "Eliminar Usuarios",
      register_income: "Registrar Ingresos",
      view_income: "Ver Ingresos",
      edit_income: "Editar Ingresos",
      view_discounts: "Ver Descuentos",
      manage_discounts: "Administrar Descuentos",
      view_expenses: "Ver Gastos",
      manage_expenses: "Administrar Gastos",
      view_requests: "Ver Solicitudes",
      manage_requests: "Administrar Solicitudes",
      view_reports: "Ver Reportes",
      manage_reports: "Administrar Reportes",
      manage_special_income: "Administrar Ingresos Especiales",
      view_budget: "Ver Presupuesto",
      manage_budget: "Administrar Presupuesto",
      manage_provisions: "Administrar Provisiones",
      manage_support: "Administrar Soporte",
    };

    return (
      permissionMap[permission] ||
      permission
        .split("_")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ")
    );
  };

  const columns = [
    {
      accessorKey: "name",
      header: "Nombres",
      cell: (info: any) => (
        <div>
          <h3 className="font-semibold text-slate-800">{info.getValue()}</h3>
          <div>
            <a
              href={`mailto:${info.row.original.email}`}
              className="text-red-600 underline visited:text-red-600"
            >
              {info.row.original.email}
            </a>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "role_id",
      header: "Rol",
      cell: (info: any) =>
        (
          <>
            <p className="capitalize italic select-none">
              {roleMap[info.getValue()]}
            </p>
          </>
        ) || (
          <>
            <p>Rol no asignado.</p>
            <p className="text-xs text-gray-500">
              {info.row.original.name.split(" ")[0]} no puede inteactuar con el
              sistema.
            </p>
          </>
        ),
    },
    {
      accessorKey: "permissions",
      header: "Permisos",
      cell: (info: any) =>
        info.getValue().map((perm: { name: string }) => (
          <span
            key={perm.name}
            className="inline-block text-xs px-2 py-1 mr-2 mb-2 rounded-full bg-slate-200 text-slate-800 capitalize"
          >
            {formatPermissionName(perm.name)}
          </span>
        )),
    },
    {
      accessorKey: "actions",
      header: "Acciones",
      cell: (info: any) => (
        <>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  className="mx-2 text-white bg-red-600 hover:bg-red-700"
                  onClick={() => {
                    console.log("Editar usuario ", info.row.original.id);
                  }}
                >
                  <Pencil />
                  <span className="sr-only">Editar</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Editar</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  className="mx-2 text-white bg-gray-600 hover:bg-gray-700"
                >
                  <Trash />
                  <span className="sr-only">Eliminar</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Eliminar</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </>
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
    return <Loader fullScreen={false} text="Recuperando usuarios..." />;
  }

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filtrar por nombre..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
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

export default UsersTable;
