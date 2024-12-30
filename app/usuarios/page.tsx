"use client";
import React, { useState } from "react";
import "./usuarios.component.css";
import { admnUsers } from "@/utils/constants";
import UsersTableComponent from "../components/UsersTable";

const UsersPage: React.FC = () => {
  const [view, setView] = useState<"users" | "roles">("users");

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
      </section>
      <section className="w-full h-full block transition-all duration-300 overflow-x-hidden relative">
        <div
          className={`w-full h-full transition-all duration-300 ease-out ${
            view === "roles"
              ? "translate-x-0 opacity-100"
              : "translate-x-full opacity-0"
          }`}
        >
          <UsersTableComponent nodes={users} type="roles" />
        </div>
        <div
          className={`w-full h-full transition-all duration-300 ease-out ${
            view === "users"
              ? "translate-x-0 opacity-100"
              : "-translate-x-full opacity-0"
          }`}
        >
          <UsersTableComponent nodes={users} type="users" />
        </div>
      </section>
    </div>
  );
};

export default UsersPage;
