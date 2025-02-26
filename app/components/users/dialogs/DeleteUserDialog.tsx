import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { type User } from "@/types/dialogs";

interface DeleteUserDialogProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}

export const DeleteUserDialog = ({
  user,
  isOpen,
  onClose,
  onConfirm,
  isLoading,
}: DeleteUserDialogProps) => {
  const handleClose = () => {
    onClose();
  };

  if (!user) return null;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <DialogContent className="sm:max-w-[425px] md:max-w-lg">
        <DialogHeader>
          <DialogTitle>Eliminar Usuario</DialogTitle>
        </DialogHeader>
        <Alert variant="destructive" className="bg-red-100 border-red-600">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-600">Advertencia</AlertTitle>
          <AlertDescription className="text-red-800">
            ¿Estás seguro que deseas eliminar permanentemente al usuario{" "}
            <strong>{user.name}</strong>? Esta acción no se puede deshacer.
          </AlertDescription>
        </Alert>
        <DialogFooter>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={onConfirm}
              disabled={isLoading}
            >
              {isLoading ? "Eliminando..." : "Sí, eliminar usuario"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
