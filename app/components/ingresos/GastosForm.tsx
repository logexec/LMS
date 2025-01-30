"use client";

import React, { ChangeEvent, FormEvent, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import Input from "../Input";
import Select from "../Select";
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
import { Upload, Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import debounce from "lodash/debounce";

interface GastosFormProps {
  onSubmit?: (data: FormData) => Promise<void>;
}

const GastosForm: React.FC<GastosFormProps> = ({
  onSubmit = async (formData: FormData) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/requests`,
        {
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
    empresa: "",
    responsable: "",
    transporte: "",
    adjunto: new Blob([]),
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
      case "empresa":
        newErrors[name] =
          typeof value === "string" && value.length < 2
            ? "La empresa es obligatoria"
            : "";
        break;
      case "observacion":
        newErrors[name] =
          typeof value === "string" && value.trim().length < 1
            ? "Debes escribir una observación"
            : "";
        break;
      case "adjunto":
        newErrors[name] =
          value instanceof Blob && value.size === 0
            ? "El adjunto es obligatorio"
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

    // console.log(newErrors);

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

  const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    const file = e.target.files[0];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (file.size > maxSize) {
      toast.error(
        "El archivo es demasiado grande. El tamaño máximo permitido es de 5MB."
      );
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    setFormData((prev) => ({
      ...prev,
      adjunto: file,
    }));
    validateField("adjunto", file);
  };

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
      empresa: "",
      responsable: "",
      transporte: "",
      adjunto: new Blob([]),
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
      formDataToSend.append("company", formData.empresa);
      formDataToSend.append("note", formData.observacion);
      formDataToSend.append("personnel_type", "nomina");

      // Conditional fields
      if (formData.responsable) {
        formDataToSend.append("responsible_id", formData.responsable);
      }
      // Append attachment if exists
      if (formData.adjunto instanceof Blob && formData.adjunto.size > 0) {
        formDataToSend.append("attachment", formData.adjunto);
      }

      await onSubmit(formDataToSend);
      resetForm();
    } catch (error) {
      toast.error("Error al procesar el gasto");
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
        `${process.env.NEXT_PUBLIC_API_URL}/accounts/?account_type=nomina`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) throw new Error("Error al cargar las cuentas");

      const data = await response.json();
      setLocalOptions((prev) => ({
        ...prev,
        accounts: data.map((account: any) => ({
          label: account.name,
          value: account.id,
        })),
      }));
    } catch (error) {
      toast.error("Error al cargar las cuentas");
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
            credentials: "include",
          }
        );

        if (!response.ok) throw new Error("Error al cargar responsables");

        const data = await response.json();
        setLocalOptions((prev) => ({
          ...prev,
          responsibles: data.map((responsible: any) => ({
            label: responsible.nombre_completo,
            value: responsible.id,
          })),
        }));
      } catch (error) {
        toast.error("Error al cargar responsables");
      } finally {
        setLocalLoading((prev) => ({ ...prev, responsibles: false }));
      }
    }, 300),
    []
  );

  const fetchProjects = useCallback(async () => {
    setLocalLoading((prev) => ({ ...prev, projects: true }));
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/projects`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) throw new Error("Error al cargar proyectos");

      const data = await response.json();
      setLocalOptions((prev) => ({
        ...prev,
        projects: data.map((project: any) => ({
          label: project.name,
          value: project.id,
        })),
      }));
    } catch (error) {
      toast.error("Error al cargar proyectos");
    } finally {
      setLocalLoading((prev) => ({ ...prev, projects: false }));
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    if (formData.proyecto) {
      fetchResponsibles(formData.proyecto);
    }
  }, [formData.proyecto, fetchResponsibles]);

  useEffect(() => {
    fetchProjects();
  }, []);

  // Options for dropdowns

  const empresaOptions = [
    { value: "SERSUPPORT", label: "SERSUPPORT" },
    { value: "PREBAM", label: "PREBAM" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="container"
    >
      <Card>
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

                <Select
                  label="Empresa"
                  name="empresa"
                  id="empresa"
                  options={empresaOptions}
                  onChange={handleSelectChange}
                  value={formData.empresa}
                  error={formErrors.empresa}
                />

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

                <div className="col-span-full">
                  <div className="mt-2">
                    <label
                      className={`
                        flex justify-center w-full h-32 px-4 transition 
                        bg-white border-2 border-gray-300 border-dashed rounded-md 
                        appearance-none cursor-pointer hover:border-gray-400 
                        focus:outline-none ${
                          formData.adjunto instanceof Blob &&
                          formData.adjunto.size > 0
                            ? "border-green-500"
                            : ""
                        }
                      `}
                    >
                      <span className="flex items-center space-x-2">
                        <Upload className="w-6 h-6 text-gray-600" />
                        <span className="font-medium text-gray-600">
                          {formData.adjunto instanceof Blob &&
                          formData.adjunto.size > 0
                            ? (formData.adjunto as File).name ||
                              "Archivo adjunto"
                            : "Arrastra un archivo o haz click aquí"}
                        </span>
                      </span>
                      <input
                        type="file"
                        name="adjunto"
                        className="hidden"
                        onChange={handleFileChange}
                        ref={fileInputRef}
                        accept=".pdf,.jpg,.jpeg,.png"
                      />
                    </label>
                    {formErrors.adjunto && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.adjunto}
                      </p>
                    )}
                  </div>
                </div>
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
