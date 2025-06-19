/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  flexRender,
  ColumnDef,
  Row,
} from "@tanstack/react-table";
import { rankItem } from "@tanstack/match-sorter-utils";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import axios, { AxiosInstance } from "axios";
import ComboBox from "../ui/Combobox";
import { CheckIcon, DownloadIcon, XIcon } from "lucide-react";
import { Factura } from "@/types/factura";
import { Button } from "@/components/ui/button";

interface Option {
  value: string;
  label: string;
}

const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  timeout: 120_000,
});

interface FacturasTableProps {
  facturas: Factura[];
  loading: boolean;
  updateFactura: (id: number, data: Partial<Factura>) => void;
}
export default function FacturasTable({
  facturas,
  loading,
  updateFactura,
}: FacturasTableProps) {
  const [filterProyecto, setFilterProyecto] = useState<string>("");
  const [filterCentro, setFilterCentro] = useState<string>("");
  const [filterCuentaContable, setFilterCuentaContable] = useState<string>("");
  const [globalFilter, setGlobalFilter] = useState<string>("");

  const [proyectosLatinium, setProyectosLatinium] = useState<Option[]>([]);
  const [centrosCosto, setCentrosCosto] = useState<Option[]>([]);
  const [accounts, setAccounts] = useState<Option[]>([]);

  // Fetch combo options
  useEffect(() => {
    apiClient
      .get<{ data: Option[] }>("/latinium/projects")
      .then((res) => setProyectosLatinium(res.data.data))
      .catch((err) => {
        console.error(err);
        toast.error("No se pudieron cargar los proyectos");
      });

    apiClient
      .get<{ data: Option[] }>("/latinium/centro-costo")
      .then((res) => setCentrosCosto(res.data.data))
      .catch((err) => {
        console.error(err);
        toast.error("No se pudieron cargar los centros de costo");
      });

    apiClient
      .get<{ data: Option[] }>("/latinium/accounts")
      .then((res) => setAccounts(res.data.data))
      .catch((err) => {
        console.error(err);
        toast.error("No se pudieron cargar las cuentas contables");
      });
  }, []);

  // Global fuzzy filter function
  const fuzzyFilter = <TData,>(
    row: Row<TData>,
    columnId: string,
    filterValue: string
  ) => {
    const itemRank = rankItem(row.getValue<any>(columnId), filterValue);
    return itemRank.passed;
  };

  // Define columns
  const columns = useMemo<ColumnDef<Factura, any>[]>(
    () => [
      { accessorKey: "mes", header: "Mes" },
      {
        accessorKey: "razon_social_emisor",
        header: "Proveedor",
        cell: ({ row }) => (
          <span
            className="inline-flex min-w-16 max-w-48 truncate"
            title={row.original.razon_social_emisor}
          >
            {row.original.razon_social_emisor}
          </span>
        ),
      },
      { accessorKey: "ruc_emisor", header: "RUC" },
      { accessorKey: "secuencial", header: "Secuencial" },
      {
        accessorKey: "fecha_emision",
        header: "Fecha Emisión",
        cell: ({ row }) => (
          <span className="w-max inline-flex px-4">
            {row.original.fecha_emision?.split("T")[0]}
          </span>
        ),
      },
      {
        accessorKey: "clave_acceso",
        header: "Autorización",
        cell: ({ row }) => (
          <span
            className="max-w-24 inline-flex truncate"
            title={row.original.clave_acceso}
          >
            {row.original.clave_acceso}
          </span>
        ),
      },
      {
        accessorFn: (row) => `$${row.importe_total}`,
        id: "importe_total",
        header: "Precio",
      },
      {
        accessorKey: "project",
        header: "Proyecto",
        cell: (info) => (
          <ComboBox
            selected={info.getValue()}
            options={proyectosLatinium}
            onChange={(v) =>
              updateFactura(info.row.original.id, { project: v })
            }
          />
        ),
      },
      {
        accessorKey: "centro_costo",
        header: "Centro Costo",
        cell: (info) => (
          <ComboBox
            selected={info.getValue()}
            options={centrosCosto}
            onChange={(v) =>
              updateFactura(info.row.original.id, { centro_costo: v })
            }
          />
        ),
      },
      {
        accessorFn: "descripcion",
        id: "descripcion",
        header: "Descripción",
        cell: ({ row }) => (
          <span
            className="max-w-64 inline-flex truncate"
            title={row.original.descripcion!.descripcion}
          >
            {row.original.descripcion!.descripcion}
          </span>
        ),
      },
      {
        accessorKey: "observacion",
        header: "Observación",
        cell: ({ row }) => {
          return (
            <Input
              value={row.original.observacion ?? ""}
              onChange={(e) => e.target.value}
              className="w-max max-w-lg"
              onBlur={(e) =>
                updateFactura(row.original.id, {
                  observacion: e.target.value,
                })
              }
            />
          );
        },
      },
      {
        accessorKey: "contabilizado",
        header: "Contabilizado",
        cell: ({ row }) => (
          <span className="flex justify-center">
            {row.original.contabilizado === "CONTABILIZADO" ? (
              <CheckIcon className="h-4 w-4 text-green-500" />
            ) : (
              <XIcon className="h-4 w-4 text-red-500" />
            )}
          </span>
        ),
      },
      {
        accessorKey: "cuenta_contable",
        header: "Cuenta Contable",
        cell: ({ row }) => (
          <ComboBox
            selected={row.original.cuenta_contable}
            options={accounts}
            onChange={(v) =>
              updateFactura(row.original.id, { cuenta_contable: v })
            }
          />
        ),
      },
      {
        accessorKey: "proveedor_latinium",
        header: "Proveedor Latinium",
        cell: ({ row }) => (
          <span
            className={`w-max inline-flex ${
              !row.original.proveedor_latinium &&
              "text-gray-400 font-normal italic text-sm"
            }`}
          >
            {row.original.proveedor_latinium ??
              "El proveedor no se encuentra registrado en LATINIUM"}
          </span>
        ),
      },
      {
        accessorKey: "nota_latinium",
        header: "Nota Latinium",
        cell: ({ row }) => (
          <span
            className={`w-max inline-flex ${
              !row.original.nota_latinium &&
              "text-gray-400 font-normal italic text-sm"
            }`}
          >
            {row.original.nota_latinium ?? "Faltan datos para generar la nota"}
          </span>
        ),
      },
      {
        header: "Factura PDF",
        id: "download",
        cell: ({ row }) => (
          <Button
            variant="outline"
            title="Descargar Factura"
            onClick={() => console.log(row.original.id)}
          >
            <DownloadIcon size={4} />
          </Button>
        ),
      },
    ],
    [proyectosLatinium, centrosCosto, accounts, updateFactura]
  );

  // Build table instance
  const table = useReactTable({
    data: facturas,
    columns,
    state: { globalFilter },
    globalFilterFn: fuzzyFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="space-y-6">
      {/* filtros */}
      <div className="flex gap-4 flex-wrap pt-3">
        <div className="relative">
          <small className="absolute -top-5 left-0">Proyecto</small>
          <ComboBox
            selected={filterProyecto}
            options={proyectosLatinium}
            onChange={setFilterProyecto}
          />
        </div>
        <div className="relative">
          <small className="absolute -top-5 left-0">Centro Costo</small>
          <ComboBox
            selected={filterCentro}
            options={centrosCosto}
            onChange={setFilterCentro}
          />
        </div>
        <div className="relative">
          <small className="absolute -top-5 left-0">Cuenta Contable</small>
          <ComboBox
            selected={filterCuentaContable}
            options={accounts}
            onChange={setFilterCuentaContable}
          />
        </div>
      </div>
      <div className="relative flex-1 max-w-sm">
        <Input
          placeholder="Buscar en toda la tabla…"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
        />
      </div>

      {/* tabla */}
      <div className="overflow-auto border border-gray-200 rounded-xl p-2">
        <table className="min-w-full">
          <thead className="sticky top-0 bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="px-4 py-2 text-left">
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={15} className="text-center p-4">
                  Cargando...
                </td>
              </tr>
            ) : facturas.length === 0 ? (
              <tr>
                <td colSpan={15} className="text-center p-4">
                  No hay facturas
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="even:bg-gray-100">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-2 align-top">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
