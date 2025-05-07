import { useState } from "react";
import { toast } from "sonner"; // Asegúrate de que tienes sonner instalado
import { requestsApi } from "@/services/axios"; // Ajusta la ruta según tu estructura
import { useTableContext, Request } from "@/contexts/TableContext"; // Ajusta la ruta
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { CircleAlertIcon, LoaderCircle, TrashIcon } from "lucide-react";

interface DeleteButtonProps {
  row: Request;
}

export const DeleteButtonComponent: React.FC<DeleteButtonProps> = ({ row }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [open, setOpen] = useState(false);

  // Usar el contexto de la tabla
  const { setData, refreshData } = useTableContext();

  const handleDeleteRecord = async () => {
    try {
      setIsDeleting(true);

      // Eliminación optimista - Actualizamos la UI primero
      setData((prevData) =>
        prevData.filter((item) => item.unique_id !== row.unique_id)
      );

      // Luego realizamos la petición a la API
      await requestsApi.deleteRequest(row.unique_id);

      // Cerrar el diálogo y mostrar mensaje de éxito
      setOpen(false);
      toast.success(`Solicitud ${row.unique_id} eliminada correctamente`);
    } catch (error) {
      console.error("Error deleting record:", error);

      // Revertir la eliminación optimista en caso de error
      refreshData();

      // Mostrar un mensaje de error
      toast.error("No se pudo eliminar la solicitud. Inténtalo de nuevo.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <TrashIcon className="h-4 w-4" />
          <span>Eliminar</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <div className="flex flex-col gap-2 max-sm:items-center sm:flex-row sm:gap-4">
          <div
            className="flex size-9 shrink-0 items-center justify-center rounded-full border"
            aria-hidden="true"
          >
            <CircleAlertIcon className="opacity-80" size={16} />
          </div>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás realmente seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente
              el registro {row.unique_id}.
            </AlertDialogDescription>
          </AlertDialogHeader>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault(); // Prevenir que el diálogo se cierre automáticamente
              handleDeleteRecord();
            }}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                Eliminando...
              </>
            ) : (
              "Eliminar"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteButtonComponent;
