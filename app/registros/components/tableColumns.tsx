/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { ColumnDef } from "@tanstack/react-table";
import {
  Status,
  RequestProps,
  ReposicionProps,
  ReposicionUpdateData,
} from "@/utils/types";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import RequestDetailsTable from "./table/RequestDetailsTable";
import Checkbox from "@/app/components/Checkbox";
import { ActionButtons } from "./table/ActionButtons";

interface ColumnHelpers {
  accountMap: Record<string, string>;
  responsibleMap: Record<string, string>;
  vehicleMap: Record<string, string>;
  onStatusChange?: (id: number, status: Status) => Promise<void>;
  onUpdateReposicion?: (
    id: number,
    data: ReposicionUpdateData,
    previousStatus: Status
  ) => Promise<void>;
}

interface TableMeta {
  updateData: (rowIndex: number, columnId: string, value: any) => void;
}

const whenOptions = {
  rol: "Rol",
  decimo_cuarto: "Décimo Cuarto",
  decimo_tercero: "Décimo Tercero",
  liquidacion: "Liquidación",
  utilidades: "Utilidades",
} as const;

type WhenOption = keyof typeof whenOptions;

export const getRequestColumns = ({
  accountMap,
  responsibleMap,
  vehicleMap,
}: ColumnHelpers): ColumnDef<RequestProps, any>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        label="Select all"
        name="selectAll"
        checked={table.getIsAllPageRowsSelected()}
        onChange={(e) => table.toggleAllPageRowsSelected(!!e.target.checked)}
        className="translate-y-[2px]"
        hideLabel
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        label="Select row"
        name={`select-${row.id}`}
        checked={row.getIsSelected()}
        onChange={(e) => row.toggleSelected(!!e.target.checked)}
        className="translate-y-[2px]"
        hideLabel
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "unique_id",
    header: "ID",
  },
  {
    accessorKey: "updated_at",
    header: "Fecha",
    cell: ({ row }) => (
      <p className="text-slate-500 font-medium w-max px-1">
        {(row.getValue("updated_at") as string).split("T")[0]}
      </p>
    ),
  },
  {
    accessorKey: "invoice_number",
    header: "Factura o Vale",
  },
  {
    accessorKey: "account_id",
    header: "Cuenta",
    cell: ({ row }) => (
      <p className="capitalize px-1">
        {accountMap[row.getValue("account_id") as number]}
      </p>
    ),
  },
  {
    accessorKey: "amount",
    header: "Valor",
    cell: ({ row }) => (
      <p className="font-medium text-slate-900 w-max px-1">
        ${parseFloat(row.getValue("amount") as string).toFixed(2)}
      </p>
    ),
  },
  {
    accessorKey: "project",
    header: "Proyecto",
  },
  {
    accessorKey: "responsible_id",
    header: "Responsable",
    cell: ({ row }) => {
      const id = row.getValue("responsible_id") as string;
      return id ? responsibleMap[id] || "No encontrado" : "No aplica";
    },
  },
  {
    accessorKey: "transport_id",
    header: "Placa",
    cell: ({ row }) => {
      const id = row.getValue("transport_id") as string;
      return id ? (
        <p className="px-1 w-max">
          {`${vehicleMap[id].slice(0, 3)}-${vehicleMap[id].slice(3, 7)}` ||
            "No encontrado"}
        </p>
      ) : (
        <p className="w-max px-1">No aplica</p>
      );
    },
  },
  {
    accessorKey: "note",
    header: "Observación",
    cell: ({ row }) => (
      <p className="text-pretty">
        {(row.getValue("note") as string) || "Sin observaciones."}
      </p>
    ),
  },
];

