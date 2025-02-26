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
import { Card, CardContent } from "@/components/ui/card";
import { CalendarIcon, Search, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useQuery } from "@tanstack/react-query";
import { apiService } from "@/services/api.service";
import { toast } from "sonner";

const permissionMap: { [key: string]: { id: string; label: string } } = {
  manage_users: { id: "1", label: "Administrar Usuarios" },
  view_users: { id: "2", label: "Ver Usuarios" },
  create_users: { id: "3", label: "Crear Usuarios" },
  edit_users: { id: "4", label: "Editar Usuarios" },
  delete_users: { id: "5", label: "Eliminar Usuarios" },
  register_income: { id: "6", label: "Registrar Ingresos" },
  view_income: { id: "7", label: "Ver Ingresos" },
  edit_income: { id: "8", label: "Editar Ingresos" },
  view_discounts: { id: "9", label: "Ver Descuentos" },
  manage_discounts: { id: "10", label: "Administrar Descuentos" },
  view_expenses: { id: "11", label: "Ver Gastos" },
  manage_expenses: { id: "12", label: "Administrar Gastos" },
  view_requests: { id: "13", label: "Ver Solicitudes" },
  manage_requests: { id: "14", label: "Administrar Solicitudes" },
  view_reports: { id: "15", label: "Ver Reportes" },
  manage_reports: { id: "16", label: "Administrar Reportes" },
  manage_special_income: { id: "17", label: "Administrar Ingresos Especiales" },
  view_budget: { id: "18", label: "Ver Presupuesto" },
  manage_budget: { id: "19", label: "Administrar Presupuesto" },
  manage_provisions: { id: "20", label: "Administrar Provisiones" },
  view_provisions: { id: "21", label: "Ver Provisiones" },
  manage_support: { id: "22", label: "Administrar Soporte" },
};

const formatPermissionName = (permission: string): string => {
  return permissionMap[permission]?.label || permission;
};

const getPermissionId = (permission: string): string => {
  return permissionMap[permission]?.id || permission;
};

// Array con todas las opciones disponibles (códigos internos)
const permissionOptions = Object.keys(permissionMap);

// Permisos por defecto según el rol. Las keys deben ser el nombre del rol en minúsculas.
const roleDefaultPermissions: { [roleName: string]: string[] } = {
  admin: [
    "manage_users",
    "view_users",
    "create_users",
    "edit_users",
    "register_income",
    "view_income",
    "edit_income",
    "view_discounts",
    "manage_discounts",
    "view_expenses",
    "manage_expenses",
    "view_requests",
    "manage_requests",
    "view_reports",
    "manage_reports",
    "manage_special_income",
    "view_budget",
    "manage_budget",
    "manage_provisions",
  ],
  developer: [
    "manage_users",
    "view_users",
    "create_users",
    "edit_users",
    "delete_users",
    "register_income",
    "view_income",
    "edit_income",
    "view_discounts",
    "manage_discounts",
    "view_expenses",
    "manage_expenses",
    "view_requests",
    "manage_requests",
    "view_reports",
    "manage_reports",
    "manage_special_income",
    "view_budget",
    "manage_budget",
    "manage_provisions",
  ],
  custodio: ["view_users", "edit_users"],
  auditor: ["view_users", "view_provisions"],
};

interface Role {
  id: string;
  name: string;
}

interface Project {
  id: string;
  name: string;
  code: string;
}

interface CreateUserFormData {
  name: string;
  email: string;
  password: string;
  role_id: string;
  dob: string;
  permissions: string[];
  projectIds: string[];
}

interface CreateUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateUserFormData) => void;
  roles: Role[] | undefined;
  isLoading: boolean;
}

const DEFAULT_PASSWORD = "L0g3X2025*";
const today = new Date();

