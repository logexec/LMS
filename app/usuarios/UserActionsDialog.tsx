import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useEffect } from "react";
import { toast } from "sonner";

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

interface UserActionsDialogsProps {
  user: User | null;
  roles: Role[];
  isEditOpen: boolean;
  isPermissionsOpen: boolean;
  isDeleteOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const UserActionsDialogs = ({
  user,
  roles,
  isEditOpen,
  isPermissionsOpen,
  isDeleteOpen,
  onClose,
  onSuccess,
}: UserActionsDialogsProps) => {
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    role_id: "",
  });
  const [availablePermissions, setAvailablePermissions] = useState<
    Permission[]
  >([]);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setEditForm({
        name: user.name,
        email: user.email,
        role_id: user.role_id,
      });
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
        toast.error(
          error instanceof Error
            ? error.message
            : "Error al cargar los permisos disponibles"
        );
      }
    };

    if (isPermissionsOpen) {
      fetchPermissions();
    }
  }, [isPermissionsOpen]);

  const handleEdit = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${user.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(editForm),
        }
      );

      if (!response.ok) throw new Error("Error al actualizar el usuario");

      toast.success("Usuario actualizado exitosamente");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Error al actualizar el usuario"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handlePermissions = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${user.id}/permissions`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ permissions: selectedPermissions }),
        }
      );

      if (!response.ok) throw new Error("Error al actualizar los permisos");

      toast.success("Permisos actualizados exitosamente");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Error al actualizar los permisos"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${user.id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok) throw new Error("Error al eliminar el usuario");

      toast.success("Usuario eliminado exitosamente");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al eliminar el usuario"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Dialog open={isEditOpen} onOpenChange={() => onClose()}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
            <DialogDescription>
              Actualiza la información del usuario. Presiona guardar cuando
              termines.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="name">Nombre</label>
              <Input
                id="name"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="email">Correo electrónico</label>
              <Input
                id="email"
                type="email"
                value={editForm.email}
                onChange={(e) =>
                  setEditForm({ ...editForm, email: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="role">Rol</label>
              <Select
                value={editForm.role_id}
                onValueChange={(value) =>
                  setEditForm({ ...editForm, role_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un rol" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleEdit} disabled={isLoading}>
              {isLoading ? "Guardando..." : "Guardar cambios"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isPermissionsOpen} onOpenChange={() => onClose()}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Gestionar Permisos</DialogTitle>
            <DialogDescription>
              Selecciona los permisos que deseas asignar al usuario.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
            {availablePermissions.map((permission) => (
              <Card key={permission.id} className="relative">
                <CardHeader className="pb-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`permission-${permission.id}`}
                      checked={selectedPermissions.includes(permission.id)}
                      onCheckedChange={(checked) => {
                        setSelectedPermissions(
                          checked
                            ? [...selectedPermissions, permission.id]
                            : selectedPermissions.filter(
                                (id) => id !== permission.id
                              )
                        );
                      }}
                    />
                    <label
                      htmlFor={`permission-${permission.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {permission.name}
                    </label>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handlePermissions} disabled={isLoading}>
              {isLoading ? "Guardando..." : "Guardar permisos"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteOpen} onOpenChange={() => onClose()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El usuario será eliminado del
              sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isLoading}>
              {isLoading ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
