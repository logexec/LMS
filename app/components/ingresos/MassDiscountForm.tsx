"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { MassDiscountTable } from "./MassDiscountTable";
import {
  MassiveFormData,
  LoadingState,
  OptionsState,
  Employee,
  RequestData,
} from "@/utils/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  AlertCircle,
  RefreshCw,
  Users,
  Building2,
  CalendarDays,
  ListFilter,
  FileText,
  DollarSign,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import debounce from "lodash/debounce";
import { fetchWithAuth } from "@/services/auth.service";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

export interface MassDiscountFormProps {
  options: OptionsState;
  loading: LoadingState;
  onSubmit: (data: RequestData | FormData) => Promise<void>;
}

interface EmployeeResponse {
  id: string;
  nombre_completo: string;
  area: string;
  proyecto: string;
}

// Schema para validación
const massDiscountSchema = z.object({
  fechaGasto: z.string().min(1, "La fecha de gasto es obligatoria"),
  tipo: z.string().min(1, "El tipo es obligatorio"),
  factura: z
    .string()
    .min(3, "El número de factura debe tener al menos 3 caracteres"),
  cuenta: z.string().min(1, "La cuenta es obligatoria"),
  valor: z
    .string()
    .min(1, "El valor es obligatorio")
    .refine((val) => parseFloat(val) > 0, {
      message: "El valor debe ser mayor a 0",
    }),
  proyecto: z.string().min(1, "El proyecto es obligatorio"),
  area: z.string().min(1, "El área es obligatoria"),
  observacion: z.string().min(1, "La observación es obligatoria"),
  responsable: z.string().optional(),
});

