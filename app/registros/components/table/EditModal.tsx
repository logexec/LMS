/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo } from "react";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AccountProps,
  RequestProps,
  ResponsibleProps,
  TransportProps,
} from "@/utils/types";
import {
  CalendarIcon,
  Receipt,
  CreditCard,
  DollarSign,
  Briefcase,
  User,
  Car,
  Hash,
  FileText,
} from "lucide-react";

interface EditModalProps {
  row: RequestProps;
  onSave: (updatedRow: RequestProps) => void;
  onClose: () => void;
  accounts: AccountProps[];
  responsibles: ResponsibleProps[];
  vehicles: TransportProps[];
}

interface FormDataType {
  personnel_type: string;
  request_date: string;
  month: string;
  invoice_number: string;
  account_id: string;
  amount: string;
  project: string;
  responsible_id: string;
  vehicle_plate: string;
  vehicle_number: string;
  note: string;
}

// Función pura para procesar y eliminar duplicados
const removeDuplicates = <T extends { [key: string]: any }>(
  items: T[],
  keyField: string,
  sortField?: string
): T[] => {
  // Usar un objeto para rastrear elementos únicos por clave
  const uniqueMap: Record<string, T> = {};

  items.forEach((item) => {
    const key = item[keyField];
    if (key && !uniqueMap[key]) {
      uniqueMap[key] = item;
    }
  });

  // Convertir de vuelta a array
  const uniqueItems = Object.values(uniqueMap);

  // Ordenar si se especificó un campo de ordenamiento
  if (sortField) {
    return uniqueItems.sort((a, b) => {
      const valueA = a[sortField] || "";
      const valueB = b[sortField] || "";
      return valueA.toString().localeCompare(valueB.toString());
    });
  }

  return uniqueItems;
};

