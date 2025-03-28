/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import Input from "../Input";
import Select from "../Select";
import Datalist from "../Datalist";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import {
  LoanFormData,
  LoadingState,
  OptionsState,
  Installment,
  ResponsibleProps,
  TransportProps,
  AccountProps,
} from "@/utils/types";
import { apiService } from "@/services/api.service";
import { SubmitFile } from "@/app/registros/components/table/SubmitFile";
import { getAuthToken } from "@/services/auth.service";
import { debounce } from "lodash";

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
    [formData.type] // Dependencia necesaria porque se usa en la lógica
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
        }
      }, 300),
    []
  );

  const fetchTransports = useCallback(async () => {
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
      setVehicles(
        data.map((vehicle: TransportProps) => ({
          label: vehicle.name,
          value: vehicle.id,
        }))
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Error al cargar los transportes"
      );
    }
  }, []);

  const fetchAccounts = useCallback(async () => {
    try {
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
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Formulario de Préstamo</CardTitle>
          <CardDescription>
            Completa los datos del préstamo y define las fechas de las cuotas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Todos los campos son obligatorios. Selecciona fechas a partir
                  del mes actual.
                </AlertDescription>
              </Alert>
            </div>

            <div className="md:col-span-2">
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Select
                    label="Tipo"
                    name="type"
                    id="type"
                    value={formData.type}
                    options={[
                      { value: "nomina", label: "Nómina" },
                      { value: "proveedor", label: "Proveedor" },
                    ]}
                    onChange={handleInputChange}
                    error={formErrors.type}
                  />

                  <Datalist
                    label="Proyecto"
                    name="project"
                    id="project"
                    value={formData.project}
                    options={options.projects}
                    onChange={handleInputChange}
                    disabled={loading.projects}
                    error={formErrors.project}
                  />

                  <Datalist
                    label="Cuenta"
                    name="account_id"
                    id="account_id"
                    value={formData.account_id}
                    options={accounts}
                    onChange={handleInputChange}
                    disabled={loading.accounts}
                    error={formErrors.account_id}
                  />

                  <Input
                    required
                    type="number"
                    step="0.01"
                    id="amount"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    label="Monto Total"
                    error={formErrors.amount}
                  />

                  <Input
                    required
                    type="text"
                    id="invoice_number"
                    name="invoice_number"
                    value={formData.invoice_number}
                    onChange={handleInputChange}
                    label="Número de Factura"
                    error={formErrors.invoice_number}
                  />

                  <Input
                    required
                    type="number"
                    id="installments"
                    name="installments"
                    value={formData.installments}
                    onChange={handleInputChange}
                    label="Número de Cuotas"
                    error={formErrors.installments}
                  />

                  {formData.type === "nomina" ? (
                    <Datalist
                      label="Responsable"
                      name="responsible_id"
                      id="responsible_id"
                      value={formData.responsible_id ?? ""}
                      options={responsibles}
                      onChange={handleInputChange}
                      disabled={loading.responsibles || !formData.project}
                      error={formErrors.responsible_id}
                    />
                  ) : (
                    <Datalist
                      label="Vehículo"
                      name="vehicle_id"
                      id="vehicle_id"
                      value={formData.vehicle_id ?? ""}
                      options={vehicles}
                      onChange={handleInputChange}
                      disabled={loading.transports}
                      error={formErrors.vehicle_id}
                    />
                  )}

                  <Input
                    required
                    type="text"
                    id="note"
                    name="note"
                    value={formData.note}
                    onChange={handleInputChange}
                    label="Observación"
                    error={formErrors.note}
                    className="col-span-full"
                  />
                </div>

                {installments.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-2">
                      Fechas de Cuotas
                    </h3>
                    {formErrors.installment_dates && (
                      <p className="text-red-500 text-sm mb-2">
                        {formErrors.installment_dates}
                      </p>
                    )}
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border p-2 text-left">Cuota</th>
                          <th className="border p-2 text-left">Monto</th>
                          <th className="border p-2 text-left">Fecha</th>
                        </tr>
                      </thead>
                      <tbody>
                        {installments.map((inst, index) => (
                          <tr key={index} className="border-b">
                            <td className="border p-2">Cuota {index + 1}</td>
                            <td className="border p-2">
                              ${inst.amount.toFixed(2)}
                            </td>
                            <td className="border p-2">
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
                                className="w-full p-1 border rounded"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {formErrors.attachment && (
                  <p className="text-red-500 text-sm mt-2">
                    {formErrors.attachment}
                  </p>
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
                  <SubmitFile
                    customText="Generar préstamo"
                    showBadge={false}
                    onCreateReposicion={handleCreateLoan}
                    isLoading={isLoading}
                    selectedRequests={[]}
                  />
                </div>
              </form>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default LoanForm;
