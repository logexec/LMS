/* eslint-disable @typescript-eslint/no-explicit-any */
import { ColumnDef } from "@tanstack/react-table";
import { RequestProps, ReposicionProps, Status } from "@/utils/types";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ColumnHelpers {
  onStatusChange?: (id: number, status: Status) => Promise<void>;
  handleDoubleClick?: (id: string, field: keyof RequestProps) => void;
  handleInputChange?: (
    id: string,
    field: keyof RequestProps,
    value: any
  ) => void;
  handleKeyDown?: (
    event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
    id: string
  ) => void;
  handleSave?: (id: string) => Promise<void>;
  editingField?: { id: string; field: keyof RequestProps } | null;
  editedValues?: { [key: string]: Partial<RequestProps> };
}

// Columnas para RequestProps
export const getRequestColumns = ({
  handleDoubleClick,
  handleInputChange,
  handleKeyDown,
  handleSave,
  editingField,
  editedValues,
}: ColumnHelpers): ColumnDef<RequestProps>[] => [
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
      const id = row.original.unique_id;
      if (editingField?.id === id && editingField.field === "updated_at") {
        return (
          <Input
            type="date"
            value={
              editedValues?.[id]?.updated_at
                ? new Date(editedValues[id].updated_at as string)
                    .toISOString()
                    .split("T")[0]
                : new Date(row.getValue("updated_at") as string)
                    .toISOString()
                    .split("T")[0]
            }
            onChange={(e) =>
              handleInputChange?.(id, "updated_at", e.target.value)
            }
            onBlur={() => handleSave?.(id)}
            onKeyDown={(e) => handleKeyDown?.(e, id)}
            autoFocus
            className="w-full text-center"
          />
        );
      }
      return (
        <p
          className="text-slate-500 font-medium w-full text-start"
          onDoubleClick={() => handleDoubleClick?.(id, "updated_at")}
        >
          {(row.getValue("updated_at") as string).split("T")[0]}
        </p>
      );
    },
    sortingFn: "datetime",
    enableSorting: true,
  },
  {
    accessorKey: "invoice_number",
    header: () => <div className="w-[15ch] text-center">Factura</div>,
    cell: ({ row }) => {
      const id = row.original.unique_id;
      if (editingField?.id === id && editingField.field === "invoice_number") {
        return (
          <Input
            type="text"
            value={
              editedValues?.[id]?.invoice_number ||
              (row.getValue("invoice_number") as string)
            }
            onChange={(e) =>
              handleInputChange?.(id, "invoice_number", e.target.value)
            }
            onBlur={() => handleSave?.(id)}
            onKeyDown={(e) => handleKeyDown?.(e, id)}
            autoFocus
            className="w-full"
          />
        );
      }
      return (
        <div onDoubleClick={() => handleDoubleClick?.(id, "invoice_number")}>
          {row.getValue("invoice_number") || ""}
        </div>
      );
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
      const id = row.original.unique_id;
      if (editingField?.id === id && editingField.field === "account_id") {
        return (
          <Input
            type="text"
            value={
              editedValues?.[id]?.account_id ||
              (row.getValue("account_id") as string)
            }
            onChange={(e) =>
              handleInputChange?.(id, "account_id", e.target.value)
            }
            onBlur={() => handleSave?.(id)}
            onKeyDown={(e) => handleKeyDown?.(e, id)}
            autoFocus
            className="w-full"
          />
        );
      }
      return (
        <p
          className="capitalize px-1"
          onDoubleClick={() => handleDoubleClick?.(id, "account_id")}
        >
          {row.getValue("account_id") || ""}
        </p>
      );
    },
    sortingFn: "alphanumeric",
    enableSorting: true,
  },
  {
    accessorKey: "amount",
    header: () => <div className="w-[7ch] text-center">Valor</div>,
    cell: ({ row }) => {
      const id = row.original.unique_id;
      if (editingField?.id === id && editingField.field === "amount") {
        return (
          <Input
            type="number"
            step="0.01"
            value={
              editedValues?.[id]?.amount || (row.getValue("amount") as string)
            }
            onChange={(e) => handleInputChange?.(id, "amount", e.target.value)}
            onBlur={() => handleSave?.(id)}
            onKeyDown={(e) => handleKeyDown?.(e, id)}
            autoFocus
            className="w-full"
          />
        );
      }
      const rawAmount = row.getValue("amount") as string | number; // Explicitly type
      const amount =
        typeof rawAmount === "string"
          ? parseFloat(rawAmount || "0")
          : rawAmount || 0;
      return (
        <p
          className="font-medium text-slate-900 text-start"
          onDoubleClick={() => handleDoubleClick?.(id, "amount")}
        >
          ${amount.toFixed(2)} {/* Now TypeScript knows amount is a number */}
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
      const id = row.original.unique_id;
      if (editingField?.id === id && editingField.field === "project") {
        return (
          <Input
            type="text"
            value={
              editedValues?.[id]?.project || (row.getValue("project") as string)
            }
            onChange={(e) => handleInputChange?.(id, "project", e.target.value)}
            onBlur={() => handleSave?.(id)}
            onKeyDown={(e) => handleKeyDown?.(e, id)}
            autoFocus
            className="w-full"
          />
        );
      }
      return (
        <p
          className="px-1 text-center"
          onDoubleClick={() => handleDoubleClick?.(id, "project")}
        >
          {row.getValue("project") || ""}
        </p>
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
      const id = row.original.unique_id;
      if (editingField?.id === id && editingField.field === "responsible_id") {
        return (
          <Input
            type="text"
            value={
              editedValues?.[id]?.responsible_id ||
              (row.getValue("responsible_id") as string)
            }
            onChange={(e) =>
              handleInputChange?.(id, "responsible_id", e.target.value)
            }
            onBlur={() => handleSave?.(id)}
            onKeyDown={(e) => handleKeyDown?.(e, id)}
            autoFocus
            className="w-full"
          />
        );
      }
      return (
        <div onDoubleClick={() => handleDoubleClick?.(id, "responsible_id")}>
          {row.getValue("responsible_id") || "—"}
        </div>
      );
    },
    sortingFn: "alphanumeric",
    enableSorting: true,
  },
  {
    accessorKey: "vehicle_plate",
    header: () => <div className="w-[12ch] text-center">Placa</div>,
    cell: ({ row }) => {
      const id = row.original.unique_id;
      if (editingField?.id === id && editingField.field === "vehicle_plate") {
        return (
          <Input
            type="text"
            value={
              editedValues?.[id]?.vehicle_plate ||
              (row.getValue("vehicle_plate") as string)
            }
            onChange={(e) =>
              handleInputChange?.(id, "vehicle_plate", e.target.value)
            }
            onBlur={() => handleSave?.(id)}
            onKeyDown={(e) => handleKeyDown?.(e, id)}
            autoFocus
            className="w-full"
          />
        );
      }
      const vehicle_plate = row.getValue("vehicle_plate") as string;
      return (
        <div onDoubleClick={() => handleDoubleClick?.(id, "vehicle_plate")}>
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
      const id = row.original.unique_id;
      if (editingField?.id === id && editingField.field === "vehicle_number") {
        return (
          <Input
            type="text"
            value={
              editedValues?.[id]?.vehicle_number ||
              (row.getValue("vehicle_number") as string)
            }
            onChange={(e) =>
              handleInputChange?.(id, "vehicle_number", e.target.value)
            }
            onBlur={() => handleSave?.(id)}
            onKeyDown={(e) => handleKeyDown?.(e, id)}
            autoFocus
            className="w-full"
          />
        );
      }
      return (
        <div onDoubleClick={() => handleDoubleClick?.(id, "vehicle_number")}>
          {row.getValue("vehicle_number") ? (
            <p className="text-center w-[12ch]">
              {row.getValue("vehicle_number")}
            </p>
          ) : (
            <p className="text-center">Sin datos</p>
          )}
        </div>
      );
    },
    sortingFn: "alphanumeric",
    enableSorting: true,
  },
  {
    accessorKey: "note",
    header: () => <div className="min-w-[40ch] text-center">Observación</div>,
    cell: ({ row }) => {
      const id = row.original.unique_id;
      if (editingField?.id === id && editingField.field === "note") {
        return (
          <Textarea
            value={
              editedValues?.[id]?.note || (row.getValue("note") as string) || ""
            }
            onChange={(e) => handleInputChange?.(id, "note", e.target.value)}
            onBlur={() => handleSave?.(id)}
            onKeyDown={(e) => handleKeyDown?.(e, id)}
            autoFocus
            className="w-full min-h-[80px]"
          />
        );
      }
      return (
        <p
          className="text-pretty text-justify overflow-ellipsis"
          onDoubleClick={() => handleDoubleClick?.(id, "note")}
        >
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="cursor-default">
                  {(row.getValue("note") as string) || "Sin observaciones."}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                {(row.getValue("note") as string) || "Sin observaciones."}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </p>
      );
    },
    sortingFn: "alphanumeric",
    enableSorting: true,
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
    accessorKey: "unique_id",
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
    sortingFn: "alphanumeric",
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
    id: "type",
    header: () => <div className="w-[12ch] text-center">Tipo</div>,
    cell: ({ row }) => {
      const requests = row.original.requests || [];
      if (!requests.length) {
        return <p className="text-center opacity-50">No especificado</p>;
      }
      const firstRequestId = requests[0].unique_id;
      const type = firstRequestId.startsWith("G")
        ? "Gasto"
        : firstRequestId.startsWith("D")
        ? "Descuento"
        : firstRequestId.startsWith("P")
        ? "Préstamo"
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
    sortingFn: "alphanumeric",
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
                {row.getValue("note") || "Sin observaciones"}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              {row.getValue("note") || "Sin observaciones"}
            </TooltipContent>
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
