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

export const permissionMap: { [key: string]: { id: string; label: string } } = {
  view_users: { id: "1", label: "Ver Usuarios" },
  edit_users: { id: "2", label: "Editar Usuarios" },
  manage_users: { id: "3", label: "Administrar Usuarios" },

  view_income: { id: "4", label: "Ver Ingresos" },
  edit_income: { id: "5", label: "Editar Ingresos" },
  manage_income: { id: "6", label: "Administrar Ingresos" },

  view_discounts: { id: "7", label: "Ver Descuentos" },
  edit_discounts: { id: "8", label: "Editar Descuentos" },
  manage_discounts: { id: "9", label: "Administrar Descuentos" },

  view_expenses: { id: "10", label: "Ver Gastos" },
  edit_expenses: { id: "11", label: "Editar Gastos" },
  manage_expenses: { id: "12", label: "Administrar Gastos" },

  view_requests: { id: "13", label: "Ver Solicitudes" },
  edit_requests: { id: "14", label: "Editar Solicitudes" },
  manage_requests: { id: "15", label: "Administrar Solicitudes" },

  view_repositions: { id: "16", label: "Ver Reposiciones" },
  edit_repositions: { id: "17", label: "Editar Reposiciones" },
  manage_repositions: { id: "18", label: "Administrar Reposiciones" },

  view_budget: { id: "19", label: "Ver Presupuesto" },
  edit_budget: { id: "20", label: "Editar Presupuesto" },
  manage_budget: { id: "21", label: "Administrar Presupuesto" },

  view_provisions: { id: "22", label: "Ver Provisiones" },
  edit_provisions: { id: "23", label: "Editar Provisiones" },
  manage_provisions: { id: "24", label: "Administrar Provisiones" },

  view_support: { id: "25", label: "Ver Soporte" },
  edit_support: { id: "26", label: "Editar Soporte" },
  manage_support: { id: "27", label: "Administrar Soporte" },
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
