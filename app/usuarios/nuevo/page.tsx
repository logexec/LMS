"use client";
import Checkbox from "@/app/components/Checkbox";
import Hr from "@/app/components/Hr";
import Input from "@/app/components/Input";
import Select from "@/app/components/Select";
import React, { useEffect, useState } from "react";

interface Role {
  id: number;
  name: string;
}

interface Option {
  label: string;
  value: number;
}

interface Permission {
  id: number;
  name: string;
}

interface RolePermissions {
  [key: number]: number[];
}

interface FormData {
  name: string;
  dob: string;
  email: string;
  role_id: number;
  password: string;
  permissions: number[];
}

const INITIAL_FORM_DATA: FormData = {
  name: "",
  dob: "",
  email: "",
  role_id: 0,
  password: "L0g3X2025*",
  permissions: [],
};

const defaultRolePermissions: RolePermissions = {
  1: [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
  ], // Admin - todos los permisos
  2: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21], // developer - ver usuarios
  3: [6, 7], // user - ver y editar usuarios
  4: [7, 9, 11, 13, 15], // revisar - ver y editar usuarios
  5: [2, 4], // pagar - ver y editar usuarios
};

const formatPermissionName = (permission: string): string => {
  const permissionMap: Record<string, string> = {
    manage_users: "Administrar Usuarios",
    view_users: "Ver Usuarios",
    create_users: "Crear Usuarios",
    edit_users: "Editar Usuarios",
    delete_users: "Eliminar Usuarios",
    register_income: "Registrar Ingresos",
    view_income: "Ver Ingresos",
    edit_income: "Editar Ingresos",
    view_discounts: "Ver Descuentos",
    manage_discounts: "Administrar Descuentos",
    view_expenses: "Ver Gastos",
    manage_expenses: "Administrar Gastos",
    view_requests: "Ver Solicitudes",
    manage_requests: "Administrar Solicitudes",
    view_reports: "Ver Reportes",
    manage_reports: "Administrar Reportes",
    manage_special_income: "Administrar Ingresos Especiales",
    view_budget: "Ver Presupuesto",
    manage_budget: "Administrar Presupuesto",
    manage_provisions: "Administrar Provisiones",
    manage_support: "Administrar Soporte",
  };

  return permissionMap[permission] || "";
};

const UserManagementPage: React.FC = () => {
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [roles, setRoles] = useState<Option[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [previousRole, setPreviousRole] = useState<number>(0);

  const fetchData = async (): Promise<void> => {
    try {
      const [rolesResponse, permissionsResponse] = await Promise.all([
        fetch("http://localhost:8000/api/roles"),
        fetch("http://localhost:8000/api/permissions-list"),
      ]);

      if (!rolesResponse.ok || !permissionsResponse.ok) {
        throw new Error("Failed to fetch data");
      }

      const [rolesData, permissionsData] = await Promise.all([
        rolesResponse.json() as Promise<Role[]>,
        permissionsResponse.json() as Promise<Permission[]>,
      ]);

      setRoles(
        rolesData.map((role) => ({
          label: role.name,
          value: role.id,
        }))
      );
      setPermissions(permissionsData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    void fetchData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ): void => {
    const newRoleId = Number(e.target.value);

    if (previousRole !== newRoleId || formData.permissions.length === 0) {
      setFormData((prev) => ({
        ...prev,
        role_id: newRoleId,
        permissions: defaultRolePermissions[newRoleId] || [],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        role_id: newRoleId,
      }));
    }

    setPreviousRole(newRoleId);
  };

  const handlePermissionChange =
    (permissionId: number) =>
    (e: React.ChangeEvent<HTMLInputElement>): void => {
      setFormData((prev) => ({
        ...prev,
        permissions: e.target.checked
          ? [...prev.permissions, permissionId]
          : prev.permissions.filter((id) => id !== permissionId),
      }));
    };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to create user");
      }

      setFormData(INITIAL_FORM_DATA);
    } catch (error) {
      console.error("Error creating user:", error);
    }
  };

  return (
    <div className="container mx-auto">
      <h3 className="text-xl font-semibold text-slate-800 mb-5">
        Agregar Usuario
      </h3>
      <form
        className="border rounded-lg border-slate-200 p-7"
        onSubmit={handleSubmit}
      >
        <section className="flex flex-row gap-5 mb-5">
          <div className="w-1/4">
            <h3 className="text-red-700 font-semibold text-sm">
              Información personal
            </h3>
            <p className="text-slate-400 text-xs font-normal">
              Información básica del usuario.
            </p>
          </div>
          <div className="w-3/4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              <Input
                label="Nombres"
                name="name"
                type="text"
                id="name"
                onChange={handleInputChange}
                value={formData.name}
              />
              <Input
                label="Fecha de nacimiento"
                name="dob"
                type="date"
                id="dob"
                onChange={handleInputChange}
                value={formData.dob}
              />
              <div className="flex flex-col gap-0">
                <Input
                  label="Correo electrónico"
                  name="email"
                  type="email"
                  id="email"
                  onChange={handleInputChange}
                  value={formData.email}
                />
                <span className="text-slate-400 text-xs font-normal mt-0.5">
                  La contraseña asignada por defecto es{" "}
                  <strong className="text-slate-800 italic">L0g3X2025*</strong>
                </span>
              </div>
            </div>
          </div>
        </section>

        <Hr />

        <section className="flex flex-row gap-5 mt-5">
          <div className="w-1/4">
            <h3 className="text-red-700 font-semibold text-sm">
              Accesibilidad
            </h3>
            <p className="text-slate-400 text-xs font-normal">
              Configura los permisos del usuario.
            </p>
          </div>
          <div className="w-3/4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              <Select
                label="Rol"
                name="role_id"
                id="role_id"
                options={roles}
                onChange={handleSelectChange}
                value={formData.role_id}
              />

              <div className="flex flex-row flex-wrap gap-2 items-center md:col-span-2 lg:col-span-3">
                <span className="text-red-600 w-full block">Permisos</span>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                  {permissions.map((permission) => (
                    <Checkbox
                      key={permission.id}
                      label={formatPermissionName(permission.name)}
                      name={permission.name}
                      id={permission.name}
                      checked={formData.permissions.includes(permission.id)}
                      onChange={handlePermissionChange(permission.id)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
        <button
          type="submit"
          className="text-white bg-red-600 hover:bg-red-700 transition-all duration-300 rounded-lg px-5 py-1 flex items-center place-self-end gap-2"
        >
          Guardar
        </button>
      </form>
    </div>
  );
};

export default UserManagementPage;
