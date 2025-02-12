/* eslint-disable react-hooks/rules-of-hooks */
"use client";

import { useState, useMemo } from "react";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  MoreVertical,
  Search,
  UserCog,
  Shield,
  Trash,
  Filter,
} from "lucide-react";
import { RiUserAddLine } from "react-icons/ri";
import { toast } from "sonner";
import debounce from "lodash/debounce";
import {
  CreateUserDialog,
  EditUserDialog,
  PermissionsDialog,
  DeleteUserDialog,
} from "./dialogs";
import { TableSkeleton } from "./TableSkeleton";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { type User, type Role, type Permission } from "@/types/dialogs";
import React from "react";
import { apiService } from "@/services/api.service";
import { useRoles } from "@/hooks/useRoles";
import { useRouter } from "next/router";

interface ErrorResponse {
  response?: {
    data: {
      message: string;
    };
  };
}

// API functions
const fetchUsers = async () => {
  try {
    const response = await apiService.getUsers();
    return response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    toast.error(
      error instanceof Error ? error.message : "Error al cargar los usuarios"
    );
    throw error;
  }
};

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
    view_provisions: "Ver Provisiones",
    manage_support: "Administrar Soporte",
  };
  return permissionMap[permission] || permission;
};

export const UsersTable = () => {
  const queryClient = useQueryClient();
  // Estados para diálogos
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPermissionsOpen, setIsPermissionsOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Estados para la tabla
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility] = useState<VisibilityState>({});
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [pageIndex, setPageIndex] = useState(0);

  // API functions y mutations...
  const { data: users = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
    retry: 1,
    staleTime: 15000, // 15 segundos
  });

  const { data: roles = [] } = useRoles();

  const createUserMutation = useMutation({
    mutationFn: async (data: {
      name: string;
      email: string;
      password: string;
      role_id: string;
      dob?: string;
      permissions: string[];
    }) => {
      const response = await apiService.createUser(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Usuario creado exitosamente");
      setIsCreateOpen(false);
      useRouter().reload();
    },
    onError: (error: ErrorResponse) => {
      console.error("Error creating user:", error);
      toast.error(error.response?.data?.message || "Error al crear el usuario");
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: { name: string; email: string; role_id: string };
    }) => {
      const response = await apiService.updateUser(id, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Usuario actualizado exitosamente");
      setIsEditOpen(false);
      useRouter().reload();
    },
    onError: (error: ErrorResponse) => {
      toast.error(
        error.response?.data?.message || "Error al actualizar el usuario"
      );
    },
  });

  const updatePermissionsMutation = useMutation({
    mutationFn: async ({
      id,
      permissions,
    }: {
      id: string;
      permissions: string[];
    }) => {
      const response = await apiService.updateUserPermissions(id, permissions);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Permisos actualizados exitosamente");
      setIsPermissionsOpen(false);
      useRouter().reload();
    },
    onError: (error: ErrorResponse) => {
      toast.error(
        error.response?.data?.message || "Error al actualizar los permisos"
      );
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiService.deleteUser(id);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Usuario eliminado exitosamente");
      setIsDeleteOpen(false);
      useRouter().reload();
    },
    onError: (error: ErrorResponse) => {
      toast.error(
        error.response?.data?.message || "Error al eliminar el usuario"
      );
    },
  });

  // funciones auxiliares
  const handleAction = (action: string, user: User) => {
    setSelectedUser(user);
    switch (action) {
      case "edit":
        setIsEditOpen(true);
        break;
      case "permissions":
        setIsPermissionsOpen(true);
        break;
      case "delete":
        setIsDeleteOpen(true);
        break;
    }
  };

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
          const role = roles.find((r: Role) => r.id === row.original.role_id);
          return role ? (
            <Badge variant="outline" className="capitalize">
              {role.name}
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
              Sin Rol
            </Badge>
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
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => handleAction("edit", row.original)}
              >
                <UserCog className="mr-2 h-4 w-4" />
                Editar Usuario
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => handleAction("permissions", row.original)}
              >
                <Shield className="mr-2 h-4 w-4" />
                Gestionar Permisos
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 cursor-pointer"
                onClick={() => handleAction("delete", row.original)}
              >
                <Trash className="mr-2 h-4 w-4" />
                Eliminar Usuario
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [roles]
  );

  const table = useReactTable({
    data: users,
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
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const debouncedSetGlobalFilter = useMemo(
    () => debounce((value: string) => setGlobalFilter(value), 300),
    []
  );

  if (isLoadingUsers) return <TableSkeleton />;

  return (
    <>
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
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
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
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="ml-4 bg-red-600 hover:bg-red-700"
          >
            <RiUserAddLine className="h-4 w-4 mr-2" />
            Nuevo Usuario
          </Button>
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

      <CreateUserDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={(data) => {
          createUserMutation.mutate(data);
        }}
        roles={roles}
        isLoading={createUserMutation.isPending}
      />

      <EditUserDialog
        user={selectedUser}
        roles={roles}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSubmit={(data) => {
          if (selectedUser) {
            const { name = "", email = "", role_id = "" } = data;
            updateUserMutation.mutate({
              id: selectedUser.id,
              data: { name, email, role_id },
            });
          }
        }}
        isLoading={updateUserMutation.isPending}
      />

      <PermissionsDialog
        user={selectedUser}
        isOpen={isPermissionsOpen}
        onClose={() => setIsPermissionsOpen(false)}
        onSubmit={(permissions) => {
          if (selectedUser) {
            updatePermissionsMutation.mutate({
              id: selectedUser.id,
              permissions,
            });
          }
        }}
        isLoading={updatePermissionsMutation.isPending}
      />

      <DeleteUserDialog
        user={selectedUser}
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={() => {
          if (selectedUser) {
            deleteUserMutation.mutate(selectedUser.id);
          }
        }}
        isLoading={deleteUserMutation.isPending}
      />
    </>
  );
};
