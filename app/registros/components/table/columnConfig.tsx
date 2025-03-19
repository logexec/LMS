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

interface ColumnHelpers {
  accountMap: Record<string, string>;
  responsibleMap: Record<string, string>;
  vehicleMap: Record<string, string>;
  projectMap: Record<string, string>; // Añadimos projectMap
  onStatusChange?: (id: number, status: Status) => Promise<void>;
}

// Columnas para RequestProps
export const getRequestColumns = ({
  accountMap,
  responsibleMap,
  vehicleMap,
  projectMap,
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
  },
  {
    accessorKey: "updated_at",
    header: () => <div className="text-center w-[10ch]">Fecha</div>,
    cell: ({ row }) => (
      <p className="text-slate-500 font-medium w-full text-start">
        {(row.getValue("updated_at") as string).split("T")[0]}
      </p>
    ),
  },
  {
    accessorKey: "invoice_number",
    header: () => <div className="w-[25ch] text-center">Factura</div>,
  },
  {
    accessorKey: "account_id",
    header: () => (
      <div className="min-w-[20ch] max-w-[65ch] text-center">Cuenta</div>
    ),
    cell: ({ row }) => (
      <p className="capitalize px-1">
        {accountMap[row.getValue("account_id") as number]}
      </p>
    ),
  },
  {
    accessorKey: "amount",
    header: () => <div className="w-[7ch] text-center">Valor</div>,
    cell: ({ row }) => (
      <p className="font-medium text-slate-900 text-start">
        ${parseFloat(row.getValue("amount") as string).toFixed(2)}
      </p>
    ),
  },
  {
    accessorKey: "project",
    header: () => <div className="w-[7ch] tet-center">Proyecto</div>,
    cell: ({ row }) => (
      <p className="px-1 text-center">
        {projectMap[row.getValue<string>("project")] ||
          "No se pudo obtener el nombre del proyecto"}
      </p>
    ),
  },
  {
    accessorKey: "responsible_id",
    header: () => (
      <div className="min-w-64 max-w-sm text-center">Responsable</div>
    ),
    cell: ({ row }) => {
      const id = row.getValue("responsible_id") as string;
      return id ? responsibleMap[id] || "No encontrado" : "No aplica";
    },
  },
  {
    accessorKey: "transport_id",
    header: () => <div className="w-[12ch] text-center">Placa</div>,
    cell: ({ row }) => {
      const id = row.getValue("transport_id") as string;
      return id ? (
        <p className="text-center w-[12ch]">
          {vehicleMap[id]
            ? `${vehicleMap[id].slice(0, 3)}-${vehicleMap[id].slice(3, 7)}`
            : "No encontrado"}
        </p>
      ) : (
        <p className="text-center">No aplica</p>
      );
    },
  },
  {
    accessorKey: "note",
    header: () => <div className="min-w-[40ch] text-center">Observación</div>,
    cell: ({ row }) => (
      <p className="text-pretty text-justify overflow-ellipsis">
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
    ),
  },
];

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
  },
  {
    accessorKey: "month",
    header: () => <div className="w-[15ch] text-center">Mes</div>,
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
          : row.getValue("when")}
      </p>
    ),
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
  },
  {
    accessorKey: "details",
    header: () => <div className="w-[10ch] text-center">Detalles</div>,
    cell: ({ row }) => {
      const requests = row.original.requests || [];
      const id = row.original.id;
      return (
        <Dialog>
          <DialogTrigger asChild className="-ml-3">
            <Button variant="outline" size="sm">
              <FileText className="h-4 w-4" />
              Detalle
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[95%]">
            <DialogHeader>
              <DialogTitle>Solicitudes de la Reposición</DialogTitle>
              <DialogDescription>
                Proyecto{" "}
                {projectMap[row.original.project] || row.original.project}
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
    },
  },
  {
    id: "actions",
    header: () => <div className="w-[356px] text-center">Acciones</div>,
    cell: ({ row }) => <ActionButtons row={row.original} />,
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
