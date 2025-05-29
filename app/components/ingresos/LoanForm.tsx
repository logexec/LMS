/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { debounce } from "lodash";
import { cn } from "@/lib/utils";

// UI Components
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

// Icons
import {
  AlertCircle,
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
  Calendar as CalendarIcon,
} from "lucide-react";

// Services and types
import { apiService } from "@/services/api.service";
import { getAuthToken } from "@/services/auth.service";
import {
  LoadingState,
  OptionsState,
  Installment,
  ResponsibleProps,
  TransportProps,
  AccountProps,
} from "@/utils/types";
import { SubmitFile } from "@/app/registros/components/table/SubmitFile";

// Animation variants
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

// Form validation schema
const formSchema = z.object({
  type: z.string().min(1, "El tipo es obligatorio"),
  account_id: z.string().min(1, "La cuenta es obligatoria"),
  amount: z.string().refine(
    (val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num > 0;
    },
    { message: "El monto debe ser mayor a 0" }
  ),
  project: z.string().min(1, "El proyecto es obligatorio"),
  invoice_number: z
    .string()
    .min(3, "El número de factura debe tener al menos 3 caracteres"),
  installments: z.string().refine(
    (val) => {
      const num = parseInt(val);
      return !isNaN(num) && num > 0 && num <= 36;
    },
    { message: "El número de cuotas debe estar entre 1 y 36" }
  ),
  responsible_id: z.string().optional(),
  vehicle_id: z.string().optional(),
  note: z.string().min(1, "La observación es obligatoria"),
});

// Dynamic validation function for type-dependent fields
const validateTypeSpecificFields = (
  data: any,
  type: any
): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (type === "nomina" && !data.responsible_id) {
    errors.responsible_id = "El responsable es obligatorio para nómina";
  }

  if (type === "proveedor" && !data.vehicle_id) {
    errors.vehicle_id = "El vehículo es obligatorio para proveedor";
  }

  return errors;
};

interface LoanFormProps {
  options: OptionsState;
  loading: LoadingState;
  onProjectChange?: (project: string) => void;
}

