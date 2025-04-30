/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  AlertCircle,
  Calendar as CalendarIcon,
  RefreshCw,
  Check,
  ChevronsUpDown,
  DollarSign,
  FileText,
  ClipboardList,
  Building2,
  User,
  Truck,
  HashIcon,
  Loader2,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { LoadingState, OptionsState } from "@/utils/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useData } from "@/contexts/DataContext";
import CalendarComponent from "@/components/comp-487";

const formSchema = z.object({
  fechaGasto: z.coerce.date(),
  tipo: z.string().min(1, "Debes seleccionar un tipo"),
  proyecto: z.string().min(2, "El proyecto es obligatorio"),
  cuenta: z.string().min(2, "La cuenta es obligatoria"),
  responsable: z.string().optional(),
  vehicle_plate: z.string().optional(),
  vehicle_number: z.string().optional(),
  factura: z
    .string()
    .min(3, "El número de factura debe tener al menos 3 caracteres")
    .max(10, "El número de factura no puede tener más de 10 caracteres"),
  valor: z.string().min(3, "El valor debe tener al menos 3 dígitos"),
  observacion: z.string().min(1, "Debes escribir una observación"),
});

interface MyFormProps {
  options: OptionsState;
  loading?: LoadingState;
  type: "discount" | "income";
  onSubmit: (data: FormData) => Promise<void>;
}