export const CreateUserDialog = ({
  isOpen,
  onClose,
  onSubmit,
  roles = [],
  isLoading,
}: CreateUserDialogProps) => {
  const [activeTab, setActiveTab] = useState<string>("basic");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [formData, setFormData] = useState<CreateUserFormData>({
    name: "",
    email: "",
    password: DEFAULT_PASSWORD,
    role_id: "",
    dob: "",
    permissions: [],
    projectIds: [],
  });

  // Estado para validación
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Estado para el input del datalist de permisos
  const [permissionInput, setPermissionInput] = useState<string>("");
  const [projectSearchTerm, setProjectSearchTerm] = useState<string>("");

  // Fetch projects from the API
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

  // Resetear el formulario cuando se cierra
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        name: "",
        email: "",
        password: DEFAULT_PASSWORD,
        role_id: "",
        dob: "",
        permissions: [],
        projectIds: [],
      });
      setSelectedDate(undefined);
      setPermissionInput("");
      setProjectSearchTerm("");
      setActiveTab("basic");
      setErrors({});
    }
  }, [isOpen]);

  const handleCloseDialog = () => {
    onClose();
  };

  // Validación de campos
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validar campos básicos
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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validar el formulario antes de enviar
    if (validateForm()) {
      onSubmit(formData);
    } else {
      // Mostrar mensaje de error y cambiar a la pestaña con errores
      toast.error("Por favor, completa todos los campos requeridos");
      setActiveTab("basic"); // Volver a la pestaña básica donde están los campos requeridos
    }
  };

  // Prevenir envío del formulario al presionar Enter
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.target instanceof HTMLInputElement) {
      // Prevenir envío del formulario solo si no es un textarea
      if (e.target.type !== "textarea") {
        e.preventDefault();
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Limpiar error al cambiar el valor
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleRoleChange = (value: string) => {
    // Actualiza el role_id; la asignación de los permisos predeterminados se hará en el useEffect.
    setFormData((prev) => ({
      ...prev,
      role_id: value,
    }));

    // Limpiar error
    if (errors.role_id) {
      setErrors((prev) => ({ ...prev, role_id: "" }));
    }
  };

  useEffect(() => {
    if (formData.role_id && Array.isArray(roles)) {
      // Buscamos en el array de roles el objeto correspondiente (comparando id como string)
      const selectedRole = roles.find(
        (role) => role.id.toString() === formData.role_id.toString()
      );
      // Utilizamos el nombre del rol en minúsculas para obtener los permisos predeterminados
      const defaults = selectedRole
        ? roleDefaultPermissions[selectedRole.name.toLowerCase()] || []
        : [];
      setFormData((prev) => ({
        ...prev,
        permissions: defaults,
      }));
    }
  }, [formData.role_id, roles]);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      setFormData((prev) => ({
        ...prev,
        dob: format(date, "yyyy-MM-dd"),
      }));
    }
  };

  // Permisos - Permite agregar el permiso al hacer click o autocompletar
  const handlePermissionInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newValue = e.target.value;
    setPermissionInput(newValue);
    const permKey = Object.keys(permissionMap).find(
      (key) => permissionMap[key].label === newValue
    );
    if (permKey) {
      const permId = getPermissionId(permKey);
      if (!formData.permissions.includes(permId)) {
        setFormData((prev) => ({
          ...prev,
          permissions: [...prev.permissions, permId],
        }));
      }
      setPermissionInput("");
    }
  };

  const handlePermissionKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevenir envío del formulario
      const trimmed = permissionInput.trim();
      if (trimmed === "*") {
        const allPermissionIds =
          Object.keys(permissionMap).map(getPermissionId);
        setFormData((prev) => ({
          ...prev,
          permissions: allPermissionIds,
        }));
      } else {
        const permKey = Object.keys(permissionMap).find(
          (key) => permissionMap[key].label === trimmed
        );
        if (permKey) {
          const permId = getPermissionId(permKey);
          if (!formData.permissions.includes(permId)) {
            setFormData((prev) => ({
              ...prev,
              permissions: [...prev.permissions, permId],
            }));
          }
        }
      }
      setPermissionInput("");
    }
  };

  const handleRemovePermission = (perm: string) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.filter((p) => p !== perm),
    }));
  };

  // Proyectos
  const handleProjectToggle = (projectId: string) => {
    setFormData((prev) => ({
      ...prev,
      projectIds: prev.projectIds.includes(projectId)
        ? prev.projectIds.filter((id) => id !== projectId)
        : [...prev.projectIds, projectId],
    }));
  };

  // Filtrar proyectos basados en término de búsqueda
  const filteredProjects = Array.isArray(projects)
    ? projects.filter(
        (project: Project) =>
          project.name
            ?.toLowerCase()
            .includes(projectSearchTerm.toLowerCase()) ||
          project.code?.toLowerCase().includes(projectSearchTerm.toLowerCase())
      )
    : [];

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) handleCloseDialog();
      }}
    >
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Crear nuevo usuario</DialogTitle>
          <DialogDescription>
            Ingresa la información del nuevo usuario.
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
                    onValueChange={(value) => {
                      handleRoleChange(value);
                    }}
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
                      {Array.isArray(roles) && roles.length > 0 ? (
                        roles.map((role) => (
                          <SelectItem key={role.id} value={role.id}>
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
                <Card>
                  <CardContent className="pt-4">
                    <p className="text-sm text-muted-foreground">
                      La contraseña por defecto será:{" "}
                      <strong>{DEFAULT_PASSWORD}</strong>
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="permissions" className="space-y-4">
              <div className="grid gap-4 py-2">
                {/* Datalist para permisos */}
                <div className="grid gap-2">
                  <Input
                    id="permissions"
                    name="permissions"
                    placeholder="Agregar permiso     (Escribe * y presiona Enter para seleccionar todos)"
                    list="permissions-options"
                    value={permissionInput}
                    onChange={handlePermissionInputChange}
                    onKeyDown={handlePermissionKeyDown}
                    autoComplete="off"
                  />
                  <datalist id="permissions-options">
                    {permissionOptions
                      .filter(
                        (perm) =>
                          !formData.permissions.includes(getPermissionId(perm))
                      )
                      .map((perm) => (
                        <option
                          key={perm}
                          value={formatPermissionName(perm)}
                          data-id={getPermissionId(perm)}
                        />
                      ))}
                  </datalist>
                  {/* Mostrar permisos seleccionados como píldoras */}
                  <div className="flex flex-wrap gap-2">
                    {formData.permissions.map((permId) => {
                      const permKey = Object.keys(permissionMap).find(
                        (key) => permissionMap[key].id === permId
                      );
                      return (
                        <Badge
                          key={permId}
                          variant="outline"
                          className="cursor-pointer hover:bg-slate-100"
                          onClick={() => handleRemovePermission(permId)}
                        >
                          {permKey ? formatPermissionName(permKey) : permId}{" "}
                          <span className="ml-1">x</span>
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="projects" className="space-y-4">
              <div className="grid gap-4 py-2">
                <div className="relative mb-4">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar proyectos..."
                    className="pl-8"
                    value={projectSearchTerm}
                    onChange={(e) => setProjectSearchTerm(e.target.value)}
                  />
                </div>

                {isLoadingProjects ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : !Array.isArray(filteredProjects) ||
                  filteredProjects.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <p className="text-sm text-muted-foreground">
                      No se encontraron proyectos
                    </p>
                  </div>
                ) : (
                  <ScrollArea className="h-[240px] pr-4">
                    <div className="space-y-3">
                      {filteredProjects.map((project: Project) => (
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
                            <span className="font-medium">{project.code}</span>{" "}
                            - {project.name}
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
            <Button type="button" variant="outline" onClick={handleCloseDialog}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? "Creando..." : "Crear usuario"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
