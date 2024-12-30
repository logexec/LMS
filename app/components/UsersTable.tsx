"use client";
import React, { Suspense, useState } from "react";
import { CompactTable } from "@table-library/react-table-library/compact";
import { useTheme } from "@table-library/react-table-library/theme";
import { getTheme } from "@table-library/react-table-library/baseline";
import { usePagination } from "@table-library/react-table-library/pagination";
import { useSort } from "@table-library/react-table-library/sort";

import Input from "./Input";
import { BiLeftArrow, BiRightArrow } from "react-icons/bi";
import "./table.component.css";
import Loader from "./Loader";

interface Node {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  estado: string;
  rol: string;
  created_at: string;
  updated_at: string;
}

interface TableData {
  nodes: Node[];
  type: string;
}

const PaginationButtons: React.FC<{
  currentPage: number;
  totalPages: number;
  onPreviousPage: () => void;
  onNextPage: () => void;
  handlePage: (index: number) => void;
}> = ({ currentPage, totalPages, onPreviousPage, onNextPage, handlePage }) => (
  <div className="flex justify-center items-center">
    <span className="flex gap-3 items-center">
      <button
        aria-label="Página anterior"
        className={
          currentPage === 0
            ? "cursor-not-allowed text-slate-400"
            : "text-red-600"
        }
        onClick={onPreviousPage}
        disabled={currentPage === 0}
      >
        <BiLeftArrow />
      </button>
      {[...Array(totalPages)].map((_, index) => (
        <button
          key={index}
          type="button"
          className={`hover:underline underline-offset-4 ${
            currentPage === index
              ? "underline font-semibold underline-offset-4 text-red-700"
              : "font-light text-secondary "
          }`}
          onClick={() => handlePage(index)}
        >
          {index + 1}
        </button>
      ))}
      <button
        aria-label="Página siguiente"
        className={
          currentPage === totalPages - 1
            ? "cursor-not-allowed text-slate-400"
            : "text-red-600"
        }
        onClick={onNextPage}
        disabled={currentPage === totalPages - 1}
      >
        <BiRightArrow />
      </button>
    </span>
  </div>
);

const removeAccents = (text: string) => {
  return text
    .normalize("NFD") // Descompone caracteres acentuados en dos partes (caracter base + acento)
    .replace(/[\u0300-\u036f]/g, ""); // Elimina los caracteres de acento
};

const UsersTableComponent: React.FC<TableData> = ({ nodes, type }) => {
  const [search, setSearch] = useState("");

  if (type === "users") {
    console.log("Administrar Usuarios");
  } else {
    console.log("administrar roles");
  }

  const theme = useTheme([
    getTheme(),
    {
      Table: `
        --data-table-library_grid-template-columns:  auto auto auto auto auto;
      `,
    },
  ]);

  const lowerSearch = removeAccents(search.toLowerCase());
  const filteredData = nodes.filter((item) => {
    return (
      removeAccents(item.id.toLowerCase()).includes(lowerSearch) ||
      removeAccents(item.nombre.toLowerCase()).includes(lowerSearch) ||
      removeAccents(item.apellido.toLowerCase()).includes(lowerSearch) ||
      removeAccents(item.email.toLowerCase()).includes(lowerSearch) ||
      removeAccents(item.estado.toLowerCase()).includes(lowerSearch)
    );
  });

  const pagination = usePagination(
    { nodes: nodes },
    {
      state: { page: 0, size: 10 },
    }
  );

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
  };

  const handlePage = (index: number) => {
    if (pagination.state.page !== index) {
      pagination.fns.onSetPage(index);
    }
  };

  const handleNextPage = () => {
    if (
      pagination.state.page <
      pagination.state.getTotalPages(filteredData) - 1
    ) {
      pagination.fns.onSetPage(pagination.state.page + 1);
    }
  };

  const handlePreviousPage = () => {
    if (pagination.state.page > 0) {
      pagination.fns.onSetPage(pagination.state.page - 1);
    }
  };

  const sort = useSort(
    { nodes: filteredData },
    { onChange: (action, state) => console.log(action, state) },
    {
      sortFns: {
        CUENTA: (array) =>
          array.sort((a, b) => a.cuenta.localeCompare(b.cuenta)),
        PROYECTO: (array) =>
          array.sort((a, b) => a.proyecto.localeCompare(b.proyecto)),

        TRANSPORTE: (array) =>
          array.sort((a, b) => a.transporte.localeCompare(b.transporte)),
        PLACA: (array) => array.sort((a, b) => a.placa.localeCompare(b.placa)),
      },
    }
  );

  const COLUMNS = [
    {
      label: "Identificación",
      renderCell: (item: Node) => item.id,
      sort: { sortKey: "FECHA_GASTO" },
    },
    {
      label: "Nombres",
      renderCell: (item: Node) => (
        <div className="flex flex-col">
          <span className="text-slate-800 text-lg">
            {item.nombre} {item.apellido}
          </span>
          <a
            href={`mailto:${item.email}`}
            className="text-red-600 hover:text-red-800"
          >
            {item.email}
          </a>
        </div>
      ),
    },
    {
      label: "Rol",
      renderCell: (item: Node) => (
        <span className="capitalize">{item.rol}</span>
      ),
    },
    {
      label: "Estado",
      renderCell: (item: Node) => (
        <span
          className={`capitalize font-semibold ${
            item.estado === "activo"
              ? "text-green-600"
              : item.estado === "suspendido"
              ? "text-amber-600"
              : "text-slate-600"
          }`}
        >
          {item.estado}
        </span>
      ),
    },
    {
      label: "Acciones",
      renderCell: () => (
        <div className="flex flex-row gap-3">
          <button className="text-indigo-500 hover:underline hover:text-indigo-700">
            <span>Editar</span>
          </button>
          <button className="text-red-500 hover:underline hover:text-red-700">
            <span>Eliminar</span>
          </button>
        </div>
      ),
    },
  ];

  return (
    <Suspense fallback={<Loader />}>
      <div className="flex items-center justify-between">
        <Input
          label="Buscar"
          placeholder="Filtrar datos..."
          name="search"
          id="search"
          required
          type="search"
          value={search}
          onChange={handleSearch}
        />
      </div>
      <br />
      <CompactTable
        columns={COLUMNS}
        data={{ nodes: filteredData }}
        theme={theme}
        layout={{ custom: true, horizontalScroll: true }}
        pagination={pagination}
        sort={sort}
      />
      <br />
      <PaginationButtons
        currentPage={pagination.state.page}
        totalPages={pagination.state.getTotalPages(filteredData)}
        onPreviousPage={handlePreviousPage}
        onNextPage={handleNextPage}
        handlePage={handlePage}
      />
    </Suspense>
  );
};

export default UsersTableComponent;
