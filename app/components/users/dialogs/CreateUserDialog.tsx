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
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

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

interface CreateUserFormData {
  name: string;
  email: string;
  password: string;
  role_id: string;
  dob: string;
  permissions: string[];
}

interface CreateUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateUserFormData) => void;
  roles: Role[];
  isLoading: boolean;
}

const DEFAULT_PASSWORD = "L0g3X2025*";
const today = new Date();

export const CreateUserDialog = ({
  isOpen,
  onClose,
  onSubmit,
  roles,
  isLoading,
}: CreateUserDialogProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [formData, setFormData] = useState<CreateUserFormData>({
    name: "",
    email: "",
    password: DEFAULT_PASSWORD,
    role_id: "",
    dob: "",
    permissions: [],
  });
  // Estado para el input del datalist de permisos
  const [permissionInput, setPermissionInput] = useState<string>("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (value: string) => {
    // Actualiza el role_id; la asignación de los permisos predeterminados se hará en el useEffect.
    setFormData((prev) => ({
      ...prev,
      role_id: value,
    }));
  };

  useEffect(() => {
    if (formData.role_id) {
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

  // Permite agregar el permiso al hacer click o autocompletar
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
      e.preventDefault();
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-[600px]"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Crear nuevo usuario</DialogTitle>
          <DialogDescription>
            Ingresa la información del nuevo usuario.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Input
                id="name"
                name="name"
                placeholder="Nombre completo"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
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
              />
            </div>
            <div className="grid gap-2">
              <Select
                value={formData.role_id}
                onValueChange={(value) => {
                  handleRoleChange(value);
                }}
                required
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecciona un rol" />
                </SelectTrigger>
                <SelectContent className="w-full min-w-[200px]">
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
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
