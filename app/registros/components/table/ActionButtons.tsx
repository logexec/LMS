import { useState, useCallback, useContext, JSX } from "react";
import { ReposicionContext } from "./ReposicionContext";
import { ReposicionUpdateData, Status, ReposicionProps } from "@/utils/types";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import UndoableToast from "../UndoableToast";
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
    color: "bg-emerald-600",
    hoverColor: "hover:bg-emerald-700",
    variant: "default",
  },
  review: {
    icon: <Edit size={24} />,
    label: "Revisar",
    color: "border-indigo-200 text-indigo-700",
    hoverColor: "hover:bg-indigo-50",
    variant: "outline",
  },
  rejected: {
    icon: <CircleX size={24} />,
    label: "Rechazar",
    color: "border-red-200 text-red-700",
    hoverColor: "hover:bg-red-50",
    variant: "outline",
  },
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
      const updateData: ReposicionUpdateData =
        newStatus === Status.paid
          ? {
              status: newStatus,
              month: editData.month,
              when: editData.when as ReposicionProps["when"],
              note: editData.note,
            }
          : { status: newStatus, note: editData.note };

      toast.custom(
        (t) => (
          <UndoableToast
            message={`${statusConfigs[newStatus]!.label} ejecutado`}
            status={newStatus}
            onUndo={() => {
              onUpdateReposicion?.(row.id, { status: row.status }, newStatus);
              toast.dismiss(t);
            }}
            duration={2500}
          />
        ),
        {
          duration: 2500,
          onAutoClose: () =>
            onUpdateReposicion?.(row.id, updateData, row.status),
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
          disabled={row.status === "rejected" || row.status === "paid"}
        >
          {statusConfigs[status]!.icon}
          {statusConfigs[status]!.label}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{statusConfigs[status]!.label}</AlertDialogTitle>
          <AlertDialogDescription>
            ¿Estás seguro de esta acción?
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
      {(["paid", "review", "rejected"] as Status[]).map((status) =>
        renderDialog(status)
      )}
    </div>
  );
};
