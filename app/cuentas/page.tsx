"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
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
import { ArrowDown, ArrowUp, Trash2, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import AddAccountComponent from "../components/cuentas/dialogs/AddAccount";
import { AccountProps } from "@/utils/types";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const [globalFilter, setGlobalFilter] = useState("");
  const [isVisible, setIsVisible] = useState(true);

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

  const handleDoubleClick = useCallback(
    (id: string, field: keyof AccountProps) => {
      setEditingField({ id, field });
      setEditedValues((prev) => ({
        ...prev,
        [id]: {
          ...prev[id],
          [field]: accounts.find((acc) => acc.id === id)?.[field],
        },
      }));
    },
    [accounts]
  );

  const handleInputChange = useCallback(
    (id: string, field: keyof AccountProps, value: string) => {
      setEditedValues((prev) => ({
        ...prev,
        [id]: { ...prev[id], [field]: value },
      }));
    },
    []
  );

  const handleSave = useCallback(
    async (id: string) => {
      const updatedData = editedValues[id];
      if (!updatedData) return;

      try {
        const updatedAccount = await apiService.updateAccount(id, updatedData);
        setAccounts((prev) =>
          prev.map((acc) =>
            acc.id === updatedAccount.id ? { ...acc, ...updatedAccount } : acc
          )
        );
        toast.success("Cuenta actualizada");
      } catch (error) {
        toast.error("No se pudo actualizar la cuenta");
        console.error(error);
      } finally {
        setEditingField(null);
        setEditedValues((prev) => {
          const newValues = { ...prev };
          delete newValues[id];
          return newValues;
        });
      }
    },
    [editedValues]
  );

  const handleDelete = useCallback(async (id: string) => {
    try {
      await apiService.deleteAccount(id);
      setAccounts((prev) => prev.filter((acc) => acc.id !== id));
      toast.success("Cuenta eliminada exitosamente");
    } catch (error) {
      toast.error("No se pudo eliminar la cuenta");
      console.error("Error al eliminar cuenta:", error);
    }
  }, []);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>, id: string) => {
      if (event.key === "Enter") {
        event.preventDefault();
        handleSave(id);
      }
    },
    [handleSave]
  );

  const handleStatusToggle = useCallback(
    async (id: string, currentStatus: string) => {
      const newStatus = currentStatus === "active" ? "inactive" : "active";
      try {
        const updatedAccount = await apiService.updateAccount(id, {
          account_status: newStatus,
        });
        setAccounts((prev) =>
          prev.map((acc) =>
            acc.id === updatedAccount.id ? { ...acc, ...updatedAccount } : acc
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
    },
    []
  );

  const columns = useMemo<ColumnDef<AccountProps>[]>(
    () => [
      {
        accessorKey: "action",
        header: () => <div className="w-2" />,
        cell: ({ row }) => (
          <AlertDialog>
            <AlertDialogTrigger className="max-w-4">
              <Button variant="default" className="h-9 w-10">
                <Trash2 />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  ¿Seguro deseas eliminar la cuenta {row.original.name}?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleDelete(row.original.id!.toString())}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold"
                >
                  Eliminar Cuenta
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ),
        filterFn: "equals",
      },
      {
        accessorKey: "name",
        header: "Nombre",
        cell: ({ row }) => {
          const id = row.original.id!.toString();
          return editingField?.id === id && editingField.field === "name" ? (
            <Input
              type="text"
              value={editedValues[id]?.name || row.getValue("name")}
              onChange={(e) => handleInputChange(id, "name", e.target.value)}
              onBlur={() => handleSave(id)}
              onKeyDown={(e) => handleKeyDown(e, id)}
              autoFocus
              className="border px-2 py-1 rounded w-full"
            />
          ) : (
            <div onDoubleClick={() => handleDoubleClick(id, "name")}>
              {row.getValue("name")}
            </div>
          );
        },
      },
      {
        accessorKey: "account_number",
        header: "Identificador",
        cell: ({ row }) => {
          const id = row.original.id!.toString();
          return editingField?.id === id &&
            editingField.field === "account_number" ? (
            <Input
              type="text"
              value={
                editedValues[id]?.account_number ||
                row.getValue("account_number")
              }
              onChange={(e) =>
                handleInputChange(id, "account_number", e.target.value)
              }
              onBlur={() => handleSave(id)}
              onKeyDown={(e) => handleKeyDown(e, id)}
              autoFocus
              className="border px-2 py-1 rounded w-full"
            />
          ) : (
            <div onDoubleClick={() => handleDoubleClick(id, "account_number")}>
              {row.getValue("account_number")}
            </div>
          );
        },
      },
      {
        accessorKey: "account_type",
        header: "Tipo",
        cell: ({ row }) => {
          const id = row.original.id!.toString();
          return editingField?.id === id &&
            editingField.field === "account_type" ? (
            <Select
              value={
                editedValues[id]?.account_type || row.getValue("account_type")
              }
              onValueChange={(value) => {
                handleInputChange(id, "account_type", value);
                handleSave(id);
              }}
            >
              <SelectTrigger className="border px-2 py-1 rounded w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nomina">Nómina</SelectItem>
                <SelectItem value="transportista">Transportista</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <div onDoubleClick={() => handleDoubleClick(id, "account_type")}>
              {row.getValue<string>("account_type") === "nomina"
                ? "Nómina"
                : "Transportista"}
            </div>
          );
        },
        filterFn: "equals",
      },
      {
        accessorKey: "account_affects",
        header: "Corresponde a",
        cell: ({ row }) => {
          const id = row.original.id!.toString();
          return editingField?.id === id &&
            editingField.field === "account_affects" ? (
            <Select
              value={
                editedValues[id]?.account_affects ||
                row.getValue("account_affects")
              }
              onValueChange={(value) => {
                handleInputChange(id, "account_affects", value);
                handleSave(id);
              }}
            >
              <SelectTrigger className="border px-2 py-1 rounded w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="discount">Descuentos</SelectItem>
                <SelectItem value="expense">Gastos</SelectItem>
                <SelectItem value="both">Ambos</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <div onDoubleClick={() => handleDoubleClick(id, "account_affects")}>
              <p className="capitalize">
                {row.getValue<string>("account_affects") === "discount"
                  ? "Descuentos"
                  : row.getValue<string>("account_affects") === "expense"
                  ? "Gastos"
                  : "Ambos"}
              </p>
            </div>
          );
        },
        filterFn: "equals",
      },
      {
        accessorKey: "account_status",
        header: () => <div>Estado</div>,
        cell: ({ row }) => (
          <div className="text-right">
            <CustomSwitch
              checked={row.getValue("account_status") === "active"}
              onCheckedChange={() =>
                handleStatusToggle(
                  row.original.id!.toString(),
                  row.getValue("account_status")
                )
              }
            />
          </div>
        ),
        filterFn: "equals",
      },
    ],
    [
      editingField,
      editedValues,
      handleDoubleClick,
      handleKeyDown,
      handleInputChange,
      handleSave,
      handleDelete,
      handleStatusToggle,
    ]
  );

  const table = useReactTable({
    data: accounts,
    columns,
    state: {
      globalFilter,
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <div>
      {isVisible && (
        <div className="bg-sky-100/70 text-sky-600 border border-sky-300 px-4 py-3 md:py-2 mb-8 rounded max-w-5xl mx-auto shadow-md">
          <div className="flex gap-2 md:items-center">
            <div className="flex grow gap-3 md:items-center md:justify-center">
              <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                <p className="text-sm">
                  Para realizar un cambio en la cuenta, dale doble clic en el
                  campo que desees editar. Da click afuera o presiona la tecla{" "}
                  <span className="text-sm text-muted-foreground">
                    <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 shadow">
                      <span className="text-xs">↩</span>Enter
                    </kbd>
                  </span>{" "}
                  para guardar los cambios.
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
      <div className="w-full flex items-center justify-between p-2 mb-4">
        <h3 className="text-2xl font-semibold text-black/70 w-max">
          Gestión de Cuentas
        </h3>
        <div className="w-fit justify-self-end">
          <AddAccountComponent setAccounts={setAccounts} />
        </div>
      </div>

      <div className="mb-4 flex gap-4">
        <Input
          placeholder="Buscar en todas las cuentas..."
          value={globalFilter ?? ""}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-sm"
        />
        <Select
          onValueChange={(value) =>
            table
              .getColumn("account_type")
              ?.setFilterValue(value === "all" ? undefined : value)
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="nomina">Nómina</SelectItem>
            <SelectItem value="transportista">Transportista</SelectItem>
          </SelectContent>
        </Select>
        <Select
          onValueChange={(value) =>
            table
              .getColumn("account_affects")
              ?.setFilterValue(value === "all" ? undefined : value)
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por corresponde a" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="discount">Descuentos</SelectItem>
            <SelectItem value="expense">Gastos</SelectItem>
            <SelectItem value="both">Ambos</SelectItem>
          </SelectContent>
        </Select>
        <Select
          onValueChange={(value) =>
            table
              .getColumn("account_status")
              ?.setFilterValue(value === "all" ? undefined : value)
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Activa</SelectItem>
            <SelectItem value="inactive">Inactiva</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="bg-background overflow-hidden rounded border">
        <Table>
          <TableHeader className="bg-background/90 sticky top-0 z-10 backdrop-blur-xs bg-slate-100">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className={
                      header.column.getCanSort()
                        ? "cursor-pointer select-none"
                        : ""
                    }
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                    {{
                      asc: (
                        <ArrowDown className="inline-flex pl-2 self-center" />
                      ),
                      desc: (
                        <ArrowUp className="inline-flex pl-2 self-center" />
                      ),
                    }[header.column.getIsSorted() as string] ?? null}
                  </TableHead>
                ))}
              </TableRow>
            ))}
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
              : table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className={
                      row.original.account_status === "inactive"
                        ? "opacity-50"
                        : ""
                    }
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-2">
          <Button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            variant="outline"
          >
            Anterior
          </Button>
          <Button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            variant="outline"
          >
            Siguiente
          </Button>
          <span>
            Página {table.getState().pagination.pageIndex + 1} de{" "}
            {table.getPageCount()}
          </span>
        </div>
        <Select
          value={table.getState().pagination.pageSize.toString()}
          onValueChange={(value) => table.setPageSize(Number(value))}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filas por página" />
          </SelectTrigger>
          <SelectContent>
            {[5, 10, 20, 50].map((size) => (
              <SelectItem key={size} value={size.toString()}>
                {size} filas por página
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default CuentasPage;
