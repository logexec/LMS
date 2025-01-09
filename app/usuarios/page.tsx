"use client";
import React, { Suspense, useEffect, useState } from "react";
import Modal from "../components/ModalForm";
import Input from "../components/Input";
import { roles } from "@/utils/constants";
import { RiUserAddLine } from "react-icons/ri";
import "./usuarios.component.css";
import { DataTable } from "../components/DataTable";
import Loader from "../components/Loader";

interface Employee {
  id: number;
  data: Data[];
}

interface Data {
  id: string;
  nombres: string;
  apellidos: string;
  correo_electronico: string;
  proyecto: string;
  cargo_logex: string;
  estado_personal: string;
}

const UsersPage = () => {
  const [view, setView] = useState<"users" | "roles">("users");
  const [modalOpen, setModalOpen] = useState(false);

  const [users, setUsers] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  const userColumns = [
    {
      id: 0,
      key: "id",
      label: "ID",
      sorteable: true,
    },
    {
      id: 1,
      key: "nombres",
      label: "Nombres",
      sorteable: true,
    },
    {
      id: 2,
      key: "correo_electronico",
      label: "Correo",
      sortable: true,
    },
    {
      id: 3,
      key: "proyecto",
      label: "Proyecto",
      sortable: true,
    },
    {
      id: 4,
      key: "cargo_logex",
      label: "Cargo",
      sortable: true,
    },
    {
      id: 5,
      key: "estado_personal",
      label: "Estado",
      sortable: true,
    },
  ];

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/personal`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        const processedUsers = data.data.map((user: any) => ({
          id: user.id,
          nombres: `${capitalize(user.nombres)} ${capitalize(user.apellidos)}`,
          correo_electronico: user.correo_electronico,
          proyecto: user.proyecto,
          cargo_logex: user.cargo_logex,
          estado_personal: capitalize(user.estado_personal),
        }));

        setUsers(processedUsers);
        console.log(users);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleEdit = async (item: any) => {
    try {
      // Implementar la lógica de edición
      console.log("Editando:", item);
      // Ejemplo:
      // await fetch(`/api/users/${item.id}`, {
      //   method: 'PUT',
      //   body: JSON.stringify(item)
      // });
    } catch (error) {
      console.error("Error editing user:", error);
    }
  };

  const handleDelete = async (item: any) => {
    try {
      // Implementar la lógica de eliminación
      console.log("Eliminando:", item);
      // Ejemplo:
      // await fetch(`/api/users/${item.id}`, {
      //   method: 'DELETE'
      // });
      // Actualiza la lista de usuarios después de eliminar
      setUsers(users.filter((user) => user.id !== item.id));
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  };
  const capitalize = (string: string) => {
    return string
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const handleViewChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedValue = event.target.value;
    setView(selectedValue as "users" | "roles");
  };

  return (
    <div className="w-full">
      <section className="w-full shadow rounded-lg bg-white p-5 flex gap-3">
        <div className="container" id="toggle">
          <div className="user-tabs">
            <input
              type="radio"
              id="users"
              name="tabletoggle"
              value="users"
              checked={view === "users"}
              onChange={handleViewChange}
            />
            <label className="user-tab" htmlFor="users">
              Administrar Usuarios
            </label>
            <input
              type="radio"
              id="roles"
              name="tabletoggle"
              value="roles"
              checked={view === "roles"}
              onChange={handleViewChange}
            />
            <label className="user-tab" htmlFor="roles">
              Administrar Roles
            </label>
            <span className="user-glider"></span>
          </div>
        </div>
        <button
          className="float-end btn w-56 h-11"
          onClick={() => setModalOpen(true)}
        >
          <span className="flex gap-4 justify-center items-center">
            <RiUserAddLine className="flex w-min" />
            Agregar Usuario
          </span>
        </button>
      </section>
      <section className="w-full h-full grid grid-cols-[1fr_auto] p-5 grid-rows-1 transition-all duration-300 overflow-x-hidden relative">
        <div
          className={`w-full h-full transition-all duration-300 col-span-1 row-start-1 col-start-1 ease-out overflow-hidden ${
            view === "roles" ? "opacity-100 visible" : "opacity-0 invisible"
          }`}
        >
          <Suspense fallback={<Loader />}>
            <DataTable
              columns={userColumns}
              data={users}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </Suspense>
        </div>
        <div
          className={`w-full h-full transition-all duration-300 col-span-1 col-start-1 row-start-1 ease-out overflow-hidden ${
            view === "users" ? "opacity-100 visible" : "opacity-0 invisible"
          }`}
        >
          <Suspense fallback={<Loader />}>
            <DataTable
              columns={userColumns}
              data={users}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </Suspense>
        </div>

        <Modal
          title="Nuevo Usuario"
          onClose={() => setModalOpen(false)}
          isOpen={modalOpen}
          isForm={false}
        >
          <form className="pb-5">
            <div className="grid grid-cols-3 p-2 gap-5">
              <Input type="text" label="Nombres" name="name" id="name" />
              <Input
                type="text"
                id="lastName"
                name="lastName"
                label="Apellidos"
              />
              <div className="relative w-full">
                <select
                  id="roleSelect"
                  className="block w-full p-2 text-sm border-none border-b-[2px] border-b-[#ccc] outline-none bg-transparent select-field"
                >
                  {roles.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
                <label htmlFor="roleSelect" className={`select-label`}>
                  Rol
                </label>
                <span className="select-highlight"></span>
              </div>
              <div className="block">
                <Input type="text" id="id" name="id" label="Identificación" />
              </div>
              <div className="block">
                <Input type="email" id="email" name="email" label="Email" />
              </div>
              <div className="w-full block">
                <div className="relative w-full">
                  <select
                    id="roleSelect"
                    className="block w-full p-2 text-sm border-none border-b-[2px] border-b-[#ccc] outline-none bg-transparent select-field"
                  >
                    <option value="active">Activo</option>
                    <option value="deactivated">Desactivado</option>
                  </select>
                  <label htmlFor="roleSelect" className={`select-label`}>
                    Estado
                  </label>
                  <span className="select-highlight"></span>
                </div>
              </div>
            </div>
            <button type="submit" className="float-start mt-5 btn w-56">
              Guardar
            </button>
          </form>
        </Modal>
      </section>
    </div>
  );
};

export default UsersPage;