const EditModal = ({
  row,
  onSave,
  onClose,
  accounts,
  responsibles,
  vehicles,
}: EditModalProps) => {
  const [formData, setFormData] = useState<FormDataType>({
    personnel_type: row.personnel_type || "",
    request_date: row.request_date
      ? new Date(row.request_date).toISOString().split("T")[0]
      : "",
    month: row.month || "",
    invoice_number: row.invoice_number?.toString() || "",
    account_id: row.account_id || "",
    amount:
      typeof row.amount === "number" ? row.amount.toString() : row.amount || "",
    project: row.project || "",
    responsible_id: row.responsible_id || "",
    vehicle_plate: row.vehicle_plate || "",
    vehicle_number: row.vehicle_number || "",
    note: row.note || "",
  });

  // Procesamiento de datos único usando useMemo para evitar recálculos
  const uniqueAccounts = useMemo(
    () => removeDuplicates(accounts, "id", "name"),
    [accounts]
  );

  const uniqueResponsibles = useMemo(
    () => removeDuplicates(responsibles, "id", "nombre_completo"),
    [responsibles]
  );

  const uniqueVehicles = useMemo(
    () =>
      removeDuplicates(
        vehicles.filter((v) => v.vehicle_plate),
        "vehicle_plate",
        "vehicle_plate"
      ),
    [vehicles]
  );

  // Calcular rango de fechas permitido: 29 del mes pasado al 28 del mes en curso
  const { min: minDate, max: maxDate } = useMemo(() => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const minDate = new Date(currentYear, currentMonth - 1, 29);
    if (minDate.getMonth() !== (currentMonth - 1 + 12) % 12) {
      minDate.setDate(0); // Último día del mes pasado si no hay 29
    }
    const maxDate = new Date(currentYear, currentMonth, 28);
    return {
      min: minDate.toISOString().split("T")[0],
      max: maxDate.toISOString().split("T")[0],
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    const updatedRow: RequestProps = {
      ...row,
      personnel_type: formData.personnel_type,
      request_date: formData.request_date,
      month: row.month, // Mantener el valor original ya que no es editable
      invoice_number: formData.invoice_number,
      account_id: formData.account_id,
      // Convertir amount a number si es posible
      amount: formData.amount ? parseFloat(formData.amount) : 0,
      project: formData.project,
      responsible_id: formData.responsible_id,
      vehicle_plate: formData.vehicle_plate,
      vehicle_number: formData.vehicle_number,
      note: formData.note,
    };
    onSave(updatedRow);
    onClose();
  };

  // Función para traducir estados
  const getStatusText = (status: string): string => {
    const statusMap: Record<string, string> = {
      paid: "Pagado",
      pending: "Pendiente",
      rejected: "Rechazado",
      review: "Revisar",
      in_reposition: "En Reposición",
    };
    return statusMap[status] || status;
  };

  // Función para traducir tipo
  const getTypeText = (type: string): string => {
    return type === "discount" ? "Descuento" : "Gasto";
  };

  // Función para obtener clase de color según estado
  const getStatusClass = (status: string): string => {
    const statusClass: Record<string, string> = {
      paid: "bg-green-50 border-green-200 text-green-700",
      pending: "bg-yellow-50 border-yellow-200 text-yellow-700",
      rejected: "bg-red-50 border-red-200 text-red-700",
      review: "bg-blue-50 border-blue-200 text-blue-700",
      in_reposition: "bg-purple-50 border-purple-200 text-purple-700",
    };
    return statusClass[status] || "bg-gray-50 border-gray-200 text-gray-700";
  };

  // Función para obtener clase de color según tipo
  const getTypeClass = (type: string): string => {
    return type === "discount"
      ? "bg-indigo-50 border-indigo-200 text-indigo-700"
      : "bg-orange-50 border-orange-200 text-orange-700";
  };

  return (
    <DialogContent className="sm:max-w-[650px] p-0 overflow-hidden bg-white">
      <div className="bg-gradient-to-r from-rose-500 to-red-600 p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white flex items-center">
            Editando solicitud {row.unique_id}
          </DialogTitle>
          <p className="text-blue-100 text-sm mt-1">
            Completa los campos editables a continuación para actualizar la
            solicitud
          </p>
        </DialogHeader>
      </div>

      <div className="p-6">
        {/* Sección de información no editable */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div
            className={`flex flex-col rounded-lg border p-3 ${getTypeClass(
              row.type
            )}`}
          >
            <span className="text-xs font-medium uppercase tracking-wider opacity-75">
              Tipo
            </span>
            <span className="font-semibold mt-1">{getTypeText(row.type)}</span>
          </div>

          <div
            className={`flex flex-col rounded-lg border p-3 ${getStatusClass(
              row.status
            )}`}
          >
            <span className="text-xs font-medium uppercase tracking-wider opacity-75">
              Estado
            </span>
            <span className="font-semibold mt-1">
              {getStatusText(row.status)}
            </span>
          </div>

          <div className="flex flex-col rounded-lg border p-3 bg-gray-50 border-gray-200">
            <span className="text-xs font-medium uppercase tracking-wider text-gray-500">
              Mes/Rol
            </span>
            <span className="font-semibold mt-1 text-gray-700">
              {row.month || "No especificado"}
            </span>
          </div>
        </div>

        {/* Campos editables agrupados por secciones con iconos */}
        <div className="space-y-6">
          {/* Primera sección: Datos generales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label
                htmlFor="personnel_type"
                className="text-sm font-medium text-gray-700 flex items-center"
              >
                <User className="h-4 w-4 mr-1.5 text-gray-400" />
                Área
              </label>
              <Input
                id="personnel_type"
                name="personnel_type"
                value={formData.personnel_type}
                onChange={handleChange}
                className="w-full focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nómina / Transporte"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="request_date"
                className="text-sm font-medium text-gray-700 flex items-center"
              >
                <CalendarIcon className="h-4 w-4 mr-1.5 text-gray-400" />
                Fecha
              </label>
              <Input
                id="request_date"
                name="request_date"
                type="date"
                value={formData.request_date}
                onChange={handleChange}
                min={minDate}
                max={maxDate}
                className="w-full focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="invoice_number"
                className="text-sm font-medium text-gray-700 flex items-center"
              >
                <Receipt className="h-4 w-4 mr-1.5 text-gray-400" />
                Factura
              </label>
              <Input
                id="invoice_number"
                name="invoice_number"
                value={formData.invoice_number}
                onChange={handleChange}
                className="w-full focus:ring-blue-500 focus:border-blue-500"
                placeholder="Número de factura"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="account_id"
                className="text-sm font-medium text-gray-700 flex items-center"
              >
                <CreditCard className="h-4 w-4 mr-1.5 text-gray-400" />
                ID de cuenta
              </label>
              <Select
                value={formData.account_id}
                onValueChange={(value) =>
                  handleSelectChange("account_id", value)
                }
                disabled={uniqueAccounts.length === 0}
              >
                <SelectTrigger className="w-full focus:ring-blue-500 focus:border-blue-500">
                  <SelectValue placeholder="Selecciona una cuenta" />
                </SelectTrigger>
                <SelectContent>
                  {uniqueAccounts.length > 0 ? (
                    uniqueAccounts.map((account, index) => (
                      <SelectItem
                        key={`${account.id}-${index}`}
                        value={account.name}
                      >
                        {account.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="loading" disabled>
                      Cargando cuentas...
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Segunda sección: Datos de proyecto y montos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label
                htmlFor="amount"
                className="text-sm font-medium text-gray-700 flex items-center"
              >
                <DollarSign className="h-4 w-4 mr-1.5 text-gray-400" />
                Monto
              </label>
              <Input
                id="amount"
                name="amount"
                type="number"
                value={formData.amount}
                onChange={handleChange}
                className="w-full focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="project"
                className="text-sm font-medium text-gray-700 flex items-center"
              >
                <Briefcase className="h-4 w-4 mr-1.5 text-gray-400" />
                Proyecto
              </label>
              <Input
                id="project"
                name="project"
                value={formData.project}
                onChange={handleChange}
                className="w-full focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nombre del proyecto"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="responsible_id"
                className="text-sm font-medium text-gray-700 flex items-center"
              >
                <User className="h-4 w-4 mr-1.5 text-gray-400" />
                Responsable
              </label>
              <Select
                value={formData.responsible_id}
                onValueChange={(value) =>
                  handleSelectChange("responsible_id", value)
                }
                disabled={uniqueResponsibles.length === 0}
              >
                <SelectTrigger className="w-full focus:ring-blue-500 focus:border-blue-500">
                  <SelectValue placeholder="Selecciona un responsable" />
                </SelectTrigger>
                <SelectContent>
                  {uniqueResponsibles.length > 0 ? (
                    uniqueResponsibles.map((responsible, index) => (
                      <SelectItem
                        key={`${responsible.id}-${index}`}
                        value={responsible.nombre_completo}
                      >
                        {responsible.nombre_completo || responsible.id}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="loading" disabled>
                      Cargando responsables...
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tercera sección: Datos de vehículo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label
                htmlFor="vehicle_plate"
                className="text-sm font-medium text-gray-700 flex items-center"
              >
                <Car className="h-4 w-4 mr-1.5 text-gray-400" />
                Placa
              </label>
              <Select
                value={formData.vehicle_plate}
                onValueChange={(value) =>
                  handleSelectChange("vehicle_plate", value)
                }
                disabled={uniqueVehicles.length === 0}
              >
                <SelectTrigger className="w-full focus:ring-blue-500 focus:border-blue-500">
                  <SelectValue placeholder="Selecciona una placa" />
                </SelectTrigger>
                <SelectContent>
                  {uniqueVehicles.length > 0 ? (
                    uniqueVehicles.map((vehicle, index) => (
                      <SelectItem
                        key={`${vehicle.vehicle_plate}-${index}`}
                        value={vehicle.vehicle_plate}
                      >
                        {vehicle.vehicle_plate}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="loading" disabled>
                      Cargando placas...
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="vehicle_number"
                className="text-sm font-medium text-gray-700 flex items-center"
              >
                <Hash className="h-4 w-4 mr-1.5 text-gray-400" />
                No. Transporte
              </label>
              <Input
                id="vehicle_number"
                name="vehicle_number"
                value={formData.vehicle_number}
                onChange={handleChange}
                className="w-full focus:ring-blue-500 focus:border-blue-500"
                placeholder="Número de transporte"
              />
            </div>
          </div>

          {/* Cuarta sección: Notas */}
          <div className="space-y-2">
            <label
              htmlFor="note"
              className="text-sm font-medium text-gray-700 flex items-center"
            >
              <FileText className="h-4 w-4 mr-1.5 text-gray-400" />
              Nota
            </label>
            <Input
              id="note"
              name="note"
              value={formData.note}
              onChange={handleChange}
              className="w-full focus:ring-blue-500 focus:border-blue-500"
              placeholder="Observaciones adicionales"
            />
          </div>
        </div>
      </div>

      {/* Pie de modal con botones de acción */}
      <div className="flex justify-end items-center gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100">
        <Button
          variant="outline"
          onClick={onClose}
          className="px-4 border-gray-300 hover:bg-gray-100 hover:text-gray-700"
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          className="px-4 bg-blue-600 hover:bg-blue-700 text-white"
        >
          Guardar cambios
        </Button>
      </div>
    </DialogContent>
  );
};

export default React.memo(EditModal);
