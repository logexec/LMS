/* eslint-disable @typescript-eslint/no-explicit-any */
import { ColumnDef } from "@tanstack/react-table";
import {
  RequestProps,
  ReposicionProps,
  Status,
  AccountProps,
  Project,
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
import RequestDetailsTable from "./RequestDetailsTable";
import { ActionButtons } from "./ActionButtons";
import Checkbox from "@/app/components/Checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import EditCell from "./EditCell";

interface ColumnHelpers {
  onStatusChange?: (id: number, status: Status) => Promise<void>;
  accountMap?: Record<string, string>;
  responsibleMap?: Record<string, string>;
  vehicleMap?: Record<string, string>;
  projectMap?: Record<string, string>;
  accounts?: AccountProps[];
  projects?: Project[];
}

// Columnas para RequestProps

export const getRequestColumns = (
  helpers: ColumnHelpers = {}
): ColumnDef<RequestProps>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        label="Select all"
        name="selectAll"
        checked={table.getIsAllPageRowsSelected()}
        onChange={(e) => table.toggleAllPageRowsSelected(!!e.target.checked)}
        className="w-[3ch]"
        hideLabel
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        label="Select row"
        name={`select-${row.id}`}
        checked={row.getIsSelected()}
        onChange={(e) => row.toggleSelected(!!e.target.checked)}
        className="-ml-[7px]"
        hideLabel
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "unique_id",
    header: () => <div className="w-[10ch] text-center">ID</div>,
    sortingFn: "alphanumeric",
    enableSorting: true,
  },
  {
    accessorKey: "updated_at",
    header: () => <div className="text-center w-[15ch]">Fecha</div>,
    cell: ({ row }) => {
      return (
        <p className="text-slate-500 font-medium w-full text-start">
          {(row.getValue("updated_at") as string).split("T")[0]}
        </p>
      );
    },
    sortingFn: "datetime",
    enableSorting: true,
  },
  {
    accessorKey: "invoice_number",
    header: () => <div className="w-[10ch] text-center">Factura</div>,
    cell: ({ row }) => {
      return <div>{row.getValue("invoice_number") || ""}</div>;
    },
    sortingFn: "alphanumeric",
    enableSorting: true,
  },
  {
    accessorKey: "account_id",
    header: () => (
      <div className="min-w-[20ch] max-w-[65ch] text-center">Cuenta</div>
    ),
    cell: ({ row }) => {
      return (
        <p className="capitalize px-1">{row.getValue("account_id") || ""}</p>
      );
    },
    sortingFn: "alphanumeric",
    enableSorting: true,
  },
  {
    accessorKey: "amount",
    header: () => <div className="w-[7ch] text-center">Valor</div>,
    cell: ({ row }) => {
      const rawAmount = row.getValue("amount") as string | number;
      const amount =
        typeof rawAmount === "string"
          ? parseFloat(rawAmount || "0")
          : rawAmount || 0;
      return (
        <p className="font-medium text-slate-900 text-start">
          ${amount.toFixed(2)}
        </p>
      );
    },
    sortingFn: "basic",
    enableSorting: true,
  },
  {
    accessorKey: "project",
    header: () => <div className="w-[7ch] text-center">Proyecto</div>,
    cell: ({ row }) => {
      return (
        <p className="px-1 text-center">{row.getValue("project") || ""}</p>
      );
    },
    sortingFn: "alphanumeric",
    enableSorting: true,
  },
  {
    accessorKey: "responsible_id",
    header: () => (
      <div className="min-w-64 max-w-sm text-center">Responsable</div>
    ),
    cell: ({ row }) => {
      return <div>{row.getValue("responsible_id") || "—"}</div>;
    },
    sortingFn: "alphanumeric",
    enableSorting: true,
  },
  {
    accessorKey: "vehicle_plate",
    header: () => <div className="w-[12ch] text-center">Placa</div>,
    cell: ({ row }) => {
      const vehicle_plate = row.getValue("vehicle_plate") as string;
      return (
        <div>
          {vehicle_plate ? (
            <p className="text-center w-[12ch]">{vehicle_plate}</p>
          ) : (
            <p className="text-center">—</p>
          )}
        </div>
      );
    },
    sortingFn: "alphanumeric",
    enableSorting: true,
  },
  {
    accessorKey: "vehicle_number",
    header: () => <div className="w-[12ch] text-center">No. Transporte</div>,
    cell: ({ row }) => {
      return (
        <div>
          {row.getValue("vehicle_number") ? (
            <p className="text-center w-[12ch]">
              {row.getValue("vehicle_number")}
            </p>
          ) : (
            <p className="text-center">—</p>
          )}
        </div>
      );
    },
    sortingFn: "alphanumeric",
    enableSorting: true,
  },
  {
    accessorKey: "note",
    header: () => <div className="min-w-[35ch] text-center">Observación</div>,
    cell: ({ row }) => {
      return (
        <p className="text-pretty text-justify overflow-ellipsis">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="cursor-default">
                  {(row.getValue("note") as string) || "—"}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                {(row.getValue("note") as string) || "—"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </p>
      );
    },
    sortingFn: "alphanumeric",
    enableSorting: true,
  },
  {
    accessorKey: "options",
    header: () => <div className="min-w-[8ch] text-center">Acciones</div>,
    cell: ({ row, table }) => (
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger>
            <div className="flex items-center justify-center">
              <EditCell
                row={row}
                table={table}
                accounts={helpers.accounts || []}
                projects={helpers.projects || []}
              />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Editar</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ),
    enableSorting: false,
  },
];

