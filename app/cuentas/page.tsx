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
import { Switch } from "@/components/ui/switch";
import apiService from "@/services/api.service";

interface AccountProps {
  id: number;
  name: string;
  account_number: string;
  account_type: string;
  account_status: string;
  account_affects: string;
}

const CuentasPage = () => {
  const [accounts, setAccounts] = useState<AccountProps[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingField, setEditingField] = useState<{
    id: number;
    field: keyof AccountProps;
  } | null>(null);
  const [editedValues, setEditedValues] = useState<{
    [key: number]: Partial<AccountProps>;
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

  const handleStatusToggle = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    try {
      await apiService.updateAccount(String(id), { account_status: newStatus });
      setAccounts((prev) =>
        prev.map((acc) =>
          acc.id === id ? { ...acc, account_status: newStatus } : acc
        )
      );
      toast.success("Estado actualizado");
    } catch (error) {
      toast.error("No se pudo actualizar el estado");
      console.error(error);
    }
  };

  const handleDoubleClick = (id: number, field: keyof AccountProps) => {
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
    id: number,
    field: keyof AccountProps,
    value: string
  ) => {
    setEditedValues((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const handleSave = async (id: number) => {
    const idString = String(id);
    if (!editedValues[id]) return;
    try {
      await apiService.updateAccount(idString, editedValues[id]);
      setAccounts((prev) =>
        prev.map((acc) =>
          acc.id === id ? { ...acc, ...editedValues[id] } : acc
        )
      );
      toast.success("Cuenta actualizada");
      setEditingField(null);
    } catch (error) {
      toast.error("No se pudo actualizar la cuenta");
      console.error(error);
    }
  };

  return (
    <div className="bg-background overflow-hidden rounded-md border">
      <Table>
        <TableHeader className="bg-background/90 sticky top-0 z-10 backdrop-blur-xs">
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
                    onDoubleClick={() => handleDoubleClick(item.id, "name")}
                  >
                    {editingField?.id === item.id &&
                    editingField.field === "name" ? (
                      <input
                        type="text"
                        value={editedValues[item.id]?.name || item.name}
                        onChange={(e) =>
                          handleInputChange(item.id, "name", e.target.value)
                        }
                        onBlur={() => handleSave(item.id)}
                        autoFocus
                        className="border px-2 py-1 rounded"
                      />
                    ) : (
                      item.name
                    )}
                  </TableCell>
                  <TableCell>{item.account_number}</TableCell>
                  <TableCell className="capitalize">
                    {item.account_type}
                  </TableCell>
                  <TableCell className="capitalize">
                    {item.account_affects}
                  </TableCell>
                  <TableCell className="text-right">
                    <Switch
                      checked={item.account_status === "active"}
                      onChange={() =>
                        handleStatusToggle(item.id, item.account_status)
                      }
                      className="h-3 w-9 border-none"
                    />
                  </TableCell>
                </TableRow>
              ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default CuentasPage;
