/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// UI Components
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertCircle,
  Loader2,
  RefreshCw,
  Calendar as CalendarIcon,
  FileText,
  Building2,
  User,
  HashIcon,
  DollarSign,
  ChevronsUpDown,
  Check,
  ClipboardList,
} from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

// Services & Utils
import { getAuthToken } from "@/services/auth.service";
import { LoadingState } from "@/utils/types";
import ExcelUploadSection from "./ExcelUploadSection";
import { Skeleton } from "@/components/ui/skeleton";
import { useData } from "@/contexts/DataContext";

// Form Schema
const formSchema = z.object({
  fechaGasto: z.date({
    required_error: "Debes seleccionar una fecha",
  }),
  tipo: z.string().readonly().default("nomina").optional(),
  proyecto: z.string().min(2, "El proyecto es obligatorio"),
  cuenta: z.string().min(2, "La cuenta es obligatoria"),
  responsable: z.string().min(1, "Debes seleccionar un responsable"),
  vehicle_number: z.string().optional(),
  factura: z
    .string()
    .min(3, "El número de factura debe tener al menos 3 caracteres"),
  valor: z.string().refine((val) => parseFloat(val) > 0, {
    message: "El valor debe ser mayor a 0",
  }),
  observacion: z.string().min(1, "Debes escribir una observación"),
});

// Animation variants
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 },
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

interface GastosFormProps {
  onSubmit?: (data: FormData) => Promise<void>;
}

