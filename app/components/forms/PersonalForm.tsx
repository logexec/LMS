import { PersonalForm as IPersonalForm, PrimitiveType } from "@/utils/types";

import React from "react";
import { Modal } from "../Modal";
import Checkbox from "../Checkbox";

interface PersonalFormProps {
  mode: "create" | "edit";
  initialData?: IPersonalForm;
  isOpen: boolean;
  onSave: (data: IPersonalForm) => Promise<void> | void;
  onCancel: () => void;
}

const INITIAL_FORM_STATE: IPersonalForm = {
  correo_electronico: "",
  permisos: [],
};
interface Personal {
  correo_electronico: string;
  permisos: string[];
  [key: string]: PrimitiveType;
}

const PersonalForm: React.FC<PersonalFormProps> = ({
  mode,
  initialData,
  isOpen,
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = React.useState<Personal>(
    initialData || INITIAL_FORM_STATE
  );

  // Lista de permisos disponibles
  const PERMISOS_DISPONIBLES = [
    { id: "admin", label: "Admin" },
    { id: "revisar", label: "Revisar" },
    { id: "pagar", label: "Pagar" },
  ];

  React.useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData(INITIAL_FORM_STATE);
    }
  }, [initialData, isOpen]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Nuevo manejador para checkboxes
  const handlePermissionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      permisos: checked
        ? [...prev.permisos, name] // Agregar permiso
        : prev.permisos.filter((permiso) => permiso !== name), // Remover permiso
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Modal isOpen={isOpen}>
      <h3 className="text-2xl text-slate-700">
        {mode === "create" ? "Agregar Personal" : "Editar Personal"}
      </h3>
      <div className="h-[2px] my-2 bg-slate-200" />
      <form onSubmit={handleSubmit} className="w-full">
        <div className="flex flex-col p-2 gap-6">
          {/* Primera fila */}
          <div className="flex flex-row gap-2">
            <div className="flex flex-col">
              <label
                htmlFor="correo_electronico"
                className="text-slate-700 text-sm"
              >
                Email
              </label>
              <input
                type="email"
                name="correo_electronico"
                id="correo_electronico"
                className="border-b-2 border-gray-300 outline-none focus:border-sky-300 transition-all duration-300"
                placeholder="alguien@logex.ec"
                onChange={handleInputChange}
                value={formData.correo_electronico}
              />
            </div>
            <div className="flex flex-col pl-3">
              <h3 className="text-slate-700 text-sm">Permisos</h3>
              <div className="flex flex-row gap-3">
                {PERMISOS_DISPONIBLES.map(({ id, label }) => (
                  <Checkbox
                    key={id}
                    label={label}
                    name={id}
                    id={id}
                    checked={formData.permisos.includes(label)}
                    onChange={handlePermissionChange}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-row mt-2 w-full items-center justify-between">
            <button
              type="button"
              className="btn btn-negative w-32"
              onClick={onCancel}
            >
              Cancelar
            </button>
            <button type="submit" className="btn w-32">
              Guardar
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default PersonalForm;
