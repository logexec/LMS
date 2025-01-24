import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import Input from "../Input";
import Select from "../Select";
import { EmployeeTable } from "./EmployeeTable";
import {
  MassiveFormData,
  LoadingState,
  OptionsState,
  Employee,
  MassiveRequestData,
} from "@/utils/types";
import Datalist from "../Datalist";
import { Modal } from "../Modal";

interface MassDiscountFormProps {
  options: OptionsState;
  loading: LoadingState;
  onSubmit: (data: MassiveRequestData) => Promise<void>;
}

const MassDiscountForm: React.FC<MassDiscountFormProps> = ({
  options,
  loading,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<MassiveFormData>({
    fechaGasto: new Date().toISOString().split("T")[0],
    tipo: "nomina",
    factura: "",
    cuenta: "",
    valor: "",
    proyecto: "",
    area: "",
    observacion: "",
  });

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Estado local para las cuentas
  const [localOptions, setLocalOptions] = React.useState<OptionsState>({
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
  });

  const fetchEmployees = async (proyecto: string, area: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/responsibles?proyecto=${proyecto}&area=${area}`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) throw new Error("Error al cargar empleados");

      const data = await response.json();
      setEmployees(
        data.map((emp: any) => ({
          name: emp.nombres,
          area: emp.area,
          project: emp.proyecto,
          selected: false,
        }))
      );
    } catch (error) {
      console.error("Error fetching employees:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (formData.proyecto && formData.area) {
      fetchEmployees(formData.proyecto, formData.area);
    }
  }, [formData.proyecto, formData.area]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const selectedEmployeeIds = employees
      .filter((emp) => emp.selected)
      .map((emp) => emp.id);

    if (selectedEmployeeIds.length === 0) {
      return <Modal>Por favor, selecciona al menos un empleado</Modal>;
    }

    const requestData: MassiveRequestData = {
      type: "massive_discount",
      request_date: formData.fechaGasto,
      invoice_number: formData.factura,
      account_id: formData.cuenta,
      total_amount: formData.valor,
      project: formData.proyecto,
      area: formData.area,
      employees: selectedEmployeeIds,
      note: formData.observacion,
    };

    await onSubmit(requestData);
  };

  return (
    <>
      <div className="flex w-full mr-3">
        <div className="w-1/4">
          <h3 className="text-slate-700 text-sm font-bold">
            ¿Descuentos masivos?
          </h3>
          <p className="text-sm text-slate-500">
            <strong>
              <i>Todos</i>
            </strong>{" "}
            los campos son obligatorios.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="w-3/4 ml-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
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
            />

            <Select
              label="Tipo"
              name="tipo"
              id="tipo"
              value="nomina"
              options={[{ value: "nomina", label: "Nómina" }]}
              disabled
            />

            <Select
              label="Proyecto"
              name="proyecto"
              id="proyecto"
              value={formData.proyecto}
              options={options.projects}
              onChange={handleSelectChange}
              disabled={loading.projects}
            />

            <Select
              label="Área"
              name="area"
              id="area"
              value={formData.area}
              options={options.areas}
              onChange={handleSelectChange}
              disabled={!formData.proyecto || loading.areas}
            />

            <Select
              label="Cuenta"
              name="cuenta"
              id="cuenta"
              value={formData.cuenta}
              options={localOptions.accounts}
              onChange={handleSelectChange}
              disabled={loading.accounts}
            />

            <Input
              required
              type="number"
              id="factura"
              name="factura"
              value={formData.factura}
              onChange={handleInputChange}
              label="No. Factura o Vale"
            />

            <Input
              required
              type="number"
              step="0.01"
              id="valor"
              name="valor"
              value={formData.valor}
              onChange={handleInputChange}
              label="Valor Total"
            />

            <Input
              required
              type="text"
              id="observacion"
              name="observacion"
              value={formData.observacion}
              onChange={handleInputChange}
              label="Observación"
            />
          </div>

          {employees.length > 0 && (
            <div className="mt-6">
              <div className="flex justify-end space-x-2 mb-2">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Seleccionar todos
                </button>
                <button
                  type="button"
                  onClick={handleDeselectAll}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Deseleccionar todos
                </button>
              </div>
              <EmployeeTable
                employees={employees}
                totalAmount={Number(formData.valor) || 0}
                onSelectionChange={handleSelectionChange}
                isLoading={isLoading}
              />
            </div>
          )}

          <div className="flex w-full items-center justify-end gap-5 mt-6">
            <button
              type="submit"
              className="bg-red-600 hover:bg-red-700 text-white py-1 px-4 rounded font-semibold shadow-md hover:shadow-none transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading.submit || isLoading || employees.length === 0}
            >
              {loading.submit ? "Procesando..." : "Registrar Descuento Masivo"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default MassDiscountForm;
