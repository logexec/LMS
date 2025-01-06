import Input from "@/app/components/Input";
import React, { useState } from "react";

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
    roles: roles || [],
    estado: estado,
    proyecto: proyecto,
  });

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

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setFormData((prevData) => {
      if (checked) {
        return {
          ...prevData,
          roles: [...prevData.roles, value],
        };
      } else {
        return {
          ...prevData,
          roles: prevData.roles.filter((role) => role !== value),
        };
      }
    });
  };

  return (
    <form className="grid grid-cols-3 gap-5">
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
      <div className="flex flex-col items-start justify-center">
        <div className="block">
          <Input
            type="checkbox"
            label="Administrador"
            name="role"
            id="adminRole"
            value="Administrador"
            checked={formData.roles.includes("Administrador")}
            onChange={() => handleRoleChange("Administrador")}
          />
        </div>
        <div className="block">
          <Input
            type="checkbox"
            label="Developer"
            name="role"
            id="developerRole"
            value="Developer"
            checked={formData.roles.includes("Developer")}
            onChange={() => handleRoleChange("Developer")}
          />
        </div>
        <div className="block">
          <Input
            type="checkbox"
            label="Usuario"
            name="role"
            id="userRole"
            value="Usuario"
            checked={formData.roles.includes("Usuario")}
            onChange={() => handleRoleChange("Usuario")}
          />
        </div>
      </div>
      <Input
        type="text"
        id="estado"
        name="estado"
        label="Estado"
        value={formData.estado}
        onChange={handleInputChange}
      />
      <Input
        type="text"
        id="proyecto"
        name="proyecto"
        label="Proyecto"
        value={formData.proyecto}
        onChange={handleInputChange}
      />
      <Input
        type="email"
        id="email"
        name="email"
        label="Email"
        value={formData.email}
        onChange={handleInputChange}
      />
    </form>
  );
};

export default EditUserForm;
