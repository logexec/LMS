/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import { TableCell, TableFooter, TableRow } from "@/components/ui/table";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo } from "react";

const TableFooterWithTotals = ({
  table,
  data,
  mode,
}: {
  table: any;
  data: any[];
  mode: "requests" | "reposiciones";
}) => {
  // Calcular el total de todas las solicitudes pending
  const totalAmount = useMemo(() => {
    if (mode === "requests") {
      return data
        .filter((item) => item.status === "pending")
        .reduce((sum: number, item) => {
          const amount =
            typeof item.amount === "string"
              ? parseFloat(item.amount || "0")
              : typeof item.amount === "number"
              ? item.amount
              : 0;
          return sum + amount;
        }, 0);
    } else {
      return data
        .filter((item) => item.status === "pending")
        .reduce((sum: number, item) => {
          const total =
            typeof item.total_reposicion === "string"
              ? parseFloat(item.total_reposicion || "0")
              : typeof item.total_reposicion === "number"
              ? item.total_reposicion
              : 0;
          return sum + total;
        }, 0);
    }
  }, [data, mode]);

  // Calcular el total de las filas seleccionadas
  const selectedRows = table.getSelectedRowModel().rows;
  const selectedAmount = useMemo(() => {
    if (mode === "requests") {
      return selectedRows.reduce((sum: number, row: any) => {
        const amount =
          typeof row.original.amount === "string"
            ? parseFloat(row.original.amount || "0")
            : typeof row.original.amount === "number"
            ? row.original.amount
            : 0;
        return sum + amount;
      }, 0);
    } else {
      return selectedRows.reduce((sum: number, row: any) => {
        const total =
          typeof row.original.total_reposicion === "string"
            ? parseFloat(row.original.total_reposicion || "0")
            : typeof row.original.total_reposicion === "number"
            ? row.original.total_reposicion
            : 0;
        return sum + total;
      }, 0);
    }
  }, [selectedRows, mode]);

  // Obtener el índice de la columna amount
  // Extraigo la expresión compleja a una variable fuera del useMemo
  const visibleColumns = table.getVisibleLeafColumns();
  const amountIndex = useMemo(() => {
    const keyToFind = mode === "requests" ? "amount" : "total_reposicion";
    const index = visibleColumns.findIndex((col: any) => col.id === keyToFind);
    return index !== -1 ? index : Math.floor(visibleColumns.length / 2);
  }, [visibleColumns, mode]); // Ahora usamos visibleColumns como dependencia

  return (
    <TableFooter>
      <TableRow>
        {/* Columnas antes de amount - información de resultados */}
        <TableCell colSpan={amountIndex}>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Mostrando {table.getRowModel().rows.length} de{" "}
            {table.getFilteredRowModel().rows.length} resultados
            {table.getFilteredRowModel().rows.length !== data.length &&
              ` (Total: ${data.length})`}
          </div>
        </TableCell>

        {/* Columna amount y el resto - totales y paginación */}
        <TableCell colSpan={table.getVisibleLeafColumns().length - amountIndex}>
          <div className="flex flex-wrap items-center gap-4">
            {/* Parte de los totales */}
            {mode === "requests" && (
              <div className="font-medium whitespace-nowrap">
                {selectedAmount > 0 ? (
                  <span className="text-red-600">
                    Seleccionado: ${selectedAmount.toFixed(2)} (de $
                    {totalAmount.toFixed(2)})
                  </span>
                ) : (
                  <span className="text-slate-800">
                    Total: ${totalAmount.toFixed(2)}
                  </span>
                )}
              </div>
            )}

            {/* Parte de la paginación */}
            <div className="flex items-center gap-2 ml-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="h-8 w-8 p-0 sm:w-auto sm:px-3"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline ml-2">Anterior</span>
              </Button>
              <span className="text-sm text-slate-600">
                Página {table.getState().pagination.pageIndex + 1} de{" "}
                {table.getPageCount()}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="h-8 w-8 p-0 sm:w-auto sm:px-3"
              >
                <span className="hidden sm:inline mr-2">Siguiente</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </TableCell>
      </TableRow>
    </TableFooter>
  );
};

export default TableFooterWithTotals;
