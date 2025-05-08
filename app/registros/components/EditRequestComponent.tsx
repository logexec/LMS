/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { requestsApi } from "@/services/axios";
import { useTableContext, Request } from "@/contexts/TableContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoaderCircle, Edit2 } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

// Esquema de validación para el formulario
const formSchema = z.object({
  invoice_number: z.string().min(1, "El número de factura es requerido"),
  amount: z
    .string()
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: "El monto debe ser un número positivo",
    }),
  note: z.string().min(1, "La observación es requerida"),
});

interface EditRequestProps {
  row: Request;
  triggerElement?: React.ReactNode;
}

type FormValues = z.infer<typeof formSchema>;

export const EditRequestComponent: React.FC<EditRequestProps> = ({ row }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [open, setOpen] = useState(false);

  // Usar el contexto de la tabla
  const { setData } = useTableContext();

  // Inicializar el formulario
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      invoice_number: row.invoice_number,
      amount: row.amount,
      note: row.note,
    },
  });

  // Reset form when row changes
  useEffect(() => {
    form.reset({
      invoice_number: row.invoice_number,
      amount: row.amount,
      note: row.note,
    });
  }, [row, form.reset]);

  const handleSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);

      // Actualización optimista - Actualizar UI primero
      setData((prevData) =>
        prevData.map((item) =>
          item.unique_id === row.unique_id ? { ...item, ...values } : item
        )
      );

      // Luego actualizamos en la API
      await requestsApi.updateRequest(row.unique_id, values);

      // Cerrar diálogo y mostrar mensaje
      setOpen(false);
      toast.success(`Solicitud ${row.unique_id} actualizada correctamente`);
    } catch (error) {
      console.error("Error updating request:", error);

      // En caso de error, revertir cambios optimistas
      setData((prevData) =>
        prevData.map((item) => (item.unique_id === row.unique_id ? row : item))
      );

      toast.error("No se pudo actualizar la solicitud. Inténtalo de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="w-full text-slate-700 dark:text-slate-300 hover:bg-slate-400/10 dark:hover:bg-slate-600/10 hover:text-slate-900 dark:hover:text-slate-100 cursor-pointer"
        >
          <Edit2 className="h-4 w-4" />
          <span>Editar</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar Solicitud {row.unique_id}</DialogTitle>
          <DialogDescription>
            Modifica los detalles de la solicitud. Los campos marcados con * son
            obligatorios.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="invoice_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número de Factura *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Ej. F-12345"
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monto *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">
                        $
                      </span>
                      <Input
                        {...field}
                        type="number"
                        step="0.01"
                        className="pl-7"
                        placeholder="0.00"
                        disabled={isSubmitting}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Ingresa el monto en dólares americanos.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observación *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Detalle de la solicitud"
                      disabled={isSubmitting}
                      className="w-full"
                      // Evitar la selección automática del texto
                      onFocus={(e) => {
                        // Colocar el cursor al final del texto en lugar de seleccionar todo
                        const length = e.target.value.length;
                        e.target.setSelectionRange(length, length);
                      }}
                      // Asegurar que los espacios se registren
                      onKeyDown={(e) => {
                        if (e.key === " ") {
                          // Esto puede ayudar a prevenir que la tecla de espacio sea interceptada
                          e.stopPropagation();
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
  );
};

export default EditRequestComponent;
