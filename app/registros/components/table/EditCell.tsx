/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import React, { useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { Row, Table } from "@tanstack/react-table";
import { RequestProps, AccountProps, Project } from "@/utils/types";
import EditRecord from "./edit-record-component";

interface EditCellProps {
  row: Row<RequestProps>;
  table: Table<RequestProps>;
  accounts?: AccountProps[];
  projects?: Project[];
}

const EditCell = ({
  row,
  table,
  accounts = [],
  projects = [],
}: EditCellProps) => {
  const [open, setOpen] = useState(false);

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  // Manejar actualización optimista de la fila
  const handleUpdateSuccess = (updatedData: Partial<RequestProps>) => {
    // Obtener el índice de la fila a actualizar
    const rowIndex = row.index;

    // Buscar nombres de cuenta y proyecto para mostrar
    const selectedAccount = accounts.find(
      (acc) => acc.id === updatedData.account_id
    );
    const selectedProject = projects.find(
      (proj) => proj.id === updatedData.project
    );

    // Actualizar cada campo individualmente usando la meta.updateData de la tabla
    // Comprobamos si existe updateData y si podemos determinar cómo llamarlo
    if (table.options.meta && "updateData" in table.options.meta) {
      const updateFn = table.options.meta.updateData as Function;

      // Verificar si updateData espera un objeto o argumentos separados
      const updateDataType = updateFn.length === 1 ? "object" : "separate";

      // Actualizar cada campo modificado según el tipo de función
      Object.entries(updatedData).forEach(([columnId, value]) => {
        if (updateDataType === "object") {
          // Llamada en formato { rowIndex, columnId, value }
          updateFn({
            rowIndex,
            columnId,
            value,
          });
        } else {
          // Intentar como formato (rowIndex, value)
          const updatedRow = {
            ...row.original,
            [columnId]: value,
          };
          updateFn(rowIndex, updatedRow);
        }
      });

      // Actualizar campos visuales para mostrar nombres en vez de IDs
      if (selectedAccount?.name && updateDataType === "object") {
        updateFn({
          rowIndex,
          columnId: "account_id",
          value: selectedAccount.name,
        });
      }

      if (selectedProject?.name && updateDataType === "object") {
        updateFn({
          rowIndex,
          columnId: "project",
          value: selectedProject.name,
        });
      }
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        asChild
        className="flex p-1 size-7 text-white bg-amber-500 hover:bg-amber-600 transition-colors shadow-sm hover:shadow-none rounded-lg items-center justify-center"
        onClick={handleButtonClick}
      >
        <Pencil />
      </AlertDialogTrigger>
      <AlertDialogContent
        className="w-max max-w-6xl"
        onClick={(e) => e.stopPropagation()}
        style={{ zIndex: 1100 }}
      >
        <AlertDialogHeader>
          <AlertDialogTitle>Editar registro</AlertDialogTitle>
          <AlertDialogDescription>
            Estás editando el registro de {row.original.responsible_id || ""}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <EditRecord
          row={row}
          onClose={handleClose}
          onUpdateSuccess={handleUpdateSuccess}
          accounts={accounts}
          projects={projects}
        />
        <AlertDialogCancel asChild>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
        </AlertDialogCancel>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default EditCell;
