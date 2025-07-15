import React from "react";
import { Modal } from "../Modal";
import Checkbox from "../Checkbox";

interface Permission {
  id: number;
  name: string;
}

interface Role {
  id: number;
  name: string;
}

interface User {
  name: string;
  email: string;
  password?: string;
  role_id: number;
  permissions: number[];
}

interface UserFormProps {
  mode: "create" | "edit";
  initialData?: User;
  roles: Role[];
  permissions: Permission[];
  isOpen: boolean;
  onSave: (data: User) => Promise<void>;
  onCancel: () => void;
}

const INITIAL_FORM_STATE: User = {
  name: "",
  email: "",
  password: "",
  role_id: 0,
  permissions: [],
};

const UserForm: React.FC<UserFormProps> = ({
  mode,
  initialData,
  roles,
  permissions,
  isOpen,
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = React.useState<User>(
    initialData || INITIAL_FORM_STATE
  );
  const [confirmPassword, setConfirmPassword] = React.useState("");

  React.useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setConfirmPassword("");
    } else {
      setFormData(INITIAL_FORM_STATE);
      setConfirmPassword("");
    }
  }, [initialData, isOpen]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password && formData.password !== confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }

    await onSave(formData);
  };

  // Agrupar permisos por categoría
  const groupedPermissions = permissions.reduce((acc, permission) => {
    const category = permission.name.split("_")[0];
    if (!acc[category]) acc[category] = [];
    acc[category].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <Modal isOpen={isOpen}>
      <h3 className="text-2xl text-slate-700">
        {mode === "create" ? "Crear Usuario" : "Editar Usuario"}
      </h3>
      <div className="h-[2px] my-2 bg-slate-200" />
      <form onSubmit={handleSubmit} className="w-full max-w-3xl">
        <div className="flex flex-col p-2 gap-6">
          <div className="grid grid-cols-2 gap-4">
            {/* Información básica */}
            <div className="space-y-4">
              <div className="flex flex-col">
                <label htmlFor="name" className="text-slate-700 text-sm">
                  Nombre
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  className="border-b-2 border-gray-300 outline-hidden focus:border-sky-300 transition-all duration-300"
                  placeholder="Nombre completo"
                  onChange={handleInputChange}
                  value={formData.name}
                  required
                />
              </div>

              <div className="flex flex-col">
                <label htmlFor="email" className="text-slate-700 text-sm">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  className="border-b-2 border-gray-300 outline-hidden focus:border-sky-300 transition-all duration-300"
                  placeholder="usuario@logex.ec"
                  onChange={handleInputChange}
                  value={formData.email}
                  required
                />
              </div>

              {mode === "create" && (
                <>
                  <div className="flex flex-col">
                    <label
                      htmlFor="password"
                      className="text-slate-700 text-sm"
                    >
                      Contraseña
                    </label>
                    <input
                      type="password"
                      name="password"
                      id="password"
                      className="border-b-2 border-gray-300 outline-hidden focus:border-sky-300 transition-all duration-300"
                      onChange={handleInputChange}
                      value={formData.password}
                      required
                    />
                  </div>

                  <div className="flex flex-col">
                    <label
                      htmlFor="confirmPassword"
                      className="text-slate-700 text-sm"
                    >
                      Confirmar Contraseña
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      id="confirmPassword"
                      className="border-b-2 border-gray-300 outline-hidden focus:border-sky-300 transition-all duration-300"
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      value={confirmPassword}
                      required
                    />
                  </div>
                </>
              )}

              <div className="flex flex-col">
                <label htmlFor="role_id" className="text-slate-700 text-sm">
                  Rol
                </label>
                <select
                  name="role_id"
                  id="role_id"
                  className="border-b-2 border-gray-300 outline-hidden focus:border-sky-300 transition-all duration-300"
                  onChange={handleInputChange}
                  value={formData.role_id}
                  required
                >
                  <option value="">Seleccionar rol</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Permisos */}
            <div className="space-y-4">
              <h4 className="text-slate-700 text-sm font-medium">Permisos</h4>
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

export default UserForm;
