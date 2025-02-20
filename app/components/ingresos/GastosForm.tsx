/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { motion } from "motion/react";
import Input from "../Input";
import Datalist from "../Datalist";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import debounce from "lodash/debounce";
import { getAuthToken } from "@/services/auth.service";
import * as XLSX from "xlsx";
import ExcelUploadSection from "./ExcelUploadSection";
import { LoadingState } from "@/utils/types";
import { useAuth } from "@/hooks/useAuth";

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
    // empresa: "",
    responsable: "",
    transporte: "",
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
  const fileInputRef = React.useRef<HTMLInputElement>(null);

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
      // case "empresa":
      //   newErrors[name] =
      //     typeof value === "string" && value.length < 2
      //       ? "La empresa es obligatoria"
      //       : "";
      //   break;
      case "observacion":
        newErrors[name] =
          typeof value === "string" && value.trim().length < 1
            ? "Debes escribir una observación"
            : "";
        break;
      case "transporte":
        if (formData.tipo === "transportista") {
          newErrors[name] =
            typeof value === "string" && value.length < 1
              ? "Debes seleccionar un transporte"
              : "";
        }
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
  };

  // const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
  //   const { name, value } = e.target;
  //   setFormData((prev) => ({ ...prev, [name]: value }));
  //   validateField(name, value);
  // };

  // Reset form method
  const resetForm = () => {
    setFormData({
      fechaGasto: new Date().toISOString().split("T")[0],
      type: "expense",
      tipo: "nomina",
      factura: "",
      cuenta: "",
      valor: "",
      proyecto: "",
      // empresa: "",
      responsable: "",
      transporte: "",
      observacion: "",
    });
    setFormErrors({});
    setFormValid(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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
      // formDataToSend.append("company", formData.empresa);
      formDataToSend.append("note", formData.observacion);
      formDataToSend.append("personnel_type", "nomina");

      // Conditional fields
      if (formData.responsable) {
        formDataToSend.append("responsible_id", formData.responsable);
      }

      await onSubmit(formDataToSend);
      resetForm();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al procesar el gasto"
      );
    } finally {
      setLocalLoading((prev) => ({ ...prev, submit: false }));
      resetForm();
    }
  };

  // Fetch methods
  const fetchAccounts = useCallback(async () => {
    setLocalLoading((prev) => ({ ...prev, accounts: true }));
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/accounts?account_type=nomina`,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
          credentials: "include",
        }
      );

      if (!response.ok) throw new Error("Error al cargar las cuentas");

      const data = await response.json();
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
                value: responsible.id,
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

  // const currentUser = useAuth().user;

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
          value: project.id,
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

  // Options for dropdowns

  // const empresaOptions = [
  //   { value: "SERSUPPORT", label: "SERSUPPORT" },
  //   { value: "PREBAM", label: "PREBAM" },
  // ];

  const [loading, setLoading] = useState<LoadingState>({
    submit: false,
    projects: false,
    responsibles: false,
    transports: false,
    accounts: false,
    areas: false,
  });

  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadTemplate = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/download-excel-template`,
        // `${process.env.NEXT_PUBLIC_API_URL}/download-expenses-excel-template`,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
          method: "GET",
          credentials: "include",
        }
      );

      if (!response.ok) throw new Error("Error al descargar la plantilla");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "Plantilla Gastos.xlsx | LogeX.xlsx";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Plantilla descargada correctamente");
    } catch (error) {
      toast.error("Error al descargar la plantilla");
      console.error("Error al descargar la plantilla:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleExcelUpload = async (file: File) => {
    setLoading((prev) => ({ ...prev, submit: true }));
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, {
        cellDates: true,
        dateNF: "yyyy-mm-dd",
      });

      // Obtener la primera hoja
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: false });

      // Validar estructura del Excel
      const requiredColumns = [
        "Fecha",
        "Tipo",
        "No. Factura",
        "Cuenta",
        "Valor",
        "Proyecto",
        "Responsable",
        "Placa", // Opcional, solo para transportistas
        "Observación",
      ];

      const rawHeaderRow = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
      })[0];
      const headerRow = Array.isArray(rawHeaderRow)
        ? rawHeaderRow.map(String)
        : [];

      const missingColumns = requiredColumns.filter(
        (col) => col !== "Placa" && !headerRow.includes(col)
      );

      if (missingColumns.length > 0) {
        throw new Error(`Columnas faltantes: ${missingColumns.join(", ")}`);
      }

      // Preparar FormData con los datos procesados
      const formData = new FormData();
      formData.append("file", file);
      formData.append("data", JSON.stringify(jsonData));

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/upload-discounts`,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
          method: "POST",
          body: formData,
          credentials: "include",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        if (result.errors) {
          // Crear mensaje de error detallado para cada fila con error
          const errorMessage = result.errors
            .map(
              (err: { row: number; error: string }) =>
                `Fila ${err.row}: ${err.error}`
            )
            .join("\n");
          throw new Error(errorMessage);
        }
        throw new Error(result.message || "Error al procesar el archivo");
      }

      toast.success(`${result.processed} descuentos procesados correctamente`);
    } catch (error) {
      console.error("Error:", error);
      // Si el error tiene múltiples líneas, usar toast.error para cada línea
      if (error instanceof Error && error.message.includes("\n")) {
        error.message.split("\n").forEach((line) => toast.error(line));
      } else {
        toast.error(
          error instanceof Error
            ? error.message
            : "Error al procesar el archivo"
        );
      }
    } finally {
      setLoading((prev) => ({ ...prev, submit: false }));
    }
  };

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
        <ExcelUploadSection
          onFileUpload={handleExcelUpload}
          onDownloadTemplate={handleDownloadTemplate}
          isUploading={loading.submit}
          isDownloading={isDownloading}
        />
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
                  allowPastDates={false}
                  error={formErrors.fechaGasto}
                />

                <Datalist
                  label="Tipo"
                  name="tipo"
                  id="tipo"
                  options={[{ value: "nomina", label: "Nómina" }]}
                  value={"nomina"}
                  error={formErrors.tipo}
                  disabled
                />

                <Datalist
                  label="Proyecto"
                  name="proyecto"
                  id="proyecto"
                  options={localOptions.projects}
                  onChange={handleInputChange}
                  value={formData.proyecto}
                  error={formErrors.proyecto}
                />

                {/* <Select
                  label="Empresa"
                  name="empresa"
                  id="empresa"
                  options={empresaOptions}
                  onChange={handleSelectChange}
                  value={formData.empresa}
                  error={formErrors.empresa}
                /> */}

                <Datalist
                  label="Cuenta"
                  name="cuenta"
                  id="cuenta"
                  options={localOptions.accounts}
                  onChange={handleInputChange}
                  value={formData.cuenta}
                  error={formErrors.cuenta}
                />

                {formData.tipo === "nomina" && (
                  <Datalist
                    label="Responsable"
                    name="responsable"
                    id="responsable"
                    options={localOptions.responsibles}
                    onChange={handleInputChange}
                    value={formData.responsable}
                    error={formErrors.responsable}
                  />
                )}

                {formData.tipo === "transportista" && (
                  <Datalist
                    label="Transporte"
                    name="transporte"
                    id="transporte"
                    options={localOptions.transports}
                    onChange={handleInputChange}
                    value={formData.transporte}
                    error={formErrors.transporte}
                  />
                )}

                <Input
                  required
                  id="factura"
                  name="factura"
                  label="Factura"
                  type="text"
                  value={formData.factura}
                  onChange={handleInputChange}
                  error={formErrors.factura}
                />

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
              </div>

              <div className="flex justify-end space-x-4 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  disabled={localLoading.submit}
                >
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