const GastosForm: React.FC<GastosFormProps> = ({
  onSubmit = async (formData: FormData) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/requests`,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al crear el gasto");
      }

      toast.success("Gasto registrado exitosamente");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al procesar el gasto"
      );
    }
  },
}) => {
  // States
  const [localLoading, setLocalLoading] = useState<LoadingState>({
    submit: false,
    projects: false,
    responsibles: false,
    transports: false,
    accounts: false,
    areas: false,
  });

  const [showAdditionalFields, setShowAdditionalFields] = useState(false);

  // Usar el contexto de datos global
  const {
    options,
    loading: contextLoading,
    fetchAccounts,
    fetchResponsibles,
  } = useData();

  // Form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fechaGasto: new Date(),
      tipo: "nomina",
      proyecto: "",
      cuenta: "",
      responsable: "",
      vehicle_number: "",
      factura: "",
      valor: "",
      observacion: "",
    },
  });

  // Calculate date constraints
  const today = new Date();
  const firstAllowedDate = new Date(
    today.getFullYear(),
    today.getMonth() - 1,
    29
  );
  const lastAllowedDate = new Date(today.getFullYear(), today.getMonth(), 28);

  // Fetch cuentas cuando se carga el componente
  useEffect(() => {
    fetchAccounts("nomina", "expense");
  }, []);

  // Show additional fields when project is selected
  const selectedProject = form.watch("proyecto");
  const lastFetchedProject = React.useRef<string | null>(null);

  useEffect(() => {
    if (!selectedProject) {
      setShowAdditionalFields(false);
      lastFetchedProject.current = null;
      return;
    }

    if (selectedProject !== lastFetchedProject.current) {
      setShowAdditionalFields(true);
      fetchResponsibles(selectedProject);
      lastFetchedProject.current = selectedProject;
    }
  }, [selectedProject, fetchResponsibles]);

  // Form submission
  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setLocalLoading((prev) => ({ ...prev, submit: true }));

    try {
      const formDataToSend = new FormData();
      formDataToSend.append(
        "request_date",
        format(values.fechaGasto, "yyyy-MM-dd")
      );
      formDataToSend.append("type", "expense");
      formDataToSend.append("status", "pending");
      formDataToSend.append("invoice_number", values.factura);
      formDataToSend.append("account_id", values.cuenta);
      formDataToSend.append("amount", values.valor);
      formDataToSend.append("project", values.proyecto);
      formDataToSend.append("note", values.observacion);
      formDataToSend.append("personnel_type", "nomina");

      // Conditional fields
      if (values.responsable) {
        formDataToSend.append("responsible_id", values.responsable);
      }
      if (values.vehicle_number) {
        formDataToSend.append("vehicle_number", values.vehicle_number);
      }

      await onSubmit(formDataToSend);

      // Reset form with animation timing
      setShowAdditionalFields(false);
      setTimeout(() => {
        form.reset({
          fechaGasto: new Date(),
          tipo: "nomina",
          proyecto: "",
          cuenta: "",
          responsable: "",
          vehicle_number: "",
          factura: "",
          valor: "",
          observacion: "",
        });
      }, 100);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al procesar el gasto"
      );
    } finally {
      setLocalLoading((prev) => ({ ...prev, submit: false }));
    }
  };

  // Reset form handler
  const resetForm = () => {
    setShowAdditionalFields(false);
    setTimeout(() => {
      form.reset({
        fechaGasto: new Date(),
        tipo: "nomina",
        proyecto: "",
        cuenta: "",
        responsable: "",
        vehicle_number: "",
        factura: "",
        valor: "",
        observacion: "",
      });
    }, 100);
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="container"
    >
      {/* Excel Upload Section */}
      <motion.div
        key="excel-upload"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <ExcelUploadSection context="expenses" />
      </motion.div>

      <Card className="mt-8 border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-950 shadow-md hover:shadow-lg transition-all duration-300">
        <CardHeader className="bg-linear-to-r from-rose-50 to-red-50 dark:from-rose-950/40 dark:to-red-950/40 border-b border-slate-100 dark:border-slate-800">
          <CardTitle className="text-xl text-slate-800 dark:text-slate-200">
            Registro de Gastos
          </CardTitle>
          <CardDescription className="mt-1">
            Complete todos los campos requeridos para registrar un nuevo gasto
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 items-center pt-4">
              <Alert className="border-rose-200 dark:border-rose-800 bg-rose-50/50 dark:bg-rose-950/30 shadow-xs">
                <AlertDescription className="flex flex-col space-y-4 text-slate-700 dark:text-slate-300">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                    <span>
                      Todos los campos son obligatorios y deben ser completados
                      correctamente.
                    </span>
                  </div>
                  <div className="pt-2 border-t border-rose-100 dark:border-rose-900/60">
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-medium uppercase tracking-wide mb-2">
                      Progreso
                    </p>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-linear-to-r from-rose-500 to-red-500 transition-all duration-500 ease-out"
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

              {/* Form Summary */}
              <div className="mt-6 space-y-4">
                <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4 shadow-xs">
                  <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                    Resumen del Gasto
                  </h3>
                  <div className="space-y-2">
                    {localLoading.submit ? (
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
                              format(form.watch("fechaGasto"), "dd/MM/yyyy")}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-600 dark:text-slate-400">
                            Tipo:
                          </span>
                          <span className="font-medium text-slate-800 dark:text-slate-200">
                            Nómina
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
                        {showAdditionalFields && (
                          <>
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-slate-600 dark:text-slate-400">
                                Cuenta:
                              </span>
                              <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[150px]">
                                {form.watch("cuenta") || "No seleccionada"}
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-slate-600 dark:text-slate-400">
                                Responsable:
                              </span>
                              <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[150px]">
                                {form.watch("responsable") || "No seleccionado"}
                              </span>
                            </div>
                            {form.watch("vehicle_number") && (
                              <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-600 dark:text-slate-400">
                                  No. Transporte:
                                </span>
                                <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[150px]">
                                  {form.watch("vehicle_number")}
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
                                {form.watch("valor")
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
                        {/* Fecha del Gasto */}
                        <FormField
                          control={form.control}
                          name="fechaGasto"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel className="flex items-center text-xs font-medium">
                                <CalendarIcon className="w-3.5 h-3.5 mr-1.5 text-rose-500 dark:text-rose-400" />
                                Fecha del Gasto
                              </FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant={"outline"}
                                      className={cn(
                                        "w-full pl-3 text-left font-normal text-sm h-9 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60",
                                        !field.value && "text-muted-foreground"
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
                                  <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    disabled={(date) =>
                                      date < firstAllowedDate ||
                                      date > lastAllowedDate
                                    }
                                    initialFocus
                                    className="rounded-md border-slate-200 dark:border-slate-700"
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />

                        {/* Tipo */}
                        <FormField
                          control={form.control}
                          name="tipo"
                          render={() => (
                            <FormItem>
                              <FormLabel className="flex items-center text-xs font-medium">
                                <User className="w-3.5 h-3.5 mr-1.5 text-rose-500 dark:text-rose-400" />
                                Tipo
                              </FormLabel>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className="w-full justify-between text-sm h-9 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
                                  disabled
                                >
                                  Nómina
                                </Button>
                              </FormControl>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />

                        {/* Proyecto */}
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
                                        !field.value && "text-muted-foreground"
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
                                          {options.projects.find(
                                            (project) =>
                                              project.value === field.value
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
                                      placeholder="Buscar proyecto..."
                                      className="h-9"
                                    />
                                    <CommandList>
                                      <CommandEmpty>
                                        No se encontraron proyectos.
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
                                              form.trigger("proyecto");
                                            }}
                                            className="text-sm"
                                          >
                                            <div className="flex items-center">
                                              <Check
                                                className={cn(
                                                  "mr-2 h-3.5 w-3.5 text-rose-500 dark:text-rose-400",
                                                  project.value === field.value
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
                      </div>
                    </div>
                  </motion.div>

                  {/* Campos adicionales que aparecen cuando se selecciona proyecto */}
                  <AnimatePresence>
                    {showAdditionalFields && (
                      <motion.div
                        initial="hidden"
                        animate="visible"
                        exit={{ opacity: 0, y: -20 }}
                        variants={staggerVariants}
                        className="space-y-6"
                      >
                        {/* Segunda sección: Detalles del gasto */}
                        <div className="bg-slate-50/80 dark:bg-slate-900/50 rounded-lg p-4 border border-slate-100 dark:border-slate-800 shadow-xs">
                          <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-4 flex items-center">
                            <ClipboardList className="w-4 h-4 mr-2 text-rose-500 dark:text-rose-400" />
                            Detalles del Gasto
                          </h3>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Cuenta */}
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.2 }}
                              exit={{ opacity: 0, x: -20 }}
                            >
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
                                                    account.value ===
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
                                                      form.trigger("cuenta");
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
                            </motion.div>

                            {/* Responsable */}
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.2 }}
                              exit={{ opacity: 0, x: -20 }}
                            >
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
                                              contextLoading.responsibles
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
                                                  (resp) =>
                                                    resp.value === field.value
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
                                                      form.trigger(
                                                        "responsable"
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
                            </motion.div>

                            {/* Nº Transporte */}
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.2 }}
                              exit={{ opacity: 0, x: -20 }}
                            >
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
                                        {...field}
                                        className="h-9 text-sm border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
                                      />
                                    </FormControl>
                                    <FormMessage className="text-xs" />
                                  </FormItem>
                                )}
                              />
                            </motion.div>

                            {/* Factura */}
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.2 }}
                              exit={{ opacity: 0, x: -20 }}
                            >
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
                                        type="number"
                                        {...field}
                                        className="h-9 text-sm border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
                                      />
                                    </FormControl>
                                    <FormMessage className="text-xs" />
                                  </FormItem>
                                )}
                              />
                            </motion.div>

                            {/* Valor */}
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.2 }}
                              exit={{ opacity: 0, x: -20 }}
                            >
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
                            </motion.div>

                            {/* Observación */}
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.2 }}
                              exit={{ opacity: 0, x: -20 }}
                              className="col-span-full"
                            >
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
                                        {...field}
                                        className="h-9 text-sm border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
                                      />
                                    </FormControl>
                                    <FormMessage className="text-xs" />
                                  </FormItem>
                                )}
                              />
                            </motion.div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Botones de acción */}
                  <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 items-center sm:justify-end mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full sm:w-auto bg-white dark:bg-transparent text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all"
                      onClick={resetForm}
                      disabled={localLoading.submit}
                    >
                      <RefreshCw className="mr-2 h-4 w-4 text-slate-500 dark:text-slate-400" />
                      Limpiar
                    </Button>

                    <Button
                      type="submit"
                      className="w-full sm:w-auto bg-linear-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white transition-all"
                      disabled={!form.formState.isValid || localLoading.submit}
                    >
                      {localLoading.submit ? (
                        <span className="flex items-center">
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Procesando...
                        </span>
                      ) : (
                        "Registrar Gasto"
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
};

export default GastosForm;
