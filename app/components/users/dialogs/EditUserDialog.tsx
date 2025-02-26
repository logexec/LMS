/*eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { apiService } from "@/services/api.service";

// Interfaces y tipos
interface PermissionData {
  id: string;
  name: string;
  label: string;
}

interface CategoryData {
  label: string;
  permissions: PermissionData[];
}

type PermissionCategories = Record<string, CategoryData>;

// Mapeo de permisos con sus categorías
const permissionCategories: PermissionCategories = {
  users: {
    label: "Usuarios",
    permissions: [
      { id: "1", name: "manage_users", label: "Administrar Usuarios" },
      { id: "2", name: "view_users", label: "Ver Usuarios" },
      { id: "3", name: "create_users", label: "Crear Usuarios" },
      { id: "4", name: "edit_users", label: "Editar Usuarios" },
      { id: "5", name: "delete_users", label: "Eliminar Usuarios" },
    ],
  },
  income: {
    label: "Ingresos",
    permissions: [
      { id: "6", name: "register_income", label: "Registrar Ingresos" },
      { id: "7", name: "view_income", label: "Ver Ingresos" },
      { id: "8", name: "edit_income", label: "Editar Ingresos" },
      {
        id: "17",
        name: "manage_special_income",
        label: "Administrar Ingresos Especiales",
      },
    ],
  },
  discounts: {
    label: "Descuentos",
    permissions: [
      { id: "9", name: "view_discounts", label: "Ver Descuentos" },
      { id: "10", name: "manage_discounts", label: "Administrar Descuentos" },
    ],
  },
  expenses: {
    label: "Gastos",
    permissions: [
      { id: "11", name: "view_expenses", label: "Ver Gastos" },
      { id: "12", name: "manage_expenses", label: "Administrar Gastos" },
    ],
  },
  requests: {
    label: "Solicitudes",
    permissions: [
      { id: "13", name: "view_requests", label: "Ver Solicitudes" },
      { id: "14", name: "manage_requests", label: "Administrar Solicitudes" },
    ],
  },
  reports: {
    label: "Reportes",
    permissions: [
      { id: "15", name: "view_reports", label: "Ver Reportes" },
      { id: "16", name: "manage_reports", label: "Administrar Reportes" },
    ],
  },
  budget: {
    label: "Presupuesto",
    permissions: [
      { id: "18", name: "view_budget", label: "Ver Presupuesto" },
      { id: "19", name: "manage_budget", label: "Administrar Presupuesto" },
    ],
  },
  provisions: {
    label: "Provisiones",
    permissions: [
      { id: "20", name: "view_provisions", label: "Ver Provisiones" },
      { id: "21", name: "manage_provisions", label: "Administrar Provisiones" },
    ],
  },
  support: {
    label: "Soporte",
    permissions: [
      { id: "22", name: "manage_support", label: "Administrar Soporte" },
    ],
  },
};

interface Role {
  id: string;
  name: string;
}

interface Permission {
  id: string;
  name: string;
}

interface Project {
  id: string;
  name: string;
  description?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role_id: string;
  role?: Role;
  dob?: string;
  permissions: Permission[];
  projects: Project[];
}

interface UserFormData {
  name: string;
  email: string;
  role_id: string;
  dob: string;
  permissions: string[];
  projectIds: string[];
}

interface EditUserDialogProps {
  user: User | null;
  roles: Role[] | Record<string, Role>;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UserFormData) => void;
  isLoading: boolean;
}

const today = new Date();

export const EditUserDialog = ({
  user,
  roles,
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: EditUserDialogProps) => {
  // Estado para controlar las pestañas
  const [activeTab, setActiveTab] = useState<string>("basic");

  // Datos del formulario
  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    email: "",
    role_id: "",
    dob: "",
    permissions: [],
    projectIds: [],
  });

  // Estados auxiliares
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Procesar roles para garantizar que sea un array
  const processedRoles = Array.isArray(roles)
    ? roles
    : roles && typeof roles === "object"
    ? Object.entries(roles)
        .filter(([key]) => !isNaN(Number(key)))
        .map(([_, value]) => value as Role)
    : [];

  // Obtener los proyectos asignados al usuario
  const { data: projects = [], isLoading: isLoadingProjects } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      try {
        const response = await apiService.getProjects();
        // Usar la misma lógica simple del componente original
        const projectsData = Array.isArray(response) ? response : [];

        // Mapear para asegurar que tengan la propiedad code
        return projectsData.map((project: Project) => ({
          ...project,
          name:
            (project.name ? project.name.substring(0, 4).toUpperCase() : "") ||
            `PRJ-${project.id}`,
        }));
      } catch (error) {
        console.error("Error al cargar proyectos:", error);
        toast.error("Error al cargar los proyectos");
        return [];
      }
    },
    enabled: isOpen && activeTab === "projects",
    staleTime: 1000 * 10, // 10 segundos
  });

  // Inicializar el formulario cuando cambia el usuario o se abre el diálogo
  useEffect(() => {
    if (user && isOpen) {
      // Mapear los IDs de permisos
      const permissionIds = user.permissions?.map((p) => p.id.toString()) || [];

      // Mapear los IDs de proyectos
      const projectIds = user.projects?.map((p) => p.id.toString()) || [];

      setFormData({
        name: user.name || "",
        email: user.email || "",
        role_id: user.role_id?.toString() || "",
        dob: user.dob || "",
        permissions: permissionIds,
        projectIds: projectIds,
      });

      // Establecer la fecha de nacimiento si existe
      if (user.dob) {
        setSelectedDate(new Date(user.dob));
      } else {
        setSelectedDate(undefined);
      }

      // Restablecer errores
      setErrors({});
    }
  }, [user, isOpen]);

  // Validación del formulario
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "El nombre es requerido";
    }

    if (!formData.email.trim()) {
      newErrors.email = "El correo electrónico es requerido";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "El correo electrónico no es válido";
    }

    if (!formData.role_id) {
      newErrors.role_id = "El rol es requerido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar cambios en los campos de texto
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Limpiar error al cambiar el valor
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Manejar cambio de rol
  const handleRoleChange = (value: string) => {
    setFormData((prev) => ({ ...prev, role_id: value }));

    // Limpiar error
    if (errors.role_id) {
      setErrors((prev) => ({ ...prev, role_id: "" }));
    }
  };

  // Manejar selección de fecha
  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      setFormData((prev) => ({
        ...prev,
        dob: format(date, "yyyy-MM-dd"),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        dob: "",
      }));
    }
  };

  // Manejar toggle de permisos
  const handlePermissionToggle = (permissionId: string) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter((id) => id !== permissionId)
        : [...prev.permissions, permissionId],
    }));
  };

  // Manejar toggle de categoría completa de permisos
  const handleCategoryToggle = (category: CategoryData) => {
    const categoryPermissionIds = category.permissions.map((p) => p.id);
    const allIncluded = categoryPermissionIds.every((id) =>
      formData.permissions.includes(id)
    );

    if (allIncluded) {
      // Quitar todos los permisos de esta categoría
      setFormData((prev) => ({
        ...prev,
        permissions: prev.permissions.filter(
          (id) => !categoryPermissionIds.includes(id)
        ),
      }));
    } else {
      // Añadir todos los permisos de esta categoría
      const newPermissions = [...formData.permissions];
      categoryPermissionIds.forEach((id) => {
        if (!newPermissions.includes(id)) {
          newPermissions.push(id);
        }
      });
      setFormData((prev) => ({ ...prev, permissions: newPermissions }));
    }
  };

  // Manejar toggle de proyectos
  const handleProjectToggle = (projectId: string) => {
    setFormData((prev) => ({
      ...prev,
      projectIds: prev.projectIds.includes(projectId)
        ? prev.projectIds.filter((id) => id !== projectId)
        : [...prev.projectIds, projectId],
    }));
  };

  // Manejar envío del formulario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit(formData);
    } else {
      toast.error("Por favor completa todos los campos requeridos");
    }
  };

  // Prevenir envío del formulario al presionar Enter
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.target instanceof HTMLInputElement) {
      if (e.target.type !== "textarea") {
        e.preventDefault();
      }
    }
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] md:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar Usuario</DialogTitle>
          <DialogDescription>
            Actualiza la información del usuario {user.name}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full mt-2"
          >
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="basic">Información Básica</TabsTrigger>
              <TabsTrigger value="permissions">Permisos</TabsTrigger>
              <TabsTrigger value="projects">Proyectos</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid gap-4 py-2">
                <div className="grid gap-2">
                  <Input
                    id="name"
                    name="name"
                    placeholder="Nombre completo"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && (
                    <span className="text-xs text-red-500">{errors.name}</span>
                  )}
                </div>
                <div className="grid gap-2">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Correo electrónico"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className={errors.email ? "border-red-500" : ""}
                  />
                  {errors.email && (
                    <span className="text-xs text-red-500">{errors.email}</span>
                  )}
                </div>
                <div className="grid gap-2">
                  <Select
                    value={formData.role_id}
                    onValueChange={handleRoleChange}
                    required
                  >
                    <SelectTrigger
                      className={`w-full ${
                        errors.role_id ? "border-red-500" : ""
                      }`}
                    >
                      <SelectValue placeholder="Selecciona un rol" />
                    </SelectTrigger>
                    <SelectContent className="w-full min-w-[200px]">
                      {processedRoles.length > 0 ? (
                        processedRoles.map((role: Role) => (
                          <SelectItem key={role.id} value={role.id.toString()}>
                            {role.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="loading" disabled>
                          Cargando roles...
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {errors.role_id && (
                    <span className="text-xs text-red-500">
                      {errors.role_id}
                    </span>
                  )}
                </div>
                <div className="grid gap-2">
                  <Popover modal>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !selectedDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate
                          ? format(selectedDate, "PPP")
                          : "Fecha de nacimiento"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      align="start"
                      onOpenAutoFocus={(e) => e.preventDefault()}
                    >
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={handleDateSelect}
                        disabled={(date) => date > today}
                        fromYear={1940}
                        toYear={today.getFullYear()}
                        captionLayout="dropdown-buttons"
                        fixedWeeks
                        showOutsideDays={false}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="permissions" className="space-y-4">
              <div className="grid gap-4 py-2">
                <ScrollArea className="h-[340px] pr-4">
                  <div className="space-y-6">
                    {Object.entries(permissionCategories).map(
                      ([key, category]) => (
                        <div key={key} className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`category-${key}`}
                              checked={category.permissions.every((p) =>
                                formData.permissions.includes(p.id)
                              )}
                              onCheckedChange={() =>
                                handleCategoryToggle(category)
                              }
                            />
                            <Label
                              htmlFor={`category-${key}`}
                              className="text-sm font-medium cursor-pointer"
                            >
                              {category.label}
                            </Label>
                          </div>

                          <div className="ml-6 space-y-1.5">
                            {category.permissions.map((permission) => (
                              <div
                                key={permission.id}
                                className="flex items-center space-x-2 py-1"
                              >
                                <Checkbox
                                  id={`permission-${permission.id}`}
                                  checked={formData.permissions.includes(
                                    permission.id
                                  )}
                                  onCheckedChange={() =>
                                    handlePermissionToggle(permission.id)
                                  }
                                />
                                <Label
                                  htmlFor={`permission-${permission.id}`}
                                  className="text-sm cursor-pointer"
                                >
                                  {permission.label}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </ScrollArea>
              </div>
            </TabsContent>

            <TabsContent value="projects" className="space-y-4">
              <div className="grid gap-4 py-2">
                {isLoadingProjects ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-600"></div>
                    <span className="ml-2">Cargando proyectos...</span>
                  </div>
                ) : projects.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">
                      No hay proyectos disponibles
                    </p>
                  </div>
                ) : (
                  <ScrollArea className="h-[340px] pr-4">
                    <div className="space-y-3">
                      {projects.map((project: Project) => (
                        <div
                          key={project.id}
                          className="flex items-center space-x-2 py-1"
                        >
                          <Checkbox
                            id={`project-${project.id}`}
                            checked={formData.projectIds.includes(project.id)}
                            onCheckedChange={() =>
                              handleProjectToggle(project.id)
                            }
                          />
                          <Label
                            htmlFor={`project-${project.id}`}
                            className="flex-1 cursor-pointer"
                          >
                            <span className="font-medium">{project.name}</span>
                            {project.description && (
                              <p className="text-xs text-muted-foreground">
                                {project.description}
                              </p>
                            )}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}

                <div className="mt-2">
                  <p className="text-sm text-muted-foreground">
                    {formData.projectIds.length} proyectos seleccionados
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? "Guardando..." : "Guardar cambios"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
