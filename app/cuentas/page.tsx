"use client";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import CustomSwitch from "@/components/custom-switch";
import apiService from "@/services/api.service";
import { XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import AddAccountComponent from "../components/cuentas/dialogs/AddAccount";
import { AccountProps } from "@/utils/types";

const CuentasPage = () => {
  const [accounts, setAccounts] = useState<AccountProps[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingField, setEditingField] = useState<{
    id: string;
    field: keyof AccountProps;
  } | null>(null);
  const [editedValues, setEditedValues] = useState<{
    [key: string]: Partial<AccountProps>;
  }>({});

  useEffect(() => {
    const fetchAccounts = async () => {
      setLoading(true);
      try {
        const response = await apiService.getAccounts();
        setAccounts(response.data);
      } catch (error) {
        toast.error("Ocurrió un error al cargar las cuentas.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchAccounts();
  }, []);

  const handleStatusToggle = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    try {
      await apiService.updateAccount(id, { account_status: newStatus });

      setAccounts((prev) =>
        prev.map((acc) =>
          acc.id === id ? { ...acc, account_status: newStatus } : acc
        )
      );

      toast.success(
        `Cuenta ${
          newStatus === "active" ? "activada" : "desactivada"
        } exitosamente.`
      );
    } catch (error) {
      toast.error("No se pudo actualizar el estado");
      console.error(error);
    }
  };

  const handleDoubleClick = (id: string, field: keyof AccountProps) => {
    setEditingField({ id, field });
    setEditedValues((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: accounts.find((acc) => acc.id === id)?.[field],
      },
    }));
  };

  const handleInputChange = (
    id: string,
    field: keyof AccountProps,
    value: string
  ) => {
    setEditedValues((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const handleSave = async (id: string) => {
    setEditedValues((prev) => {
      const updatedData = prev[id];
      if (!updatedData) return prev;

      // Enviar datos actualizados al backend
      apiService
        .updateAccount(id, updatedData)
        .then(() => {
          setAccounts((prevAccounts) =>
            prevAccounts.map((acc) =>
              acc.id === id ? { ...acc, ...updatedData } : acc
            )
          );
          toast.success("Cuenta actualizada");
        })
        .catch(() => toast.error("No se pudo actualizar la cuenta"))
        .finally(() => setEditingField(null));

      // Limpiar valores editados
      const newValues = { ...prev };
      delete newValues[id];
      return newValues;
    });
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement | HTMLSelectElement>,
    id: string
  ) => {
    if (event.key === "Enter") {
      event.preventDefault(); // Evita que el enter haga un submit inesperado
      handleSave(id);
    }
  };

  const [isVisible, setIsVisible] = useState(true);

  return (
    <div>
      <div className="flex justify-between items-center p-2">
        <h3 className="text-2xl font-semibold text-black/70">
          Gestión de Cuentas
        </h3>
        <AddAccountComponent setAccounts={setAccounts} />
      </div>
      {/* Banner */}
      {isVisible && (
        <div className="bg-sky-100 text-indigo-600 border border-sky-600 px-4 py-3 md:py-2 mb-8 rounded max-w-2xl mx-auto">
          <div className="flex gap-2 md:items-center">
            <div className="flex grow gap-3 md:items-center md:justify-center">
              <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                <p className="text-sm">
                  Para realizar un cambio en la cuenta, dale doble clic en el
                  campo que desees editar. Da click afuera o presiona la tecla{" "}
                  <span className="text-sm text-muted-foreground">
                    <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                      <span className="text-xs">&#x21A9;</span>Enter
                    </kbd>
                  </span>{" "}
                  .
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              className="group -my-1.5 -me-2 size-8 shrink-0 p-0 hover:bg-transparent"
              onClick={() => setIsVisible(false)}
              aria-label="Close banner"
            >
              <XIcon
                size={16}
                className="opacity-60 transition-opacity group-hover:opacity-100"
                aria-hidden="true"
              />
            </Button>
          </div>
        </div>
      )}
      {/* /Banner */}
      <div className="bg-background overflow-hidden rounded border">
        <Table>
          <TableHeader className="bg-background/90 sticky top-0 z-10 backdrop-blur-xs bg-slate-100">
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Identificador</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Corresponde a</TableHead>
              <TableHead className="text-right">Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array(5)
                  .fill(null)
                  .map((_, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Skeleton className="h-4 w-[150px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-[150px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-[150px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-[150px]" />
                      </TableCell>
                      <TableCell className="text-right">
                        <Skeleton className="h-4 w-[150px]" />
                      </TableCell>
                    </TableRow>
                  ))
              : accounts.map((item) => (
                  <TableRow
                    key={item.id}
                    className={
                      item.account_status === "inactive" ? "opacity-50" : ""
                    }
                  >
                    <TableCell
                      onDoubleClick={() =>
                        handleDoubleClick(item.id!.toString(), "name")
                      }
                      className="w-max min-w-16 max-w-48"
                    >
                      {editingField?.id === item.id!.toString() &&
                      editingField.field === "name" ? (
                        <input
                          type="text"
                          value={
                            editedValues[item.id!.toString()]?.name || item.name
                          }
                          onChange={(e) =>
                            handleInputChange(
                              item.id!.toString(),
                              "name",
                              e.target.value
                            )
                          }
                          onBlur={() => handleSave(item.id!.toString())}
                          onKeyDown={(e) =>
                            handleKeyDown(e, item.id!.toString())
                          }
                          autoFocus
                          className="border px-2 py-1 rounded"
                        />
                      ) : (
                        item.name
                      )}
                    </TableCell>
                    <TableCell
                      onDoubleClick={() =>
                        handleDoubleClick(item.id!.toString(), "account_number")
                      }
                    >
                      {editingField?.id === item.id!.toString() &&
                      editingField.field === "account_number" ? (
                        <input
                          type="text"
                          value={
                            editedValues[item.id!.toString()]?.account_number ||
                            item.account_number
                          }
                          onChange={(e) =>
                            handleInputChange(
                              item.id!.toString(),
                              "account_number",
                              e.target.value
                            )
                          }
                          onBlur={() => handleSave(item.id!.toString())}
                          onKeyDown={(e) =>
                            handleKeyDown(e, item.id!.toString())
                          }
                          autoFocus
                          className="border px-2 py-1 rounded"
                        />
                      ) : (
                        item.account_number
                      )}
                    </TableCell>
                    <TableCell
                      onDoubleClick={() =>
                        handleDoubleClick(item.id!.toString(), "account_type")
                      }
                    >
                      {editingField?.id === item.id!.toString() &&
                      editingField.field === "account_type" ? (
                        <select
                          value={
                            editedValues[item.id!.toString()]?.account_type ||
                            item.account_type
                          }
                          onChange={(e) => {
                            handleInputChange(
                              item.id!.toString(),
                              "account_type",
                              e.target.value
                            );
                            handleSave(item.id!.toString());
                          }}
                          onKeyDown={(e) =>
                            handleKeyDown(e, item.id!.toString())
                          }
                          className="border px-2 py-1 rounded"
                        >
                          <option value="nomina">Nómina</option>
                          <option value="transportista">Transportista</option>
                        </select>
                      ) : item.account_type === "nomina" ? (
                        "Nómina"
                      ) : (
                        "Transportista"
                      )}
                    </TableCell>
                    <TableCell
                      onDoubleClick={() =>
                        handleDoubleClick(
                          item.id!.toString(),
                          "account_affects"
                        )
                      }
                    >
                      {editingField?.id === item.id!.toString() &&
                      editingField.field === "account_affects" ? (
                        <select
                          value={
                            editedValues[item.id!.toString()]
                              ?.account_affects || item.account_affects
                          }
                          onChange={(e) => {
                            handleInputChange(
                              item.id!.toString(),
                              "account_affects",
                              e.target.value
                            );
                            handleSave(item.id!.toString());
                          }}
                          onKeyDown={(e) =>
                            handleKeyDown(e, item.id!.toString())
                          }
                          className="border px-2 py-1 rounded"
                        >
                          <option value="discount">Descuentos</option>
                          <option value="expense">Gastos</option>
                          <option value="both">Ambos</option>
                        </select>
                      ) : (
                        <p className="capitalize">
                          {item.account_affects === "discount"
                            ? "Descuentos"
                            : item.account_affects === "expense"
                            ? "Gastos"
                            : "Ambos"}
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="text-right w-8">
                      <CustomSwitch
                        checked={item.account_status === "active"}
                        onCheckedChange={() =>
                          handleStatusToggle(
                            item.id!.toString(),
                            item.account_status
                          )
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default CuentasPage;
