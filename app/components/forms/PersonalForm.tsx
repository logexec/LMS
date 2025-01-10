import React from "react";
import { Modal } from "../Modal";
import { BaseTableData } from "../DataTable";

// Domain Models. | Actualizar con los campos necesarios
interface Personal extends BaseTableData {
  nombres: string;
  apellidos: string;
  correo_electronico: string;
  proyecto?: string;
  cargo_logex: string;
  estado_personal: string;
}

type FormMode = "create" | "edit";

interface PersonalFormProps {
  mode: FormMode;
  initialData?: Personal;
  isOpen: boolean;
  onSave: (data: Personal) => void;
  onCancel: () => void;
}

const INITIAL_FORM_STATE: Personal = {
  id: "",
  nombres: "",
  apellidos: "",
  correo_electronico: "",
  cargo_logex: "usuario",
  estado_personal: "activo",
  proyecto: "",
};

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
              <label htmlFor="nombres" className="text-slate-700 text-sm">
                Nombres
              </label>
              <input
                type="text"
                name="nombres"
                id="nombres"
                className="border-b-2 border-gray-300 outline-none focus:border-sky-300 transition-all duration-300"
                placeholder="John"
                onChange={handleInputChange}
                value={formData.nombres}
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="apellidos" className="text-slate-700 text-sm">
                Apellidos
              </label>
              <input
                type="text"
                name="apellidos"
                id="apellidos"
                className="border-b-2 border-gray-300 outline-none focus:border-sky-300 transition-all duration-300"
                placeholder="Kenyon"
                onChange={handleInputChange}
                value={formData.apellidos}
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="cargo_logex" className="text-slate-700 text-sm">
                Rol
              </label>
              <select
                id="cargo_logex"
                name="cargo_logex"
                className="w-[8rem] p-1 text-sm outline-none -mt-1 bg-transparent focus:outline focus:outline-sky-300 rounded"
                onChange={handleInputChange}
                value={formData.cargo_logex}
              >
                <option value="usuario">Usuario</option>
                <option value="administrador">Administrador</option>
                <option value="developer">Desarrollador</option>
              </select>
            </div>
          </div>

          {/* Segunda fila */}
          <div className="flex flex-row gap-2">
            <div className="flex flex-col">
              <label htmlFor="id" className="text-slate-700 text-sm">
                Identificación
              </label>
              <input
                type="text"
                name="id"
                id="id"
                className="border-b-2 border-gray-300 outline-none focus:border-sky-300 transition-all duration-300"
                placeholder="1234567890"
                onChange={handleInputChange}
                value={formData.id}
              />
            </div>
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
            <div className="flex flex-col">
              <label
                htmlFor="estado_personal"
                className="text-slate-700 text-sm"
              >
                Estado
              </label>
              <select
                id="estado_personal"
                name="estado_personal"
                className="w-[8rem] text-sm outline-none p-1 bg-transparent focus:outline focus:outline-sky-300 rounded"
                onChange={handleInputChange}
                value={formData.estado_personal}
              >
                <option value="activo">Activo</option>
                <option value="cesante">Cesante</option>
              </select>
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