const MassDiscountForm: React.FC<MassDiscountFormProps> = ({
  options,
  loading,
  onSubmit,
}) => {
  // Estado para manejar los empleados y su selección
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState(0);
  const [formStep, setFormStep] = useState<"basic" | "employees">("basic");
  const [massiveFormData, setMassiveFormData] = useState<MassiveFormData>({
    fechaGasto: new Date().toISOString().split("T")[0],
    tipo: "nomina",
    factura: "",
    cuenta: "",
    valor: "",
    proyecto: "",
    area: "",
    responsable: "",
    observacion: "",
  });

  // Configurar form con react-hook-form y zod
  const form = useForm<z.infer<typeof massDiscountSchema>>({
    resolver: zodResolver(massDiscountSchema),
    defaultValues: {
      fechaGasto: new Date().toISOString().split("T")[0],
      tipo: "nomina",
      factura: "",
      cuenta: "",
      valor: "",
      proyecto: "",
      area: "",
      responsable: "",
      observacion: "",
    },
  });

  // Actualizar massiveFormData cuando cambian los valores del formulario
  useEffect(() => {
    const subscription = form.watch((value) => {
      setMassiveFormData((prev) => ({
        ...prev,
        fechaGasto: value.fechaGasto || prev.fechaGasto,
        tipo: value.tipo || prev.tipo,
        factura: value.factura || prev.factura,
        cuenta: value.cuenta || prev.cuenta,
        valor: value.valor || prev.valor,
        proyecto: value.proyecto || prev.proyecto,
        area: value.area || prev.area,
        observacion: value.observacion || prev.observacion,
        responsable: value.responsable || prev.responsable,
      }));
    });

    return () => subscription.unsubscribe();
  }, [form.watch]);

  const localOptions: OptionsState = {
    accounts: [
      {
        label: "Recuperación Valores Comisión de Reparto",
        value: "Recuperación Valores Comisión de Reparto",
      },
      {
        label: "Faltantes por Cobrar Empleados y Transportistas",
        value: "Faltantes por Cobrar Empleados y Transportistas",
      },
    ],
    projects: [],
    responsibles: [],
    transports: [],
    areas: [],
  };

  // Función para cargar empleados basados en proyecto y área
  // const fetchEmployees = useMemo(
  //   () =>
  //     debounce(async (proyecto: string, area: string) => {
  //       if (!proyecto) {
  //         toast.error("Debes seleccionar un proyecto");
  //         return;
  //       }
  //       if (!area) {
  //         toast.error("Debes seleccionar un área");
  //         return;
  //       }

  //       setIsLoading(true);
  //       try {
  //         const url = `${process.env.NEXT_PUBLIC_API_URL}/responsibles?proyecto=${proyecto}&area=${area}&fields=id,nombre_completo,area,proyecto`;

  //         const response = await fetchWithAuth(
  //           url.replace(process.env.NEXT_PUBLIC_API_URL || "", "")
  //         );

  //         // Convertir el objeto en un arreglo
  //         const employeesArray: EmployeeResponse[] = Object.values(
  //           response
  //         ).filter(
  //           (item): item is EmployeeResponse =>
  //             item !== null &&
  //             typeof item === "object" &&
  //             "id" in item &&
  //             "nombre_completo" in item
  //         );

  //         if (employeesArray.length === 0) {
  //           toast.warning(
  //             "No se encontraron responsables para este proyecto y área."
  //           );
  //           return; // No cambiar al paso de empleados si no hay resultados
  //         }

  //         const mappedEmployees: Employee[] = employeesArray.map((emp) => ({
  //           id: emp.nombre_completo,
  //           name: emp.nombre_completo,
  //           area: emp.area,
  //           project: emp.proyecto,
  //           selected: false,
  //         }));

  //         setEmployees(mappedEmployees);
  //         console.log("Empleados cargados:", mappedEmployees.length);

  //         // Cambiamos a la vista de empleados si tenemos empleados para mostrar
  //         if (mappedEmployees.length > 0) {
  //           setFormStep("employees");
  //         }
  //       } catch (error) {
  //         console.error("Error fetching employees:", error);
  //         toast.error("Error al cargar los empleados");
  //       } finally {
  //         setIsLoading(false);
  //       }
  //     }, 300),
  //   []
  // );

  // Handler para el cambio de selección en MassDiscountTable
  const handleSelectionChange = (employeeId: string) => {
    setEmployees((prev) => {
      const newEmployees = prev.map((emp) =>
        emp.id === employeeId ? { ...emp, selected: !emp.selected } : emp
      );
      const newSelectedCount = newEmployees.filter(
        (emp) => emp.selected
      ).length;
      setSelectedEmployees(newSelectedCount);
      return newEmployees;
    });
  };

  const handleSelectAll = (
    e?:
      | React.MouseEvent<HTMLButtonElement>
      | React.ChangeEvent<HTMLInputElement>
  ) => {
    e?.preventDefault();
    setEmployees((prev) => {
      const newEmployees = prev.map((emp) => ({ ...emp, selected: true }));
      setSelectedEmployees(newEmployees.length);
      return newEmployees;
    });
  };

  const handleDeselectAll = (
    e?:
      | React.MouseEvent<HTMLButtonElement>
      | React.ChangeEvent<HTMLInputElement>
  ) => {
    e?.preventDefault();
    setEmployees((prev) => {
      const newEmployees = prev.map((emp) => ({ ...emp, selected: false }));
      setSelectedEmployees(0);
      return newEmployees;
    });
  };

  const resetForm = () => {
    // Limpiar selecciones
    setEmployees([]);
    setSelectedEmployees(0);
    setFormStep("basic");

    // Resetear massiveFormData
    setMassiveFormData({
      fechaGasto: new Date().toISOString().split("T")[0],
      tipo: "nomina",
      factura: "",
      cuenta: "",
      valor: "",
      proyecto: "",
      area: "",
      responsable: "",
      observacion: "",
    });

    // Resetear formulario
    form.reset({
      fechaGasto: new Date().toISOString().split("T")[0],
      tipo: "nomina",
      factura: "",
      cuenta: "",
      valor: "",
      proyecto: "",
      area: "",
      responsable: "",
      observacion: "",
    });
  };

  // Función para procesar el envío del formulario
  const onSubmitForm = async (values: z.infer<typeof massDiscountSchema>) => {
    const selectedEmployees = employees.filter((emp) => emp.selected);
    if (selectedEmployees.length === 0) {
      toast.error("Debes seleccionar al menos un empleado");
      return;
    }

    setIsLoading(true);

    try {
      const amountPerEmployee = (
        parseFloat(values.valor) / selectedEmployees.length
      ).toFixed(2);

      console.log("Empleados seleccionados:", selectedEmployees);
      console.log(
        `Procesando ${selectedEmployees.length} empleados, $${amountPerEmployee} cada uno`
      );

      for (const employee of selectedEmployees) {
        const formData = new FormData();
        formData.append("request_date", values.fechaGasto);
        formData.append("type", "discount");
        formData.append("status", "pending");
        formData.append("invoice_number", `${values.factura}-${employee.id}`); // Hacer único
        formData.append("account_id", values.cuenta);
        formData.append("amount", amountPerEmployee);
        formData.append("project", values.proyecto);
        formData.append("responsible_id", employee.id);
        formData.append("note", values.observacion);
        formData.append("personnel_type", "nomina");

        console.log(`Enviando datos para empleado: ${employee.name}`);
        try {
          await onSubmit(formData);
          console.log(`Registro creado para ${employee.name}`);
        } catch (error) {
          console.error(`Error al procesar empleado ${employee.name}:`, error);
          toast.error(`Error al procesar el descuento para ${employee.name}`);
        }
      }

      toast.success("Registros creados con éxito");
      resetForm();
    } catch (error) {
      toast.error("Error al procesar los descuentos");
      console.error("Error general:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Corregir el mapeo de empleados en fetchEmployees
  const fetchEmployees = useMemo(
    () =>
      debounce(async (proyecto: string, area: string) => {
        if (!proyecto || !area) {
          toast.error("Debes seleccionar un proyecto y un área");
          return;
        }

        setIsLoading(true);
        try {
          const url = `${process.env.NEXT_PUBLIC_API_URL}/responsibles?proyecto=${proyecto}&area=${area}&fields=id,nombre_completo,area,proyecto`;
          const response = await fetchWithAuth(
            url.replace(process.env.NEXT_PUBLIC_API_URL || "", "")
          );

          const employeesArray: EmployeeResponse[] = Object.values(
            response
          ).filter(
            (item): item is EmployeeResponse =>
              item !== null &&
              typeof item === "object" &&
              "id" in item &&
              "nombre_completo" in item
          );

          if (employeesArray.length === 0) {
            toast.warning(
              "No se encontraron responsables para este proyecto y área."
            );
            return;
          }

          const mappedEmployees: Employee[] = employeesArray.map((emp) => ({
            id: emp.nombre_completo, // Usar el ID real
            name: emp.nombre_completo,
            area: emp.area,
            project: emp.proyecto,
            selected: false,
          }));

          setEmployees(mappedEmployees);
          console.log("Empleados cargados:", mappedEmployees);
          if (mappedEmployees.length > 0) {
            setFormStep("employees");
          }
        } catch (error) {
          console.error("Error fetching employees:", error);
          toast.error("Error al cargar los empleados");
        } finally {
          setIsLoading(false);
        }
      }, 300),
    []
  );

  // Verificar si la información básica es válida
  const isBasicInfoValid = useMemo(() => {
    return form.formState.isValid;
  }, [form.formState.isValid]);

  // Verificar si todo el formulario es válido (incluyendo selección de empleados)
  const isFormValid = useMemo(() => {
    return isBasicInfoValid && selectedEmployees > 0;
  }, [isBasicInfoValid, selectedEmployees]);

  // Configuración de fechas
  const today = new Date();
  const firstAllowedDate = new Date(
    today.getFullYear(),
    today.getMonth() - 1,
    29
  );
  const lastAllowedDate = new Date(today.getFullYear(), today.getMonth(), 28);
  const minDate = firstAllowedDate.toISOString().split("T")[0];
  const maxDate = lastAllowedDate.toISOString().split("T")[0];

  // Variantes para animaciones
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  const contentVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 500, damping: 30 },
    },
    exit: {
      opacity: 0,
      y: -10,
      transition: { duration: 0.2 },
    },
  };

  // Calcular el monto por empleado
  const amountPerEmployee = useMemo(() => {
    if (!massiveFormData.valor || selectedEmployees === 0) return 0;
    return parseFloat(massiveFormData.valor) / selectedEmployees;
  }, [massiveFormData.valor, selectedEmployees]);

  // Mostrar la sección de empleados después de validar
  const handleContinueToEmployees = async () => {
    const isValid = await form.trigger();

    if (isValid && form.getValues("proyecto") && form.getValues("area")) {
      await fetchEmployees(form.getValues("proyecto"), form.getValues("area"));
      // La función fetchEmployees se encargará de cambiar a la vista de empleados
    } else {
      toast.error("Por favor, completa todos los campos obligatorios");
    }
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants}>
      <Card className="border-slate-200 dark:border-slate-800 shadow-md hover:shadow-lg transition-all duration-300 rounded-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-rose-50 to-red-50 dark:from-rose-950/30 dark:to-red-950/30 border-b border-slate-100 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <CardTitle className="flex items-center text-xl text-slate-800 dark:text-slate-200">
                <Users className="w-5 h-5 mr-2 text-rose-500 dark:text-rose-400" />
                Descuento Masivo
              </CardTitle>
              <CardDescription>
                Aplica el mismo descuento a múltiples empleados de forma rápida
                y eficiente
              </CardDescription>
            </div>
            <Badge
              className="bg-white/80 dark:bg-slate-900/80 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 px-3 py-1.5"
              variant="outline"
            >
              <DollarSign className="w-3.5 h-3.5 mr-1.5" />
              Descuento Grupal
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 space-y-6">
              <Alert className="border-rose-200 dark:border-rose-800 bg-rose-50/50 dark:bg-rose-950/30 shadow-sm">
                <AlertCircle className="h-4 w-4 text-rose-500 dark:text-rose-400" />
                <AlertDescription className="text-slate-700 dark:text-slate-300 mt-2">
                  <AlertTitle className="font-medium mb-2">
                    Instrucciones
                  </AlertTitle>
                  <ul className="space-y-2 text-sm">
                    <li className="flex">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 mr-2 flex-shrink-0"></span>
                      Completa todos los campos del formulario
                    </li>
                    <li className="flex">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 mr-2 flex-shrink-0"></span>
                      Selecciona proyecto y área para ver los empleados
                    </li>
                    <li className="flex">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 mr-2 flex-shrink-0"></span>
                      Marca a los empleados que recibirán el descuento
                    </li>
                  </ul>
                </AlertDescription>
              </Alert>

              <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
                <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 flex items-center">
                  <DollarSign className="h-4 w-4 mr-2 text-rose-500 dark:text-rose-400" />
                  Resumen del Descuento
                </h3>

                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-600 dark:text-slate-400">
                      Valor total:
                    </span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {massiveFormData.valor
                        ? new Intl.NumberFormat("es-ES", {
                            style: "currency",
                            currency: "USD",
                          }).format(Number(massiveFormData.valor))
                        : "$0.00"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-600 dark:text-slate-400">
                      Empleados seleccionados:
                    </span>
                    <Badge className="bg-rose-100/70 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 border-0">
                      {selectedEmployees}
                    </Badge>
                  </div>

                  {selectedEmployees > 0 && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-600 dark:text-slate-400">
                        Monto por empleado:
                      </span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        {new Intl.NumberFormat("es-ES", {
                          style: "currency",
                          currency: "USD",
                        }).format(amountPerEmployee)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span>Progreso</span>
                      <span>Paso {formStep === "basic" ? "1" : "2"} de 2</span>
                    </div>
                    <Progress
                      value={
                        formStep === "basic"
                          ? 50
                          : selectedEmployees > 0
                          ? 100
                          : 75
                      }
                      className="h-2"
                    />
                  </div>
                </div>
              </div>

              {/* Botón de limpiar en la barra lateral */}
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
                className="w-full border-slate-200 dark:border-slate-800 bg-white dark:bg-transparent text-slate-700 dark:text-slate-300"
              >
                <RefreshCw className="mr-2 h-4 w-4 text-slate-500 dark:text-slate-400" />
                Limpiar Formulario
              </Button>
            </div>

            <div className="md:col-span-2">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmitForm)}
                  className="space-y-6"
                >
                  {formStep === "basic" && (
                    <motion.div
                      key="basic-info"
                      variants={contentVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="space-y-6"
                    >
                      <div className="bg-slate-50/80 dark:bg-slate-900/50 rounded-lg p-4 border border-slate-100 dark:border-slate-800 shadow-sm">
                        <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-4 flex items-center">
                          <FileText className="w-4 h-4 mr-2 text-rose-500 dark:text-rose-400" />
                          Información del Descuento
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          <FormField
                            control={form.control}
                            name="fechaGasto"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs flex items-center">
                                  <CalendarDays className="h-4 w-4 text-rose-500 dark:text-rose-400 mr-1.5" />
                                  Fecha del Gasto
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="date"
                                    className="h-10 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
                                    min={minDate}
                                    max={maxDate}
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage className="text-xs" />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="tipo"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs flex items-center">
                                  <Users className="h-4 w-4 text-rose-500 dark:text-rose-400 mr-1.5" />
                                  Tipo
                                </FormLabel>
                                <Select
                                  disabled
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger className="h-10 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                                      <SelectValue placeholder="Nómina" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="nomina">
                                      Nómina
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage className="text-xs" />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="factura"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs flex items-center">
                                  <FileText className="h-4 w-4 text-rose-500 dark:text-rose-400 mr-1.5" />
                                  Número de Factura
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    className="h-10 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage className="text-xs" />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      <div className="bg-slate-50/80 dark:bg-slate-900/50 rounded-lg p-4 border border-slate-100 dark:border-slate-800 shadow-sm">
                        <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-4 flex items-center">
                          <Building2 className="w-4 h-4 mr-2 text-rose-500 dark:text-rose-400" />
                          Proyecto y Área
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="proyecto"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs flex items-center">
                                  <Building2 className="h-4 w-4 text-rose-500 dark:text-rose-400 mr-1.5" />
                                  Proyecto
                                </FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  disabled={loading.projects}
                                >
                                  <FormControl>
                                    <SelectTrigger className="h-10 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                                      <SelectValue placeholder="Selecciona un proyecto" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {options.projects.map((project) => (
                                      <SelectItem
                                        key={project.value.toString()}
                                        value={project.value.toString()}
                                      >
                                        {project.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage className="text-xs" />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="area"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs flex items-center">
                                  <ListFilter className="h-4 w-4 text-rose-500 dark:text-rose-400 mr-1.5" />
                                  Área
                                </FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  disabled={
                                    !form.watch("proyecto") || loading.areas
                                  }
                                >
                                  <FormControl>
                                    <SelectTrigger className="h-10 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                                      <SelectValue placeholder="Selecciona un área" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {options.areas.map((area) => (
                                      <SelectItem
                                        key={area.value.toString()}
                                        value={area.value.toString()}
                                      >
                                        {area.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage className="text-xs" />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      <div className="bg-slate-50/80 dark:bg-slate-900/50 rounded-lg p-4 border border-slate-100 dark:border-slate-800 shadow-sm">
                        <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-4 flex items-center">
                          <DollarSign className="w-4 h-4 mr-2 text-rose-500 dark:text-rose-400" />
                          Valores y Detalles
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="cuenta"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs flex items-center">
                                  <FileText className="h-4 w-4 text-rose-500 dark:text-rose-400 mr-1.5" />
                                  Cuenta
                                </FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger className="h-10 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                                      <SelectValue placeholder="Selecciona una cuenta" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {localOptions.accounts.map((account) => (
                                      <SelectItem
                                        key={account.value.toString()}
                                        value={account.value.toString()}
                                      >
                                        {account.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage className="text-xs" />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="valor"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs flex items-center">
                                  <DollarSign className="h-4 w-4 text-rose-500 dark:text-rose-400 mr-1.5" />
                                  Valor Total
                                </FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">
                                      $
                                    </span>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      className="pl-7 h-10 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
                                      {...field}
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage className="text-xs" />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="mt-4">
                          <FormField
                            control={form.control}
                            name="observacion"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs flex items-center">
                                  <FileText className="h-4 w-4 text-rose-500 dark:text-rose-400 mr-1.5" />
                                  Observación
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    className="h-10 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage className="text-xs" />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <Button
                          type="button"
                          onClick={handleContinueToEmployees}
                          disabled={!isBasicInfoValid || isLoading}
                          className="bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white transition-all duration-200"
                        >
                          {isLoading ? (
                            <div className="flex items-center">
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              <span>Cargando empleados...</span>
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <Users className="mr-2 h-4 w-4" />
                              <span>Continuar y Seleccionar Empleados</span>
                            </div>
                          )}
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {formStep === "employees" && (
                    <motion.div
                      key="employees-section"
                      variants={contentVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="space-y-6"
                    >
                      <div className="bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100 flex items-center mb-1">
                              <Users className="w-4 h-4 mr-2 text-rose-500 dark:text-rose-400" />
                              Selección de Empleados
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              Selecciona los empleados a los que se aplicará el
                              descuento
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setFormStep("basic")}
                                    className="text-xs h-8 border-slate-200 dark:border-slate-800"
                                  >
                                    <span className="mr-1">←</span> Volver
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                                  Volver a la información básica
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            <div className="flex">
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={handleSelectAll}
                                className="rounded-r-none border-slate-200 dark:border-slate-800 text-xs h-8 text-rose-600 hover:text-rose-800"
                              >
                                Seleccionar todos
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={handleDeselectAll}
                                className="rounded-l-none border-l-0 border-slate-200 dark:border-slate-800 text-xs h-8 text-slate-600 hover:text-slate-800"
                              >
                                Deseleccionar todos
                              </Button>
                            </div>
                          </div>
                        </div>

                        <div className="p-4">
                          {/* Aquí utilizamos MassDiscountTable para mostrar y seleccionar empleados */}
                          <MassDiscountTable
                            employees={employees}
                            totalAmount={Number(massiveFormData.valor) || 0}
                            onSelectionChange={handleSelectionChange}
                            isLoading={isLoading}
                            onSelectAll={handleSelectAll}
                            onDeselectAll={handleDeselectAll}
                          />
                        </div>
                      </div>

                      <div className="pt-2 flex flex-col-reverse sm:flex-row justify-between items-center gap-4">
                        <div className="text-sm">
                          {selectedEmployees > 0 && (
                            <div className="text-slate-600 dark:text-slate-400 flex items-center">
                              <span className="bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 size-6 flex items-center justify-center rounded-full mr-2">
                                {selectedEmployees}
                              </span>
                              <span>
                                empleados seleccionados (
                                {new Intl.NumberFormat("es-ES", {
                                  style: "currency",
                                  currency: "USD",
                                }).format(amountPerEmployee)}{" "}
                                por empleado)
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex space-x-3">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setFormStep("basic")}
                            className="border-slate-200 dark:border-slate-800 bg-white dark:bg-transparent"
                          >
                            <span className="mr-1">←</span> Volver
                          </Button>

                          <Button
                            type="submit"
                            disabled={!isFormValid || loading.submit}
                            className="bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white transition-all duration-200"
                          >
                            {loading.submit ? (
                              <div className="flex items-center">
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                <span>Procesando...</span>
                              </div>
                            ) : (
                              <div className="flex items-center">
                                <DollarSign className="mr-2 h-4 w-4" />
                                <span>Registrar Descuento Masivo</span>
                              </div>
                            )}
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </form>
              </Form>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default MassDiscountForm;