export default function LoanForm({
  options,
  loading,
  onProjectChange,
}: LoanFormProps) {
  // Form state
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [installmentDates, setInstallmentDates] = useState<string[]>([]);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Data fetching state
  const [responsibles, setResponsibles] = useState<
    Array<{ value: string; label: string }>
  >([]);
  const [vehicles, setVehicles] = useState<
    Array<{ value: string; label: string }>
  >([]);
  const [accounts, setAccounts] = useState<
    Array<{ value: string; label: string }>
  >([]);

  // Loading states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState<boolean>(false);
  const [isLoadingResponsibles, setIsLoadingResponsibles] =
    useState<boolean>(false);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState<boolean>(false);

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "nomina",
      account_id: "",
      amount: "",
      project: "",
      invoice_number: "",
      installments: "",
      responsible_id: "",
      vehicle_id: "",
      note: "",
    },
  });

  const currentType = form.watch("type");
  const currentProject = form.watch("project");
  const currentAmount = form.watch("amount");
  const currentInstallments = form.watch("installments");

  // Fetch accounts data
  const fetchAccounts = useCallback(async () => {
    try {
      setIsLoadingAccounts(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/accounts?account_affects=discount`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getAuthToken()}`,
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        toast.error("Error al cargar las cuentas");
        return;
      }

      const data = await response.json();
      setAccounts(
        data.data.map((account: AccountProps) => ({
          label: account.name,
          value: account.id,
        }))
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al cargar las cuentas"
      );
    } finally {
      setIsLoadingAccounts(false);
    }
  }, []);

  // Fetch responsible data based on project
  const fetchResponsibles = useMemo(
    () =>
      debounce(async (proyecto: string) => {
        if (!proyecto) return;

        try {
          setIsLoadingResponsibles(true);
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/responsibles?proyecto=${proyecto}&fields=id,nombre_completo`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${getAuthToken()}`,
              },
              credentials: "include",
            }
          );

          if (!response.ok) throw new Error("Error al cargar responsables");

          const data = await response.json();
          setResponsibles(
            data.map((responsible: ResponsibleProps) => ({
              value: responsible.id,
              label: responsible.nombre_completo,
            }))
          );
        } catch (error) {
          toast.error(
            error instanceof Error
              ? error.message
              : "Error al cargar responsables"
          );
        } finally {
          setIsLoadingResponsibles(false);
        }
      }, 300),
    []
  );

  // Fetch vehicles data
  const fetchTransports = useCallback(async () => {
    try {
      setIsLoadingVehicles(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/transports`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getAuthToken()}`,
          },
          credentials: "include",
        }
      );

      if (!response.ok) throw new Error("Error al cargar transportes");

      const data = await response.json();
      setVehicles(
        data.map((vehicle: TransportProps) => ({
          label: vehicle.vehicle_plate,
          value: vehicle.vehicle_plate,
        }))
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Error al cargar los transportes"
      );
    } finally {
      setIsLoadingVehicles(false);
    }
  }, []);

  // Effect: Reset responsible when project changes
  useEffect(() => {
    if (currentProject) {
      form.setValue("responsible_id", "");
      fetchResponsibles(currentProject);
    }
  }, [currentProject, fetchResponsibles]);

  // Effect: Initial data fetching
  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  // Effect: Fetch transports when type is "proveedor"
  useEffect(() => {
    if (currentType === "proveedor") {
      fetchTransports();
    }
  }, [currentType, fetchTransports]);

  // Effect: Calculate installments when amount or installments change
  useEffect(() => {
  const amount = parseFloat(currentAmount);
  const numInstallments = parseInt(currentInstallments);

  if (amount > 0 && numInstallments > 0) {
    const rawBase = amount / numInstallments;
    const baseAmount = Math.floor(rawBase * 100) / 100;

    const total = baseAmount * numInstallments;
    let difference = Math.round((amount - total) * 100); // en centavos

    const newInstallments = Array.from({ length: numInstallments }, (_, i) => {
      let extra = 0;
      if (difference > 0) {
        extra = 0.01;
        difference -= 1;
      }

      return {
        date: installmentDates[i] || "",
        amount: parseFloat((baseAmount + extra).toFixed(2)),
      };
    });

    setInstallments(newInstallments);
  } else {
    setInstallments([]);
  }
}, [currentAmount, currentInstallments, installmentDates]);

  // Handle project change (for parent component)
  const handleProjectChange = (value: string) => {
    if (onProjectChange) {
      onProjectChange(value);
    }
  };

  // Handle installment date changes
  const handleInstallmentDateChange = (index: number, date: string) => {
    const today = new Date();
    const selectedDate = new Date(`${date}-01`);
    const currentYearMonth = new Date().toISOString().slice(0, 7);

    if (selectedDate < today && date < currentYearMonth) {
      toast.error("No se pueden seleccionar meses pasados");
      return;
    }

    const newDates = [...installmentDates];
    newDates[index] = date;
    setInstallmentDates(newDates);

    const newInstallments = [...installments];
    newInstallments[index].date = date;
    setInstallments(newInstallments);
  };

  // Form submission handler
  const handleCreateLoan = async (
    requestIds: string[],
    file: File | null
  ): Promise<Response | null> => {
    // Get form values
    const values = form.getValues();

    // Additional validation for type-specific fields
    const typeErrors = validateTypeSpecificFields(values, values.type);
    if (Object.keys(typeErrors).length > 0) {
      setFormErrors((prev) => ({ ...prev, ...typeErrors }));
      toast.error("Por favor, corrige los errores en el formulario");
      return null;
    }

    // Check if all installment dates are set
    if (installments.length > 0 && installments.some((inst) => !inst.date)) {
      setFormErrors((prev) => ({
        ...prev,
        installment_dates: "Debes seleccionar una fecha para cada cuota",
      }));
      toast.error("Debes seleccionar una fecha para cada cuota");
      return null;
    }

    // Check if file is attached
    if (!file) {
      setFormErrors((prev) => ({
        ...prev,
        attachment: "El archivo adjunto es obligatorio",
      }));
      toast.error("El archivo adjunto es obligatorio");
      return null;
    }

    // Create FormData for submission
    const formData = new FormData();
    formData.append("type", values.type);
    formData.append("account_id", values.account_id);
    formData.append("amount", values.amount);
    formData.append("project", values.project);
    formData.append("invoice_number", values.invoice_number);
    formData.append("installments", values.installments);
    formData.append("note", values.note);

    if (values.type === "nomina") {
      formData.append("responsible_id", values.responsible_id || "");
    } else {
      formData.append("vehicle_id", values.vehicle_id || "");
    }

    installmentDates.forEach((date, index) => {
      formData.append(`installment_dates[${index}]`, date);
    });

    formData.append("attachment", file);

    try {
      setIsLoading(true);
      const response = await apiService.createLoan(formData);

      if (response.status === 201) {
        resetForm();
        toast.success("Préstamo creado exitosamente");
        return response;
      }

      // Handle errors from backend
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText || "Error desconocido" };
      }

      const backendErrors = errorData.errors || {};
      if (Object.keys(backendErrors).length > 0) {
        Object.entries(backendErrors).forEach(([field, messages]) => {
          (messages as string[]).forEach((message) => {
            toast.error(`${field}: ${message}`);
          });
        });

        setFormErrors((prev) => ({
          ...prev,
          ...Object.fromEntries(
            Object.entries(backendErrors).map(([field, messages]) => [
              field,
              (messages as string[]).join(", "),
            ])
          ),
        }));
      } else {
        toast.error(errorData.message || "Error al procesar el préstamo");
      }

      return null;
    } catch (error) {
      if (typeof error === "object" && error !== null && "errors" in error) {
        const backendErrors = (error as any).errors || {};
        if (Object.keys(backendErrors).length > 0) {
          Object.entries(backendErrors).forEach(([field, messages]) => {
            (messages as string[]).forEach((message) => {
              toast.error(`${field}: ${message}`);
            });
          });

          setFormErrors((prev) => ({
            ...prev,
            ...Object.fromEntries(
              Object.entries(backendErrors).map(([field, messages]) => [
                field,
                (messages as string[]).join(", "),
              ])
            ),
          }));
        } else {
          toast.error(
            (error as any).message || "Error al procesar el préstamo"
          );
        }
      } else {
        toast.error(
          "Error de conexión al servidor. Por favor, intenta de nuevo."
        );
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form state
  const resetForm = () => {
    setTimeout(() => {
      form.reset({
        type: "nomina",
        account_id: "",
        amount: "",
        project: "",
        invoice_number: "",
        installments: "",
        responsible_id: "",
        vehicle_id: "",
        note: "",
      });
      setInstallments([]);
      setInstallmentDates([]);
      setFormErrors({});
    }, 100);
  };

  // Calculate progress for progress bar
  const calculateProgress = () => {
    const totalFields = 7; // Basic required fields
    let filledFields = 0;

    const values = form.getValues();
    if (values.type) filledFields++;
    if (values.account_id) filledFields++;
    if (values.amount) filledFields++;
    if (values.project) filledFields++;
    if (values.invoice_number) filledFields++;
    if (values.installments) filledFields++;
    if (values.note) filledFields++;
    if (values.type === "nomina" && values.responsible_id) filledFields++;
    if (values.type === "proveedor" && values.vehicle_id) filledFields++;

    // Check if all installment dates are set
    if (installments.length > 0) {
      const datesFilled = installments.every((inst) => !!inst.date);
      if (datesFilled) filledFields++;
    }

    return (filledFields / (totalFields + 1)) * 100;
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={formVariants}>
      <Card className="border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-950 shadow-md hover:shadow-lg transition-all duration-300">
        <CardHeader className="bg-linear-to-r from-rose-50 to-red-50 dark:from-rose-950/40 dark:to-red-950/40 border-b border-slate-100 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-xl text-slate-800 dark:text-slate-200">
                Formulario de Préstamo
              </CardTitle>
              <CardDescription className="mt-1">
                Completa todos los datos requeridos para registrar un nuevo
                préstamo.
              </CardDescription>
            </div>
            <Badge
              variant="outline"
              className="bg-white/80 dark:bg-slate-900/80 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800 px-3 py-1 rounded-full"
            >
              Préstamo
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
                      Completa la información del préstamo y define las fechas
                      de las cuotas. Selecciona fechas a partir del mes actual.
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
                          width: `${calculateProgress()}%`,
                          maxWidth: "100%",
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
                    Resumen del Préstamo
                  </h3>
                  <div className="space-y-2">
                    {isLoading ? (
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-600 dark:text-slate-400">
                            Tipo:
                          </span>
                          <span className="font-medium text-slate-800 dark:text-slate-200">
                            {currentType === "nomina" ? "Nómina" : "Proveedor"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-600 dark:text-slate-400">
                            Proyecto:
                          </span>
                          <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[150px]">
                            {currentProject || "No seleccionado"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-600 dark:text-slate-400">
                            Cuenta:
                          </span>
                          <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[150px]">
                            {accounts.find(
                              (acc) => acc.value === form.watch("account_id")
                            )?.label || "No seleccionada"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-600 dark:text-slate-400">
                            Monto:
                          </span>
                          <span className="font-medium text-slate-800 dark:text-slate-200">
                            {currentAmount
                              ? new Intl.NumberFormat("es-ES", {
                                  style: "currency",
                                  currency: "USD",
                                }).format(Number(currentAmount))
                              : "$0.00"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-600 dark:text-slate-400">
                            Factura:
                          </span>
                          <span className="font-medium text-slate-800 dark:text-slate-200">
                            {form.watch("invoice_number") || "No especificado"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-600 dark:text-slate-400">
                            Cuotas:
                          </span>
                          <span className="font-medium text-slate-800 dark:text-slate-200">
                            {currentInstallments || "0"}
                          </span>
                        </div>
                        {currentType === "nomina" && (
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-600 dark:text-slate-400">
                              Responsable:
                            </span>
                            <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[180px]">
                              {responsibles.find(
                                (resp) =>
                                  resp.value === form.watch("responsible_id")
                              )?.label || "No seleccionado"}
                            </span>
                          </div>
                        )}
                        {currentType === "proveedor" && (
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-600 dark:text-slate-400">
                              Vehículo:
                            </span>
                            <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[180px]">
                              {vehicles.find(
                                (veh) => veh.value === form.watch("vehicle_id")
                              )?.label || "No seleccionado"}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-600 dark:text-slate-400">
                            Observación:
                          </span>
                          <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[150px]">
                            {form.watch("note") || "Sin observación"}
                          </span>
                        </div>

                        {installments.length > 0 && (
                          <div className="flex justify-between items-center text-xs mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                            <span className="text-slate-600 dark:text-slate-400">
                              Estado de cuotas:
                            </span>
                            <span className="font-medium text-slate-800 dark:text-slate-200">
                              {installments.filter((i) => i.date).length}/
                              {installments.length} definidas
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              <Form {...form}>
                <form className="space-y-6">
                  <motion.div
                    variants={staggerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {/* Primera sección: Información Básica */}
                    <div className="bg-slate-50/80 dark:bg-slate-900/50 rounded-lg p-4 border border-slate-100 dark:border-slate-800 shadow-xs">
                      <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-4 flex items-center">
                        <FileText className="w-4 h-4 mr-2 text-rose-500 dark:text-rose-400" />
                        Información Básica
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <motion.div variants={fadeInVariants}>
                          <FormField
                            control={form.control}
                            name="type"
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
                                      value="proveedor"
                                      className="text-sm"
                                    >
                                      Proveedor
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
                            name="project"
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
                                        disabled={loading.projects}
                                      >
                                        {loading.projects ? (
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
                                          No se encontraron proyectos.
                                        </CommandEmpty>
                                        <CommandGroup>
                                          {options.projects.map((project) => (
                                            <CommandItem
                                              value={project.label}
                                              key={project.value}
                                              onSelect={() => {
                                                field.onChange(project.value);
                                                handleProjectChange(
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

                        <motion.div variants={fadeInVariants}>
                          <FormField
                            control={form.control}
                            name="account_id"
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
                                          "w-full justify-between border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm h-9",
                                          !field.value &&
                                            "text-muted-foreground"
                                        )}
                                        disabled={isLoadingAccounts}
                                      >
                                        {isLoadingAccounts ? (
                                          <span className="flex items-center">
                                            <Loader2 className="w-3 h-3 rounded-full text-rose-500 dark:text-rose-400 animate-spin mr-2" />
                                            Cargando...
                                          </span>
                                        ) : field.value ? (
                                          <span className="truncate max-w-[180px]">
                                            {accounts.find(
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
                                          {accounts.map((account, idx) => (
                                            <CommandItem
                                              value={account.label}
                                              key={idx}
                                              onSelect={() => {
                                                field.onChange(account.value);
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

                    {/* Segunda sección: Detalles del préstamo */}
                    <div className="bg-slate-50/80 dark:bg-slate-900/50 rounded-lg p-4 border border-slate-100 dark:border-slate-800 shadow-xs">
                      <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-4 flex items-center">
                        <ClipboardList className="w-4 h-4 mr-2 text-rose-500 dark:text-rose-400" />
                        Detalles del Préstamo
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <motion.div variants={fadeInVariants}>
                          <FormField
                            control={form.control}
                            name="amount"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center text-xs font-medium">
                                  <DollarSign className="w-3.5 h-3.5 mr-1.5 text-rose-500 dark:text-rose-400" />
                                  Monto Total
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

                        <motion.div variants={fadeInVariants}>
                          <FormField
                            control={form.control}
                            name="invoice_number"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center text-xs font-medium">
                                  <HashIcon className="w-3.5 h-3.5 mr-1.5 text-rose-500 dark:text-rose-400" />
                                  Número de Factura
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
                        </motion.div>

                        <motion.div variants={fadeInVariants}>
                          <FormField
                            control={form.control}
                            name="installments"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center text-xs font-medium">
                                  <CalendarIcon className="w-3.5 h-3.5 mr-1.5 text-rose-500 dark:text-rose-400" />
                                  Número de Cuotas
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

                        {currentType === "nomina" && (
                          <motion.div variants={fadeInVariants}>
                            <FormField
                              control={form.control}
                              name="responsible_id"
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
                                            "w-full justify-between border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm h-9",
                                            !field.value &&
                                              "text-muted-foreground"
                                          )}
                                          disabled={
                                            isLoadingResponsibles ||
                                            !currentProject
                                          }
                                        >
                                          {isLoadingResponsibles ? (
                                            <span className="flex items-center">
                                              <Loader2 className="w-3 h-3 rounded-full text-rose-500 dark:text-rose-400 animate-spin mr-2" />
                                              Cargando...
                                            </span>
                                          ) : field.value ? (
                                            <span className="truncate max-w-[180px]">
                                              {responsibles.find(
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
                                            {responsibles.map((responsible) => (
                                              <CommandItem
                                                value={responsible.label}
                                                key={responsible.value}
                                                onSelect={() => {
                                                  field.onChange(
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
                                            ))}
                                          </CommandGroup>
                                        </CommandList>
                                      </Command>
                                    </PopoverContent>
                                  </Popover>
                                  {formErrors.responsible_id && (
                                    <p className="text-xs text-red-500 mt-1">
                                      {formErrors.responsible_id}
                                    </p>
                                  )}
                                </FormItem>
                              )}
                            />
                          </motion.div>
                        )}

                        {currentType === "proveedor" && (
                          <motion.div variants={fadeInVariants}>
                            <FormField
                              control={form.control}
                              name="vehicle_id"
                              render={({ field }) => (
                                <FormItem className="flex flex-col">
                                  <FormLabel className="flex items-center text-xs font-medium">
                                    <Truck className="w-3.5 h-3.5 mr-1.5 text-rose-500 dark:text-rose-400" />
                                    Vehículo
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
                                          disabled={isLoadingVehicles}
                                        >
                                          {isLoadingVehicles ? (
                                            <span className="flex items-center">
                                              <Loader2 className="w-3 h-3 rounded-full text-rose-500 dark:text-rose-400 animate-spin mr-2" />
                                              Cargando...
                                            </span>
                                          ) : field.value ? (
                                            <span className="truncate max-w-[180px]">
                                              {vehicles.find(
                                                (vehicle) =>
                                                  vehicle.value === field.value
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
                                          placeholder="Buscar vehículo..."
                                          className="h-9"
                                        />
                                        <CommandList>
                                          <CommandEmpty>
                                            No se encontraron vehículos.
                                          </CommandEmpty>
                                          <CommandGroup>
                                            {vehicles.map((vehicle) => (
                                              <CommandItem
                                                value={vehicle.label}
                                                key={vehicle.value}
                                                onSelect={() => {
                                                  field.onChange(vehicle.value);
                                                }}
                                                className="text-sm"
                                              >
                                                <div className="flex items-center">
                                                  <Check
                                                    className={cn(
                                                      "mr-2 h-3.5 w-3.5 text-rose-500 dark:text-rose-400",
                                                      vehicle.value ===
                                                        field.value
                                                        ? "opacity-100"
                                                        : "opacity-0"
                                                    )}
                                                  />
                                                  <span className="truncate">
                                                    {vehicle.label}
                                                  </span>
                                                </div>
                                              </CommandItem>
                                            ))}
                                          </CommandGroup>
                                        </CommandList>
                                      </Command>
                                    </PopoverContent>
                                  </Popover>
                                  {formErrors.vehicle_id && (
                                    <p className="text-xs text-red-500 mt-1">
                                      {formErrors.vehicle_id}
                                    </p>
                                  )}
                                </FormItem>
                              )}
                            />
                          </motion.div>
                        )}

                        <motion.div
                          variants={fadeInVariants}
                          className="col-span-full"
                        >
                          <FormField
                            control={form.control}
                            name="note"
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
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Tercera sección: Fechas de cuotas */}
                  {installments.length > 0 && (
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
                      className="bg-slate-50/80 dark:bg-slate-900/50 rounded-lg p-4 border border-slate-100 dark:border-slate-800 shadow-xs mb-6"
                    >
                      <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-4 flex items-center">
                        <CalendarIcon className="w-4 h-4 mr-2 text-rose-500 dark:text-rose-400" />
                        Fechas de Cuotas
                      </h3>

                      {formErrors.installment_dates && (
                        <div className="mb-4 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-600 dark:text-red-400 text-xs">
                          {formErrors.installment_dates}
                        </div>
                      )}

                      <div className="overflow-hidden rounded-md border border-slate-200 dark:border-slate-700">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-slate-100 dark:bg-slate-800">
                              <th className="border-b border-slate-200 dark:border-slate-700 p-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400">
                                Cuota
                              </th>
                              <th className="border-b border-slate-200 dark:border-slate-700 p-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400">
                                Monto
                              </th>
                              <th className="border-b border-slate-200 dark:border-slate-700 p-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400">
                                Fecha
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {installments.map((inst, index) => (
                              <tr
                                key={index}
                                className={cn(
                                  "border-b border-slate-100 dark:border-slate-800 last:border-0",
                                  index % 2 === 0
                                    ? "bg-white dark:bg-slate-950"
                                    : "bg-slate-50 dark:bg-slate-900/50"
                                )}
                              >
                                <td className="p-2 text-sm text-slate-700 dark:text-slate-300">
                                  Cuota {index + 1}
                                </td>
                                <td className="p-2 text-sm text-slate-700 dark:text-slate-300">
                                  ${inst.amount.toFixed(2)}
                                </td>
                                <td className="p-2">
                                  <input
                                    type="month"
                                    value={inst.date}
                                    onChange={(e) =>
                                      handleInstallmentDateChange(
                                        index,
                                        e.target.value
                                      )
                                    }
                                    min={new Date().toISOString().slice(0, 7)}
                                    className="w-full p-1 border rounded text-sm border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </motion.div>
                  )}

                  {/* Botones de acción */}
                  <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 items-center sm:justify-end mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full sm:w-auto bg-white dark:bg-transparent text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all"
                      onClick={resetForm}
                      disabled={isLoading}
                    >
                      <RefreshCw className="mr-2 h-4 w-4 text-slate-500 dark:text-slate-400" />
                      Limpiar
                    </Button>

                    <SubmitFile
                      customText="Generar préstamo"
                      showBadge={false}
                      onCreateReposicion={handleCreateLoan}
                      isLoading={isLoading}
                      selectedRequests={[]}
                    />
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
