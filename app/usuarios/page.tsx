"use client";
import React, { Suspense, useEffect, useState } from "react";
import { RiUserAddLine } from "react-icons/ri";
import { BaseTableData, Column, DataTable } from "../components/DataTable";
import PersonalForm from "../components/forms/PersonalForm";
import Loader from "@/app/Loader";
import { Modal } from "../components/Modal";
import { TbHierarchy2 } from "react-icons/tb";
import { PersonalForm as PersonalFormType, SortConfig } from "@/utils/types";
import "./usuarios.component.css";

// Interfaz para la respuesta cruda del API
interface ApiResponseRaw {
  data: {
    usuario: string;
    permisos: string[];
  }[];
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
  };
}

// Interfaz para los datos procesados
interface ApiResponse {
  data: Personal[];
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
  };
}

type PersonalPropertyTypes = string | number | string[];

interface Personal extends BaseTableData {
  id: string | number;
  nombres: string;
  correo_electronico: string;
  permisos: string[];
  usuario: string;
  [key: string]: PersonalPropertyTypes;
}

interface ErrorMessage {
  status: number;
  message: string;
}

const extractName = (email: string) => {
  const [firstName, lastName] = email.split(".");
  if (!lastName) return capitalize(firstName);
  const last = lastName.split("@")[0];
  return `${capitalize(firstName)} ${capitalize(last)}`;
};

const capitalize = (string: string = "") => {
  return string
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

// Configuración de columnas para la tabla con renderizadores personalizados
const userColumns: Column<Personal>[] = [
  {
    key: "nombres",
    label: "Nombres",
    sortable: false,
  },
  {
    key: "correo_electronico",
    label: "Correo",
    sortable: false,
  },
  {
    key: "permisos",
    label: "Permisos",
    sortable: false,
    render: ((value: string[], row: Personal) => (
      <div className="flex flex-wrap gap-1">
        {row.permisos.map((perm) => (
          <span
            key={`${row.usuario}-${perm}`}
            className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
          >
            {perm}
          </span>
        ))}
      </div>
    )) as Column<Personal>["render"],
  },
];

interface ErrorMessage {
  status: number;
  message: string;
}

const UsersPage: React.FC = () => {
  const [paginatedData, setPaginatedData] = useState<ApiResponse>({
    data: [],
    meta: {
      current_page: 1,
      from: 0,
      last_page: 1,
      per_page: 10,
      to: 0,
      total: 0,
    },
  });

  const [errorMessage, setErrorMessage] = useState<ErrorMessage | null>(null);
  const [view, setView] = useState<"users" | "roles">("users");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Personal | null>(null);
  const [deleteItem, setDeleteItem] = useState<Personal | null>(null);
  const [infoModalOpen, setInfoModalOpen] = useState(false);

  const fetchUsers = async (
    page: number = 1,
    sortConfig?: SortConfig<Personal>
  ) => {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
      });

      if (sortConfig) {
        queryParams.append("sort_by", String(sortConfig.key));
        queryParams.append("sort_direction", sortConfig.direction);
      }

      const response = await fetch(
        `http://127.0.0.1:8000/api/users?${queryParams}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(response.statusText || "Error al cargar usuarios");
      }

      const responseData: ApiResponseRaw = await response.json();

      const processedUsers: Personal[] = responseData.data.map((user) => ({
        id: user.usuario,
        nombres: extractName(user.usuario),
        correo_electronico: user.usuario,
        usuario: user.usuario,
        permisos: user.permisos.map((p) => capitalize(p)),
      }));

      setPaginatedData({
        data: processedUsers,
        meta: responseData.meta,
      } as ApiResponse);
    } catch (error) {
      console.error("Error fetching users:", error);
      setErrorMessage({
        status: 500,
        message: error instanceof Error ? error.message : "Error desconocido",
      });
      setInfoModalOpen(true);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // const handlePageChange = (page: number) => {
  //   fetchUsers(page);
  // };

  const handleCreate = async (newPersonal: PersonalFormType) => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newPersonal),
      });

      if (!response.ok) {
        throw new Error("Error al crear usuario");
      }

      await fetchUsers(paginatedData.meta.current_page);
      setCreateModalOpen(false);
    } catch (error) {
      console.error("Error creating personal:", error);
      setErrorMessage({
        status: 500,
        message:
          error instanceof Error ? error.message : "Error al crear usuario",
      });
      setInfoModalOpen(true);
    }
  };

  const handleEdit = async (updatedPersonal: PersonalFormType) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/users/${updatedPersonal.id}`,
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

      await fetchUsers(paginatedData.meta.current_page);
      setEditItem(null);
    } catch (error) {
      setErrorMessage({
        status: 500,
        message:
          error instanceof Error
            ? error.message
            : "Error al actualizar usuario",
      });
      setInfoModalOpen(true);
    }
  };

  const handleDelete = async (personal: Personal) => {
    try {
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

      await fetchUsers(paginatedData.meta.current_page);
      setDeleteItem(null);
    } catch (error) {
      setErrorMessage({
        status: 500,
        message:
          error instanceof Error ? error.message : "Error al eliminar usuario",
      });
      setInfoModalOpen(true);
    }
  };

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
              Administrar Cargos
            </label>
            <span className="user-glider"></span>
          </div>
        </div>
        {view === "users" && (
          <button
            className="float-end btn w-56 h-11"
            onClick={() => setCreateModalOpen(true)}
          >
            <span className="flex gap-4 justify-center items-center">
              <RiUserAddLine className="flex w-min" />
              Agregar Usuario
            </span>
          </button>
        )}
        {view === "roles" && (
          <button className="float-end btn w-56 h-11">
            <span className="flex gap-4 justify-center items-center">
              <TbHierarchy2 className="flex w-min" />
              Agregar Cargo
            </span>
          </button>
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
          <Suspense fallback={<Loader fullScreen={false} />}>
            <DataTable<Personal>
              columns={userColumns}
              data={paginatedData}
              onEdit={setEditItem}
              onDelete={setDeleteItem}
              onPageChange={(page, sortOptions) => {
                fetchUsers(page, sortOptions);
              }}
              showExport={false}
            />
          </Suspense>
        </div>
      </section>

      {/* Create Form */}
      <PersonalForm
        mode="create"
        isOpen={createModalOpen}
        onSave={handleCreate}
        onCancel={() => setCreateModalOpen(false)}
      />

      {/* Edit Form */}
      {editItem && (
        <PersonalForm
          mode="edit"
          initialData={editItem}
          isOpen={!!editItem}
          onSave={handleEdit}
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
            <p>¿Estás seguro de que quieres eliminar a {deleteItem.nombres}?</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteItem(null)}
                className="px-4 py-2 border rounded-md hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(deleteItem)}
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
