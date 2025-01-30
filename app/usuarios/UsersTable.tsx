"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  Row,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  MoreVertical,
  Search,
  Filter,
  UserCog,
  Shield,
  Trash,
} from "lucide-react";
import { toast } from "sonner";
import debounce from "lodash/debounce";

interface Permission {
  id: string;
  name: string;
}

interface Role {
  id: string;
  name: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role_id: string;
  permissions: Permission[];
}

const TableSkeleton = () => (
  <div className="space-y-4">
    {[...Array(5)].map((_, idx) => (
      <div
        key={`skeleton-${idx}`}
        className="flex items-center space-x-4 p-4 border-b last:border-0"
      >
        <div className="h-12 w-12 rounded-full bg-slate-100 animate-pulse" />
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-slate-100 rounded animate-pulse w-1/4" />
          <div className="h-4 bg-slate-100 rounded animate-pulse w-1/3" />
        </div>
      </div>
    ))}
  </div>
);

const UsersTable = () => {
  const [data, setData] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [pageIndex, setPageIndex] = useState(0);

  // Formatear el nombre del permiso
  const formatPermissionName = useCallback((permission: string): string => {
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
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    );
  }, []);

  // Definición de columnas
  const columns = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Usuario",
        cell: ({ row }: { row: Row<User> }) => (
          <div className="flex items-center space-x-4">
            <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
              <span className="text-slate-600 font-medium">
                {row.original.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="font-medium text-slate-900">
                {row.original.name}
              </h3>
              <a
                href={`mailto:${row.original.email}`}
                className="text-sm text-red-600 hover:text-red-700 transition-colors"
              >
                {row.original.email}
              </a>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "role_id",
        header: "Rol",
        cell: ({ row }: { row: Row<User> }) => {
          const role = roles.find((r) => r.id === row.original.role_id);
          return role ? (
            <Badge variant="outline" className="capitalize">
              {role.name}
            </Badge>
          ) : (
            <div className="space-y-1">
              <Badge
                variant="outline"
                className="bg-yellow-100 text-yellow-800 border-yellow-600"
              >
                Sin Rol
              </Badge>
              <p className="text-xs text-slate-500">
                Usuario sin acceso al sistema
              </p>
            </div>
          );
        },
      },
      {
        accessorKey: "permissions",
        header: "Permisos",
        cell: ({ row }: { row: Row<User> }) => (
          <div className="flex flex-wrap gap-1">
            {row.original.permissions.map((perm: Permission) => (
              <Badge
                key={`perm-${perm.id}`}
                variant="default"
                className="text-xs whitespace-nowrap text-slate-500"
              >
                {formatPermissionName(perm.name)}
              </Badge>
            ))}
          </div>
        ),
      },
      {
        id: "actions",
        cell: ({ row }: { row: Row<User> }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                <UserCog className="mr-2 h-4 w-4" />
                Editar Usuario
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Shield className="mr-2 h-4 w-4" />
                Gestionar Permisos
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600 cursor-pointer">
                <Trash className="mr-2 h-4 w-4" />
                Eliminar Usuario
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [roles, formatPermissionName]
  );

  // Cargar datos
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [usersResponse, rolesResponse] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
          credentials: "include",
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/roles`, {
          credentials: "include",
        }),
      ]);

      if (!usersResponse.ok || !rolesResponse.ok) {
        throw new Error("Error al cargar los datos");
      }

      const [usersData, rolesData] = await Promise.all([
        usersResponse.json(),
        rolesResponse.json(),
      ]);

      setData(usersData);
      setRoles(rolesData);
    } catch (error) {
      toast.error("Error al cargar los usuarios");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Configuración de la tabla
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      pagination: {
        pageIndex,
        pageSize: rowsPerPage,
      },
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    globalFilterFn: "includesString",
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const debouncedSetGlobalFilter = useMemo(
    () =>
      debounce((value: string) => {
        setGlobalFilter(value);
      }, 300),
    []
  );

  if (isLoading) {
    return <TableSkeleton />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 flex-1">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar usuarios..."
              onChange={(e) => debouncedSetGlobalFilter(e.target.value)}
              className="pl-9"
            />
          </div>
          <DropdownMenu>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent>Gestionar columnas</TooltipContent>
              </Tooltip>
            </TooltipProvider>
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
                <TableRow key={row.id}>
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
                  No se encontraron usuarios
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex-1 text-sm text-slate-500">
          {table.getFilteredRowModel().rows.length} usuarios
        </div>
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Filas por página</p>
            <Select
              value={`${rowsPerPage}`}
              onValueChange={(value) => {
                setRowsPerPage(Number(value));
                setPageIndex(0);
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={rowsPerPage} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((size) => (
                  <SelectItem key={size} value={`${size}`}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPageIndex((prev) => prev - 1)}
              disabled={!table.getCanPreviousPage()}
            >
              Anterior
            </Button>
            <div className="flex w-[100px] items-center justify-center text-sm font-medium">
              Página {pageIndex + 1} de {table.getPageCount()}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPageIndex((prev) => prev + 1)}
              disabled={!table.getCanNextPage()}
            >
              Siguiente
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersTable;
