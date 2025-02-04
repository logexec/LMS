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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

interface Permission {
  id: string;
  name: string;
}

const permissionCategories = {
  users: [
    "manage_users",
    "view_users",
    "create_users",
    "edit_users",
    "delete_users",
  ],
  financial: [
    "register_income",
    "view_income",
    "edit_income",
    "view_expenses",
    "manage_expenses",
    "manage_special_income",
  ],
  discounts: ["view_discounts", "manage_discounts"],
  requests: ["view_requests", "manage_requests"],
  reports: ["view_reports", "manage_reports"],
  budget: ["view_budget", "manage_budget"],
  other: ["manage_provisions", "manage_support"],
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
    manage_support: "Administrar Soporte",
  };
  return permissionMap[permission] || permission;
};

export const PermissionsDialog = ({
  user,
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: PermissionsDialogProps) => {
  const [availablePermissions, setAvailablePermissions] = useState<
    Permission[]
  >([]);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      setSelectedPermissions(user.permissions.map((p) => p.id));
    }
  }, [user]);

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/permissions`,
          {
            credentials: "include",
          }
        );
        if (!response.ok) throw new Error("Error al cargar los permisos");
        const data = await response.json();
        setAvailablePermissions(data);
      } catch (error) {
        console.error("Error fetching permissions:", error);
      }
    };

    if (isOpen) {
      fetchPermissions();
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(selectedPermissions);
  };

  const renderPermissionsByCategory = () => {
    return Object.entries(permissionCategories).map(
      ([category, permissions]) => (
        <Card key={category} className="mb-4">
          <CardHeader>
            <CardTitle className="text-lg capitalize">{category}</CardTitle>
            <CardDescription>
              Permisos relacionados con {category}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availablePermissions
              .filter((p) => permissions.includes(p.name))
              .map((permission) => (
                <div
                  key={permission.id}
                  className="flex items-center space-x-2"
                >
                  <Checkbox
                    id={`permission-${permission.id}`}
                    checked={selectedPermissions.includes(permission.id)}
                    onCheckedChange={() => {
                      setSelectedPermissions((prev) =>
                        prev.includes(permission.id)
                          ? prev.filter((id) => id !== permission.id)
                          : [...prev, permission.id]
                      );
                    }}
                  />
                  <label
                    htmlFor={`permission-${permission.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {formatPermissionName(permission.name)}
                  </label>
                </div>
              ))}
          </CardContent>
        </Card>
      )
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gestionar Permisos</DialogTitle>
          <DialogDescription>
            Selecciona los permisos para el usuario {user?.name}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="py-4">{renderPermissionsByCategory()}</div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Guardando..." : "Guardar permisos"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
