/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import { motion, AnimatePresence } from "motion/react";
import Input from "../Input";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import debounce from "lodash/debounce";
import { getAuthToken } from "@/services/auth.service";
import ExcelUploadSection from "./ExcelUploadSection";
import { useAuth } from "@/hooks/useAuth";
import apiService from "@/services/api.service";
import { AccountProps } from "@/utils/types";
import Combobox from "@/components/ui/combobox";

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
  const [formData, setFormData] = React.useState({
    fechaGasto: new Date().toISOString().split("T")[0],
    type: "expense",
    tipo: "nomina",
    factura: "",
    cuenta: "",
    valor: "",
    proyecto: "",
    responsable: "",
    vehicle_plate: "",
    vehicle_number: "",
    observacion: "",
  });

  const [localOptions, setLocalOptions] = React.useState({
    accounts: [],
    projects: [],
    responsibles: [],
    transports: [],
  });

  const [localLoading, setLocalLoading] = React.useState({
    submit: false,
    accounts: false,
    projects: false,
    responsibles: false,
    transports: false,
  });

  const [formErrors, setFormErrors] = React.useState<Record<string, string>>(
    {}
  );
  const [formValid, setFormValid] = React.useState(false);
  const [showAdditionalFields, setShowAdditionalFields] = React.useState(false);

  // Validation method
  const validateField = (name: string, value: string | Blob): boolean => {
    const newErrors = { ...formErrors };

    switch (name) {
      case "tipo":
        newErrors[name] = value === "" ? "Debes seleccionar un tipo" : "";
        break;
      case "fechaGasto":
        newErrors[name] =
          typeof value === "string" && value.length < 10
            ? "Debes seleccionar una fecha"
            : "";
        break;
      case "valor":
        newErrors[name] =
          typeof value === "string" && parseFloat(value) <= 0
            ? "El valor debe ser mayor a 0"
            : "";
        break;
      case "factura":
        newErrors[name] =
          typeof value === "string" && value.length < 3
            ? "El número de factura debe tener al menos 3 caracteres"
            : "";
        break;
      case "proyecto":
        newErrors[name] =
          typeof value === "string" && value.length < 2
            ? "El proyecto es obligatorio"
            : "";
        break;
      case "cuenta":
        newErrors[name] =
          typeof value === "string" && value.length < 2
            ? "La cuenta es obligatoria"
            : "";
        break;
      case "observacion":
        newErrors[name] =
          typeof value === "string" && value.trim().length < 1
            ? "Debes escribir una observación"
            : "";
        break;
      case "responsable":
        if (formData.tipo === "nomina") {
          newErrors[name] =
            typeof value === "string" && value.length < 1
              ? "Debes seleccionar un responsable"
              : "";
        }
        break;
    }

    setFormErrors(newErrors);

    const isValid = !Object.values(newErrors).some((error) => error !== "");
    setFormValid(isValid);

    return isValid;
  };

  // Input change handlers
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);

    // Si es el campo proyecto y tiene valor, mostrar los campos adicionales
    if (name === "proyecto" && value) {
      setShowAdditionalFields(true);
    }
  };

  // Reset form method
  const resetForm = () => {
    // Primero ocultar los campos adicionales
    setShowAdditionalFields(false);

    // Retraso para que primero se complete la animación de ocultar
    setTimeout(() => {
      setFormData({
        fechaGasto: new Date().toISOString().split("T")[0],
        type: "expense",
        tipo: "nomina",
        factura: "",
        cuenta: "",
        valor: "",
        proyecto: "",
        responsable: "",
        vehicle_plate: "",
        vehicle_number: "",
        observacion: "",
      });
      setFormErrors({});
      setFormValid(false);
    }, 100); // Pequeño retraso para que la animación sea más fluida
  };

  // Submit handler
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Final validation
    const hasErrors = Object.keys(formData).some(
      (key) => !validateField(key, formData[key as keyof typeof formData])
    );

    if (hasErrors) {
      toast.error("Por favor, corrije los errores antes de continuar.");
      return;
    }

    setLocalLoading((prev) => ({ ...prev, submit: true }));

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("request_date", formData.fechaGasto);
      formDataToSend.append("type", "expense");
      formDataToSend.append("status", "pending");
      formDataToSend.append("invoice_number", formData.factura);
      formDataToSend.append("account_id", formData.cuenta);
      formDataToSend.append("amount", formData.valor);
      formDataToSend.append("project", formData.proyecto);
      formDataToSend.append("note", formData.observacion);
      formDataToSend.append("personnel_type", "nomina");

      // Conditional fields
      if (formData.responsable) {
        formDataToSend.append("responsible_id", formData.responsable);
      }
      if (formData.vehicle_number) {
        formDataToSend.append("vehicle_number", formData.vehicle_number);
      }

      await onSubmit(formDataToSend);

      // Primero ocultar los campos adicionales
      setShowAdditionalFields(false);

      // Limpiar el formulario después de un breve retraso para la animación
      setTimeout(() => {
        setFormData({
          fechaGasto: new Date().toISOString().split("T")[0],
          type: "expense",
          tipo: "nomina",
          factura: "",
          cuenta: "",
          valor: "",
          proyecto: "",
          responsable: "",
          vehicle_plate: "",
          vehicle_number: "",
          observacion: "",
        });
        setFormErrors({});
        setFormValid(false);
      }, 100);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al procesar el gasto"
      );
    } finally {
      setLocalLoading((prev) => ({ ...prev, submit: false }));
    }
  };

  // Fetch methods
  const fetchAccounts = useCallback(async () => {
    setLocalLoading((prev) => ({ ...prev, accounts: true }));
    try {
      const response = await apiService.getAccounts("nomina", "expense");
      if (!response.ok) throw new Error("Error al cargar las cuentas");

      const data = await response.data;

      const activeAccounts = data.filter(
        (account: AccountProps) => account.account_status === "active"
      );

      setLocalOptions((prev) => ({
        ...prev,
        accounts: activeAccounts.map(
          (account: { name: string; id: string }) => ({
            label: account.name,
            value: account.name,
          })
        ),
      }));
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al cargar las cuentas"
      );
    } finally {
      setLocalLoading((prev) => ({ ...prev, accounts: false }));
    }
  }, [setLocalLoading]);

  const fetchResponsibles = useMemo(
    () =>
      debounce(async (proyecto: string) => {
        if (!proyecto) return;

        setLocalLoading((prev) => ({ ...prev, responsibles: true }));
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/responsibles?proyecto=${proyecto}`,
            {
              headers: {
                Authorization: `Bearer ${getAuthToken()}`,
              },
              credentials: "include",
            }
          );

          if (!response.ok) throw new Error("Error al cargar responsables");

          const data = await response.json();
          setLocalOptions((prev) => ({
            ...prev,
            responsibles: data.map(
              (responsible: { nombre_completo: string; id: string }) => ({
                label: responsible.nombre_completo,
                value: responsible.nombre_completo,
              })
            ),
          }));
        } catch (error) {
          toast.error("Error al cargar responsables");
          console.error("Error al cargar responsables:", error);
        } finally {
          setLocalLoading((prev) => ({ ...prev, responsibles: false }));
        }
      }, 300),
    []
  );

  const auth = useAuth();

  const fetchProjects = useCallback(async () => {
    setLocalLoading((prev) => ({ ...prev, projects: true }));
    const assignedProjectIds = auth.hasProjects();

    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL
        }/projects?projects=${assignedProjectIds.join(",")}`,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
          credentials: "include",
        }
      );

      if (!response.ok) throw new Error("Error al cargar proyectos");

      const data = await response.json();
      setLocalOptions((prev) => ({
        ...prev,
        projects: data.map((project: { name: string; id: string }) => ({
          label: project.name,
          value: project.name,
        })),
      }));
    } catch (error) {
      toast.error("Error al cargar proyectos");
      console.error("Error al cargar proyectos:", error);
    } finally {
      setLocalLoading((prev) => ({ ...prev, projects: false }));
    }
  }, [setLocalLoading]);

  useEffect(() => {
    if (formData.proyecto) {
      fetchResponsibles(formData.proyecto);
    }
  }, [formData.proyecto, fetchResponsibles]);

  useEffect(() => {
    fetchAccounts();
    fetchProjects();
  }, [fetchAccounts, fetchProjects]);

  const today = new Date();
  // Obtener el 29 del mes pasado
  const firstAllowedDate = new Date(
    today.getFullYear(),
    today.getMonth() - 1,
    29
  );

  // Obtener el 28 del mes actual
  const lastAllowedDate = new Date(today.getFullYear(), today.getMonth(), 28);

  const minDate = firstAllowedDate.toISOString().split("T")[0];
  const maxDate = lastAllowedDate.toISOString().split("T")[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="container"
    >
      {/* Sección de Excel */}
      <motion.div
        key="excel-upload"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <ExcelUploadSection context="expenses" />
      </motion.div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Registro de Gastos</CardTitle>
          <CardDescription>
            Complete todos los campos requeridos para registrar un nuevo gasto
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Todos los campos son obligatorios y deben ser completados
                  correctamente.
                </AlertDescription>
              </Alert>
            </div>

            <form onSubmit={handleSubmit} className="md:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Input
                  required
                  id="fechaGasto"
                  name="fechaGasto"
                  currentDate={true}
                  label="Fecha del Gasto"
                  type="date"
                  value={formData.fechaGasto}
                  onChange={handleInputChange}
                  minDate={minDate}
                  maxDate={maxDate}
                  error={formErrors.fechaGasto}
                />

                <Combobox
                  label="Tipo"
                  name="tipo"
                  id="tipo"
                  options={[{ value: "nomina", label: "Nómina" }]}
                  value={"nomina"}
                  error={formErrors.tipo}
                  disabled
                />

                <Combobox
                  label="Proyecto"
                  name="proyecto"
                  id="proyecto"
                  options={localOptions.projects}
                  onChange={handleInputChange}
                  value={formData.proyecto}
                  error={formErrors.proyecto}
                  loading={localLoading.projects}
                />

                <AnimatePresence>
                  {showAdditionalFields && (
                    <>
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Combobox
                          label="Cuenta"
                          name="cuenta"
                          id="cuenta"
                          options={localOptions.accounts}
                          onChange={handleInputChange}
                          value={formData.cuenta}
                          error={formErrors.cuenta}
                          loading={localLoading.accounts}
                        />
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Combobox
                          label="Responsable"
                          name="responsable"
                          id="responsable"
                          options={localOptions.responsibles}
                          onChange={handleInputChange}
                          value={formData.responsable}
                          error={formErrors.responsable}
                          loading={localLoading.responsibles}
                        />
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Input
                          label="No. Transporte"
                          name="vehicle_number"
                          id="vehicle_number"
                          type="text"
                          onChange={handleInputChange}
                          value={formData.vehicle_number}
                          disabled={localLoading.transports}
                          error={formErrors.vehicle_number}
                        />
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Input
                          required
                          id="factura"
                          name="factura"
                          label="Factura"
                          type="number"
                          value={formData.factura}
                          onChange={handleInputChange}
                          error={formErrors.factura}
                        />
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Input
                          required
                          id="valor"
                          name="valor"
                          label="Valor"
                          type="number"
                          value={formData.valor}
                          onChange={handleInputChange}
                          error={formErrors.valor}
                        />
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Input
                          required
                          id="observacion"
                          name="observacion"
                          label="Observación"
                          type="text"
                          value={formData.observacion}
                          onChange={handleInputChange}
                          error={formErrors.observacion}
                        />
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex justify-end space-x-4 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  disabled={localLoading.submit}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Limpiar
                </Button>
                <Button
                  type="submit"
                  disabled={localLoading.submit || !formValid}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {localLoading.submit ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    "Registrar Gasto"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default GastosForm;
