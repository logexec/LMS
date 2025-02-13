import { useState, useEffect } from "react";
import { type PermissionsDialogProps } from "@/types/dialogs";
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
  manage_support: { id: "21", label: "Administrar Soporte" },
  view_provisions: { id: "22", label: "Ver Provisiones" },
};

const formatPermissionName = (permission: string): string => {
  return permissionMap[permission]?.label || permission;
};

const getPermissionId = (permission: string): string => {
  return permissionMap[permission]?.id || permission;
};

const permissionOptions = Object.keys(permissionMap);

export const PermissionsDialog = ({
  user,
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: PermissionsDialogProps) => {
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [permissionInput, setPermissionInput] = useState<string>("");

  useEffect(() => {
    if (user) {
      setSelectedPermissions(user.permissions.map((p) => p.id));
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(selectedPermissions);
  };

  const handleClose = () => {
    setSelectedPermissions([]);
    setPermissionInput("");
    onClose();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      handleClose();
    }
  };

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
      if (!selectedPermissions.includes(permId)) {
        setSelectedPermissions((prev) => [...prev, permId]);
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
        setSelectedPermissions(allPermissionIds);
      } else {
        const permKey = Object.keys(permissionMap).find(
          (key) => permissionMap[key].label === trimmed
        );
        if (permKey) {
          const permId = getPermissionId(permKey);
          if (!selectedPermissions.includes(permId)) {
            setSelectedPermissions((prev) => [...prev, permId]);
          }
        }
      }
      setPermissionInput("");
    }
  };

  const handleRemovePermission = (permId: string) => {
    setSelectedPermissions((prev) => prev.filter((id) => id !== permId));
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className="sm:max-w-[700px]"
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          e.preventDefault();
          handleClose();
        }}
      >
        <DialogHeader>
          <DialogTitle>Gestionar Permisos</DialogTitle>
          <DialogDescription>
            Selecciona los permisos para el usuario {user?.name}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
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
                disabled={isLoading}
              />
              <datalist id="permissions-options">
                {permissionOptions
                  .filter(
                    (perm) =>
                      !selectedPermissions.includes(getPermissionId(perm))
                  )
                  .map((perm) => (
                    <option
                      key={perm}
                      value={formatPermissionName(perm)}
                      data-id={getPermissionId(perm)}
                    />
                  ))}
              </datalist>
              <div className="flex flex-wrap gap-2">
                {selectedPermissions.map((permId) => {
                  const permKey = Object.keys(permissionMap).find(
                    (key) => permissionMap[key].id === permId
                  );
                  return (
                    <Badge
                      key={permId}
                      variant="outline"
                      className="cursor-pointer hover:bg-slate-100"
                      onClick={() =>
                        !isLoading && handleRemovePermission(permId)
                      }
                    >
                      {permKey ? formatPermissionName(permKey) : permId}{" "}
                      <span className="ml-1">×</span>
                    </Badge>
                  );
                })}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? "Guardando..." : "Guardar permisos"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
