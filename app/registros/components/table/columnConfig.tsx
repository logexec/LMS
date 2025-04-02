/* eslint-disable @typescript-eslint/no-explicit-any */
import { ColumnDef } from "@tanstack/react-table";
import { ReposicionProps, RequestProps, Status } from "@/utils/types";
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
  accountMap: Record<string, string>;
  responsibleMap: Record<string, string>;
  vehicleMap: Record<string, string>;
  projectMap: Record<string, string>;
  onStatusChange?: (id: number, status: Status) => Promise<void>;
  // Nuevos campos para edición con doble clic
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
  accountMap,
  responsibleMap,
  vehicleMap,
  projectMap,
  // onStatusChange no se usa, lo mantenemos en la interfaz pero lo quitamos de los parámetros desestructurados
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
    header: () => <div className="text-center w-[10ch]">Fecha</div>,
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
            className="w-full"
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
    header: () => <div className="w-[25ch] text-center">Factura</div>,
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
          <Select
            value={
              editedValues?.[id]?.account_id?.toString() ||
              (row.getValue("account_id") as string)
            }
            onValueChange={(value) => {
              handleInputChange?.(id, "account_id", value);
              handleSave?.(id);
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleccionar cuenta" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(accountMap).map(([accountId, accountName]) => (
                <SelectItem key={accountId} value={accountId}>
                  {accountName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
    sortingFn: (rowA, rowB) => {
      const a: string = rowA.getValue("account_id") || "";
      const b: string = rowB.getValue("account_id") || "";
      return a.localeCompare(b);
    },
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

      const rawAmount = row.getValue("amount");
      const amount =
        typeof rawAmount === "string"
          ? parseFloat(rawAmount || "0")
          : typeof rawAmount === "number"
          ? rawAmount
          : 0;

      return (
        <p
          className="font-medium text-slate-900 text-start"
          onDoubleClick={() => handleDoubleClick?.(id, "amount")}
        >
          ${amount.toFixed(2)}
        </p>
      );
    },
    sortingFn: (rowA, rowB) => {
      const aValue = rowA.getValue("amount");
      const bValue = rowB.getValue("amount");

      const a =
        typeof aValue === "string"
          ? parseFloat(aValue || "0")
          : typeof aValue === "number"
          ? aValue
          : 0;
      const b =
        typeof bValue === "string"
          ? parseFloat(bValue || "0")
          : typeof bValue === "number"
          ? bValue
          : 0;

      return a - b; // Ordenamiento numérico
    },
    enableSorting: true,
  },
  {
    accessorKey: "project",
    header: () => <div className="w-[7ch] text-center">Proyecto</div>,
    cell: ({ row }) => {
      const id = row.original.unique_id;
      if (editingField?.id === id && editingField.field === "project") {
        return (
          <Select
            value={
              editedValues?.[id]?.project?.toString() ||
              (row.getValue("project") as string)
            }
            onValueChange={(value) => {
              handleInputChange?.(id, "project", value);
              handleSave?.(id);
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleccionar proyecto" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(projectMap).map(([projectId, projectName]) => (
                <SelectItem key={projectId} value={projectId}>
                  {projectName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      }
      return (
        <p
          className="px-1 text-center"
          onDoubleClick={() => handleDoubleClick?.(id, "project")}
        >
          {row.getValue<string>("project") || ""}
        </p>
      );
    },
    sortingFn: (rowA, rowB) => {
      const a = rowA.getValue<string>("project") || "";
      const b = rowB.getValue<string>("project") || "";
      return a.localeCompare(b);
    },
    enableSorting: true,
  },
  // Corrección para el cell de responsible_id
  {
    accessorKey: "responsible_id",
    header: () => (
      <div className="min-w-64 max-w-sm text-center">Responsable</div>
    ),
    cell: ({ row }) => {
      const id = row.original.unique_id;
      if (editingField?.id === id && editingField.field === "responsible_id") {
        return (
          <Select
            value={
              editedValues?.[id]?.responsible_id?.toString() ||
              (row.getValue("responsible_id") as string) ||
              ""
            }
            onValueChange={(value) => {
              handleInputChange?.(id, "responsible_id", value);
              handleSave?.(id);
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleccionar responsable" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(responsibleMap).map(([respId, respName]) => (
                <SelectItem key={respId} value={respId}>
                  {respName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      }

      // Obtenemos el valor y nos aseguramos de que sea un string o undefined/null
      const responsible = row.getValue("responsible_id") as
        | string
        | null
        | undefined;

      // Al utilizar operador ternario, aseguramos que siempre retornamos un ReactNode válido
      return (
        <div onDoubleClick={() => handleDoubleClick?.(id, "responsible_id")}>
          {responsible ? responsible || "No encontrado" : "—"}
        </div>
      );
    },
    sortingFn: (rowA, rowB) => {
      const aId = rowA.getValue("responsible_id") as string | null | undefined;
      const bId = rowB.getValue("responsible_id") as string | null | undefined;
      // Convertimos a string para comparación, asegurando valores por defecto
      const a = aId ? aId || "No encontrado" : "—";
      const b = bId ? bId || "No encontrado" : "—";
      return a.localeCompare(b);
    },
    enableSorting: true,
  },
  {
    accessorKey: "vehicle_plate",
    header: () => <div className="w-[12ch] text-center">Placa</div>,
    cell: ({ row }) => {
      const id = row.original.unique_id;
      if (editingField?.id === id && editingField.field === "vehicle_plate") {
        return (
          <Select
            value={
              editedValues?.[id]?.vehicle_plate?.toString() ||
              (row.getValue("vehicle_plate") as string)
            }
            onValueChange={(value) => {
              handleInputChange?.(id, "vehicle_plate", value);
              handleSave?.(id);
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleccionar placa" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(vehicleMap).map(([plateId, plateName]) => (
                <SelectItem key={plateId} value={plateId}>
                  {plateName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      }
      const vehicle_plate = row.getValue("vehicle_plate") as string;
      return (
        <div onDoubleClick={() => handleDoubleClick?.(id, "vehicle_plate")}>
          {vehicle_plate ? (
            <p className="text-center w-[12ch]">
              {vehicle_plate
                ? `${vehicle_plate.slice(0, 3)}-${vehicle_plate.slice(3, 7)}`
                : "No encontrado"}
            </p>
          ) : (
            <p className="text-center">—</p>
          )}
        </div>
      );
    },
    sortingFn: (rowA, rowB) => {
      const aId = rowA.getValue("vehicle_plate") as string;
      const bId = rowB.getValue("vehicle_plate") as string;
      const a = aId
        ? aId
          ? `${aId.slice(0, 3)}-${aId.slice(3, 7)}`
          : "No encontrado"
        : "—";
      const b = bId
        ? bId
          ? `${bId.slice(0, 3)}-${bId.slice(3, 7)}`
          : "No encontrado"
        : "—";
      return a.localeCompare(b);
    },
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
      const vehicle_number = row.getValue("vehicle_number") as string;
      return (
        <div onDoubleClick={() => handleDoubleClick?.(id, "vehicle_number")}>
          {vehicle_number ? (
            <p className="text-center w-[12ch]">
              {row.getValue("vehicle_number")
                ? `${row.getValue("vehicle_number")}`
                : "No encontrado"}
            </p>
          ) : (
            <p className="text-center">Sin datos</p>
          )}
        </div>
      );
    },
    sortingFn: (rowA, rowB) => {
      const aNumber = rowA.getValue("vehicle_number") as string;
      const bNumber = rowB.getValue("vehicle_number") as string;
      const a = aNumber ? (aNumber ? `${aNumber}` : "No encontrado") : "—";
      const b = bNumber ? (bNumber ? `${bNumber}` : "No encontrado") : "—";
      return a.localeCompare(b);
    },
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
const DetailsCell = ({
  row,
  projectMap,
}: {
  row: any;
  projectMap: Record<string, string>;
}) => {
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
            Proyecto {projectMap[row.original.project] || row.original.project}
          </DialogDescription>
        </DialogHeader>
        <RequestDetailsTable
          requests={requests}
          repositionId={id}
          projectMap={projectMap}
        />
      </DialogContent>
    </Dialog>
  );
};

// Columnas para ReposicionProps
export const getReposicionColumns = (
  projectMap: Record<string, string>
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
    sortingFn: (rowA, rowB) => {
      const a = rowA.getValue<number>("total_reposicion");
      const b = rowB.getValue<number>("total_reposicion");
      return a - b; // Ordenamiento numérico
    },
    enableSorting: true,
  },
  {
    accessorKey: "status",
    header: () => <div className="w-[12ch] text-center">Estado</div>,
    cell: ({ row }) => {
      const status = row.getValue("status") as Status;
      return (
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
        {projectMap[row.getValue<string>("project")] ||
          row.getValue<string>("project")}
      </p>
    ),
    sortingFn: (rowA, rowB) => {
      const a =
        projectMap[rowA.getValue<string>("project")] ||
        rowA.getValue<string>("project");
      const b =
        projectMap[rowB.getValue<string>("project")] ||
        rowB.getValue<string>("project");
      return a.localeCompare(b);
    },
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
        row.getValue("month") === null ||
        row.getValue("month") === undefined
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
        {row.getValue("when") === "" ||
        row.getValue("when") === null ||
        row.getValue("when") === undefined ||
        (row.original.status === "rejected" && row.getValue("when") === null)
          ? "No especificado"
          : row.original.when}
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
    sortingFn: (rowA, rowB) => {
      const getType = (requests: RequestProps[]) => {
        if (!requests.length) return "No especificado";
        const id = requests[0].unique_id;
        return id.startsWith("G")
          ? "Gasto"
          : id.startsWith("D")
          ? "Descuento"
          : "Desconocido";
      };
      const a = getType(rowA.original.requests || []);
      const b = getType(rowB.original.requests || []);
      return a.localeCompare(b);
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
                {row.getValue("note") !== null && row.getValue("note") !== ""
                  ? row.getValue("note")
                  : "Sin observaciones"}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              {row.getValue("note") !== null && row.getValue("note") !== ""
                ? row.getValue("note")
                : "Sin observaciones"}
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
    cell: ({ row }) => <DetailsCell row={row} projectMap={projectMap} />,
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
  return getReposicionColumns(helpers?.projectMap || {}) as ColumnDef<T>[];
}
