"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Input from "../Input";
import Select from "../Select";
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
import { Loader2, AlertCircle, Upload } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import debounce from "lodash/debounce";
import Datalist from "../Datalist";
import { getAuthToken } from "@/services/auth.service";

export interface MassDiscountFormProps {
  options: OptionsState;
  loading: LoadingState;
  onSubmit: (data: RequestData | FormData) => Promise<void>;
}

const MassDiscountForm: React.FC<MassDiscountFormProps> = ({
  options,
  loading,
  onSubmit,
}) => {
  const [massFormData, setMassFormData] = useState<MassiveFormData>({
    fechaGasto: new Date().toISOString().split("T")[0],
    tipo: "nomina",
    factura: "",
    cuenta: "",
    valor: "",
    proyecto: "",
    area: "",
    responsable: "",
    transporte: "",
    adjunto: new Blob([]),
    observacion: "",
  });

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const localOptions: OptionsState = {
    accounts: [
      {
        label: "Recuperación Valores Comisión de Reparto",
        value: "19",
      },
      {
        label: "Faltantes por Cobrar Empleados y Transportistas",
        value: "8",
      },
    ],
    projects: [],
    responsibles: [],
    transports: [],
    areas: [],
  };

  const fetchEmployees = useCallback(
    debounce(async (proyecto: string, area: string) => {
      if (!proyecto || !area) return;

      setIsLoading(true);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/responsibles?proyecto=${proyecto}&area=${area}&fields=id,nombre_completo,area,proyecto`,
          {
            headers: {
              Authorization: `Bearer ${getAuthToken()}`,
            },
            credentials: "include",
          }
        );

        if (!response.ok) throw new Error("Error al cargar empleados");

        const data = await response.json();
        setEmployees(
          data.map(
            (emp: {
              id: string;
              nombre_completo: string;
              area: string;
              proyecto: string;
            }) => ({
              id: emp.id,
              name: emp.nombre_completo,
              area: emp.area,
              project: emp.proyecto,
              selected: false,
            })
          )
        );
      } catch (error) {
        toast.error("Error al cargar los empleados");
        console.error("Error fetching employees:", error);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    if (massFormData.proyecto && massFormData.area) {
      fetchEmployees(massFormData.proyecto, massFormData.area);
    }
  }, [massFormData.proyecto, massFormData.area, fetchEmployees]);

  const validateField = (name: string, value: string) => {
    const errors: Record<string, string> = {};

    switch (name) {
      case "valor":
        if (parseFloat(value) <= 0) {
          errors[name] = "El valor debe ser mayor a 0";
        } else {
          errors[name] = "";
        }
        break;
      case "factura":
        if (value.length < 3) {
          errors[name] =
            "El número de factura debe tener al menos 3 caracteres";
        } else {
          errors[name] = "";
        }
        break;
      case "adjunto":
        if (
          !(massFormData.adjunto instanceof File) ||
          !(massFormData.adjunto instanceof Blob)
        ) {
          errors[name] = "El adjunto es obligatorio";
        } else {
          errors[name] = "";
        }
        break;
    }

    setFormErrors((prev) => ({
      ...prev,
      ...errors,
    }));

    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setMassFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    validateField(name, value);
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setMassFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    validateField(name, value);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    setMassFormData((prev) => ({
      ...prev,
      adjunto: file,
    }));
    validateField("adjunto", "");
  };

  const handleSelectionChange = (employeeId: string) => {
    setEmployees((prev) =>
      prev.map((emp) =>
        emp.id === employeeId ? { ...emp, selected: !emp.selected } : emp
      )
    );
  };

  const handleSelectAll = () => {
    setEmployees((prev) => prev.map((emp) => ({ ...emp, selected: true })));
  };

  const handleDeselectAll = () => {
    setEmployees((prev) => prev.map((emp) => ({ ...emp, selected: false })));
  };

  const resetForm = () => {
    setMassFormData({
      fechaGasto: new Date().toISOString().split("T")[0],
      tipo: "nomina",
      factura: "",
      cuenta: "",
      valor: "",
      proyecto: "",
      area: "",
      responsable: "",
      transporte: "",
      adjunto: new Blob([]),
      observacion: "",
    });
    setEmployees([]);
    setFormErrors({});
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const selectedEmployees = employees.filter((emp) => emp.selected);
    if (selectedEmployees.length === 0) {
      toast.error("Debes seleccionar al menos un empleado");
      return;
    }

    if (!(massFormData.adjunto instanceof File)) {
      toast.error("Debes adjuntar un documento");
      return;
    }

    setIsLoading(true);

    try {
      const amountPerEmployee = (
        parseFloat(massFormData.valor) / selectedEmployees.length
      ).toFixed(2);

      // Crear una solicitud individual para cada empleado
      const requests = selectedEmployees.map(async (employee) => {
        const formData = new FormData();
        formData.append("request_date", massFormData.fechaGasto);
        formData.append("type", "discount");
        formData.append("status", "pending");
        formData.append("invoice_number", massFormData.factura);
        formData.append("account_id", massFormData.cuenta);
        formData.append("amount", amountPerEmployee);
        formData.append("project", massFormData.proyecto);
        formData.append("responsible_id", employee.id);
        formData.append("transport_id", "");
        formData.append("attachment", massFormData.adjunto);
        formData.append("note", massFormData.observacion);
        formData.append("personnel_type", "nomina");

        return onSubmit(formData);
      });

      await Promise.all(requests);
      toast.success(
        `${selectedEmployees.length} descuentos registrados exitosamente`
      );
      resetForm();
    } catch (error) {
      toast.error("Error al procesar los descuentos");
      console.error("Error processing discounts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid =
    Object.keys(formErrors).length === 0 &&
    massFormData.valor &&
    massFormData.factura &&
    massFormData.adjunto instanceof File;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Descuento Masivo</CardTitle>
          <CardDescription>
            Completa el formulario y selecciona los empleados para aplicar el
            descuento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Completa todos los campos y selecciona al menos un empleado
                  para continuar.
                </AlertDescription>
              </Alert>
            </div>

            <div className="md:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Input
                    required
                    id="fechaGasto"
                    name="fechaGasto"
                    currentDate={true}
                    label="Fecha del Gasto"
                    type="date"
                    value={massFormData.fechaGasto}
                    onChange={handleInputChange}
                    allowPastDates={false}
                    error={formErrors.fechaGasto}
                  />

                  <Select
                    label="Tipo"
                    name="tipo"
                    id="tipo"
                    value="nomina"
                    options={[{ value: "nomina", label: "Nómina" }]}
                    disabled
                  />

                  <Datalist
                    label="Proyecto"
                    name="proyecto"
                    id="proyecto"
                    value={massFormData.proyecto}
                    options={options.projects}
                    onChange={handleInputChange}
                    disabled={loading.projects}
                    error={formErrors.proyecto}
                  />

                  <Select
                    label="Área"
                    name="area"
                    id="area"
                    value={massFormData.area}
                    options={options.areas}
                    onChange={handleSelectChange}
                    disabled={!massFormData.proyecto || loading.areas}
                    error={formErrors.area}
                  />

                  <Datalist
                    label="Cuenta"
                    name="cuenta"
                    id="cuenta"
                    value={massFormData.cuenta}
                    options={localOptions.accounts}
                    onChange={handleInputChange}
                    error={formErrors.cuenta}
                  />

                  <Input
                    required
                    type="number"
                    id="factura"
                    name="factura"
                    value={massFormData.factura}
                    onChange={handleInputChange}
                    label="No. Factura o Vale"
                    error={formErrors.factura}
                  />

                  <Input
                    required
                    type="number"
                    step="0.01"
                    id="valor"
                    name="valor"
                    value={massFormData.valor}
                    onChange={handleInputChange}
                    label="Valor Total"
                    error={formErrors.valor}
                  />

                  <Input
                    required
                    type="text"
                    id="observacion"
                    name="observacion"
                    value={massFormData.observacion}
                    onChange={handleInputChange}
                    label="Observación"
                    error={formErrors.observacion}
                    className="col-span-full"
                  />
                </div>

                <div className="col-span-full">
                  <Label htmlFor="adjunto">Adjuntar Documento</Label>
                  <div className="mt-2">
                    <label
                      className={`
                          flex justify-center w-full h-32 px-4 transition 
                          bg-white border-2 border-gray-300 border-dashed rounded-md 
                          appearance-none cursor-pointer hover:border-gray-400 
                          focus:outline-none ${
                            massFormData.adjunto instanceof File
                              ? "border-green-500"
                              : ""
                          }
                        `}
                    >
                      <span className="flex items-center space-x-2">
                        <Upload className="w-6 h-6 text-gray-600" />
                        <span className="font-medium text-gray-600">
                          {massFormData.adjunto instanceof File
                            ? massFormData.adjunto.name
                            : "Arrastra un archivo o haz click aquí"}
                        </span>
                      </span>
                      <input
                        type="file"
                        name="adjunto"
                        className="hidden"
                        onChange={handleFileChange}
                        ref={fileInputRef}
                      />
                    </label>
                  </div>
                </div>

                {massFormData.proyecto && massFormData.area && (
                  <div className="mt-6">
                    <MassDiscountTable
                      employees={employees}
                      totalAmount={Number(massFormData.valor) || 0}
                      onSelectionChange={handleSelectionChange}
                      isLoading={isLoading}
                      onSelectAll={handleSelectAll}
                      onDeselectAll={handleDeselectAll}
                    />
                  </div>
                )}

                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                    disabled={loading.submit}
                  >
                    Limpiar
                  </Button>
                  <Button
                    type="submit"
                    disabled={
                      loading.submit ||
                      !isFormValid ||
                      employees.filter((e) => e.selected).length === 0
                    }
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {loading.submit ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Registrando descuentos...
                      </>
                    ) : (
                      "Registrar Descuento Masivo"
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default MassDiscountForm;
