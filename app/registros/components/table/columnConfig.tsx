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
import { FileText, Loader, Trash } from "lucide-react";
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
import apiService from "@/services/api.service";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  AlertDialogCancel,
  AlertDialogDescription,
} from "@radix-ui/react-alert-dialog";
import { toast } from "sonner";
import { Permission } from "@/utils/constants";

interface ColumnHelpers {
  onStatusChange?: (id: number, status: Status) => Promise<void>;
  accountMap?: Record<string, string>;
  responsibleMap?: Record<string, string>;
  vehicleMap?: Record<string, string>;
  projectMap?: Record<string, string>;
  accounts?: AccountProps[];
  projects?: Project[];
  hasPermission?: (permission: string) => boolean;
}

// Nueva función para eliminar múltiples registros
const handleDeleteMultipleRecords = async (ids: string[], table: any) => {
  try {
    // Realizar la eliminación de todos los registros en paralelo
    const deletePromises = ids.map((id) => apiService.deleteRequest(id));
    const responses = await Promise.all(deletePromises);

    // Verificar si todas las eliminaciones fueron exitosas
    const allSuccessful = responses.every((response) => response.ok);

    if (allSuccessful) {
      toast.success(`Se eliminaron ${ids.length} registros correctamente`);

      // Actualización optimista: Eliminar los registros de la tabla
      if (table.options.meta?.removeRows) {
        table.options.meta.removeRows(ids);
      }

      // Cerrar todos los diálogos abiertos
      const dialogElements = document.querySelectorAll('[role="dialog"]');
      dialogElements.forEach((dialog) => {
        const openButtons = dialog.querySelectorAll('[data-state="open"]');
        openButtons.forEach((button) => {
          if (button instanceof HTMLElement) {
            button.click();
          }
        });

        const cancelButton = dialog.querySelector(
          "[data-radix-alert-dialog-cancel]"
        );
        if (cancelButton instanceof HTMLElement) {
          cancelButton.click();
        }
      });

      const escEvent = new KeyboardEvent("keydown", {
        key: "Escape",
        code: "Escape",
        keyCode: 27,
        which: 27,
        bubbles: true,
      });
      document.dispatchEvent(escEvent);
    } else {
      const failedIds = responses
        .map((response, index) => (!response.ok ? ids[index] : null))
        .filter(Boolean);
      console.error(
        `No se pudieron eliminar los registros: ${failedIds.join(", ")}`
      );
      toast.error(
        `No se pudieron eliminar algunos registros: ${failedIds.join(
          ", "
        )}. Inténtalo nuevamente.`
      );
      if (table.options.meta?.refreshData) {
        table.options.meta.refreshData();
      }
    }

    return allSuccessful;
  } catch (error) {
    console.error("Error al eliminar registros:", error);
    if (table.options.meta?.refreshData) {
      table.options.meta.refreshData();
    }
    toast.error("Error al eliminar los registros. Inténtalo nuevamente.");
    return false;
  }
};

const handleDeleteRecord = async (id: string, table: any) => {
  try {
    const response = await apiService.deleteRequest(id);

    if (response.ok) {
      toast.success(`${response.message}`);

      if (table.options.meta?.removeRow) {
        table.options.meta.removeRow(id);
      }

      const dialogElements = document.querySelectorAll('[role="dialog"]');
      dialogElements.forEach((dialog) => {
        const openButtons = dialog.querySelectorAll('[data-state="open"]');
        openButtons.forEach((button) => {
          if (button instanceof HTMLElement) {
            button.click();
          }
        });

        const cancelButton = dialog.querySelector(
          "[data-radix-alert-dialog-cancel]"
        );
        if (cancelButton instanceof HTMLElement) {
          cancelButton.click();
        }
      });

      const escEvent = new KeyboardEvent("keydown", {
        key: "Escape",
        code: "Escape",
        keyCode: 27,
        which: 27,
        bubbles: true,
      });
      document.dispatchEvent(escEvent);
    } else {
      console.error(`No se pudo eliminar el registro ${id}:`, response.error);
      toast.error(
        `No se pudo eliminar el registro ${id}. Inténtalo nuevamente.`
      );
      if (table.options.meta?.refreshData) {
        table.options.meta.refreshData();
      }
    }

    return response;
  } catch (error) {
    console.error(error);
    if (table.options.meta?.refreshData) {
      table.options.meta.refreshData();
    }
    toast.error(`Error al eliminar el registro. Inténtalo nuevamente.`);
  }
};

