/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { repositionsApi } from "@/services/axios";
import { Reposition, useTableContext } from "@/contexts/TableContext";
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
import { useForm, UseFormReturn } from "react-hook-form";
import * as z from "zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TableContextType {
  data: Reposition[];
  setData: React.Dispatch<React.SetStateAction<Reposition[]>>;
  refreshData: () => Promise<void>;
}

// Validation schema
export const createFormSchema = (type: string) => {
  const baseSchema = z.object({
    status: z.literal("paid"),
    note: z.string().nonempty("Debes agregar un motivo para respaldar el pago"),
  });

  if (type === "discount") {
    return baseSchema.extend({
      month: z.string().nonempty("Debes escoger un mes"),
      when: z.string().nonempty("Debes indicar cuando se hará el descuento."),
    });
  }

  return baseSchema.extend({
    month: z.string().nullable(),
    when: z.string().nullable(),
  });
};

interface EditRepositionProps {
  item: Reposition;
  type: string;
  triggerElement?: React.ReactNode;
}

type FormValues = z.infer<ReturnType<typeof createFormSchema>>;

function TextareaInput({
  form,
  isSubmitting,
}: {
  form: UseFormReturn<FormValues>;
  isSubmitting: boolean;
}) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === " ") {
      e.stopPropagation();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart || 0;
      const end = textarea.selectionEnd || 0;
      const currentValue = textarea.value || "";
      const newValue =
        currentValue.substring(0, start) + " " + currentValue.substring(end);
      form.setValue("note", newValue, { shouldValidate: true });
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 1;
      }, 0);
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

function DiscountFields({
  form,
  isSubmitting,
  today,
}: {
  form: UseFormReturn<FormValues>;
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
                value={field.value ?? ""}
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
              value={field.value ?? ""}
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

export function PayRepositionComponent({ type, item }: EditRepositionProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [open, setOpen] = useState(false);

  const { setData, data, refreshData } = useTableContext() as TableContextType;

  const schema = useMemo(() => createFormSchema(type), [type]);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      status: "paid",
      note: "",
      month: "",
      when: "",
    },
  });

  useEffect(() => {
    form.reset({
      status: "paid",
      note: "",
      month: "",
      when: "",
    });
  }, [item, type, form]);

  const handleTriggerClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOpen(true);
  };

  const handleSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);

      // Validate required fields for discount type
      if (type === "discount" && (!values.month || !values.when)) {
        toast.error(
          "Por favor, completa los campos requeridos para el descuento."
        );
        return;
      }

      // Transform values to match database schema
      const payload = {
        ...values,
        month: values.month || undefined,
        when: values.when || undefined,
      };

      const showingOnlyPending = data.every(
        (reposition) => reposition.status === "pending"
      );

      if (showingOnlyPending) {
        setData((prevData) => prevData.filter((row) => row.id !== item.id));
      } else {
        setData((prevData: any) =>
          prevData.map((row: any) =>
            row.id === item.id ? { ...row, ...values } : row
          )
        );
      }

      await repositionsApi.updateReposition(String(item.id), payload);

      setOpen(false);
      toast.success(`Reposición ${item.id} marcada como pagada correctamente`);
    } catch (error) {
      console.error("Error updating reposition:", error);
      toast.error("No se pudo actualizar la solicitud. Refrescando datos...");
      await refreshData();
    } finally {
      setIsSubmitting(false);
    }
  };

  const today = useMemo(() => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  }, []);

  return (
    <>
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
