"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Status, RequestProps, ReposicionProps } from "@/utils/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Check, FileText, ScanSearch, X } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import UndoableToast from "./UndoableToast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import RequestDetailsTable from "./RequestDetailsTable";
import Checkbox from "@/app/components/Checkbox";

interface ColumnHelpers {
  accountMap: Record<string, string>;
  responsibleMap: Record<string, string>;
  vehicleMap: Record<string, string>;
  onStatusChange?: (id: number, status: Status) => Promise<void>;
  onUpdateReposicion?: (
    id: number,
    newStatus: Status,
    previousStatus: Status
  ) => Promise<void>;
}

const getStatusMessages = (status: Status) => {
  const messages = {
    [Status.approved]: {
      title: "Aprobar Reposición",
      description: "¿Estás seguro de que deseas aprobar esta reposición?",
      action: "Aprobar",
      toast: "Reposición aprobada correctamente",
    },
    [Status.rejected]: {
      title: "Rechazar Reposición",
      description: "¿Estás seguro de que deseas rechazar esta reposición?",
      action: "Rechazar",
      toast: "Reposición rechazada",
    },
    [Status.review]: {
      title: "Enviar a Revisión",
      description:
        "¿Estás seguro de que deseas enviar esta reposición a revisión?",
      action: "Enviar a revisión",
      toast: "Reposición enviada a revisión",
    },
    [Status.pending]: {
      title: "Marcar como Pendiente",
      description:
        "¿Estás seguro de que deseas marcar esta reposición como pendiente?",
      action: "Marcar como pendiente",
      toast: "Reposición marcada como pendiente",
    },
    [Status.in_reposition]: {
      title: "Marcar en Reposición",
      description:
        "¿Estás seguro de que deseas marcar esta reposición en proceso de reposición?",
      action: "Marcar en proceso",
      toast: "Reposición marcada en proceso",
    },
  };
  return messages[status];
};

const handleStatusUpdate = (
  id: number,
  newStatus: Status,
  currentStatus: Status,
  onUpdateReposicion?: (
    id: number,
    newStatus: Status,
    previousStatus: Status
  ) => Promise<void>
) => {
  // Mostrar toast con opción de deshacer
  toast.custom(
    (t) => (
      <UndoableToast
        message={getStatusMessages(newStatus).toast}
        status={newStatus}
        onUndo={() => {
          // Restaurar el estado anterior
          onUpdateReposicion?.(id, currentStatus, newStatus);
          toast.dismiss(t);
        }}
      />
    ),
    {
      duration: 5000,
      onAutoClose: () => {
        // Confirmar la acción cuando el toast se cierre
        onUpdateReposicion?.(id, newStatus, currentStatus);
      },
    }
  );
};

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

export const getReposicionColumns = ({
  accountMap,
  responsibleMap,
  vehicleMap,
  onUpdateReposicion,
}: ColumnHelpers): ColumnDef<ReposicionProps>[] => [
  {
    accessorKey: "fecha_reposicion",
    header: "Fecha",
    cell: ({ row }) => (
      <p className="text-slate-500 font-medium w-max px-1">
        {row.getValue<string>("fecha_reposicion").split("T")[0]}
      </p>
    ),
  },
  {
    accessorKey: "total_reposicion",
    header: "Total",
    cell: ({ row }) => (
      <p className="font-medium text-slate-900 w-max px-1">
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
            : "Aprobado"}
        </p>
      );
    },
  },
  {
    accessorKey: "project",
    header: "Proyecto",
  },
  {
    accessorKey: "month",
    header: "Mes",
    cell: ({ row }) => {
      const today = new Date();
      const minDate = new Date(today.getFullYear(), today.getMonth(), 1)
        .toISOString()
        .split("T")[0];

      return (
        <input
          type="month"
          name="month"
          id="month"
          min={minDate}
          className="border border-slate-200 rounded-md p-1 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-transparent"
          onChange={(e) => {
            console.log(e.target.value);
          }}
        />
      );
    },
  },
  {
    accessorKey: "when",
    header: "Descontar en",
    cell: ({ row }) => {
      let when: string = row.original.when;
      return (
        <select
          name="when"
          id="when"
          className="w-full border border-slate-200 rounded-md p-1 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-transparent"
          value={when}
          onChange={(e) => {
            console.log(e.target.value);
          }}
        >
          <option value="rol">Rol</option>
          <option value="decimo_cuarto">Décimo Cuarto</option>
          <option value="decimo_tercero">Décimo Tercero</option>
          <option value="liquidacion">Liquidación</option>
          <option value="utilidades">Utilidades</option>
        </select>
      );
    },
  },
  {
    accessorKey: "note",
    header: "Observación",
    cell: ({ row }) => (
      <input
        type="text"
        className="w-full border border-slate-200 rounded-md p-1 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-transparent"
        name="note"
        id="note"
        value={(row.getValue("note") as string) || ""}
        onChange={(e) => {
          console.log(e.target.value);
        }}
      />
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
    cell: ({ row }) => {
      const currentStatus = row.original.status;
      return (
        <div className="flex flex-row flex-wrap items-center gap-1 w-36">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button className="text-white bg-red-600 hover:bg-red-700 size-7">
                      <X />
                      <span className="sr-only">Rechazar</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        {getStatusMessages(Status.rejected).title}
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        {getStatusMessages(Status.rejected).description}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-red-600 hover:bg-red-700"
                        onClick={() =>
                          handleStatusUpdate(
                            row.original.id,
                            Status.rejected,
                            currentStatus,
                            onUpdateReposicion
                          )
                        }
                      >
                        {getStatusMessages(Status.rejected).action}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TooltipTrigger>
              <TooltipContent>
                <p className="bg-red-600 font-medium px-1.5 py-0.5 rounded-xl text-white">
                  Rechazar
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button className="text-white bg-indigo-600 hover:bg-indigo-700 size-7">
                      <ScanSearch />
                      <span className="sr-only">Revisar</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        {getStatusMessages(Status.review).title}
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        {getStatusMessages(Status.review).description}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-indigo-600 hover:bg-indigo-700"
                        onClick={() =>
                          handleStatusUpdate(
                            row.original.id,
                            Status.review,
                            currentStatus,
                            onUpdateReposicion
                          )
                        }
                      >
                        {getStatusMessages(Status.review).action}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TooltipTrigger>
              <TooltipContent>
                <p className="bg-indigo-600 font-medium px-1.5 py-0.5 rounded-xl text-white">
                  Revisar
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button className="text-white bg-emerald-600 hover:bg-emerald-700 size-7">
                      <Check />
                      <span className="sr-only">Aprobar</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        {getStatusMessages(Status.approved).title}
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        {getStatusMessages(Status.approved).description}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-emerald-600 hover:bg-emerald-700"
                        onClick={() =>
                          handleStatusUpdate(
                            row.original.id,
                            Status.approved,
                            currentStatus,
                            onUpdateReposicion
                          )
                        }
                      >
                        {getStatusMessages(Status.approved).action}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TooltipTrigger>
              <TooltipContent>
                <p className="bg-emerald-600 font-medium px-1.5 pt-0.5 pb-1 rounded-xl text-white">
                  Aprobar
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      );
    },
  },
];

export default {
  getRequestColumns,
  getReposicionColumns,
};
