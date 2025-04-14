"use client";

import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { format, subMonths } from "date-fns";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Row } from "@tanstack/react-table";
import { useState } from "react";
import { AccountProps, Project, RequestProps } from "@/utils/types";
import { apiService } from "@/services/api.service";
import DateSelectField from "../DateSelectField";
import SelectField from "../SelectField";

interface EditRecordProps {
  row: Row<RequestProps>;
  onClose?: () => void;
  onUpdateSuccess?: (updatedData: Partial<RequestProps>) => void;
  accounts?: AccountProps[];
  projects?: Project[];
}

const formSchema = z.object({
  request_date: z.coerce.date(),
  invoice_number: z.coerce.number().transform((val) => String(val)), // Convertir a string después de validar como número
  account_id: z.string(),
  amount: z.coerce.number(),
  project: z.string().optional(),
  note: z.string().optional(),
});

export default function EditRecord({
  row,
  onClose,
  onUpdateSuccess,
  accounts = [],
  projects = [],
}: EditRecordProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  //   const dataFetchedRef = useRef(false);

  const today = new Date();
  const lastMonth = subMonths(today, 1);
  const minDate = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 28);
  const maxDate = new Date(today.getFullYear(), today.getMonth(), 29);

  const defaultDate = row.original.request_date
    ? new Date(row.original.request_date)
    : today;
  const clampedDate =
    defaultDate < minDate
      ? minDate
      : defaultDate > maxDate
      ? maxDate
      : defaultDate;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      request_date: clampedDate,
      invoice_number: row.original.invoice_number.toString() || "0",
      account_id: row.original.account_id
        ? String(row.original.account_id)
        : "",
      amount: Number(row.original.amount) || 0,
      project: row.original.project || "",
      note: row.original.note || "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true);

      // Preparar los datos para enviar
      const updatedData: Partial<RequestProps> = {
        request_date: format(values.request_date, "yyyy-MM-dd"),
        invoice_number: values.invoice_number, // Ya es string gracias al transform
        account_id: values.account_id,
        amount: values.amount,
        project: values.project,
        note: values.note,
      };

      // Añadir información para la visualización en la tabla
      const uiData: Partial<RequestProps> = {
        ...updatedData,
        id: row.original.id,
      };

      // Aplicar actualización optimista antes de la petición al API
      if (onUpdateSuccess) {
        onUpdateSuccess(uiData);
      }

      // Enviar los datos actualizados
      const requestId = String(row.original.id);
      const response = await apiService.updateRequest(requestId, updatedData);

      if (response.ok) {
        toast.success("Registro actualizado correctamente");
        // Cerrar el diálogo de edición si se proporcionó una función onClose
        if (onClose) onClose();
      } else {
        // Si la petición falla, podríamos revertir la actualización optimista
        throw new Error(response.message || "Error al actualizar el registro");
      }
    } catch (error) {
      console.error("Form submission error", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to submit the form. Please try again."
      );

      // Aquí podríamos implementar una función para revertir la actualización optimista
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 max-w-6xl mx-auto pt-10 px-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="grid grid-cols-12 gap-4">
          {/* Bloque del Calendario */}
          <div className="col-span-4">
            <FormField
              control={form.control}
              name="request_date"
              render={({ field }) => (
                <DateSelectField
                  label={`Fecha de ${
                    row.original.type === "discount" ? "Descuento" : "Gasto"
                  }`}
                  value={field.value}
                  onChange={field.onChange}
                  minDate={minDate}
                  maxDate={maxDate}
                />
              )}
            />
          </div>

          <div className="col-span-4">
            <FormField
              control={form.control}
              name="invoice_number"
              render={({ field: { onChange, ...field } }) => (
                <FormItem>
                  <FormLabel>No. Factura</FormLabel>
                  <FormControl>
                    <Input
                      placeholder=""
                      type="number"
                      onChange={(e) => onChange(parseInt(e.target.value) || 0)}
                      {...field}
                      value={
                        typeof field.value === "string"
                          ? parseInt(field.value) || 0
                          : field.value
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Bloque del Combobox de Cuentas */}
          <div className="col-span-4">
            <FormField
              control={form.control}
              name="account_id"
              render={({ field }) => (
                <SelectField
                  label="Cuenta"
                  value={field.value}
                  onChange={field.onChange}
                  options={accounts.map((acc) => ({
                    id: String(acc.id),
                    name: acc.name,
                  }))}
                  placeholder="Selecciona una cuenta"
                />
              )}
            />
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-6">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor</FormLabel>
                  <FormControl>
                    <Input
                      placeholder=""
                      type="number"
                      step="0.01"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Bloque del Combobox de Proyectos */}
          <div className="col-span-6">
            <FormField
              control={form.control}
              name="project"
              render={({ field }) => (
                <SelectField
                  label="Proyecto"
                  value={field.value as string}
                  onChange={field.onChange}
                  options={projects.map((proj) => ({
                    id: String(proj.id),
                    name: proj.name,
                  }))}
                  placeholder="Selecciona un proyecto"
                />
              )}
            />
          </div>
        </div>

        <FormField
          control={form.control}
          name="note"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observación</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Comienza a escribir..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Actualizando..." : "Actualizar Datos"}
        </Button>
      </form>
    </Form>
  );
}
