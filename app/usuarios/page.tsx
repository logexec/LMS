"use client";
import React, { useState } from "react";
import "./usuarios.component.css";
import UsersTableComponent from "../components/UsersTable";
import Modal from "../components/Modal";
import Input from "../components/Input";
import { roles } from "@/utils/constants";
import { RiUserAddLine } from "react-icons/ri";

const UsersPage: React.FC = () => {
  const [view, setView] = useState<"users" | "roles">("users");
  const [modalOpen, setModalOpen] = useState(false);

  const users = [
    {
      id: "1234567890",
      nombre: "John",
      apellido: "Doe",
      email: "johndoe@logex.ec",
      estado: "activo",
      rol: "administrador",
      created_at: "30/12/2024",
      updated_at: "30/12/2024",
    },
    {
      id: "0987654321",
      nombre: "John Segundo",
      apellido: "Doe",
      email: "johndoe@logex.ec",
      estado: "activo",
      rol: "administrador",
      created_at: "30/12/2024",
      updated_at: "30/12/2024",
    },
    {
      id: "1029384756",
      nombre: "John Tercero",
      apellido: "Doe",
      email: "johndoe@logex.ec",
      estado: "activo",
      rol: "administrador",
      created_at: "30/12/2024",
      updated_at: "30/12/2024",
    },
  ];

  const handleViewChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedValue = event.target.value;
    setView(selectedValue as "users" | "roles");
  };

  return (
    <div className="w-full">
      <section className="w-full shadow rounded-lg bg-white p-5 flex gap-3">
        <div className="container" id="toggle">
          <div className="tabs">
            <input
              type="radio"
              id="users"
              name="tabletoggle"
              value="users"
              checked={view === "users"}
              onChange={handleViewChange}
            />
            <label className="tab" htmlFor="users">
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
            <label className="tab" htmlFor="roles">
              Administrar Roles
            </label>
            <span className="glider"></span>
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
          <UsersTableComponent nodes={users} type="roles" />
        </div>
        <div
          className={`w-full h-full transition-all duration-300 col-span-1 col-start-1 row-start-1 ease-out overflow-hidden ${
            view === "users" ? "opacity-100 visible" : "opacity-0 invisible"
          }`}
        >
          <UsersTableComponent nodes={users} type="users" />
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
