import { useState, useCallback, useContext, JSX } from "react";
import { ReposicionContext } from "./ReposicionContext";
import { ReposicionUpdateData, Status, ReposicionProps } from "@/utils/types";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
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
import { CircleX, Edit, HandCoins } from "lucide-react";
import UndoableToast from "../UndoableToast";

const statusConfigs: Partial<
  Record<
    Status,
    {
      icon: JSX.Element;
      label: string;
      color: string;
      hoverColor: string;
      variant: string;
    }
  >
> = {
  paid: {
    icon: <HandCoins size={24} />,
    label: "Pagar",
    color: "bg-green-500",
    hoverColor: "hover:bg-green-600",
    variant: "default",
  },
  review: {
    icon: <Edit size={24} />,
    label: "Revisar",
    color: "border-indigo-200 text-indigo-700",
    hoverColor: "hover:bg-indigo-50 hover:text-indigo-600",
    variant: "outline",
  },
  rejected: {
    icon: <CircleX size={24} />,
    label: "Rechazar",
    color: "border-red-200 text-red-700",
    hoverColor: "hover:bg-red-50 hover:text-red-600",
    variant: "outline",
  },
};

const getStatusMessages = (status: Status) => {
  const messages = {
    [Status.paid]: {
      title: "Pagar Reposición",
      description: "¿Estás seguro de que deseas pagar esta reposición?",
      action: "Pagar",
      toast: "Reposición pagada correctamente",
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

export const ActionButtons: React.FC<{ row: ReposicionProps }> = ({ row }) => {
  const { onUpdateReposicion } = useContext(ReposicionContext);
  const [editData, setEditData] = useState({
    month: row.month || "",
    when: row.when || "rol",
    note: row.note || "",
  });

  const handleInputChange = useCallback((field: string, value: string) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleStatusUpdate = useCallback(
    (newStatus: Status) => {
      const currentStatus = row.status;
      let updateData: ReposicionUpdateData;

      switch (newStatus) {
        case Status.paid:
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

      // Mostrar el toast sin actualizar inmediatamente
      toast.custom(
        (t) => (
          <UndoableToast
            message={getStatusMessages(newStatus).toast}
            status={newStatus}
            onUndo={() => {
              // Deshacer: restaurar el estado anterior en el backend
              onUpdateReposicion?.(
                row.id,
                { status: currentStatus },
                newStatus
              );
              toast.dismiss(t);
            }}
            duration={4000}
          />
        ),
        {
          duration: 4000, // Tiempo para que el toast se cierre automáticamente
          onAutoClose: () => {
            // Actualizar el backend y el estado local solo al cerrar el toast
            onUpdateReposicion?.(row.id, updateData, currentStatus);
          },
        }
      );
    },
    [row.id, row.status, editData, onUpdateReposicion]
  );

  const renderDialog = (status: Status) => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant={statusConfigs[status]!.variant as "default" | "outline"}
          className={`h-9 px-4 ${statusConfigs[status]!.color} ${
            statusConfigs[status]!.hoverColor
          } ${
            row.status === "rejected" || row.status === "paid"
              ? "opacity-50 cursor-not-allowed"
              : ""
          }`}
          disabled={
            row.status === "rejected" ||
            row.status === "paid" ||
            (status === Status.review && row.status === Status.review)
          }
        >
          {statusConfigs[status]!.icon}
          {statusConfigs[status]!.label}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{getStatusMessages(status).title}</AlertDialogTitle>
          <AlertDialogDescription>
            {getStatusMessages(status).description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        {status === Status.paid && (
          <div className="space-y-3">
            <input
              type="month"
              value={editData.month}
              onChange={(e) => handleInputChange("month", e.target.value)}
              className="w-full border rounded-md p-2"
            />
            <select
              value={editData.when}
              onChange={(e) => handleInputChange("when", e.target.value)}
              className="w-full border rounded-md p-2"
            >
              <option value="rol">Rol</option>
              <option value="decimo_cuarto">Décimo Cuarto</option>
              <option value="decimo_tercero">Décimo Tercero</option>
            </select>
          </div>
        )}
        <textarea
          value={editData.note}
          onChange={(e) => handleInputChange("note", e.target.value)}
          placeholder="Observación..."
          className="w-full border rounded-md p-2"
        />
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={() => handleStatusUpdate(status)}>
            {statusConfigs[status]!.label}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return (
    <div className="flex gap-2">
      {(["paid", "review", "rejected"] as Status[]).map((status, idx) => (
        <div key={idx}>{renderDialog(status)}</div>
      ))}
    </div>
  );
};
