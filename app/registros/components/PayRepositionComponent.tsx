/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useMemo } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Esquema de validación para el formulario
const formSchema = z.object({
  status: z.enum(["paid"]),
  month: z
    .string()
    .min(1, "Debes escoger un mes")
    .transform((val) => val ?? ""),
  note: z
    .string()
    .min(1, "Debes agregar un motivo para respaldar el pago")
    .transform((val) => val ?? ""),
  when: z
    .string()
    .min(1, "Debes indicar cuando se hará el descuento.")
    .transform((val) => val ?? ""), // convierte null o undefined en ""
});

interface EditRepositionProps {
  item: Reposition;
  type?: string;
  triggerElement?: React.ReactNode;
}

type FormValues = z.infer<typeof formSchema>;

function TextareaInput({
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
              placeholder="Justifica el pago. (Ej. Citación de tránsito.)"
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

// Componente para mostrar los campos de descuento
function DiscountFields({
  form,
  isSubmitting,
  today,
}: {
  form: any;
  isSubmitting: boolean;
  today: string;
}) {
  return (
    <>
      <FormField
        control={form.control}
        name="month"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Mes *</FormLabel>
            <FormControl>
              <input
                type="month"
                disabled={isSubmitting}
                min={today}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={field.value}
                onChange={field.onChange}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="when"
        render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor="when">Descontar en</FormLabel>
            <Select
              value={field.value}
              onValueChange={field.onChange}
              disabled={isSubmitting}
            >
              <FormControl>
                <SelectTrigger id="when">
                  <SelectValue placeholder="Selecciona" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="decimo_tercero">Décimo Tercero</SelectItem>
                <SelectItem value="decimo_cuarto">Décimo Cuarto</SelectItem>
                <SelectItem value="liquidación">Liquidación</SelectItem>
                <SelectItem value="rol">Rol</SelectItem>
                <SelectItem value="utilidades">Utilidades</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}

// Componente principal
export function PayRepositionComponent({ type, item }: EditRepositionProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [open, setOpen] = useState(false);

  // Usar el contexto de la tabla
  const { setData } = useTableContext();

  // Inicializar el formulario
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: "paid",
      month: "",
      when: "",
      note: "",
    },
  });

  // Reset form when row changes
  useEffect(() => {
    form.reset({
      status: "paid",
      month: "",
      when: "",
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

      // Actualización optimista - Actualizar UI primero
      setData((prevData: any) =>
        prevData.map((row: any) =>
          row.id === item.id ? { ...row, ...values } : row
        )
      );

      // Luego actualizamos en la API
      await repositionsApi.updateReposition(item.id!, values);

      // Cerrar diálogo y mostrar mensaje
      setOpen(false);
      toast.success(`Reposición ${item.id} actualizada correctamente`);
    } catch (error) {
      console.error("Error updating reposition:", error);

      // En caso de error, revertir cambios optimistas
      setData((prevData: any) =>
        prevData.map((row: any) => (row.id === item.id ? item : row))
      );

      toast.error("No se pudo actualizar la solicitud. Inténtalo de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const today = useMemo(() => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Meses de 0-11, +1 para 1-12
    return `${year}-${month}`;
  }, []);

  return (
    <>
      {/* Usamos una etiqueta div en lugar de span para evitar cualquier problema de propagación */}
      <div className="w-full" onClick={(e) => e.stopPropagation()}>
        <div
          className="text-slate-700 dark:text-slate-300 hover:bg-slate-400/10 dark:hover:bg-slate-600/10 hover:text-slate-900 dark:hover:text-slate-100 cursor-pointer text-start px-2 py-1.5 text-sm block"
          onClick={handleTriggerClick}
        >
          Pagar
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Pagar reposición {item.id}</DialogTitle>
            <DialogDescription>
              Marca esta reposición como pagada.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              {type === "discount" && (
                <DiscountFields
                  form={form}
                  isSubmitting={isSubmitting}
                  today={today}
                />
              )}

              <TextareaInput form={form} isSubmitting={isSubmitting} />

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

export default PayRepositionComponent;
