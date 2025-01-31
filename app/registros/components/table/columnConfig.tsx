import { ColumnDef } from "@tanstack/react-table";
import { ReposicionProps, RequestProps, Status } from "@/utils/types";
import { Button } from "@/components/ui/button";
import { Check, FileText, ScanSearch, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import RequestDetailsTable from "./RequestDetailsTable";
import { ActionButtons } from "./ActionButtons";
import Checkbox from "@/app/components/Checkbox";
import { MonthCell } from "./EditableCell";
import { TextCell } from "./EditableCell";
import { SelectCell } from "./EditableCell";

interface ColumnHelpers {
  accountMap: Record<string, string>;
  responsibleMap: Record<string, string>;
  vehicleMap: Record<string, string>;
  onStatusChange?: (id: number, status: Status) => Promise<void>;
}

export const getRequestColumns = ({
  accountMap,
  responsibleMap,
  vehicleMap,
  onStatusChange,
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
          {vehicleMap[id]
            ? `${vehicleMap[id].slice(0, 3)}-${vehicleMap[id].slice(3, 7)}`
            : "No encontrado"}
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
    accessorKey: "unique_id",
    header: "ID",
    cell: ({ row }) => (
      <p
        className={`text-slate-500 font-medium w-max px-1 ${
          row.original.status === "rejected" && "opacity-70 cursor-not-allowed"
        }`}
      >
        {row.original.id}
      </p>
    ),
  },
  {
    accessorKey: "fecha_reposicion",
    header: "Fecha",
    cell: ({ row }) => (
      <p
        className={`text-slate-500 font-medium w-max px-1 ${
          row.original.status === "rejected" && "opacity-50 cursor-not-allowed"
        }`}
      >
        {row.getValue<string>("fecha_reposicion").split("T")[0]}
      </p>
    ),
  },
  {
    accessorKey: "total_reposicion",
    header: "Total",
    cell: ({ row }) => (
      <p
        className={`font-medium text-slate-900 w-max px-1 ${
          row.original.status === "rejected" && "opacity-50 cursor-not-allowed"
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
            status === "pending"
              ? "text-orange-700 bg-orange-50"
              : status === "rejected"
              ? "text-red-700 bg-red-50 opacity-50 cursor-not-allowed"
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
            : "Aprobado"}
        </p>
      );
    },
  },
  {
    accessorKey: "project",
    header: "Proyecto",
    cell: ({ row }) => (
      <p
        className={`text-slate-500 font-medium w-max px-1 ${
          row.original.status === "rejected" && "opacity-50 cursor-not-allowed"
        }`}
      >
        {row.getValue("project")}
      </p>
    ),
  },
  {
    accessorKey: "month",
    header: "Mes",
    cell: ({ row }) => (
      <p
        className={`text-slate-500 font-medium w-max px-1 ${
          row.original.status === "rejected" && "opacity-50 cursor-not-allowed"
        }`}
      >
        {row.getValue("month")}
      </p>
    ),
  },
  {
    accessorKey: "when",
    header: "Descontar en",
    cell: ({ row }) => (
      <p
        className={`${
          row.original.status === "rejected" && "opacity-50 cursor-not-allowed"
        }`}
      >
        {row.getValue("when")}
      </p>
    ),
  },
  {
    accessorKey: "note",
    header: "Observación",
    cell: ({ row }) => (
      <p
        className={`text-pretty ${
          row.original.status === "rejected" && "opacity-50 cursor-not-allowed"
        }`}
      >
        {row.getValue("note") || "Sin observaciones"}
      </p>
    ),
  },
  {
    accessorKey: "details",
    header: "Detalles",
    cell: ({ row }) => {
      return (
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={`${
                row.original.status === "rejected" && "opacity-70"
              }`}
            >
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
    cell: ({ row, table }) => <ActionButtons row={row.original} />,
  },
];

export function getColumns<T extends RequestProps | ReposicionProps>(
  mode: "requests" | "reposiciones",
  helpers?: ColumnHelpers
): ColumnDef<T, any>[] {
  if (mode === "requests" && helpers) {
    return getRequestColumns(helpers) as ColumnDef<T, any>[];
  }
  return getReposicionColumns() as ColumnDef<T, any>[];
}
