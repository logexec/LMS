import { useState, useCallback, useContext } from "react";
import { ReposicionContext } from "./ReposicionContext";
import { Button } from "@/components/ui/button";
import { Check, ScanSearch, X } from "lucide-react";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { ReposicionProps, Status, ReposicionUpdateData } from "@/utils/types";
import UndoableToast from "../UndoableToast";

interface ActionButtonsProps {
  row: ReposicionProps;
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
  };
  return messages[status as keyof typeof messages];
};

export const ActionButtons: React.FC<ActionButtonsProps> = ({ row }) => {
  const { onUpdateReposicion } = useContext(ReposicionContext);
  const [editData, setEditData] = useState({
    month: row.month || "",
    when: row.when || "rol",
    note: row.note || "",
  });

  const handleInputChange = useCallback((field: string, value: string) => {
    setEditData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const handleStatusUpdate = useCallback(
    (newStatus: Status) => {
      const currentStatus = row.status;
      let updateData: ReposicionUpdateData;

      switch (newStatus) {
        case Status.approved:
          updateData = {
            status: newStatus,
            month: editData.month,
            when: editData.when as ReposicionProps["when"],
            note: editData.note,
          };
          break;
        case Status.rejected:
        case Status.review:
          updateData = {
            status: newStatus,
            note: editData.note,
          };
          break;
        default:
          updateData = { status: newStatus };
      }

      toast.custom(
        (t) => (
          <UndoableToast
            message={getStatusMessages(newStatus).toast}
            status={newStatus}
            onUndo={() => {
              onUpdateReposicion?.(
                row.id,
                { status: currentStatus },
                newStatus
              );
              toast.dismiss(t);
            }}
          />
        ),
        {
          duration: 5000,
          onAutoClose: () => {
            onUpdateReposicion?.(row.id, updateData, currentStatus);
          },
        }
      );
    },
    [row.id, row.status, editData, onUpdateReposicion]
  );

  return (
    <div className="flex flex-row flex-wrap items-center gap-2">
      {/* Aprobar */}
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  className={`text-white bg-emerald-600 hover:bg-emerald-700 h-9 px-4 flex items-center gap-2 ${
                    row.status === "rejected" && "opacity-50 cursor-not-allowed"
                  }`}
                  disabled={row.status === "rejected"}
                >
                  <Check className="h-4 w-4" />
                  <span className="hidden sm:inline">Aprobar</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {getStatusMessages(Status.approved).title}
                  </AlertDialogTitle>
                  <AlertDialogDescription className="pt-4">
                    {getStatusMessages(Status.approved).description}
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label
                        htmlFor="month"
                        className="text-sm font-medium text-gray-700"
                      >
                        Mes de reposición
                      </label>
                      <input
                        type="month"
                        id="month"
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                        value={editData.month}
                        onChange={(e) =>
                          handleInputChange("month", e.target.value)
                        }
                        disabled={row.status === "rejected"}
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="when"
                        className="text-sm font-medium text-gray-700"
                      >
                        Descontar en
                      </label>
                      <select
                        id="when"
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                        value={editData.when}
                        onChange={(e) =>
                          handleInputChange("when", e.target.value)
                        }
                        disabled={row.status === "rejected"}
                      >
                        <option value="rol">Rol</option>
                        <option value="decimo_cuarto">Décimo Cuarto</option>
                        <option value="decimo_tercero">Décimo Tercero</option>
                        <option value="liquidacion">Liquidación</option>
                        <option value="utilidades">Utilidades</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="note"
                      className="text-sm font-medium text-gray-700"
                    >
                      Observación (opcional)
                    </label>
                    <textarea
                      id="note"
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                      rows={2}
                      value={editData.note}
                      onChange={(e) =>
                        handleInputChange("note", e.target.value)
                      }
                      disabled={row.status === "rejected"}
                    />
                  </div>
                </div>

                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      if (row.status === "rejected") {
                        toast.error("Esta reposición no puede ser modificada.");
                        return;
                      }
                      if (!editData.month || !editData.when) {
                        toast.error(
                          "Debes seleccionar el mes y el tipo de descuento"
                        );
                        return;
                      }
                      handleStatusUpdate(Status.approved);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700"
                    disabled={row.status === "rejected"}
                  >
                    Aprobar reposición
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>Aprobar reposición</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Revisar */}
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className={`h-9 px-4 flex items-center gap-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50 ${
                    row.status === "rejected" && "opacity-50 cursor-not-allowed"
                  }`}
                  disabled={row.status === "rejected"}
                >
                  <ScanSearch className="h-4 w-4" />
                  <span className="hidden sm:inline">Revisar</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {getStatusMessages(Status.review).title}
                  </AlertDialogTitle>
                  <AlertDialogDescription className="pt-4">
                    {getStatusMessages(Status.review).description}
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="space-y-2">
                  <label
                    htmlFor="review-note"
                    className="text-sm font-medium text-gray-700"
                  >
                    Observación
                  </label>
                  <textarea
                    id="review-note"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    rows={3}
                    value={editData.note}
                    onChange={(e) => handleInputChange("note", e.target.value)}
                    placeholder="Indica los puntos a revisar..."
                    disabled={row.status === "rejected"}
                  />
                </div>

                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      if (row.status === "rejected") {
                        toast.error("Esta reposición no puede ser modificada.");
                        return;
                      }
                      handleStatusUpdate(Status.review);
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    Enviar a revisión
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>Enviar a revisión</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Rechazar */}
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className={`h-9 px-4 flex items-center gap-2 border-red-200 text-red-700 hover:bg-red-50 ${
                    row.status === "rejected" && "opacity-50 cursor-not-allowed"
                  }`}
                  disabled={row.status === "rejected"}
                >
                  <X className="h-4 w-4" />
                  <span className="hidden sm:inline">Rechazar</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {getStatusMessages(Status.rejected).title}
                  </AlertDialogTitle>
                  <AlertDialogDescription className="pt-4">
                    {getStatusMessages(Status.rejected).description}
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="space-y-2">
                  <label
                    htmlFor="reject-note"
                    className="text-sm font-medium text-gray-700"
                  >
                    Motivo del rechazo
                  </label>
                  <textarea
                    id="reject-note"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                    rows={3}
                    value={editData.note}
                    onChange={(e) => handleInputChange("note", e.target.value)}
                    placeholder="Indica el motivo del rechazo..."
                    disabled={row.status === "rejected"}
                  />
                </div>

                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      if (row.status === "rejected") {
                        toast.error("Esta reposición no puede ser modificada.");
                        return;
                      }
                      handleStatusUpdate(Status.rejected);
                    }}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Rechazar reposición
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>Rechazar reposición</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};