export const getReposicionColumns = (): ColumnDef<ReposicionProps, any>[] => [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => {
      <p
        className={`text-slate-500 font-medium w-max px-1 ${
          row.original.status === "rejected" ||
          (row.original.status === "paid" && "opacity-50 cursor-not-allowed")
        }`}
      >
        {row.getValue<string>("id")}
      </p>;
    },
  },
  {
    accessorKey: "fecha_reposicion",
    header: "Fecha",
    cell: ({ row }) => {
      <p
        className={`text-slate-500 font-medium w-max px-1 ${
          row.original.status === "rejected" ||
          (row.original.status === "paid" && "opacity-50 cursor-not-allowed")
        }`}
      >
        {row.getValue<string>("fecha_reposicion").split("T")[0]}
      </p>;
    },
  },
  {
    accessorKey: "total_reposicion",
    header: "Total",
    cell: ({ row }) => (
      <p
        className={`font-medium text-slate-900 w-max px-1 ${
          row.original.status === "rejected" ||
          (row.original.status === "paid" && "opacity-50 cursor-not-allowed")
        }`}
      >
        $
        {new Intl.NumberFormat("es-ES", { minimumFractionDigits: 2 }).format(
          row.getValue<number>("total_reposicion")
        )}
      </p>
    ),
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
      const status = row.getValue("status") as Status;
      return (
        <p
          className={`font-semibold rounded-full text-center ${
            (row.original.status === "rejected" ||
              row.original.status === "paid") &&
            "opacity-50"
          } ${
            status === "pending"
              ? "text-orange-700 bg-orange-50"
              : status === "rejected"
              ? "text-red-700 bg-red-50"
              : status === "review"
              ? "text-indigo-700 bg-indigo-50"
              : "text-emerald-700 bg-emerald-50"
          }`}
        >
          {status === "pending"
            ? "Pendiente"
            : status === "rejected"
            ? "Rechazado"
            : status === "review"
            ? "Revisar"
            : "Pagado"}
        </p>
      );
    },
  },
  {
    accessorKey: "project",
    header: "Proyecto",
    cell: ({ row }) => (
      <p
        className={`px-1 w-max ${
          (row.original.status === "rejected" ||
            row.original.status === "paid") &&
          "opacity-50 cursor-not-allowed"
        }`}
      >
        {row.getValue<string>("project")}
      </p>
    ),
  },
  {
    accessorKey: "month",
    header: "Mes",
    cell: (props) => {
      const today = new Date();
      const minDate = new Date(today.getFullYear(), today.getMonth(), 1)
        .toISOString()
        .split("T")[0];

      return (
        <div
          className={`w-full min-w-[180px] ${
            (props.row.original.status === "rejected" ||
              props.row.original.status === "paid") &&
            "opacity-50 cursor-not-allowed"
          }`}
        >
          <input
            type="month"
            name="month"
            id={`month-${props.row.id}`}
            min={minDate}
            value={
              props.row.original.month
                ? props.row.original.month
                : "No ingresado"
            }
            onChange={(e) => {
              const meta = props.table.options.meta as TableMeta;
              meta?.updateData(props.row.index, "month", e.target.value);
            }}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 text-sm"
            disabled={
              props.row.original.status === "rejected" ||
              props.row.original.status === "paid"
            }
          />
        </div>
      );
    },
  },
  {
    accessorKey: "when",
    header: "Descontar en",
    cell: (props) => (
      <div className="w-full min-w-[150px]">
        <select
          name="when"
          id={`when-${props.row.id}`}
          value={
            props.row.original.when ? props.row.original.when : "No ingresado"
          }
          onChange={(e) => {
            const meta = props.table.options.meta as TableMeta;
            meta?.updateData(
              props.row.index,
              "when",
              e.target.value as WhenOption
            );
          }}
          className={`w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 text-sm ${
            (props.row.original.status === "rejected" ||
              props.row.original.status === "paid") &&
            "opacity-50 cursor-not-allowed"
          }`}
          disabled={
            props.row.original.status === "rejected" ||
            props.row.original.status === "paid"
          }
        >
          {Object.entries(whenOptions).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
    ),
  },
  {
    accessorKey: "note",
    header: "Observación",
    cell: ({ row, table }) => (
      <div className="w-full min-w-[200px]">
        <input
          type="text"
          value={row.original.note ? row.original.note : "No ingresado"}
          onChange={(e) => {
            const meta = table.options.meta as TableMeta;
            meta?.updateData(row.index, "note", e.target.value);
          }}
          placeholder="Agregar observación..."
          className={`w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 text-sm ${
            (row.original.status === "rejected" ||
              row.original.status === "paid") &&
            "opacity-50 cursor-not-allowed"
          }`}
          disabled={
            row.original.status === "rejected" || row.original.status === "paid"
          }
        />
      </div>
    ),
  },
  {
    accessorKey: "details",
    header: "Detalles",
    cell: ({ row }) => {
      return (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <FileText className="h-4 w-4 mr-1" />
              Detalle
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[95%]">
            <DialogHeader>
              <DialogTitle>Solicitudes de la Reposición</DialogTitle>
              <DialogDescription>
                Proyecto {row.original.project}
              </DialogDescription>
            </DialogHeader>
            <RequestDetailsTable requests={row.original.requests || []} />
          </DialogContent>
        </Dialog>
      );
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => <ActionButtons row={row.original} />,
  },
];
