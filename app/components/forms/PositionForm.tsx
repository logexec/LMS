import React from "react";
import { Modal } from "../Modal";
import Checkbox from "../Checkbox";

interface Permission {
  id: number;
  name: string;
}

interface Position {
  id?: number;
  name: string;
  description: string;
  permissions: number[];
  status: boolean;
}

interface PositionFormProps {
  mode: "create" | "edit";
  initialData?: Position;
  permissions: Permission[];
  isOpen: boolean;
  onSave: (data: Position) => Promise<void>;
  onCancel: () => void;
}

const INITIAL_FORM_STATE: Position = {
  name: "",
  description: "",
  permissions: [],
  status: true,
};

const PositionForm: React.FC<PositionFormProps> = ({
  mode,
  initialData,
  permissions,
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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const newValue =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    setFormData((prev) => ({ ...prev, [name]: newValue }));
  };

  const handlePermissionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const permissionId = parseInt(e.target.name);
    const { checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      permissions: checked
        ? [...prev.permissions, permissionId]
        : prev.permissions.filter((id) => id !== permissionId),
    }));
  };

  // Agrupar permisos por categoría
  const groupedPermissions = permissions.reduce((acc, permission) => {
    const category = permission.name.split("_")[0];
    if (!acc[category]) acc[category] = [];
    acc[category].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
  };

  return (
    <Modal isOpen={isOpen}>
      <h3 className="text-2xl text-slate-700">
        {mode === "create" ? "Crear Cargo" : "Editar Cargo"}
      </h3>
      <div className="h-[2px] my-2 bg-slate-200" />
      <form onSubmit={handleSubmit} className="w-full max-w-3xl">
        <div className="flex flex-col p-2 gap-6">
          <div className="grid grid-cols-2 gap-4">
            {/* Información básica */}
            <div className="space-y-4">
              <div className="flex flex-col">
                <label htmlFor="name" className="text-slate-700 text-sm">
                  Nombre del Cargo
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  className="border-b-2 border-gray-300 outline-hidden focus:border-sky-300 transition-all duration-300"
                  placeholder="Ej: Gerente de Operaciones"
                  onChange={handleInputChange}
                  value={formData.name}
                  required
                />
              </div>

              <div className="flex flex-col">
                <label htmlFor="description" className="text-slate-700 text-sm">
                  Descripción
                </label>
                <textarea
                  name="description"
                  id="description"
                  rows={4}
                  className="border-2 border-gray-300 rounded-md p-2 outline-hidden focus:border-sky-300 transition-all duration-300"
                  placeholder="Descripción del cargo y sus responsabilidades"
                  onChange={handleInputChange}
                  value={formData.description}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="status"
                  id="status"
                  checked={formData.status}
                  onChange={handleInputChange}
                  className="w-4 h-4"
                />
                <label htmlFor="status" className="text-slate-700 text-sm">
                  Cargo Activo
                </label>
              </div>
            </div>

            {/* Permisos */}
            <div className="space-y-4">
              <h4 className="text-slate-700 text-sm font-medium">
                Permisos asignados al cargo
              </h4>
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-4">
                {Object.entries(groupedPermissions).map(([category, perms]) => (
                  <div key={category} className="space-y-2">
                    <h5 className="text-sm font-medium text-slate-600 capitalize">
                      {category}
                    </h5>
                    <div className="grid grid-cols-2 gap-2">
                      {perms.map((permission) => (
                        <Checkbox
                          key={permission.id}
                          label={permission.name.split("_").join(" ")}
                          name={permission.id.toString()}
                          id={`permission-${permission.id}`}
                          checked={formData.permissions.includes(permission.id)}
                          onChange={handlePermissionChange}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-row mt-4 w-full items-center justify-between">
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