// Componente de celda separado:
const DetailsCell = ({ row }: { row: any }) => {
  const [isOpen, setIsOpen] = useState(false);
  const requests = row.original.requests || [];
  const id = row.original.id;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild className="-ml-3">
        <Button variant="outline" size="sm" onClick={() => setIsOpen(true)}>
          <FileText className="h-4 w-4" />
          Detalle
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95%]">
        <DialogHeader>
          <DialogTitle>Solicitudes de la Reposición</DialogTitle>
          <DialogDescription>
            Proyecto {row.original.project || "Sin proyecto"}
          </DialogDescription>
        </DialogHeader>
        <RequestDetailsTable
          requests={requests}
          repositionId={id}
          projectMap={{}}
        />
      </DialogContent>
    </Dialog>
  );
};

// Columnas para ReposicionProps
export const getReposicionColumns = (
  helpers?: ColumnHelpers
): ColumnDef<ReposicionProps>[] => [
  {
    accessorKey: "id",
    header: () => <div className="max-w-[5ch] text-center">ID</div>,
    cell: ({ row }) => (
      <p
        className={`text-slate-500 font-medium text-center ${
          (row.original.status === "rejected" ||
            row.original.status === "paid") &&
          "opacity-70"
        }`}
      >
        {row.original.id}
      </p>
    ),
    sortingFn: "basic",
    enableSorting: true,
  },
  {
    accessorKey: "fecha_reposicion",
    header: () => <div className="text-center w-[10ch]">Fecha</div>,
    cell: ({ row }) => (
      <p
        className={`text-slate-500 font-medium w-max px-1 ${
          (row.original.status === "rejected" ||
            row.original.status === "paid") &&
          "opacity-50"
        }`}
      >
        {row.getValue<string>("fecha_reposicion").split("T")[0]}
      </p>
    ),
    sortingFn: "datetime",
    enableSorting: true,
  },
  {
    accessorKey: "total_reposicion",
    header: () => <div className="w-[7ch] text-center">Total</div>,
    cell: ({ row }) => (
      <p
        className={`font-medium text-slate-900 w-max px-1 ${
          (row.original.status === "rejected" ||
            row.original.status === "paid") &&
          "opacity-50"
        }`}
      >
        $
        {new Intl.NumberFormat("es-ES", { minimumFractionDigits: 2 }).format(
          row.getValue<number>("total_reposicion")
        )}
      </p>
    ),
    sortingFn: "basic",
    enableSorting: true,
  },
  {
    accessorKey: "status",
    header: () => <div className="w-[12ch] text-center">Estado</div>,
    cell: ({ row }) => {
      const id = row.original.id;
      const status = row.getValue("status") as Status;
      return helpers?.onStatusChange ? (
        <Select
          value={status}
          onValueChange={async (newStatus: Status) => {
            if (helpers.onStatusChange) {
              await helpers.onStatusChange(id, newStatus);
              // Optimistic update handled by parent
            }
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pendiente</SelectItem>
            <SelectItem value="rejected">Rechazado</SelectItem>
            <SelectItem value="review">Revisar</SelectItem>
            <SelectItem value="paid">Pagado</SelectItem>
          </SelectContent>
        </Select>
      ) : (
        <p
          className={`font-semibold rounded-lg text-center ${
            status === "pending"
              ? "text-orange-700 bg-orange-100 px-1.5"
              : status === "rejected"
              ? "text-red-700 bg-red-100 px-1.5 opacity-50"
              : status === "review"
              ? "text-indigo-700 bg-indigo-100 px-1.5"
              : "text-emerald-700 bg-emerald-100 px-1.5 opacity-50"
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
    sortingFn: "alphanumeric",
    enableSorting: true,
  },
  {
    accessorKey: "project",
    header: () => <div className="w-[7ch] text-center">Proyecto</div>,
    cell: ({ row }) => (
      <p
        className={`text-slate-500 font-medium w-max px-1 ${
          (row.original.status === "rejected" ||
            row.original.status === "paid") &&
          "opacity-50"
        }`}
      >
        {row.getValue<string>("project") || "Sin proyecto"}
      </p>
    ),
    sortingFn: "alphanumeric",
    enableSorting: true,
  },
  {
    accessorKey: "month",
    header: () => <div className="w-[15ch] text-center">Mes/Rol</div>,
    cell: ({ row }) => (
      <p
        className={`text-slate-500 font-medium w-max px-1 ${
          (row.original.status === "rejected" ||
            row.original.status === "paid") &&
          "opacity-50"
        }`}
      >
        {row.original.status === "rejected" ||
        row.getValue("month") === "0000-00-00" ||
        !row.getValue("month")
          ? "No especificado"
          : row.getValue("month")}
      </p>
    ),
    sortingFn: "alphanumeric",
    enableSorting: true,
  },
  {
    accessorKey: "when",
    header: () => <div className="w-[15ch] text-center">Descontar en</div>,
    cell: ({ row }) => (
      <p
        className={`capitalize ${
          (row.original.status === "rejected" ||
            row.original.status === "paid") &&
          "opacity-50"
        }`}
      >
        {!row.getValue("when") || row.original.status === "rejected"
          ? "No especificado"
          : row.getValue("when")}
      </p>
    ),
    sortingFn: "alphanumeric",
    enableSorting: true,
  },
  {
    id: "request_type",
    accessorKey: "request_type", // Esto puede quedarse aunque no se use directamente
    header: () => <div className="w-[12ch] text-center">Tipo</div>,
    cell: ({ row }) => {
      const requests = row.original.requests || [];
      if (!requests.length) {
        return <p className="text-center opacity-50">—</p>;
      }
      const firstRequestId = requests[0].unique_id;
      const type = firstRequestId.startsWith("G")
        ? "Gasto"
        : firstRequestId.startsWith("D")
        ? "Descuento"
        : firstRequestId.startsWith("P")
        ? "Préstamo"
        : firstRequestId.startsWith("I")
        ? "Ingreso"
        : "Desconocido";
      return (
        <p
          className={`text-start font-medium ${
            (row.original.status === "rejected" ||
              row.original.status === "paid") &&
            "opacity-50"
          }`}
        >
          {type}
        </p>
      );
    },
    sortingFn: (rowA, rowB) => {
      const getRequestType = (row: any) => {
        const requests = row.original.requests || [];
        if (!requests.length) return "—"; // Valor por defecto para filas sin requests
        const firstRequestId = requests[0].unique_id;
        return firstRequestId.startsWith("G")
          ? "Gasto"
          : firstRequestId.startsWith("D")
          ? "Descuento"
          : firstRequestId.startsWith("P")
          ? "Préstamo"
          : firstRequestId.startsWith("I")
          ? "Ingreso"
          : "Desconocido";
      };

      const typeA = getRequestType(rowA);
      const typeB = getRequestType(rowB);

      // Compara los valores como strings
      return typeA.localeCompare(typeB);
    },
    enableSorting: true,
  },
  {
    accessorKey: "note",
    header: () => <div className="min-w-[40ch] text-center">Observación</div>,
    cell: ({ row }) => (
      <p className="text-pretty text-justify overflow-ellipsis">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                className={`text-pretty cursor-default ${
                  (row.original.status === "rejected" ||
                    row.original.status === "paid") &&
                  "opacity-50"
                }`}
              >
                {row.getValue("note") || "—"}
              </span>
            </TooltipTrigger>
            <TooltipContent>{row.getValue("note") || "—"}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </p>
    ),
    sortingFn: "alphanumeric",
    enableSorting: false,
  },
  {
    accessorKey: "details",
    header: () => <div className="w-[10ch] text-center">Detalles</div>,
    cell: ({ row }) => <DetailsCell row={row} />,
    enableSorting: false,
  },
  {
    id: "actions",
    header: () => <div className="w-[356px] text-center">Acciones</div>,
    cell: ({ row }) => <ActionButtons row={row.original} />,
    enableSorting: false,
  },
];

// Función genérica para obtener columnas
export function getColumns<T extends RequestProps | ReposicionProps>(
  mode: "requests" | "reposiciones",
  helpers?: ColumnHelpers
): ColumnDef<T>[] {
  if (mode === "requests" && helpers) {
    return getRequestColumns(helpers) as ColumnDef<T>[];
  }
  return getReposicionColumns(helpers) as ColumnDef<T>[];
}
