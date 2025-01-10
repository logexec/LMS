"use client";
import React, { useEffect, useState } from "react";
import { RiUserAddLine } from "react-icons/ri";
import { DataTable, Column, BaseTableData } from "../components/DataTable";
import PersonalForm from "../components/forms/PersonalForm";
import Loader from "../components/Loader";
import { Modal } from "../components/Modal";
import "./usuarios.component.css";

// Domain Models
interface Personal extends BaseTableData {
  nombres: string;
  apellidos: string;
  correo_electronico: string;
  proyecto?: string;
  cargo_logex: string;
  estado_personal: string;
}

// Configuración de columnas para la tabla
const userColumns: Column<Personal>[] = [
  {
    key: "nombres",
    label: "Nombres",
    sortable: true,
  },
  {
    key: "correo_electronico",
    label: "Correo",
    sortable: true,
  },
  {
    key: "proyecto",
    label: "Proyecto",
    sortable: true,
  },
  {
    key: "cargo_logex",
    label: "Cargo",
    sortable: true,
  },
  {
    key: "estado_personal",
    label: "Estado",
    sortable: true,
  },
];

interface ApiResponse {
  data: Personal[];
}

interface ErrorMessage {
  status: number;
  message: string;
}

const UsersPage: React.FC = () => {
  // Estado principal
  const [users, setUsers] = useState<Personal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<ErrorMessage | null>(null);

  // Estados de UI
  const [view, setView] = useState<"users" | "roles">("users");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Personal | null>(null);
  const [deleteItem, setDeleteItem] = useState<Personal | null>(null);
  const [infoModalOpen, setInfoModalOpen] = useState(false);

  // Fetch inicial de datos
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/personal`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(response.statusText || "Error al cargar usuarios");
      }

      const { data }: ApiResponse = await response.json();
      const processedUsers = data.map((user) => ({
        ...user,
        nombres: `${capitalize(user.nombres)} ${capitalize(user.apellidos)}`,
        estado_personal: capitalize(user.estado_personal),
      }));

      setUsers(processedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      setErrorMessage({
        status: 500,
        message: error instanceof Error ? error.message : "Error desconocido",
      });
      setInfoModalOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handlers
  const handleCreatePersonal = async (newPersonal: Personal) => {
    try {
      setIsLoading(true);
      const response = await fetch("http://127.0.0.1:8000/api/personal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newPersonal),
      });

      if (!response.ok) {
        throw new Error("Error al crear usuario");
      }

      await fetchUsers();
      setCreateModalOpen(false);
    } catch (error) {
      console.error("Error creating personal:", error);
      setErrorMessage({
        status: 500,
        message:
          error instanceof Error ? error.message : "Error al crear usuario",
      });
      setInfoModalOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditPersonal = async (updatedPersonal: Personal) => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `http://127.0.0.1:8000/api/personal/${updatedPersonal.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedPersonal),
        }
      );

      if (!response.ok) {
        throw new Error("Error al actualizar usuario");
      }

      await fetchUsers();
      setEditItem(null);
    } catch (error) {
      console.error("Error updating personal:", error);
      setErrorMessage({
        status: 500,
        message:
          error instanceof Error
            ? error.message
            : "Error al actualizar usuario",
      });
      setInfoModalOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePersonal = async (personal: Personal) => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `http://127.0.0.1:8000/api/personal/${personal.id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Error al eliminar usuario");
      }

      await fetchUsers();
      setDeleteItem(null);
    } catch (error) {
      console.error("Error deleting personal:", error);
      setErrorMessage({
        status: 500,
        message:
          error instanceof Error ? error.message : "Error al eliminar usuario",
      });
      setInfoModalOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setView(event.target.value as "users" | "roles");
  };

  // Utilidades
  const capitalize = (string: string) => {
    return string
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  return (
    <div className="w-full">
      {isLoading && <Loader fullScreen />}

      {/* Error Modal */}
      {infoModalOpen && errorMessage && (
        <Modal isOpen={infoModalOpen}>
          <div className="flex flex-col">
            <h3 className="text-2xl text-red-700 -mb-1">
              Error {errorMessage.status}:{" "}
              <span className="text-red-600">{errorMessage.message}</span>
            </h3>
            <p className="text-slate-800 my-4 text-lg">
              Hubo un problema al tratar de recuperar la información.
            </p>
            <p className="text-slate-700 text-sm">
              Por favor, acércate al equipo de IT e informa de este problema lo
              antes posible.
            </p>
            <button
              className="bg-red-700 hover:bg-red-800 rounded text-white font-semibold justify-center items-center self-end px-4 py-1 w-max"
              onClick={() => setInfoModalOpen(false)}
            >
              Aceptar
            </button>
          </div>
        </Modal>
      )}

      {/* Header Section */}
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
          onClick={() => setCreateModalOpen(true)}
        >
          <span className="flex gap-4 justify-center items-center">
            <RiUserAddLine className="flex w-min" />
            Agregar Usuario
          </span>
        </button>
      </section>

      {/* Content Section */}
      <section className="w-full h-full grid grid-cols-[1fr_auto] p-5 grid-rows-1 transition-all duration-300 overflow-x-hidden relative">
        <div
          className={`w-full h-full transition-all duration-300 col-span-1 row-start-1 col-start-1 ease-out overflow-hidden ${
            view === "roles" ? "opacity-100 visible" : "opacity-0 invisible"
          }`}
        >
          <DataTable
            columns={userColumns}
            data={users}
            onEdit={setEditItem}
            onDelete={setDeleteItem}
            showExport={false}
          />
        </div>
        <div
          className={`w-full h-full transition-all duration-300 col-span-1 col-start-1 row-start-1 ease-out overflow-hidden ${
            view === "users" ? "opacity-100 visible" : "opacity-0 invisible"
          }`}
        >
          <DataTable
            columns={userColumns}
            data={users}
            onEdit={setEditItem}
            onDelete={setDeleteItem}
            showExport={false}
          />
        </div>
      </section>

      {/* Create Form */}
      <PersonalForm
        mode="create"
        isOpen={createModalOpen}
        onSave={handleCreatePersonal}
        onCancel={() => setCreateModalOpen(false)}
      />

      {/* Edit Form */}
      {editItem && (
        <PersonalForm
          mode="edit"
          initialData={editItem}
          isOpen={!!editItem}
          onSave={handleEditPersonal}
          onCancel={() => setEditItem(null)}
        />
      )}

      {/* Delete Confirmation */}
      {deleteItem && (
        <Modal isOpen={!!deleteItem}>
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">
              Se va a eliminar el registro
            </h2>
            <p>
              ¿Estás seguro de que quieres eliminar el registro de{" "}
              {deleteItem.nombres}?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteItem(null)}
                className="px-4 py-2 border rounded-md hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDeletePersonal(deleteItem)}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Eliminar
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default UsersPage;
