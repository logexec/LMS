"use client";

import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
import { Search, Pencil, Trash2 } from "lucide-react";
import { RiUserAddLine } from "react-icons/ri";
import { toast } from "sonner";
import { TableSkeleton } from "./TableSkeleton";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type User, type Role } from "@/types/dialogs";
import { apiService } from "@/services/api.service";
import { useRoles } from "@/hooks/useRoles";
import { UserDialog } from "./dialogs";
import { DeleteUserDialog } from "./dialogs";
import { formatPermissionName } from "@/lib/utils";
import { FaWhatsapp } from "react-icons/fa6";

interface ErrorResponse {
  response?: {
    data: { message: string };
  };
  message?: string;
}

const fetchUsers = async () => {
  try {
    const response = await apiService.getUsers();
    if (!Array.isArray(response)) {
      console.error("❌ Response is not an array:", response);
      toast.error("Formato de datos inesperado al cargar usuarios");
      return [];
    }

    // Extraer todos los UUIDs de proyectos asignados
    const projectIds = response.flatMap((user) =>
      Array.isArray(user.projects) ? user.projects : []
    );
    const uniqueProjectIds = [...new Set(projectIds)]; // Evitar duplicados

    // Obtener detalles de los proyectos desde sistema_onix
    const projects = uniqueProjectIds.length
      ? await apiService.getProjects(uniqueProjectIds)
      : [];
    const projectMap = new Map(
      projects.map((p) => [
        p.id.toString(),
        {
          id: p.id.toString(),
          name: p.name || p.id,
          description: p.description,
        },
      ])
    );

    // Normalizar usuarios
    const validUsers = response.map((user) => ({
      id: user.id.toString(),
      name: user.name || "Sin nombre",
      email: user.email || "Sin email",
      role: user.role || null,
      role_id: user.role ? user.role.id.toString() : null,
      permissions: Array.isArray(user.permissions)
        ? user.permissions.map((p) => ({
            id: p.id.toString(),
            name: p.name,
          }))
        : [],
      projects: Array.isArray(user.projects)
        ? user.projects.map(
            (id) =>
              projectMap.get(id.toString()) || { id: id.toString(), name: id }
          )
        : [],
      phone: user.phone || null,
    }));

    return validUsers;
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    toast.error(
      error instanceof Error ? error.message : "Error al cargar los usuarios"
    );
    return [];
  }
};

