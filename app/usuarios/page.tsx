"use client";
import React, { Suspense, useState } from "react";
import { RiUserAddLine } from "react-icons/ri";
import Loader from "@/app/Loader";
import { Modal } from "../components/Modal";
import { TbHierarchy2 } from "react-icons/tb";
import { ErrorMessage } from "@/utils/types";
import UsersTable from "./UsersTable";
import "./usuarios.component.css";
import Link from "next/link";

interface UserFormData {
  id: string | number;
  name: string;
  email: string;
  password?: string;
  role_id: number;
  permissions: number[];
}

const UsersPage = () => {
  // Nuevo estado para roles y permisos
  const [errorMessage, setErrorMessage] = useState<ErrorMessage | null>(null);
  const [view, setView] = useState<"users" | "roles">("users");
  const [infoModalOpen, setInfoModalOpen] = useState(false);

  const handleViewChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setView(event.target.value as "users" | "roles");
  };

  return (
    <div className="w-full">
      {infoModalOpen && errorMessage && (
        <Modal isOpen={infoModalOpen}>
          <div className="flex flex-col">
            <h3 className="text-2xl text-red-600 -mb-1">
              Error {errorMessage.status}:{" "}
              <span className="text-red-600">{errorMessage.message}</span>
            </h3>
            <p className="text-slate-800 my-4 text-lg">
              Hubo un problema al tratar de recuperar la información.
            </p>
            <p className="text-slate-700 text-sm">
              Por favor, acércate al equipo de IT e informa de este problema lo
              antes posible. <br />
              <strong className="text-slate-600">
                No refresques la página
              </strong>
            </p>
            <button
              className="bg-slate-700 hover:bg-slate-800 rounded text-white font-semibold justify-center items-center self-end px-4 py-1 mt-5 w-max"
              onClick={() => setInfoModalOpen(false)}
            >
              Aceptar
            </button>
          </div>
        </Modal>
      )}

      <section className="w-full flex gap-3 pb-2 border-b border-slate-100">
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
        {view === "users" && (
          <Link
            href="/usuarios/nuevo"
            className="float-end flex items-center justify-center w-52 h-10 gap-4 bg-red-600 hover:bg-red-700 rounded-lg transition-all duration-300 text-white font-medium"
          >
            <RiUserAddLine size={18} />
            Agregar Usuario
          </Link>
        )}
        {view === "roles" && (
          <Link
            href="/usuarios/roles"
            className="float-end flex items-center justify-center w-52 h-10 gap-4 bg-red-600 hover:bg-red-700 rounded-lg transition-all duration-300 text-white font-medium"
          >
            <TbHierarchy2 size={18} />
            Agregar Roles
          </Link>
        )}
      </section>

      <section className="w-full h-full grid grid-cols-[1fr_auto] p-5 grid-rows-1 transition-all duration-300 overflow-x-hidden relative">
        <div
          className={`w-full h-full transition-all duration-300 col-span-1 row-start-1 col-start-1 ease-out overflow-hidden ${
            view === "roles" ? "opacity-100 visible" : "opacity-0 invisible"
          }`}
        >
          <Suspense fallback={<Loader fullScreen={false} />}>
            <p>Aqui va la otra tabla</p>
          </Suspense>
        </div>
        <div
          className={`w-full h-full transition-all duration-300 col-span-1 col-start-1 row-start-1 ease-out overflow-hidden ${
            view === "users" ? "opacity-100 visible" : "opacity-0 invisible"
          }`}
        >
          <UsersTable />
        </div>
      </section>
    </div>
  );
};

export default UsersPage;