// Componente para la celda de acciones con su propio estado
const ActionCell = ({
  row,
  table,
  onDelete,
  accounts = [],
  projects = [],
}: any) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await onDelete(row.original.unique_id, table);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger>
          <div className="inline-block items-center justify-center w-min mx-1">
            <EditCell
              row={row}
              table={table}
              accounts={accounts}
              projects={projects}
            />
          </div>
        </TooltipTrigger>
        <TooltipContent className="bg-amber-600" side="top">
          Editar
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger>
          <AlertDialog>
            <AlertDialogTrigger
              className="p-1 bg-red-600 hover:bg-red-700 text-white text-center rounded inline-block w-min mx-1"
              asChild
            >
              <Trash size={30} />
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Borrar registro</AlertDialogTitle>
                <AlertDialogDescription>
                  Se va a eliminar el registro {row.original.unique_id}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="w-full flex items-center justify-evenly gap-2">
                <AlertDialogCancel className="w-full py-1.5 shadow-xs rounded border hover:bg-gray-100">
                  Cancelar
                </AlertDialogCancel>
                <Button
                  onClick={handleDelete}
                  className="w-full rounded bg-red-600 hover:bg-red-700 text-center text-white"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <span className="flex flex-row items-center gap-2">
                      <Loader className="animate-spin h-4 w-4" /> Eliminando...
                    </span>
                  ) : (
                    "Sí, Eliminar"
                  )}
                </Button>
              </div>
            </AlertDialogContent>
          </AlertDialog>
        </TooltipTrigger>
        <TooltipContent side="top">Eliminar</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

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
    size: 40,
  },
  {
    accessorKey: "unique_id",
    header: () => <div className="text-center">ID</div>,
    sortingFn: "alphanumeric",
    enableSorting: true,
    size: 100,
  },
  {
    accessorKey: "updated_at",
    header: () => <div className="text-center">Fecha</div>,
    cell: ({ row }) => {
      return (
        <p className="text-slate-500 font-medium text-center">
          {(row.getValue("updated_at") as string).split("T")[0]}
        </p>
      );
    },
    sortingFn: "datetime",
    enableSorting: true,
    minSize: 220,
  },
  {
    accessorKey: "invoice_number",
    header: () => <div className="text-center">Factura</div>,
    cell: ({ row }) => {
      return <div>{row.getValue("invoice_number") || ""}</div>;
    },
    sortingFn: "alphanumeric",
    enableSorting: true,
    size: 120,
  },
  {
    accessorKey: "account_id",
    header: () => <div className="text-center">Cuenta</div>,
    cell: ({ row }) => {
      return (
        <p className="capitalize truncate max-w-[180px]">
          {row.getValue("account_id") || ""}
        </p>
      );
    },
    sortingFn: "alphanumeric",
    enableSorting: true,
    minSize: 150,
    maxSize: 180,
  },
  {
    accessorKey: "amount",
    header: () => <div className="text-center">Valor</div>,
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
    size: 180,
  },
  {
    accessorKey: "project",
    header: () => <div className="text-center">Proyecto</div>,
    cell: ({ row }) => {
      return <p className="text-start">{row.getValue("project") || "—"}</p>;
    },
    sortingFn: "alphanumeric",
    enableSorting: true,
    size: 150,
  },
  {
    accessorKey: "responsible_id",
    header: () => <div className="text-center">Responsable</div>,
    cell: ({ row }) => {
      return (
        <div className="truncate max-w-[180px]">
          {row.getValue("responsible_id") || "—"}
        </div>
      );
    },
    sortingFn: "alphanumeric",
    enableSorting: true,
    minSize: 180,
    maxSize: 220,
  },
  {
    accessorKey: "vehicle_plate",
    header: () => <div className="text-center">Placa</div>,
    cell: ({ row }) => {
      const vehicle_plate = row.getValue("vehicle_plate") as string;
      return <p className="text-center">{vehicle_plate || "—"}</p>;
    },
    sortingFn: "alphanumeric",
    enableSorting: true,
    minSize: 50,
    maxSize: 100,
  },
  {
    accessorKey: "vehicle_number",
    header: () => <div className="w-[10ch] text-center">No. Transporte</div>,
    cell: ({ row }) => {
      return (
        <p className="text-center">{row.getValue("vehicle_number") || "—"}</p>
      );
    },
    sortingFn: "alphanumeric",
    enableSorting: true,
    minSize: 50,
    maxSize: 100,
  },
  {
    accessorKey: "note",
    header: () => <div className="text-center">Observación</div>,
    cell: ({ row }) => {
      return (
        <p className="text-start truncate w-[80%]">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="cursor-default">
                  {(row.getValue("note") as string) || "—"}
                </span>
              </TooltipTrigger>
              <TooltipContent className="bg-white shadow-sm dark:bg-slate-800 text-slate-700 dark:text-white font-medium">
                {(row.getValue("note") as string) || "—"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </p>
      );
    },
    sortingFn: "alphanumeric",
    enableSorting: true,
    minSize: 150,
    maxSize: 220,
  },
  {
    accessorKey: "options",
    header: "Acciones",
    cell: ({ row, table }) => (
      <ActionCell
        row={row}
        table={table}
        onDelete={handleDeleteRecord}
        accounts={helpers.accounts || []}
        projects={helpers.projects || []}
      />
    ),
    enableSorting: false,
    size: 350,
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
): ColumnDef<ReposicionProps>[] => {
  const baseColumns: ColumnDef<ReposicionProps>[] = [
    {
      accessorKey: "id",
      header: () => <div className="w-full text-center">ID</div>,
      cell: ({ row }) => (
        <p
          className={`text-slate-500 font-medium w-full text-center ${
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
      size: 20,
    },
    {
      accessorKey: "fecha_reposicion",
      header: () => <div className="w-full text-center">Fecha</div>,
      cell: ({ row }) => (
        <p
          className={`text-slate-500 font-medium px-1 ${
            (row.original.status === "rejected" ||
              row.original.status === "paid") &&
            "opacity-50"
          } text-center w-full flex items-center justify-center`}
        >
          {row.getValue<string>("fecha_reposicion").split("T")[0]}
        </p>
      ),
      sortingFn: "datetime",
      enableSorting: true,
      size: 100,
    },
    {
      accessorKey: "total_reposicion",
      header: () => <div className="w-full text-center">Total</div>,
      cell: ({ row }) => (
        <p
          className={`font-medium text-slate-900 w-max px-1 ${
            (row.original.status === "rejected" ||
              row.original.status === "paid") &&
            "opacity-50"
          } text-center`}
        >
          $
          {new Intl.NumberFormat("es-ES", { minimumFractionDigits: 2 }).format(
            row.getValue<number>("total_reposicion")
          )}
        </p>
      ),
      sortingFn: "basic",
      enableSorting: true,
      size: 100,
    },
    {
      accessorKey: "status",
      header: () => <div className="text-center">Estado</div>,
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
            className={`font-semibold rounded-lg ${
              status === "pending"
                ? "text-orange-700 bg-orange-100 px-1.5"
                : status === "rejected"
                ? "text-red-700 bg-red-100 px-1.5 opacity-50"
                : status === "review"
                ? "text-indigo-700 bg-indigo-100 px-1.5"
                : "text-emerald-700 bg-emerald-100 px-1.5 opacity-50"
            } text-center`}
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
      minSize: 120,
      maxSize: 180,
    },
    {
      accessorKey: "project",
      header: () => <div className="w-full text-center">Proyecto</div>,
      cell: ({ row }) => {
        const rawProject = row.getValue<string>("project");
        const status = row.original.status;

        const isDimmed = status === "rejected" || status === "paid";

        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <p
                  className={`max-w-[160px] truncate text-center px-1 text-slate-500 font-medium cursor-default ${
                    isDimmed ? "opacity-50" : ""
                  }`}
                >
                  {rawProject.includes(",")
                    ? rawProject.replace(",", ", ")
                    : rawProject}
                </p>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="bg-white dark:bg-black text-slate-800 dark:text-slate-200 border rounded"
              >
                {rawProject.includes(",")
                  ? rawProject.replace(",", ", ")
                  : rawProject}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      },
      sortingFn: "alphanumeric",
      enableSorting: true,
      minSize: 150,
      maxSize: 180,
    },
    {
      accessorKey: "month",
      header: () => <div className="w-full text-center">Mes/Rol</div>,
      cell: ({ row }) => (
        <p
          className={`text-slate-500 font-medium px-1 ${
            (row.original.status === "rejected" ||
              row.original.status === "paid") &&
            "opacity-50"
          }`}
        >
          {row.original.status === "rejected" ||
          row.getValue("month") === "0000-00-00" ||
          !row.getValue("month") ? (
            <span className="flex items-center justify-center text-center">
              —
            </span>
          ) : (
            row.getValue("month")
          )}
        </p>
      ),
      sortingFn: "alphanumeric",
      enableSorting: true,
      size: 300,
    },
    {
      accessorKey: "when",
      header: () => <div className="w-full text-center">Descontar en</div>,
      cell: ({ row }) => (
        <p
          className={`capitalize ${
            (row.original.status === "rejected" ||
              row.original.status === "paid") &&
            "opacity-50"
          }`}
        >
          {row.getValue("when") || (
            <span className="flex items-center justify-center text-center">
              —
            </span>
          )}
        </p>
      ),
      sortingFn: "alphanumeric",
      enableSorting: true,
      minSize: 250,
      maxSize: 350,
    },
    {
      id: "request_type",
      accessorKey: "request_type",
      header: () => <div className="w-full text-center">Tipo</div>,
      cell: ({ row }: any) => {
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
          if (!requests.length) return "—";
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

        return typeA.localeCompare(typeB);
      },
      enableSorting: true,
      minSize: 250,
      maxSize: 450,
    },
    {
      accessorKey: "note",
      header: () => <div className="w-full text-center">Observación</div>,
      cell: ({ row }) => (
        <p className="truncate max-w-[90%]">
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
              <TooltipContent className="text-slate-800 bg-white shadow-sm dark:text-slate-200 dark:bg-black border border-gray-300">
                {row.getValue("note") || "—"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </p>
      ),
      sortingFn: "alphanumeric",
      enableSorting: false,
      minSize: 250,
      maxSize: 450,
    },
    {
      accessorKey: "details",
      header: () => <div className="w-full text-center">Detalles</div>,
      cell: ({ row }: any) => (
        <div className="flex items-center justify-center w-full">
          <DetailsCell row={row} />
        </div>
      ),
      enableSorting: false,
      size: 100,
    },
  ];
  const actionsColumn: ColumnDef<ReposicionProps> = {
    id: "actions",
    header: () => <div className="w-full text-center">Acciones</div>,
    cell: ({ row }) => <ActionButtons row={row.original} />,
    enableSorting: false,
  };
  if (
    helpers?.hasPermission?.(Permission.EDIT_REPOSITIONS) ||
    helpers?.hasPermission?.(Permission.MANAGE_REPOSITIONS)
  ) {
    return [...baseColumns, actionsColumn];
  }

  return baseColumns;
};

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

// Exportar la función de eliminación masiva
export { handleDeleteMultipleRecords };
