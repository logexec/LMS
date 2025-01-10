import React from "react";
import { Modal } from "../Modal";

// Domain Models. | Actualizar con los campos necesarios
interface Position {
  id: string | number;
  cargo: string;
}

type FormMode = "create" | "edit";

interface PositionFormProps {
  mode: FormMode;
  initialData?: Position;
  isOpen: boolean;
  onSave: (data: Position) => void;
  onCancel: () => void;
}

const INITIAL_FORM_STATE: Position = {
  id: "",
  cargo: "",
};

const PositionForm: React.FC<PositionFormProps> = ({
  mode,
  initialData,
  isOpen,
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = React.useState<Position>(
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
        {mode === "create" ? "Agregar Position" : "Editar Position"}
      </h3>
      <div className="h-[2px] my-2 bg-slate-200" />
      <form onSubmit={handleSubmit} className="w-96">
        <div className="flex flex-col p-2 gap-6">
          <div className="flex flex-row gap-2">
            <div className="flex flex-col">
              <label htmlFor="cargo" className="text-slate-700 text-sm">
                Cargo
              </label>
              <input
                type="text"
                name="cargo"
                id="cargo"
                className="border-b-2 border-gray-300 outline-none focus:border-sky-300 transition-all duration-300"
                placeholder="Desarrollador"
                onChange={handleInputChange}
                value={formData.cargo}
              />
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

export default PositionForm;
