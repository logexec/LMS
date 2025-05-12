/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { repositionsApi } from "@/services/axios";
import { useTableContext, Reposition } from "@/contexts/TableContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { LoaderCircle } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

// Esquema de validación para el formulario
const formSchema = z.object({
  status: z.enum(["rejected"]),
  note: z.string().min(1, "El motivo de rechazo es requerido"),
});

interface EditRepositionProps {
  item: Reposition;
  type?: string;
  triggerElement?: React.ReactNode;
}

type FormValues = z.infer<typeof formSchema>;

// Componente para el campo de observación/motivo de rechazo
function RejectNoteInput({
  form,
  isSubmitting,
}: {
  form: any;
  isSubmitting: boolean;
}) {
  // Manejador específico para la tecla espacio
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === " ") {
      // Evitar el comportamiento predeterminado para la tecla espacio
      e.stopPropagation();

      // Obtener la posición actual del cursor
      const textarea = e.currentTarget;
      const start = textarea.selectionStart || 0;
      const end = textarea.selectionEnd || 0;

      // Obtener el valor actual
      const currentValue = textarea.value || "";

      // Crear el nuevo valor con el espacio insertado en la posición del cursor
      const newValue =
        currentValue.substring(0, start) + " " + currentValue.substring(end);

      // Actualizar el valor en el formulario
      form.setValue("note", newValue, { shouldValidate: true });

      // Programar la actualización de la posición del cursor después del render
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 1;
      }, 0);

      // Prevenir el comportamiento predeterminado
      e.preventDefault();
    }
  };

  return (
    <FormField
      control={form.control}
      name="note"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Observación *</FormLabel>
          <FormControl>
            <textarea
              placeholder="Motivo de rechazo..."
              disabled={isSubmitting}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              {...field}
              rows={1}
              onKeyDown={handleKeyDown}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export function RejectRepositionComponent({ item }: EditRepositionProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [open, setOpen] = useState(false);

  // Usar el contexto de la tabla
  const { setData, data, refreshData } = useTableContext();

  // Inicializar el formulario
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: "rejected",
      note: "",
    },
  });

  // Reset form when row changes
  useEffect(() => {
    form.reset({
      status: "rejected",
      note: "",
    });
  }, [item, form.reset]);

  // Se encarga de prevenir la propagación de eventos del dropdown
  const handleTriggerClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOpen(true);
  };

  const handleSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);

      // Verificar si estamos mostrando solo pendientes
      const showingOnlyPending = data.every(
        (reposition: any) => reposition.status === "pending"
      );

      // Si solo mostramos pendientes, eliminar la reposición de la vista
      if (showingOnlyPending) {
        setData((prevData: any) =>
          prevData.filter((row: any) => row.id !== item.id)
        );
      } else {
        // Si estamos mostrando todas las reposiciones, actualizar la fila
        setData((prevData: any) =>
          prevData.map((row: any) =>
            row.id === item.id ? { ...row, ...values } : row
          )
        );
      }

      // Luego actualizamos en la API
      await repositionsApi.updateReposition(item.id.toString(), values);

      // Cerrar diálogo y mostrar mensaje
      setOpen(false);
      toast.success(`Reposición ${item.id} rechazada correctamente`);
    } catch (error) {
      console.error("Error updating reposition:", error);

      // Revertir cambios - refrescar los datos para asegurar consistencia
      toast.error("No se pudo actualizar la reposición. Refrescando datos...");
      await refreshData();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Usamos un div contenedor para evitar problemas de propagación */}
      <div className="w-full" onClick={(e) => e.stopPropagation()}>
        <div
          className="text-destructive focus:text-destructive hover:bg-red-400/10 dark:hover:bg-red-600/10 hover:text-red-600 dark:hover:text-red-400 cursor-pointer text-start px-2 py-1.5 text-sm block"
          onClick={handleTriggerClick}
        >
          Rechazar
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Rechazar reposición {item.id}</DialogTitle>
            <DialogDescription>
              Marca esta reposición como rechazada.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              <RejectNoteInput form={form} isSubmitting={isSubmitting} />

              <DialogFooter className="pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    "Guardar Cambios"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default RejectRepositionComponent;
