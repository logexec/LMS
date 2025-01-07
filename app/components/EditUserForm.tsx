"use client";
import Input from "@/app/components/Input";
import React, { useState } from "react";
import Select from "./Select";
import ModalStatus from "./ModalStatus";
import { createPortal } from "react-dom";

interface FormProps {
  id: string;
  name: string;
  email: string;
  roles: string[];
  estado: string;
  proyecto: string;
}

const EditUserForm: React.FC<FormProps> = ({
  id,
  name,
  roles,
  email,
  estado,
  proyecto,
}) => {
  const [formData, setFormData] = useState({
    id: id,
    name: name,
    email,
    roles: roles.length ? roles : [],
    estado: estado,
    proyecto: proyecto,
  });

  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const estadoOptions = [
    { label: "Activo", value: "activo" },
    { label: "Inactivo", value: "inactivo" },
    { label: "Suspendido", value: "suspendido" },
  ];
  const proyectoOptions = [
    { label: "Admin", value: "admin" },
    { label: "CNQT", value: "cnqt" },
  ];

  const handleRoleChange = (role: string) => {
    setFormData((prevData) => {
      const newRoles = prevData.roles.includes(role)
        ? prevData.roles.filter((r) => r !== role) // Desmarcar si ya está seleccionado
        : [...prevData.roles, role]; // Agregar si no está seleccionado
      return {
        ...prevData,
        roles: newRoles,
      };
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Aquí realizarías la lógica de actualización del usuario, por ejemplo, una llamada a una API

    // Mostrar la modal
    setModalOpen(true);

    // Cerrar la modal después de 3 segundos
    setTimeout(() => {
      setModalOpen(false);
    }, 3000);
  };

  return (
    <form className="grid grid-cols-3 gap-5 py-4">
      <Input
        type="text"
        id="identificacion"
        name="identificacion"
        label="Identificación"
        value={formData.id}
        onChange={handleInputChange}
      />
      <Input
        type="text"
        id="name"
        name="name"
        label="Nombre"
        value={formData.name}
        onChange={handleInputChange}
      />
      <Select
        label="Estado"
        name="estado"
        id="estado"
        value={formData.estado}
        options={estadoOptions}
        onChange={handleSelectChange}
      />
      <Select
        label="Proyecto"
        name="proyecto"
        id="proyecto"
        value={formData.proyecto}
        options={proyectoOptions}
        onChange={handleSelectChange}
      />
      <Input
        type="email"
        id="email"
        name="email"
        label="Email"
        value={formData.email}
        onChange={handleInputChange}
      />
      <div className="flex flex-col items-start justify-center">
        <div className="flex flex-col justify-center gap-2">
          <h3 className="text-blue-600 text-sm">Roles</h3>
          <div className="flex flex-row gap-2">
            <Input
              type="checkbox"
              label="Administrador"
              name="role"
              id="adminRole"
              value="Administrador"
              checked={formData.roles.includes("admin")}
              onChange={() => handleRoleChange("admin")}
            />

            <Input
              type="checkbox"
              label="Developer"
              name="role"
              id="developerRole"
              value="Developer"
              checked={formData.roles.includes("developer")}
              onChange={() => handleRoleChange("developer")}
            />

            <Input
              type="checkbox"
              label="Usuario"
              name="role"
              id="userRole"
              value="Usuario"
              checked={formData.roles.includes("user")}
              onChange={() => handleRoleChange("user")}
            />
          </div>
        </div>
      </div>
      <div className="mt-8" />
      <button
        className="btn absolute float float-start bottom-8 w-80"
        type="submit"
        onClick={handleSubmit}
      >
        Actualizar usuario
      </button>

      {modalOpen &&
        createPortal(
          <ModalStatus text="Usuario actualizado" error />,
          document.body
        )}
    </form>
  );
};

export default EditUserForm;
