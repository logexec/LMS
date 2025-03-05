"use client";

import { useState, useMemo, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
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
import { MoreVertical, Search, UserCog, Trash, Filter } from "lucide-react";
import { RiUserAddLine } from "react-icons/ri";
import { toast } from "sonner";
import debounce from "lodash/debounce";
import { TableSkeleton } from "./TableSkeleton";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { type User, type Role } from "@/types/dialogs";
import { apiService } from "@/services/api.service";
import { useRoles } from "@/hooks/useRoles";
import { UserDialog } from "./dialogs"; // Nuevo componente unificado
import { DeleteUserDialog } from "./dialogs";
import { formatPermissionName } from "@/lib/utils";
import { FaWhatsapp } from "react-icons/fa6";

interface ErrorResponse {
  response?: {
    data: {
      message: string;
    };
  };
  message?: string;
}

// API functions modificada para aceptar parámetros de paginación
const fetchUsers = async (page = 1, pageSize = 10, searchQuery = "") => {
  try {
    console.log(
      `🔍 Fetching users for page ${page} with ${pageSize} items per page...`
    );
    let response;

    // Si hay una consulta de búsqueda, ignoramos paginación para búsqueda global
    if (searchQuery && searchQuery.trim().length > 0) {
      response = await apiService.getUsers();
    } else {
      response = await apiService.getUsers(page, pageSize);
    }

    return response;
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    toast.error(
      error instanceof Error ? error.message : "Error al cargar los usuarios"
    );
    return {
      data: [],
      total: 0,
      current_page: 1,
      last_page: 1,
      per_page: pageSize,
    };
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

  // Estados para la paginación del servidor
  const [serverPageIndex, setServerPageIndex] = useState(1);
  const [serverPageSize, setServerPageSize] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // API query con parámetros de paginación
  const { data: response, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["users", serverPageIndex, serverPageSize, globalFilter],
    queryFn: () => fetchUsers(serverPageIndex, serverPageSize, globalFilter),
    retry: 1,
    staleTime: 15000,
  });

  // Extraer los usuarios de la respuesta
  const users = useMemo(() => {
    if (!response) return [];

    if (Array.isArray(response)) {
      return response;
    }

    if (response && typeof response === "object") {
      // Verificar estructura: response.data[]
      if (Array.isArray(response.data)) {
        return response.data;
      }

      // Verificar estructura: response.data.data[]
      if (
        response.data &&
        typeof response.data === "object" &&
        response.data.data &&
        Array.isArray(response.data.data)
      ) {
        return response.data.data;
      }

      // La estructura de tu JSON es response con data[] dentro
      if (response.data && Array.isArray(response.data)) {
        return response.data;
      }
    }

    return [];
  }, [response]);

  // Actualizar metadatos de paginación cuando llega la respuesta
  useEffect(() => {
    if (response && typeof response === "object" && !Array.isArray(response)) {
      // La estructura de la respuesta tiene los metadatos de paginación en el nivel raíz
      if (response.total) {
        setTotalUsers(response.total);
        setTotalPages(response.last_page);
      } else if (
        response.data &&
        typeof response.data === "object" &&
        !Array.isArray(response.data)
      ) {
        // Si los metadatos están anidados dentro de data
        if (response.data.total) {
          setTotalUsers(response.data.total);
          setTotalPages(response.data.last_page);
        }
      }
    }
  }, [response]);

  // Resto de mutaciones
  const { data: roles = [] } = useRoles();

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
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Usuario creado exitosamente");
      setIsCreateOpen(false);
      setTimeout(
        () => queryClient.invalidateQueries({ queryKey: ["users"] }),
        100
      );
    },
    onError: (error: ErrorResponse) => {
      console.error("Error creating user:", error);
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
      toast.success("Usuario actualizado exitosamente");
      setIsEditOpen(false);
      setSelectedUser(null);
      setTimeout(
        () => queryClient.invalidateQueries({ queryKey: ["users"] }),
        100
      );
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
      toast.success("Permisos actualizados exitosamente");
      setTimeout(
        () => queryClient.invalidateQueries({ queryKey: ["users"] }),
        100
      );
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
      toast.success("Proyectos actualizados exitosamente");
      setTimeout(
        () => queryClient.invalidateQueries({ queryKey: ["users"] }),
        100
      );
    },
    onError: (error: ErrorResponse) => {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Error al actualizar los proyectos"
      );
      console.error(
        error.response?.data?.message || "Error al actualizar los proyectos"
      );
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiService.deleteUser(id);
      return response;
    },
    onSuccess: () => {
      toast.success("Usuario eliminado exitosamente");
      setIsDeleteOpen(false);
      setSelectedUser(null);
      setTimeout(
        () => queryClient.invalidateQueries({ queryKey: ["users"] }),
        100
      );
    },
    onError: (error: ErrorResponse) => {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Error al eliminar el usuario"
      );
    },
  });

  const handleAction = (action: string, user: User) => {
    setSelectedUser(user);
    switch (action) {
      case "edit":
        setIsEditOpen(true);
        break;
      case "delete":
        setIsDeleteOpen(true);
        break;
    }
  };

  // Manejadores para cambiar de página
  const handlePreviousPage = () => {
    if (serverPageIndex > 1) {
      setServerPageIndex((prev) => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (serverPageIndex < totalPages) {
      setServerPageIndex((prev) => prev + 1);
    }
  };

  // Manejador para cambiar el tamaño de página
  const handleChangePageSize = (size: string) => {
    const newSize = Number(size);
    setServerPageSize(newSize);
    setServerPageIndex(1); // Volver a la primera página al cambiar el tamaño
  };

  // Búsqueda global con debounce
  const debouncedSetGlobalFilter = useMemo(
    () =>
      debounce((value: string) => {
        setGlobalFilter(value);
        setServerPageIndex(1); // Volver a la primera página al buscar
      }, 300),
    []
  );

  const columns = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Usuario",
        cell: ({ row }: { row: Row<User> }) => {
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
        cell: ({ row }: { row: Row<User> }) => {
          // Asegurarse que roles sea tratado siempre como array
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
        cell: ({ row }: { row: Row<User> }) => (
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
        cell: ({ row }: { row: Row<User> }) => (
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
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),

    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: true, // Indica que la paginación es manual (del servidor)
    pageCount: totalPages,
  });

  if (isLoadingUsers) return <TableSkeleton />;

  // Mostrar mensaje cuando no hay usuarios
  if (Array.isArray(users) && users.length === 0 && !isLoadingUsers) {
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
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 flex-1">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar usuarios..."
                onChange={(e) => debouncedSetGlobalFilter(e.target.value)}
                className="pl-9"
              />

              <DeleteUserDialog
                user={selectedUser}
                isOpen={isDeleteOpen}
                onClose={() => {
                  setIsDeleteOpen(false);
                  setSelectedUser(null);
                  setTimeout(
                    () =>
                      queryClient.invalidateQueries({ queryKey: ["users"] }),
                    100
                  );
                }}
                onConfirm={() => {
                  if (selectedUser) {
                    deleteUserMutation.mutate(selectedUser.id);
                  }
                }}
                isLoading={deleteUserMutation.isPending}
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
            {totalUsers} usuarios en total
          </div>
          <div className="flex items-center space-x-6 lg:space-x-8">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium">Filas por página</p>
              <Select
                value={`${serverPageSize}`}
                onValueChange={handleChangePageSize}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue placeholder={serverPageSize} />
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
                onClick={handlePreviousPage}
                disabled={serverPageIndex <= 1}
              >
                Anterior
              </Button>
              <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                Página {serverPageIndex} de {totalPages || 1}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={serverPageIndex >= totalPages}
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
        onClose={() => {
          setIsCreateOpen(false);
          setTimeout(
            () => queryClient.invalidateQueries({ queryKey: ["users"] }),
            100
          );
        }}
        onSubmit={(data) => {
          createUserMutation.mutate(data);
        }}
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
          setTimeout(
            () => queryClient.invalidateQueries({ queryKey: ["users"] }),
            100
          );
        }}
        onSubmit={(data) => {
          if (selectedUser) {
            // Actualizar información básica
            updateUserMutation.mutate({
              id: selectedUser.id,
              data: {
                name: data.name,
                email: data.email,
                role_id: data.role_id,
              },
            });

            // Solo si han cambiado los permisos, actualizar
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

            // Solo si han cambiado los proyectos, actualizar
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
    </>
  );
};
