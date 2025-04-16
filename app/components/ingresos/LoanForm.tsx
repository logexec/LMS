/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { debounce } from "lodash";
import { cn } from "@/lib/utils";

// shadcn/ui components
import { Button } from "@/components/ui/button";
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
  LoanFormData,
  LoadingState,
  OptionsState,
  Installment,
  ResponsibleProps,
  TransportProps,
  AccountProps,
} from "@/utils/types";
import { SubmitFile } from "@/app/registros/components/table/SubmitFile";

interface LoanFormProps {
  options: OptionsState;
  loading: LoadingState;
  onProjectChange?: (project: string) => void;
}

const LoanForm: React.FC<LoanFormProps> = ({
  options,
  loading,
  onProjectChange,
}) => {
  const [formData, setFormData] = useState<LoanFormData>({
    type: "nomina",
    account_id: "",
    amount: "",
    project: "",
    invoice_number: "",
    installments: "",
    responsible_id: "",
    vehicle_id: "",
    note: "",
    installment_dates: [],
  });

  const [installments, setInstallments] = useState<Installment[]>([]);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [responsibles, setResponsibles] = useState<
    { value: string; label: string }[]
  >([]);
  const [vehicles, setVehicles] = useState<{ value: string; label: string }[]>(
    []
  );
  const [accounts, setAccounts] = useState<{ value: string; label: string }[]>(
    []
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState<boolean>(false);
  const [isLoadingResponsibles, setIsLoadingResponsibles] =
    useState<boolean>(false);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState<boolean>(false);

  // Resetear responsible_id cuando cambia project
  useEffect(() => {
    setFormData((prev) => ({ ...prev, responsible_id: "" }));
  }, [formData.project]);

  // Memoizar validateField
  const validateField = useCallback(
    (
      name: keyof Omit<LoanFormData, "installment_dates">,
      value: string
    ): boolean => {
      const errors: Record<string, string> = {};

      switch (name) {
        case "type":
          errors[name] = !value ? "El tipo es obligatorio" : "";
          break;
        case "account_id":
          errors[name] = !value ? "La cuenta es obligatoria" : "";
          break;
        case "amount":
          errors[name] =
            !value || parseFloat(value) <= 0
              ? "El monto debe ser mayor a 0"
              : "";
          break;
        case "project":
          errors[name] = !value ? "El proyecto es obligatorio" : "";
          break;
        case "invoice_number":
          errors[name] =
            !value || value.length < 3
              ? "El número de factura debe tener al menos 3 caracteres"
              : "";
          break;
        case "installments":
          const num = parseInt(value);
          errors[name] =
            !value || num <= 0 || num > 36
              ? "El número de cuotas debe estar entre 1 y 36"
              : "";
          break;
        case "note":
          errors[name] = !value ? "La observación es obligatoria" : "";
          break;
        case "responsible_id":
          errors[name] =
            formData.type === "nomina" && !value
              ? "El responsable es obligatorio para nómina"
              : "";
          break;
        case "vehicle_id":
          errors[name] =
            formData.type === "proveedor" && !value
              ? "El vehículo es obligatorio para proveedor"
              : "";
          break;
      }

      setFormErrors((prev) => ({ ...prev, [name]: errors[name] }));
      return !errors[name];
    },
    [formData.type]
  );

  // Revalidar responsible_id y vehicle_id cuando cambia type
  useEffect(() => {
    validateField("responsible_id", formData.responsible_id ?? "");
    validateField("vehicle_id", formData.vehicle_id ?? "");
  }, [
    formData.type,
    formData.responsible_id,
    formData.vehicle_id,
    validateField,
  ]);

  useEffect(() => {
    const amount = parseFloat(formData.amount);
    const numInstallments = parseInt(formData.installments);
    if (amount > 0 && numInstallments > 0) {
      const baseAmount = Math.floor((amount * 100) / numInstallments) / 100;
      const remainder =
        (amount * 100 - baseAmount * 100 * numInstallments) / 100;
      const newInstallments = Array.from(
        { length: numInstallments },
        (_, i) => {
          const extra = i < remainder * 100 ? 0.01 : 0;
          return {
            date: formData.installment_dates[i] || "",
            amount: baseAmount + extra,
          };
        }
      );
      setInstallments(newInstallments);
    } else {
      setInstallments([]);
    }
  }, [formData.amount, formData.installments, formData.installment_dates]);

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
          value: account.name,
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

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  useEffect(() => {
    if (formData.type === "proveedor") {
      fetchTransports();
    }
  }, [formData.type, fetchTransports]);

  useEffect(() => {
    if (formData.project) {
      fetchResponsibles(formData.project);
    }
  }, [formData.project, fetchResponsibles]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    validateField(name as keyof Omit<LoanFormData, "installment_dates">, value);
    if (name === "project" && onProjectChange) {
      onProjectChange(value);
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    validateField(name as keyof Omit<LoanFormData, "installment_dates">, value);
    if (name === "project" && onProjectChange) {
      onProjectChange(value);
    }
  };

  const handleInstallmentDateChange = (index: number, date: string) => {
    const today = new Date();
    const selectedDate = new Date(`${date}-01`);
    const currentYearMonth = new Date().toISOString().slice(0, 7);
    if (selectedDate < today && date < currentYearMonth) {
      toast.error("No se pueden seleccionar meses pasados");
      return;
    }

    const newInstallments = [...installments];
    newInstallments[index].date = date;
    setInstallments(newInstallments);
    setFormData((prev) => ({
      ...prev,
      installment_dates: newInstallments.map((inst) => inst.date),
    }));
  };

  const handleCreateLoan = async (
    requestIds: string[],
    file: File | null
  ): Promise<Response | null> => {
    const fieldsToValidate: (keyof Omit<LoanFormData, "installment_dates">)[] =
      [
        "type",
        "account_id",
        "amount",
        "project",
        "invoice_number",
        "installments",
        "note",
        formData.type === "nomina" ? "responsible_id" : "vehicle_id",
      ];

    const isValid = fieldsToValidate.every((field) =>
      validateField(field, formData[field] ?? "")
    );

    if (!isValid) {
      toast.error("Por favor, corrige los errores en el formulario");
      return null;
    }

    if (installments.length === 0 || installments.some((inst) => !inst.date)) {
      setFormErrors((prev) => ({
        ...prev,
        installment_dates: "Debes seleccionar una fecha para cada cuota",
      }));
      toast.error("Debes seleccionar una fecha para cada cuota");
      return null;
    }

    if (!file) {
      setFormErrors((prev) => ({
        ...prev,
        attachment: "El archivo adjunto es obligatorio",
      }));
      toast.error("El archivo adjunto es obligatorio");
      return null;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("type", formData.type);
    formDataToSend.append("account_id", formData.account_id);
    formDataToSend.append("amount", formData.amount);
    formDataToSend.append("project", formData.project);
    formDataToSend.append("invoice_number", formData.invoice_number);
    formDataToSend.append("installments", formData.installments);
    formDataToSend.append("note", formData.note);
    if (formData.type === "nomina") {
      formDataToSend.append("responsible_id", formData.responsible_id ?? "");
    } else {
      formDataToSend.append("vehicle_id", formData.vehicle_id ?? "");
    }
    formData.installment_dates.forEach((date, index) => {
      formDataToSend.append(`installment_dates[${index}]`, date);
    });
    formDataToSend.append("attachment", file);

    try {
      setIsLoading(true);
      const response = await apiService.createLoan(formDataToSend);
      const status = response.status;

      if (status === 201) {
        resetForm();
        toast.success("Préstamo creado exitosamente");
        return response;
      }

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
      } else {
        toast.error(errorData.message || "Error al procesar el préstamo");
      }

      setFormErrors((prev) => ({
        ...prev,
        ...Object.fromEntries(
          Object.entries(backendErrors).map(([field, messages]) => [
            field,
            (messages as string[]).join(", "),
          ])
        ),
      }));
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
        } else {
          toast.error(
            (error as any).message || "Error al procesar el préstamo"
          );
        }

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
          "Error de conexión al servidor. Por favor, intenta de nuevo."
        );
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setTimeout(() => {
      setFormData({
        type: "nomina",
        account_id: "",
        amount: "",
        project: "",
        invoice_number: "",
        installments: "",
        responsible_id: "",
        vehicle_id: "",
        note: "",
        installment_dates: [],
      });
      setInstallments([]);
      setFormErrors({});
    }, 100);
  };

  // Animación variantes
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

  // Calcular progreso del formulario
  const calculateProgress = () => {
    const totalFields = 7; // campos básicos requeridos
    let filledFields = 0;

    if (formData.type) filledFields++;
    if (formData.account_id) filledFields++;
    if (formData.amount) filledFields++;
    if (formData.project) filledFields++;
    if (formData.invoice_number) filledFields++;
    if (formData.installments) filledFields++;
    if (formData.note) filledFields++;
    if (formData.type === "nomina" && formData.responsible_id) filledFields++;
    if (formData.type === "proveedor" && formData.vehicle_id) filledFields++;

    // Si hay cuotas, verificar que todas tengan fecha
    if (installments.length > 0) {
      const datesFilled = installments.every((inst) => !!inst.date);
      if (datesFilled) filledFields++;
    }

    return (filledFields / (totalFields + 1)) * 100;
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={formVariants}>
      <Card className="border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-950 shadow-md hover:shadow-lg transition-all duration-300">
        <CardHeader className="bg-gradient-to-r from-rose-50 to-red-50 dark:from-rose-950/40 dark:to-red-950/40 border-b border-slate-100 dark:border-slate-800">
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
              <Alert className="border-rose-200 dark:border-rose-800 bg-rose-50/50 dark:bg-rose-950/30 shadow-sm">
                <AlertDescription className="flex flex-col space-y-4 text-slate-700 dark:text-slate-300">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
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
                        className="h-2 rounded-full bg-gradient-to-r from-rose-500 to-red-500 transition-all duration-500 ease-out"
                        style={{
                          width: `${calculateProgress()}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>

              {/* Estado del formulario */}
              <div className="mt-6 space-y-4">
                <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
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
                            {formData.type === "nomina"
                              ? "Nómina"
                              : "Proveedor"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-600 dark:text-slate-400">
                            Proyecto:
                          </span>
                          <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[150px]">
                            {formData.project || "No seleccionado"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-600 dark:text-slate-400">
                            Cuenta:
                          </span>
                          <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[150px]">
                            {accounts.find(
                              (acc) => acc.value === formData.account_id
                            )?.label || "No seleccionada"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-600 dark:text-slate-400">
                            Monto:
                          </span>
                          <span className="font-medium text-slate-800 dark:text-slate-200">
                            {formData.amount
                              ? new Intl.NumberFormat("es-ES", {
                                  style: "currency",
                                  currency: "USD",
                                }).format(Number(formData.amount))
                              : "$0.00"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-600 dark:text-slate-400">
                            Factura:
                          </span>
                          <span className="font-medium text-slate-800 dark:text-slate-200">
                            {formData.invoice_number || "No especificado"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-600 dark:text-slate-400">
                            Cuotas:
                          </span>
                          <span className="font-medium text-slate-800 dark:text-slate-200">
                            {formData.installments || "0"}
                          </span>
                        </div>
                        {formData.type === "nomina" && (
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-600 dark:text-slate-400">
                              Responsable:
                            </span>
                            <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[180px]">
                              {responsibles.find(
                                (resp) => resp.value === formData.responsible_id
                              )?.label || "No seleccionado"}
                            </span>
                          </div>
                        )}
                        {formData.type === "proveedor" && (
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-600 dark:text-slate-400">
                              Vehículo:
                            </span>
                            <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[180px]">
                              {vehicles.find(
                                (veh) => veh.value === formData.vehicle_id
                              )?.label || "No seleccionado"}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-600 dark:text-slate-400">
                            Observación:
                          </span>
                          <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[150px]">
                            {formData.note || "Sin observación"}
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
              <motion.div
                variants={staggerVariants}
                initial="hidden"
                animate="visible"
              >
                {/* Primera sección: Información Básica */}
                <div className="bg-slate-50/80 dark:bg-slate-900/50 rounded-lg p-4 border border-slate-100 dark:border-slate-800 shadow-sm mb-6">
                  <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-4 flex items-center">
                    <FileText className="w-4 h-4 mr-2 text-rose-500 dark:text-rose-400" />
                    Información Básica
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <motion.div variants={fadeInVariants}>
                      <div className="flex flex-col space-y-1.5">
                        <label className="flex items-center text-xs font-medium">
                          <User className="w-3.5 h-3.5 mr-1.5 text-rose-500 dark:text-rose-400" />
                          Tipo
                        </label>
                        <Select
                          value={formData.type}
                          onValueChange={(value) =>
                            handleSelectChange("type", value)
                          }
                        >
                          <SelectTrigger className="h-9 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm">
                            <SelectValue placeholder="-- Selecciona --" />
                          </SelectTrigger>
                          <SelectContent className="border-slate-200 dark:border-slate-700">
                            <SelectItem value="nomina" className="text-sm">
                              Nómina
                            </SelectItem>
                            <SelectItem value="proveedor" className="text-sm">
                              Proveedor
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        {formErrors.type && (
                          <p className="text-xs text-red-500">
                            {formErrors.type}
                          </p>
                        )}
                      </div>
                    </motion.div>

                    <motion.div variants={fadeInVariants}>
                      <div className="flex flex-col space-y-1.5">
                        <label className="flex items-center text-xs font-medium">
                          <Building2 className="w-3.5 h-3.5 mr-1.5 text-rose-500 dark:text-rose-400" />
                          Proyecto
                        </label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                "w-full justify-between border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm h-9",
                                !formData.project && "text-muted-foreground"
                              )}
                              disabled={loading.projects}
                            >
                              {loading.projects ? (
                                <span className="flex items-center">
                                  <Loader2 className="w-3 h-3 rounded-full text-rose-500 dark:text-rose-400 animate-spin mr-2" />
                                  Cargando...
                                </span>
                              ) : formData.project ? (
                                <span className="truncate">
                                  {
                                    options.projects.find(
                                      (project) =>
                                        project.value === formData.project
                                    )?.label
                                  }
                                </span>
                              ) : (
                                "-- Selecciona --"
                              )}
                              <ChevronsUpDown className="ml-1 h-3.5 w-3.5 shrink-0 opacity-50" />
                            </Button>
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
                                        handleSelectChange(
                                          "project",
                                          project.value
                                        );
                                      }}
                                      className="text-sm"
                                    >
                                      <div className="flex items-center">
                                        <Check
                                          className={cn(
                                            "mr-2 h-3.5 w-3.5 text-rose-500 dark:text-rose-400",
                                            project.value === formData.project
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
                        {formErrors.project && (
                          <p className="text-xs text-red-500">
                            {formErrors.project}
                          </p>
                        )}
                      </div>
                    </motion.div>

                    <motion.div variants={fadeInVariants}>
                      <div className="flex flex-col space-y-1.5">
                        <label className="flex items-center text-xs font-medium">
                          <FileText className="w-3.5 h-3.5 mr-1.5 text-rose-500 dark:text-rose-400" />
                          Cuenta
                        </label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                "w-full justify-between border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm h-9",
                                !formData.account_id && "text-muted-foreground"
                              )}
                              disabled={isLoadingAccounts}
                            >
                              {isLoadingAccounts ? (
                                <span className="flex items-center">
                                  <Loader2 className="w-3 h-3 rounded-full text-rose-500 dark:text-rose-400 animate-spin mr-2" />
                                  Cargando...
                                </span>
                              ) : formData.account_id ? (
                                <span className="truncate max-w-[180px]">
                                  {accounts.find(
                                    (account) =>
                                      account.value === formData.account_id
                                  )?.label || formData.account_id}
                                </span>
                              ) : (
                                "-- Selecciona --"
                              )}
                              <ChevronsUpDown className="ml-1 h-3.5 w-3.5 shrink-0 opacity-50" />
                            </Button>
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
                                        handleSelectChange(
                                          "account_id",
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
                                              formData.account_id
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
                        {formErrors.account_id && (
                          <p className="text-xs text-red-500">
                            {formErrors.account_id}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  </div>
                </div>

                {/* Segunda sección: Detalles del préstamo */}
                <div className="bg-slate-50/80 dark:bg-slate-900/50 rounded-lg p-4 border border-slate-100 dark:border-slate-800 shadow-sm mb-6">
                  <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-4 flex items-center">
                    <ClipboardList className="w-4 h-4 mr-2 text-rose-500 dark:text-rose-400" />
                    Detalles del Préstamo
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <motion.div variants={fadeInVariants}>
                      <div className="flex flex-col space-y-1.5">
                        <label className="flex items-center text-xs font-medium">
                          <DollarSign className="w-3.5 h-3.5 mr-1.5 text-rose-500 dark:text-rose-400" />
                          Monto Total
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">
                            $
                          </span>
                          <Input
                            type="number"
                            step="0.01"
                            id="amount"
                            name="amount"
                            value={formData.amount}
                            onChange={handleInputChange}
                            className="pl-7 h-9 text-sm border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
                          />
                        </div>
                        {formErrors.amount && (
                          <p className="text-xs text-red-500">
                            {formErrors.amount}
                          </p>
                        )}
                      </div>
                    </motion.div>

                    <motion.div variants={fadeInVariants}>
                      <div className="flex flex-col space-y-1.5">
                        <label className="flex items-center text-xs font-medium">
                          <HashIcon className="w-3.5 h-3.5 mr-1.5 text-rose-500 dark:text-rose-400" />
                          Número de Factura
                        </label>
                        <Input
                          type="text"
                          id="invoice_number"
                          name="invoice_number"
                          value={formData.invoice_number}
                          onChange={handleInputChange}
                          className="h-9 text-sm border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
                        />
                        {formErrors.invoice_number && (
                          <p className="text-xs text-red-500">
                            {formErrors.invoice_number}
                          </p>
                        )}
                      </div>
                    </motion.div>

                    <motion.div variants={fadeInVariants}>
                      <div className="flex flex-col space-y-1.5">
                        <label className="flex items-center text-xs font-medium">
                          <CalendarIcon className="w-3.5 h-3.5 mr-1.5 text-rose-500 dark:text-rose-400" />
                          Número de Cuotas
                        </label>
                        <Input
                          type="number"
                          id="installments"
                          name="installments"
                          value={formData.installments}
                          onChange={handleInputChange}
                          className="h-9 text-sm border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
                        />
                        {formErrors.installments && (
                          <p className="text-xs text-red-500">
                            {formErrors.installments}
                          </p>
                        )}
                      </div>
                    </motion.div>

                    {formData.type === "nomina" && (
                      <motion.div variants={fadeInVariants}>
                        <div className="flex flex-col space-y-1.5">
                          <label className="flex items-center text-xs font-medium">
                            <User className="w-3.5 h-3.5 mr-1.5 text-rose-500 dark:text-rose-400" />
                            Responsable
                          </label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                className={cn(
                                  "w-full justify-between border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm h-9",
                                  !formData.responsible_id &&
                                    "text-muted-foreground"
                                )}
                                disabled={
                                  isLoadingResponsibles || !formData.project
                                }
                              >
                                {isLoadingResponsibles ? (
                                  <span className="flex items-center">
                                    <Loader2 className="w-3 h-3 rounded-full text-rose-500 dark:text-rose-400 animate-spin mr-2" />
                                    Cargando...
                                  </span>
                                ) : formData.responsible_id ? (
                                  <span className="truncate max-w-[180px]">
                                    {responsibles.find(
                                      (responsible) =>
                                        responsible.value ===
                                        formData.responsible_id
                                    )?.label || formData.responsible_id}
                                  </span>
                                ) : (
                                  "-- Selecciona --"
                                )}
                                <ChevronsUpDown className="ml-1 h-3.5 w-3.5 shrink-0 opacity-50" />
                              </Button>
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
                                          handleSelectChange(
                                            "responsible_id",
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
                                                formData.responsible_id
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
                            <p className="text-xs text-red-500">
                              {formErrors.responsible_id}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    )}

                    {formData.type === "proveedor" && (
                      <motion.div variants={fadeInVariants}>
                        <div className="flex flex-col space-y-1.5">
                          <label className="flex items-center text-xs font-medium">
                            <Truck className="w-3.5 h-3.5 mr-1.5 text-rose-500 dark:text-rose-400" />
                            Vehículo
                          </label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                className={cn(
                                  "w-full justify-between border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm h-9",
                                  !formData.vehicle_id &&
                                    "text-muted-foreground"
                                )}
                                disabled={isLoadingVehicles}
                              >
                                {isLoadingVehicles ? (
                                  <span className="flex items-center">
                                    <Loader2 className="w-3 h-3 rounded-full text-rose-500 dark:text-rose-400 animate-spin mr-2" />
                                    Cargando...
                                  </span>
                                ) : formData.vehicle_id ? (
                                  <span className="truncate max-w-[180px]">
                                    {vehicles.find(
                                      (vehicle) =>
                                        vehicle.value === formData.vehicle_id
                                    )?.label || formData.vehicle_id}
                                  </span>
                                ) : (
                                  "-- Selecciona --"
                                )}
                                <ChevronsUpDown className="ml-1 h-3.5 w-3.5 shrink-0 opacity-50" />
                              </Button>
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
                                          handleSelectChange(
                                            "vehicle_id",
                                            vehicle.value
                                          );
                                        }}
                                        className="text-sm"
                                      >
                                        <div className="flex items-center">
                                          <Check
                                            className={cn(
                                              "mr-2 h-3.5 w-3.5 text-rose-500 dark:text-rose-400",
                                              vehicle.value ===
                                                formData.vehicle_id
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
                            <p className="text-xs text-red-500">
                              {formErrors.vehicle_id}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    )}

                    <motion.div
                      variants={fadeInVariants}
                      className="col-span-full"
                    >
                      <div className="flex flex-col space-y-1.5">
                        <label className="flex items-center text-xs font-medium">
                          <ClipboardList className="w-3.5 h-3.5 mr-1.5 text-rose-500 dark:text-rose-400" />
                          Observación
                        </label>
                        <Input
                          type="text"
                          id="note"
                          name="note"
                          value={formData.note}
                          onChange={handleInputChange}
                          className="h-9 text-sm border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
                        />
                        {formErrors.note && (
                          <p className="text-xs text-red-500">
                            {formErrors.note}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  </div>
                </div>

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
                    className="bg-slate-50/80 dark:bg-slate-900/50 rounded-lg p-4 border border-slate-100 dark:border-slate-800 shadow-sm mb-6"
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
              </motion.div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default LoanForm;
