"use client";
import React, { useState } from "react";
import "./usuarios.component.css";
import { admnUsers } from "@/utils/constants";
import Input from "../components/Input";
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

  const removeAccents = (text: string) => {
    return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  };

  const [search, setSearch] = useState("");
  const lowerSearch = removeAccents(search.toLowerCase());

  const filteredUsers = admnUsers.filter((user) => {
    return (
      user.id.includes(lowerSearch) ||
      removeAccents(user.name.toLocaleLowerCase()).includes(lowerSearch) ||
      removeAccents(user.email).includes(lowerSearch)
    );
  });

  const handleUserSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
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
            <Input
              label="Buscar Usuarios"
              name="searchUsers"
              id="searchUsers"
              type="search"
              onChange={handleUserSearch}
              className="search-bar float-end"
            />
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
