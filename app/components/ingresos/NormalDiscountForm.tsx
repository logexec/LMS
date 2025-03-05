/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { ChangeEvent, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useCallback, useEffect } from "react";
import Input from "../Input";
import Select from "../Select";
import { LoadingState, OptionsState, NormalFormData } from "@/utils/types";
import Datalist from "../Datalist";
import { toast } from "sonner";
import debounce from "lodash/debounce";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getAuthToken } from "@/services/auth.service";
import apiService from "@/services/api.service";

interface NormalDiscountFormProps {
  options: OptionsState;
  loading: LoadingState;
  onSubmit: (data: FormData) => Promise<void>;
}

const NormalDiscountForm: React.FC<NormalDiscountFormProps> = ({
  options,
  loading,
  onSubmit,
}) => {
  const [normalFormData, setNormalFormData] = React.useState<NormalFormData>({
    fechaGasto: new Date().toISOString().split("T")[0],
    tipo: "",
    factura: "",
    cuenta: "",
    valor: "",
    proyecto: "",
    responsable: "",
    transporte: "",
    observacion: "",
  });

  const [localOptions, setLocalOptions] = React.useState<OptionsState>({
    projects: options.projects, // Usar los proyectos que vienen de props
    responsibles: [],
    transports: [],
    accounts: [],
    areas: options.areas, // Usar las áreas que vienen de props
  });

  const [localLoading, setLocalLoading] = React.useState<LoadingState>({
    submit: loading.submit,
    projects: loading.projects,
    responsibles: false,
    transports: false,
    accounts: false,
    areas: loading.areas,
  });

  const [formValid, setFormValid] = React.useState(false);
  const [formErrors, setFormErrors] = React.useState<Record<string, string>>(
    {}
  );

  // Actualizar localOptions cuando cambien las props
  useEffect(() => {
    setLocalOptions((prevOptions) => ({
      ...prevOptions,
      projects: options.projects,
      areas: options.areas,
    }));
  }, [options.projects, options.areas]);

  // Actualizar localLoading cuando cambien las props
  useEffect(() => {
    setLocalLoading((prevLoading) => ({
      ...prevLoading,
      submit: loading.submit,
      projects: loading.projects,
      areas: loading.areas,
    }));
  }, [loading.submit, loading.projects, loading.areas]);

  const fetchAccounts = useCallback(async (tipo: string) => {
    setLocalLoading((prev) => ({ ...prev, accounts: true }));
    try {
      const response = await apiService.getAccounts(tipo, "discount");
      if (!response.ok) throw new Error("Error al cargar las cuentas");

      const data = await response.data;

      setLocalOptions((prev) => ({
        ...prev,
        accounts: data.map((account: { name: string; id: string }) => ({
          label: account.name,
          value: account.id,
        })),
      }));
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al cargar las cuentas"
      );
      console.error(error);
    } finally {
      setLocalLoading((prev) => ({ ...prev, accounts: false }));
    }
  }, []);

  const fetchResponsibles = useCallback(
    debounce(async (proyecto: string) => {
      if (!proyecto) return;

      setLocalLoading((prev) => ({ ...prev, responsibles: true }));
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/responsibles?proyecto=${proyecto}`,
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
        setLocalOptions((prev) => ({
          ...prev,
          responsibles: data.map(
            (responsible: { nombre_completo: string; id: string }) => ({
              label: responsible.nombre_completo,
              value: responsible.id,
            })
          ),
        }));
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Error al cargar responsables"
        );
      } finally {
        setLocalLoading((prev) => ({ ...prev, responsibles: false }));
      }
    }, 300),
    []
  );

  const fetchTransports = useCallback(async () => {
    setLocalLoading((prev) => ({ ...prev, transports: true }));
    try {
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
      setLocalOptions((prev) => ({
        ...prev,
        transports: data.map((transport: { name: string; id: string }) => ({
          label: transport.name,
          value: transport.id,
        })),
      }));
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Error al cargar los transportes"
      );
    } finally {
      setLocalLoading((prev) => ({ ...prev, transports: false }));
    }
  }, []);

  useEffect(() => {
    if (normalFormData.tipo) {
      fetchAccounts(normalFormData.tipo);
    }
  }, [normalFormData.tipo, fetchAccounts]);

  useEffect(() => {
    if (normalFormData.proyecto && normalFormData.tipo) {
      fetchResponsibles(normalFormData.proyecto);
    }
  }, [normalFormData.proyecto, normalFormData.tipo, fetchResponsibles]);

  useEffect(() => {
    if (normalFormData.tipo === "transportista") {
      fetchTransports();
    }
  }, [normalFormData.tipo, fetchTransports]);

  const validateField = (name: string, value: string): boolean => {
    const newErrors = { ...formErrors };

    switch (name) {
      case "tipo":
        newErrors[name] =
          typeof value === "string" && value.length < 1
            ? "Debes seleccionar un tipo"
            : "";
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
      case "transporte":
        if (
          normalFormData.tipo === "transportista" &&
          typeof value === "string" &&
          value.length < 1
        ) {
          newErrors[name] = "Debes seleccionar un transporte";
        } else {
          newErrors[name] = "";
        }
        break;
      case "responsable":
        if (
          normalFormData.tipo === "nomina" &&
          typeof value === "string" &&
          value.length < 1
        ) {
          newErrors[name] = "Debes seleccionar un responsable";
        } else {
          newErrors[name] = "";
        }
        break;
    }

    setFormErrors(newErrors);
    const isValid = !Object.values(newErrors).some((error) => error !== "");
    setFormValid(isValid);

    return isValid;
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNormalFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    validateField(name, value);
  };

  const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNormalFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    validateField(name, value);
  };

  const resetForm = () => {
    setNormalFormData({
      fechaGasto: new Date().toISOString().split("T")[0],
      tipo: "",
      factura: "",
      cuenta: "",
      valor: "",
      proyecto: "",
      responsable: "",
      transporte: "",
      observacion: "",
    });
    setFormErrors({});
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validación final antes de enviar
    const hasErrors = Object.keys(normalFormData).some(
      (key) => !validateField(key, normalFormData[key as keyof NormalFormData])
    );

    if (hasErrors) {
      toast.error("Por favor, corrije los errores antes de continuar.");
      return;
    }

    setLocalLoading((prev) => ({ ...prev, submit: true }));

    try {
      const formData = new FormData();
      formData.append("request_date", normalFormData.fechaGasto);
      formData.append("type", "discount");
      formData.append("status", "pending");
      formData.append("invoice_number", normalFormData.factura);
      formData.append("account_id", normalFormData.cuenta);
      formData.append("amount", normalFormData.valor);
      formData.append("project", normalFormData.proyecto);
      if (normalFormData.responsable) {
        formData.append("responsible_id", normalFormData.responsable);
      }
      if (normalFormData.transporte) {
        formData.append("transport_id", normalFormData.transporte);
      }
      formData.append("note", normalFormData.observacion);
      formData.append("personnel_type", normalFormData.tipo);

      await onSubmit(formData);
      toast.success("Descuento registrado exitosamente");
      resetForm();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Hubo un error al registrar el descuento"
      );
    } finally {
      setLocalLoading((prev) => ({ ...prev, submit: false }));
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Registro de Descuento</CardTitle>
        <CardDescription>
          Completa todos los campos requeridos para registrar un nuevo descuento
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Importante</AlertTitle>
              <AlertDescription>
                Todos los campos son obligatorios y deben ser completados
                correctamente.
              </AlertDescription>
            </Alert>
          </div>

          <div className="md:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-4">
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Input
                  required
                  id="fechaGasto"
                  name="fechaGasto"
                  currentDate={true}
                  label="Fecha del Gasto"
                  type="date"
                  value={normalFormData.fechaGasto}
                  onChange={handleInputChange}
                  allowPastDates={false}
                  error={formErrors.fechaGasto}
                />

                <Select
                  label="Tipo"
                  name="tipo"
                  id="tipo"
                  required
                  options={[
                    { value: "nomina", label: "Nómina" },
                    { value: "transportista", label: "Transportista" },
                  ]}
                  onChange={handleSelectChange}
                  value={normalFormData.tipo}
                  disabled={localLoading.submit}
                  error={formErrors.tipo}
                />

                <AnimatePresence mode="wait">
                  {normalFormData.tipo && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Datalist
                        label="Proyecto"
                        name="proyecto"
                        id="proyecto"
                        required
                        options={localOptions.projects}
                        onChange={handleInputChange}
                        value={normalFormData.proyecto}
                        disabled={localLoading.projects}
                        error={formErrors.proyecto}
                        loading={localLoading.projects}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence mode="wait">
                  {normalFormData.tipo && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Datalist
                        label="Cuenta"
                        name="cuenta"
                        id="cuenta"
                        required
                        options={localOptions.accounts}
                        onChange={handleInputChange}
                        value={normalFormData.cuenta}
                        disabled={localLoading.accounts}
                        error={formErrors.cuenta}
                        loading={localLoading.accounts}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {normalFormData.tipo === "nomina" && (
                  <AnimatePresence mode="wait">
                    {normalFormData.tipo && (
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Datalist
                          label="Responsable"
                          name="responsable"
                          id="responsable"
                          required
                          options={localOptions.responsibles}
                          onChange={handleInputChange}
                          value={normalFormData.responsable}
                          disabled={localLoading.responsibles}
                          error={formErrors.responsable}
                          loading={localLoading.responsibles}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}

                {normalFormData.tipo === "transportista" && (
                  <AnimatePresence mode="wait">
                    {normalFormData.tipo && (
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Datalist
                          label="Transporte"
                          name="transporte"
                          id="transporte"
                          required
                          options={localOptions.transports}
                          onChange={handleInputChange}
                          value={normalFormData.transporte}
                          disabled={localLoading.transports}
                          error={formErrors.transporte}
                          loading={localLoading.transports}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}

                <AnimatePresence mode="wait">
                  {normalFormData.tipo && (
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
                        label="Número de Factura"
                        type="text"
                        value={normalFormData.factura}
                        onChange={handleInputChange}
                        error={formErrors.factura}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence mode="wait">
                  {normalFormData.tipo && (
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
                        label="Valor del Descuento"
                        type="number"
                        value={normalFormData.valor}
                        onChange={handleInputChange}
                        error={formErrors.valor}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence mode="wait">
                  {normalFormData.tipo && (
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
                        value={normalFormData.observacion}
                        onChange={handleInputChange}
                        error={formErrors.observacion}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

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
                    "Registrar Descuento"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NormalDiscountForm;