export const UsersTable = () => {
  const queryClient = useQueryClient();

  // Estados para diálogos
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Estados para la tabla
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility] = useState<VisibilityState>({});

  // Carga de usuarios
  const { data: users = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
    retry: 1,
    staleTime: 15000,
  });

  // Carga de roles
  const { data: roles = [] } = useRoles();

  // Mutaciones con invalidación del cache
  const createUserMutation = useMutation({
    mutationFn: async (data: {
      name: string;
      email: string;
      password?: string;
      role_id: string;
      dob?: string;
      permissions: string[];
      projectIds: string[];
    }) => {
      const response = await apiService.createUser(data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Usuario creado exitosamente");
      setIsCreateOpen(false);
    },
    onError: (error: ErrorResponse) => {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Error al crear el usuario"
      );
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
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Usuario actualizado exitosamente");
      setIsEditOpen(false);
      setSelectedUser(null);
    },
    onError: (error: ErrorResponse) => {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Error al actualizar el usuario"
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
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Permisos actualizados exitosamente");
    },
    onError: (error: ErrorResponse) => {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Error al actualizar los permisos"
      );
    },
  });

  const updateProjectsMutation = useMutation({
    mutationFn: async ({
      id,
      projectIds,
    }: {
      id: string;
      projectIds: string[];
    }) => {
      const response = await apiService.updateUserProjects(id, projectIds);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Proyectos actualizados exitosamente");
    },
    onError: (error: ErrorResponse) => {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Error al actualizar los proyectos"
      );
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiService.deleteUser(id);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Usuario eliminado exitosamente");
      setIsDeleteOpen(false);
      setSelectedUser(null);
    },
    onError: (error: ErrorResponse) => {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Error al eliminar el usuario"
      );
    },
  });

  const handleAction = (action: "edit" | "delete", user: User) => {
    setSelectedUser(user);
    if (action === "edit") {
      setIsEditOpen(true);
    } else {
      setIsDeleteOpen(true);
    }
  };

  // Definimos las columnas con tipado explícito
  const columns: ColumnDef<User>[] = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Usuario",
        cell: ({ row }) => {
          const hasPhone = row.original.phone;
          return hasPhone ? (
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
                <div className="flex flex-row items-center gap-1">
                  <a
                    href={`tel:${row.original.phone}`}
                    target="_blank"
                    className="block text-xs text-slate-600 transition-all hover:underline hover:text-slate-800 hover:font-semibold"
                  >
                    {row.original.phone}
                  </a>
                  <a
                    href={`http://wa.me/+593${row.original.phone}`}
                    target="_blank"
                    className="text-xs text-red-600 transition-all hover:underline hover:text-red-800 hover:font-semibold"
                  >
                    <FaWhatsapp size={16} />
                  </a>
                </div>
              </div>
            </div>
          ) : (
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
                <p className="text-xs text-slate-600 hover:text-slate-700 transition-colors">
                  Sin teléfono disponible
                </p>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "role_id",
        header: "Rol",
        cell: ({ row }) => {
          const role = Array.isArray(roles)
            ? roles.find(
                (r: Role) =>
                  r.id.toString() === row.original.role_id?.toString()
              )
            : null;
          return role ? (
            <Badge variant="outline" className="capitalize w-max">
              {role.name}
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="bg-yellow-50 text-yellow-800 w-max"
            >
              Sin Rol
            </Badge>
          );
        },
      },
      {
        accessorKey: "permissions",
        header: "Permisos",
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            {Array.isArray(row.original.permissions) &&
            row.original.permissions.length > 0 ? (
              row.original.permissions.slice(0, 3).map((perm) => (
                <Badge
                  key={`perm-${perm.id}`}
                  variant="outline"
                  className="text-xs whitespace-nowrap text-slate-500"
                >
                  {formatPermissionName(perm.name)}
                </Badge>
              ))
            ) : (
              <span className="text-gray-500 text-sm">Sin permisos</span>
            )}
            {row.original.permissions.length > 3 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge
                      variant="outline"
                      className="text-xs whitespace-nowrap cursor-help"
                    >
                      +{row.original.permissions.length - 3} más
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent className="w-64 max-h-60 overflow-y-auto p-2 rounded shadow bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800">
                    <div className="space-y-1">
                      <p className="font-medium text-xs mb-1">
                        Permisos adicionales:
                      </p>
                      {row.original.permissions.slice(3).map((perm) => (
                        <ul key={perm.id} className="text-xs list-disc pl-4">
                          <li>{formatPermissionName(perm.name)}</li>
                        </ul>
                      ))}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        ),
      },
      {
        accessorKey: "projects",
        header: "Proyectos",
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            {row.original.projects && row.original.projects.length > 0 ? (
              row.original.projects.slice(0, 3).map((project) => (
                <TooltipProvider key={project.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge
                        variant="outline"
                        className="text-xs whitespace-nowrap"
                      >
                        {project.name || "Proyecto sin identificar"}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent className="w-64 max-h-60 overflow-y-auto p-2 rounded shadow bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800">
                      <div className="space-y-1">
                        <p className="font-medium text-xs mb-1">
                          {project.description}
                        </p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))
            ) : (
              <span className="text-gray-500 text-sm">Sin proyectos</span>
            )}
            {row.original.projects.length > 3 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge
                      variant="outline"
                      className="text-xs whitespace-nowrap cursor-help"
                    >
                      +{row.original.projects.length - 3} más
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent className="w-64 max-h-60 overflow-y-auto p-2 rounded shadow bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800">
                    <div className="space-y-1">
                      <p className="font-medium text-xs mb-1">
                        Proyectos adicionales:
                      </p>
                      {row.original.projects.slice(3).map((project) => (
                        <div key={project.id} className="text-xs">
                          • {project.name || "Proyecto sin nombre"}
                        </div>
                      ))}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        ),
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleAction("edit", row.original)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleAction("delete", row.original)}
            >
              <Trash2 className="h-4 w-4 text-red-600" />
            </Button>
          </div>
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
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: 10 },
    },
  });

  if (isLoadingUsers) return <TableSkeleton />;

  if (users.length === 0 && !isLoadingUsers) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center">
        <div className="text-6xl text-gray-300 mb-4">👤</div>
        <h3 className="text-xl font-medium text-gray-900 mb-2">
          No hay usuarios disponibles
        </h3>
        <p className="text-gray-500 mb-4">
          No se encontraron usuarios para mostrar en la tabla.
        </p>
        <Button
          onClick={() => setIsCreateOpen(true)}
          className="bg-red-600 hover:bg-red-700"
        >
          <RiUserAddLine className="h-4 w-4 mr-2" />
          Crear primer usuario
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar usuarios..."
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select
              value={
                (table.getColumn("role_id")?.getFilterValue() as string) ??
                "all"
              }
              onValueChange={(value) =>
                table
                  .getColumn("role_id")
                  ?.setFilterValue(value === "all" ? undefined : value)
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los roles</SelectItem>
                {roles.map((role: Role) => (
                  <SelectItem key={role.id} value={role.id.toString()}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="bg-red-600 hover:bg-red-700"
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
            {users.length} usuarios en total
          </div>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium">Filas por página</p>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => table.setPageSize(Number(value))}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue
                    placeholder={table.getState().pagination.pageSize}
                  />
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
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Anterior
              </Button>
              <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                Página {table.getState().pagination.pageIndex + 1} de{" "}
                {table.getPageCount()}
              </div>
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
      </div>

      <UserDialog
        mode="create"
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={(data) => createUserMutation.mutate(data)}
        roles={roles}
        isLoading={createUserMutation.isPending}
      />

      <UserDialog
        mode="edit"
        user={selectedUser}
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedUser(null);
        }}
        onSubmit={(data) => {
          if (selectedUser) {
            updateUserMutation.mutate({
              id: selectedUser.id,
              data: {
                name: data.name,
                email: data.email,
                role_id: data.role_id,
              },
            });
            const currentPermissions = selectedUser.permissions.map((p) =>
              p.id.toString()
            );
            if (
              JSON.stringify([...data.permissions].sort()) !==
              JSON.stringify([...currentPermissions].sort())
            ) {
              updatePermissionsMutation.mutate({
                id: selectedUser.id,
                permissions: data.permissions,
              });
            }
            const currentProjects = selectedUser.projects.map((p) =>
              p.id.toString()
            );
            if (
              JSON.stringify([...data.projectIds].sort()) !==
              JSON.stringify([...currentProjects].sort())
            ) {
              updateProjectsMutation.mutate({
                id: selectedUser.id,
                projectIds: data.projectIds,
              });
            }
          }
        }}
        roles={roles}
        isLoading={
          updateUserMutation.isPending ||
          updatePermissionsMutation.isPending ||
          updateProjectsMutation.isPending
        }
      />

      <DeleteUserDialog
        user={selectedUser}
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setSelectedUser(null);
        }}
        onConfirm={() => {
          if (selectedUser) deleteUserMutation.mutate(selectedUser.id);
        }}
        isLoading={deleteUserMutation.isPending}
      />
    </>
  );
};