export default function NormalDiscountForm({ type, onSubmit }: MyFormProps) {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Usar el contexto de datos global
  const {
    fetchAccounts,
    fetchResponsibles,
    fetchTransports,
    loading: contextLoading,
    options,
  } = useData();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fechaGasto: new Date(),
      tipo: "",
      proyecto: "",
      cuenta: "",
      responsable: "",
      vehicle_plate: "",
      vehicle_number: "",
      factura: "",
      valor: "0",
      observacion: "",
    },
  });

  // Autoscroll al error
  useEffect(() => {
    const errorField = Object.keys(form.formState.errors)[0];
    if (errorField) {
      const el = document.querySelector(`[name="${errorField}"]`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [form.formState.errors]);

  // Primero, define callbacks fuera del efecto:
  const handleTipoChange = useCallback(
    (tipo: string) => {
      if (tipo) {
        fetchAccounts(tipo, type === "discount" ? "discount" : "income");
      }
    },
    [fetchAccounts, type]
  );

  const handleProyectoChange = useCallback(
    (proyecto: string, tipo: string) => {
      if (proyecto && tipo === "nomina") {
        fetchResponsibles(proyecto);
      }
    },
    [fetchResponsibles]
  );

  // Luego, usa un único effect con watch:
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "tipo" && value.tipo) {
        handleTipoChange(value.tipo as string);

        if (value.tipo === "transportista") {
          fetchTransports();
        }
      }

      if (name === "proyecto" && value.proyecto && value.tipo === "nomina") {
        handleProyectoChange(value.proyecto as string, value.tipo as string);
      }
    });

    return () => subscription.unsubscribe();
  }, [form.watch, handleTipoChange, handleProyectoChange, fetchTransports]);

  const resetForm = () => {
    form.reset();
  };

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append("request_date", format(values.fechaGasto, "yyyy-MM-dd"));
      formData.append("type", type === "discount" ? "discount" : "income");
      formData.append("status", "pending");
      formData.append("invoice_number", values.factura.toString());
      formData.append("account_id", values.cuenta);
      formData.append("amount", values.valor.toString());
      formData.append("project", values.proyecto);
      if (values.responsable) {
        formData.append("responsible_id", values.responsable);
      }
      if (values.vehicle_plate) {
        formData.append("vehicle_plate", values.vehicle_plate);
      }
      if (values.vehicle_number) {
        formData.append("vehicle_number", values.vehicle_number);
      }
      formData.append("note", values.observacion);
      formData.append("personnel_type", values.tipo);

      await onSubmit(formData);
      toast.success(
        type === "discount"
          ? "Descuento registrado correctamente"
          : "Ingreso registrado correctamente"
      );
      resetForm();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Hubo un error al registrar el descuento"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const today = new Date();
  const firstAllowedDate = new Date(
    today.getFullYear(),
    today.getMonth() - 1,
    29
  );
  const lastAllowedDate = new Date(today.getFullYear(), today.getMonth(), 28);

  // Variantes de animación para una entrada más suave
  const formVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" },
    },
  };

  const staggerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.07,
        delayChildren: 0.1,
      },
    },
  };

  const fadeInVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25,
      },
    },
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={formVariants}>
      <Card className="border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-950 shadow-md hover:shadow-lg transition-all duration-300">
        <CardHeader className="bg-linear-to-r from-rose-50 to-red-50 dark:from-rose-950/40 dark:to-red-950/40 border-b border-slate-100 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-xl text-slate-800 dark:text-slate-200">
                {type === "discount"
                  ? "Formulario de Descuentos"
                  : "Formulario de Ingresos"}
              </CardTitle>
              <CardDescription className="mt-1">
                Completa todos los datos requeridos para registrar un nuevo
                {type === "discount" ? " descuento." : " ingreso."}
              </CardDescription>
            </div>
            <Badge
              variant="outline"
              className="bg-white/80 dark:bg-slate-900/80 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800 px-3 py-1 rounded-full"
            >
              {type === "discount"
                ? "Descuento Individual"
                : "Ingreso Individual"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 items-center pt-4">
              <Alert className="border-rose-200 dark:border-rose-800 bg-rose-50/50 dark:bg-rose-950/30 shadow-xs">
                <AlertDescription className="flex flex-col space-y-4 text-slate-700 dark:text-slate-300">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                    <span>
                      Completa la información necesaria para registrar tu{" "}
                      {type === "discount" ? "descuento" : "ingreso"}.
                    </span>
                  </div>
                  <div className="pt-2 border-t border-rose-100 dark:border-rose-900/60">
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-medium uppercase tracking-wide mb-2">
                      Progreso
                    </p>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full bg-linear-to-r from-rose-500 to-red-500 transition-all duration-500 ease-out`}
                        style={{
                          width: `${
                            (Object.keys(form.formState.dirtyFields).length /
                              Object.keys(formSchema.shape).length) *
                            100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>

              {/* Estado del formulario */}
              <div className="mt-6 space-y-4">
                <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4 shadow-xs">
                  <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                    Resumen del Registro
                  </h3>
                  <div className="space-y-2">
                    {isSubmitting ? (
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-600 dark:text-slate-400">
                            Fecha:
                          </span>
                          <span className="font-medium text-slate-800 dark:text-slate-200">
                            {form.watch("fechaGasto") &&
                              form
                                .getValues("fechaGasto")
                                .toLocaleDateString("es-EC", {
                                  year: "numeric",
                                  month: "2-digit",
                                  day: "2-digit",
                                })}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-600 dark:text-slate-400">
                            Tipo:
                          </span>
                          <span className="font-medium text-slate-800 dark:text-slate-200">
                            {form.watch("tipo")
                              ? form.watch("tipo") === "nomina"
                                ? "Nómina"
                                : "Transportista"
                              : "No seleccionado"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-600 dark:text-slate-400">
                            Proyecto:
                          </span>
                          <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[150px]">
                            {form.watch("proyecto") || "No seleccionado"}
                          </span>
                        </div>

                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-600 dark:text-slate-400">
                            Cuenta:
                          </span>
                          <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[150px]">
                            {form.watch("cuenta") || "No seleccionada"}
                          </span>
                        </div>
                        {form.watch("tipo") === "nomina" ? (
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-600 dark:text-slate-400">
                              Responsable:
                            </span>
                            <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[150px]">
                              {form.watch("responsable") || "No seleccionado"}
                            </span>
                          </div>
                        ) : form.watch("tipo") === "transportista" ? (
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-600 dark:text-slate-400">
                              Placa:
                            </span>
                            <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[150px]">
                              {form.watch("vehicle_plate") || "No seleccionado"}
                            </span>
                          </div>
                        ) : null}
                        {form.watch("vehicle_number") && (
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-600 dark:text-slate-400">
                              No. Vehículo:
                            </span>
                            <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[150px]">
                              {form.watch("vehicle_number") ||
                                "No especificado"}
                            </span>
                          </div>
                        )}

                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-600 dark:text-slate-400">
                            Factura:
                          </span>
                          <span className="font-medium text-slate-800 dark:text-slate-200">
                            {form.watch("factura")}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-600 dark:text-slate-400">
                            Valor:
                          </span>
                          <span className="font-medium text-slate-800 dark:text-slate-200">
                            {form.watch("valor") !== "0"
                              ? new Intl.NumberFormat("es-ES", {
                                  style: "currency",
                                  currency: "USD",
                                }).format(Number(form.watch("valor")))
                              : "$0.00"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-600 dark:text-slate-400">
                            Observación:
                          </span>
                          <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[150px]">
                            {form.watch("observacion") || "Sin observación"}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handleSubmit)}
                  className="space-y-6"
                >
                  <motion.div
                    variants={staggerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {/* Primera sección: Información básica */}
                    <div className="bg-slate-50/80 dark:bg-slate-900/50 rounded-lg p-4 border border-slate-100 dark:border-slate-800 shadow-xs">
                      <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-4 flex items-center">
                        <FileText className="w-4 h-4 mr-2 text-rose-500 dark:text-rose-400" />
                        Información Básica
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <motion.div variants={fadeInVariants}>
                          <FormField
                            control={form.control}
                            name="fechaGasto"
                            render={({ field }) => (
                              <FormItem className="flex flex-col">
                                <FormLabel className="flex items-center text-xs font-medium">
                                  <CalendarIcon className="w-3.5 h-3.5 mr-1.5 text-rose-500 dark:text-rose-400" />
                                  Fecha del{" "}
                                  {type === "discount"
                                    ? "Descuento"
                                    : "Ingreso"}
                                </FormLabel>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <FormControl>
                                      <Button
                                        variant={"outline"}
                                        className={cn(
                                          "w-full pl-3 text-left font-normal text-sm h-9 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60",
                                          !field.value &&
                                            "text-muted-foreground"
                                        )}
                                      >
                                        {field.value ? (
                                          format(field.value, "PPP")
                                        ) : (
                                          <span>Selecciona una Fecha</span>
                                        )}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                      </Button>
                                    </FormControl>
                                  </PopoverTrigger>
                                  <PopoverContent
                                    className="w-auto p-0 border-slate-200 dark:border-slate-700 shadow-lg"
                                    align="start"
                                  >
                                    <CalendarComponent
                                      mode="single"
                                      selected={field.value}
                                      onSelect={field.onChange}
                                      disabled={(date) =>
                                        date < firstAllowedDate ||
                                        date > lastAllowedDate
                                      }
                                      autoFocus
                                      className="rounded-md border-slate-200 dark:border-slate-700"
                                    />
                                  </PopoverContent>
                                </Popover>
                                <FormMessage className="text-xs" />
                              </FormItem>
                            )}
                          />
                        </motion.div>

                        <motion.div variants={fadeInVariants}>
                          <FormField
                            control={form.control}
                            name="tipo"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center text-xs font-medium">
                                  <User className="w-3.5 h-3.5 mr-1.5 text-rose-500 dark:text-rose-400" />
                                  Tipo
                                </FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger className="h-9 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm">
                                      <SelectValue placeholder="-- Selecciona --" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className="border-slate-200 dark:border-slate-700">
                                    <SelectItem
                                      value="nomina"
                                      className="text-sm"
                                    >
                                      Nómina
                                    </SelectItem>
                                    <SelectItem
                                      value="transportista"
                                      className="text-sm"
                                    >
                                      Transportista
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage className="text-xs" />
                              </FormItem>
                            )}
                          />
                        </motion.div>

                        <motion.div variants={fadeInVariants}>
                          <FormField
                            control={form.control}
                            name="proyecto"
                            render={({ field }) => (
                              <FormItem className="flex flex-col">
                                <FormLabel className="flex items-center text-xs font-medium">
                                  <Building2 className="w-3.5 h-3.5 mr-1.5 text-rose-500 dark:text-rose-400" />
                                  Proyecto
                                </FormLabel>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <FormControl>
                                      <Button
                                        variant="outline"
                                        role="combobox"
                                        className={cn(
                                          "w-full justify-between border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm h-9",
                                          !field.value &&
                                            "text-muted-foreground"
                                        )}
                                        disabled={contextLoading.projects}
                                      >
                                        {contextLoading.projects ? (
                                          <span className="flex items-center">
                                            <Loader2 className="w-3 h-3 rounded-full text-rose-500 dark:text-rose-400 animate-spin mr-2" />
                                            Cargando...
                                          </span>
                                        ) : field.value ? (
                                          <span className="truncate">
                                            {
                                              options.projects.find(
                                                (project) =>
                                                  project.value === field.value
                                              )?.label
                                            }
                                          </span>
                                        ) : (
                                          "-- Selecciona --"
                                        )}
                                        <ChevronsUpDown className="ml-1 h-3.5 w-3.5 shrink-0 opacity-50" />
                                      </Button>
                                    </FormControl>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-full p-0 border-slate-200 dark:border-slate-700 shadow-lg">
                                    <Command className="rounded-lg border-0">
                                      <CommandInput
                                        placeholder="Buscar proyecto..."
                                        className="h-9"
                                      />
                                      <CommandList>
                                        <CommandEmpty>
                                          No se pudieron cargar los proyectos.
                                        </CommandEmpty>
                                        <CommandGroup>
                                          {options.projects.map((project) => (
                                            <CommandItem
                                              value={project.label}
                                              key={project.value}
                                              onSelect={() => {
                                                form.setValue(
                                                  "proyecto",
                                                  project.value
                                                );
                                              }}
                                              className="text-sm"
                                            >
                                              <div className="flex items-center">
                                                <Check
                                                  className={cn(
                                                    "mr-2 h-3.5 w-3.5 text-rose-500 dark:text-rose-400",
                                                    project.value ===
                                                      field.value
                                                      ? "opacity-100"
                                                      : "opacity-0"
                                                  )}
                                                />
                                                <span className="truncate">
                                                  {project.label}
                                                </span>
                                              </div>
                                            </CommandItem>
                                          ))}
                                        </CommandGroup>
                                      </CommandList>
                                    </Command>
                                  </PopoverContent>
                                </Popover>
                                <FormMessage className="text-xs" />
                              </FormItem>
                            )}
                          />
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>

                  {form.watch("tipo") && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        transition: {
                          type: "spring",
                          stiffness: 500,
                          damping: 30,
                        },
                      }}
                      className="space-y-6"
                    >
                      {/* Segunda sección: Detalles del descuento */}
                      <div className="bg-slate-50/80 dark:bg-slate-900/50 rounded-lg p-4 border border-slate-100 dark:border-slate-800 shadow-xs">
                        <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-4 flex items-center">
                          <ClipboardList className="w-4 h-4 mr-2 text-rose-500 dark:text-rose-400" />
                          Detalles del{" "}
                          {type === "discount" ? "Descuento" : "Ingreso"}
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          <FormField
                            control={form.control}
                            name="cuenta"
                            render={({ field }) => (
                              <FormItem className="flex flex-col">
                                <FormLabel className="flex items-center text-xs font-medium">
                                  <FileText className="w-3.5 h-3.5 mr-1.5 text-rose-500 dark:text-rose-400" />
                                  Cuenta
                                </FormLabel>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <FormControl>
                                      <Button
                                        variant="outline"
                                        role="combobox"
                                        className={cn(
                                          "w-full justify-between text-sm h-9 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950",
                                          !field.value &&
                                            "text-muted-foreground"
                                        )}
                                        disabled={contextLoading.accounts}
                                      >
                                        {contextLoading.accounts ? (
                                          <span className="flex items-center">
                                            <Loader2 className="w-3 h-3 rounded-full text-rose-500 dark:text-rose-400 animate-spin mr-2" />
                                            Cargando...
                                          </span>
                                        ) : field.value ? (
                                          <span className="truncate max-w-[180px]">
                                            {options.accounts.find(
                                              (account) =>
                                                account.value === field.value
                                            )?.label || field.value}
                                          </span>
                                        ) : (
                                          "-- Selecciona --"
                                        )}
                                        <ChevronsUpDown className="ml-1 h-3.5 w-3.5 shrink-0 opacity-50" />
                                      </Button>
                                    </FormControl>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-full p-0 border-slate-200 dark:border-slate-700 shadow-lg">
                                    <Command className="rounded-lg border-0">
                                      <CommandInput
                                        placeholder="Buscar cuenta..."
                                        className="h-9"
                                      />
                                      <CommandList>
                                        <CommandEmpty>
                                          No se encontraron cuentas.
                                        </CommandEmpty>
                                        <CommandGroup>
                                          {options.accounts.map(
                                            (account, idx) => (
                                              <CommandItem
                                                value={account.label}
                                                key={idx}
                                                onSelect={() => {
                                                  form.setValue(
                                                    "cuenta",
                                                    account.value
                                                  );
                                                }}
                                                className="text-sm"
                                              >
                                                <div className="flex items-center">
                                                  <Check
                                                    className={cn(
                                                      "mr-2 h-3.5 w-3.5 text-rose-500 dark:text-rose-400",
                                                      account.value ===
                                                        field.value
                                                        ? "opacity-100"
                                                        : "opacity-0"
                                                    )}
                                                  />
                                                  <span className="truncate">
                                                    {account.label}
                                                  </span>
                                                </div>
                                              </CommandItem>
                                            )
                                          )}
                                        </CommandGroup>
                                      </CommandList>
                                    </Command>
                                  </PopoverContent>
                                </Popover>
                                <FormMessage className="text-xs" />
                              </FormItem>
                            )}
                          />

                          {form.watch("tipo") === "nomina" && (
                            <FormField
                              control={form.control}
                              name="responsable"
                              render={({ field }) => (
                                <FormItem className="flex flex-col">
                                  <FormLabel className="flex items-center text-xs font-medium">
                                    <User className="w-3.5 h-3.5 mr-1.5 text-rose-500 dark:text-rose-400" />
                                    Responsable
                                  </FormLabel>
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <FormControl>
                                        <Button
                                          variant="outline"
                                          role="combobox"
                                          className={cn(
                                            "w-full justify-between text-sm h-9 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950",
                                            !field.value &&
                                              "text-muted-foreground"
                                          )}
                                          disabled={
                                            contextLoading.responsibles ||
                                            form.watch("proyecto") ===
                                              undefined ||
                                            form.watch("proyecto") === null ||
                                            form.watch("proyecto") === ""
                                          }
                                        >
                                          {contextLoading.responsibles ? (
                                            <span className="flex items-center">
                                              <Loader2 className="w-3 h-3 rounded-full text-rose-500 dark:text-rose-400 animate-spin mr-2" />
                                              Cargando...
                                            </span>
                                          ) : field.value ? (
                                            <span className="truncate max-w-[180px]">
                                              {options.responsibles.find(
                                                (responsible) =>
                                                  responsible.value ===
                                                  field.value
                                              )?.label || field.value}
                                            </span>
                                          ) : (
                                            "-- Selecciona --"
                                          )}
                                          <ChevronsUpDown className="ml-1 h-3.5 w-3.5 shrink-0 opacity-50" />
                                        </Button>
                                      </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-full p-0 border-slate-200 dark:border-slate-700 shadow-lg">
                                      <Command className="rounded-lg border-0">
                                        <CommandInput
                                          placeholder="Buscar responsable..."
                                          className="h-9"
                                        />
                                        <CommandList>
                                          <CommandEmpty>
                                            No se encontraron responsables.
                                          </CommandEmpty>
                                          <CommandGroup>
                                            {options.responsibles.map(
                                              (responsible) => (
                                                <CommandItem
                                                  value={responsible.label}
                                                  key={responsible.value}
                                                  onSelect={() => {
                                                    form.setValue(
                                                      "responsable",
                                                      responsible.value
                                                    );
                                                  }}
                                                  className="text-sm"
                                                >
                                                  <div className="flex items-center">
                                                    <Check
                                                      className={cn(
                                                        "mr-2 h-3.5 w-3.5 text-rose-500 dark:text-rose-400",
                                                        responsible.value ===
                                                          field.value
                                                          ? "opacity-100"
                                                          : "opacity-0"
                                                      )}
                                                    />
                                                    <span className="truncate">
                                                      {responsible.label}
                                                    </span>
                                                  </div>
                                                </CommandItem>
                                              )
                                            )}
                                          </CommandGroup>
                                        </CommandList>
                                      </Command>
                                    </PopoverContent>
                                  </Popover>
                                  <FormMessage className="text-xs" />
                                </FormItem>
                              )}
                            />
                          )}

                          {form.watch("tipo") === "transportista" && (
                            <FormField
                              control={form.control}
                              name="vehicle_plate"
                              render={({ field }) => (
                                <FormItem className="flex flex-col">
                                  <FormLabel className="flex items-center text-xs font-medium">
                                    <Truck className="w-3.5 h-3.5 mr-1.5 text-rose-500 dark:text-rose-400" />
                                    Placa
                                  </FormLabel>
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <FormControl>
                                        <Button
                                          variant="outline"
                                          role="combobox"
                                          className={cn(
                                            "w-full justify-between text-sm h-9 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950",
                                            !field.value &&
                                              "text-muted-foreground"
                                          )}
                                          disabled={
                                            contextLoading.transports ||
                                            form.watch("proyecto") ===
                                              undefined ||
                                            form.watch("proyecto") === null ||
                                            form.watch("proyecto") === ""
                                          }
                                        >
                                          {contextLoading.transports ? (
                                            <span className="flex items-center">
                                              <Loader2 className="w-3 h-3 rounded-full bg-rose-500 dark:bg-rose-400 animate-spin mr-2" />
                                              Cargando...
                                            </span>
                                          ) : field.value ? (
                                            options.transports.find(
                                              (transport) =>
                                                transport.value === field.value
                                            )?.label || field.value
                                          ) : (
                                            "-- Selecciona --"
                                          )}
                                          <ChevronsUpDown className="ml-1 h-3.5 w-3.5 shrink-0 opacity-50" />
                                        </Button>
                                      </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-full p-0 border-slate-200 dark:border-slate-700 shadow-lg">
                                      <Command className="rounded-lg border-0">
                                        <CommandInput
                                          placeholder="Buscar placa..."
                                          className="h-9"
                                        />
                                        <CommandList>
                                          <CommandEmpty>
                                            No se encontró ninguna placa.
                                          </CommandEmpty>
                                          <CommandGroup>
                                            {options.transports.map(
                                              (transport) => (
                                                <CommandItem
                                                  value={transport.label}
                                                  key={transport.value}
                                                  onSelect={() => {
                                                    form.setValue(
                                                      "vehicle_plate",
                                                      transport.value
                                                    );
                                                  }}
                                                  className="text-sm"
                                                >
                                                  <div className="flex items-center">
                                                    <Check
                                                      className={cn(
                                                        "mr-2 h-3.5 w-3.5 text-rose-500 dark:text-rose-400",
                                                        transport.value ===
                                                          field.value
                                                          ? "opacity-100"
                                                          : "opacity-0"
                                                      )}
                                                    />
                                                    <span>
                                                      {transport.label}
                                                    </span>
                                                  </div>
                                                </CommandItem>
                                              )
                                            )}
                                          </CommandGroup>
                                        </CommandList>
                                      </Command>
                                    </PopoverContent>
                                  </Popover>
                                  <FormMessage className="text-xs" />
                                </FormItem>
                              )}
                            />
                          )}

                          <FormField
                            control={form.control}
                            name="vehicle_number"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center text-xs font-medium">
                                  <HashIcon className="w-3.5 h-3.5 mr-1.5 text-rose-500 dark:text-rose-400" />
                                  No. Transporte
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder=""
                                    type="number"
                                    {...field}
                                    className="h-9 text-sm border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
                                  />
                                </FormControl>
                                <FormMessage className="text-xs" />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      {/* Tercera sección: Valores */}
                      <div className="bg-slate-50/80 dark:bg-slate-900/50 rounded-lg p-4 border border-slate-100 dark:border-slate-800 shadow-xs">
                        <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-4 flex items-center">
                          <DollarSign className="w-4 h-4 mr-2 text-rose-500 dark:text-rose-400" />
                          Valores e Información Adicional
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          <FormField
                            control={form.control}
                            name="factura"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center text-xs font-medium">
                                  <FileText className="w-3.5 h-3.5 mr-1.5 text-rose-500 dark:text-rose-400" />
                                  Factura
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    required
                                    type="number"
                                    {...field}
                                    className="h-9 text-sm border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
                                  />
                                </FormControl>
                                <FormMessage className="text-xs" />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="valor"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center text-xs font-medium">
                                  <DollarSign className="w-3.5 h-3.5 mr-1.5 text-rose-500 dark:text-rose-400" />
                                  Valor
                                </FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">
                                      $
                                    </span>
                                    <Input
                                      type="number"
                                      required
                                      step="0.01"
                                      {...field}
                                      className="pl-7 h-9 text-sm border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage className="text-xs" />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="observacion"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center text-xs font-medium">
                                  <ClipboardList className="w-3.5 h-3.5 mr-1.5 text-rose-500 dark:text-rose-400" />
                                  Observación
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="text"
                                    {...field}
                                    className="h-9 text-sm border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
                                  />
                                </FormControl>
                                <FormMessage className="text-xs" />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 items-center sm:justify-end mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full sm:w-auto bg-white dark:bg-transparent text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all"
                      onClick={resetForm}
                      disabled={isSubmitting}
                    >
                      <RefreshCw className="mr-2 h-4 w-4 text-slate-500 dark:text-slate-400" />
                      Limpiar
                    </Button>
                    <Button
                      type="submit"
                      className="w-full sm:w-auto bg-linear-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white transition-all"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center">
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Procesando...
                        </span>
                      ) : (
                        "Registrar"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
