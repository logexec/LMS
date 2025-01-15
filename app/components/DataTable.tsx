"use client";
import React, { useState, useEffect, useMemo } from "react";
import { ArrowUpDown, FileDown, Download, Pencil, Trash2 } from "lucide-react";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { SortConfig } from "@/utils/types";

interface PaginationInfo {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationInfo;
}

type PrimitiveValue =
  | string
  | number
  | boolean
  | Date
  | null
  | undefined
  | string[];
type RecordValue = Record<string, PrimitiveValue>;

export interface BaseTableData extends RecordValue {
  id: string | number;
  [key: string]: PrimitiveValue;
}

export interface Column<T extends BaseTableData> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: <K extends keyof T>(value: T[K], row: T) => React.ReactNode;
}

interface DataTableProps<T extends BaseTableData> {
  data: PaginatedResponse<T>;
  columns: Column<T>[];
  onSelectionChange?: (selectedItems: T[]) => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onPageChange: (page: number, sortConfig?: SortConfig<T>) => void;
  className?: string;
  showActions?: boolean;
  showExport?: boolean;
}

export const DataTable = <T extends BaseTableData>({
  data,
  columns,
  onSelectionChange,
  onEdit,
  onDelete,
  onPageChange,
  className = "",
  showActions = true,
  showExport = true,
}: DataTableProps<T>) => {
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [lastSelected, setLastSelected] = useState<number | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig<T> | null>(null);
  const [filterText, setFilterText] = useState("");

  const { current_page, last_page, from, to, total } = data.meta;

  // Función para generar el rango de páginas a mostrar
  const getPageRange = () => {
    const range: number[] = [];
    const showPages = 5; // Número de páginas a mostrar
    let start = Math.max(1, current_page - Math.floor(showPages / 2));
    const end = Math.min(last_page, start + showPages - 1);

    // Ajustar el inicio si estamos cerca del final
    if (end === last_page) {
      start = Math.max(1, end - showPages + 1);
    }

    for (let i = start; i <= end; i++) {
      range.push(i);
    }

    return range;
  };

  const selectedItems = useMemo(() => {
    return Array.from(selectedRows).map((index) => data.data[index]);
  }, [selectedRows, data.data]);

  useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(selectedItems);
    }
  }, [selectedItems, onSelectionChange]);

  const handleRowClick = (index: number, event: React.MouseEvent) => {
    const newSelected = new Set(selectedRows);

    if (event.shiftKey && lastSelected !== null) {
      const start = Math.min(lastSelected, index);
      const end = Math.max(lastSelected, index);

      for (let i = start; i <= end; i++) {
        newSelected.add(i);
      }
    } else {
      if (event.ctrlKey || event.metaKey) {
        if (newSelected.has(index)) {
          newSelected.delete(index);
        } else {
          newSelected.add(index);
        }
      } else {
        newSelected.clear();
        newSelected.add(index);
      }
    }

    setLastSelected(index);
    setSelectedRows(newSelected);
  };

  const handleSort = (key: keyof T) => {
    let newDirection: "asc" | "desc" = "asc";

    // Si ya estamos ordenando por esta columna, cambiamos la dirección
    if (sortConfig?.key === key) {
      newDirection = sortConfig.direction === "asc" ? "desc" : "asc";
    }

    // Actualizar el estado de ordenamiento
    const newSortConfig: SortConfig<T> = {
      key,
      direction: newDirection,
    };
    setSortConfig(newSortConfig);

    // Llamar a onPageChange con la página actual y la nueva configuración de ordenamiento
    onPageChange(data.meta.current_page, newSortConfig);
  };

  // Existing export functions remain the same...
  const exportToCSV = () => {
    const headers = columns.map((col) => col.label).join(",");
    const rows = data.data
      .map((row) => columns.map((col) => row[col.key] ?? "").join(","))
      .join("\n");

    const csvContent = `${headers}\n${rows}`;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", "table-export.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = async () => {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontSize = 10;
    const padding = 40;
    let yOffset = page.getHeight() - padding;

    columns.forEach((col, index) => {
      page.drawText(col.label, {
        x: padding + index * 100,
        y: yOffset,
        font,
        size: fontSize,
      });
    });

    yOffset -= 20;

    data.data.forEach((row) => {
      if (yOffset < padding) {
        const newPage = pdfDoc.addPage();
        yOffset = newPage.getHeight() - padding;
      }

      columns.forEach((col, index) => {
        page.drawText(String(row[col.key] ?? ""), {
          x: padding + index * 100,
          y: yOffset,
          font,
          size: fontSize,
        });
      });

      yOffset -= 15;
    });

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", "table-export.pdf");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <input
          type="text"
          placeholder="Filtrar datos..."
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
        />
        {showExport && (
          <div className="flex gap-2">
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <FileDown size={16} />
              <span className="hidden sm:inline">Exportar CSV</span>
            </button>
            <button
              onClick={exportToPDF}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <Download size={16} />
              <span className="hidden sm:inline">Exportar PDF</span>
            </button>
          </div>
        )}
      </div>

      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  <div className="flex items-center gap-2">
                    {column.label}
                    {column.sortable && (
                      <button
                        onClick={() => handleSort(column.key)}
                        className="hover:bg-gray-100 p-1 rounded"
                      >
                        <ArrowUpDown size={16} />
                      </button>
                    )}
                  </div>
                </th>
              ))}
              {showActions && (onEdit || onDelete) && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.data.map((row, index) => (
              <tr
                key={row.id}
                onClick={(e) => handleRowClick(index, e)}
                className={`cursor-pointer hover:bg-gray-50 transition-colors
                ${selectedRows.has(index) ? "bg-blue-50" : ""}
              `}
              >
                {columns.map((column) => (
                  <td
                    key={`${row.id}-${String(column.key)}`}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                  >
                    {column.render
                      ? column.render(row[column.key], row)
                      : String(row[column.key] ?? "")}
                  </td>
                ))}
                {showActions && (onEdit || onDelete) && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex gap-2">
                      {onEdit && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(row);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-full"
                        >
                          <Pencil size={16} />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(row);
                          }}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-full"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-between items-center">
        <div className="text-sm text-gray-700">
          Mostrando {from} a {to} de {total} entradas
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(current_page - 1)}
            disabled={current_page === 1}
            className="px-3 py-1 border rounded hover:bg-red-100 disabled:opacity-50"
          >
            Anterior
          </button>

          {getPageRange().map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`px-3 py-1 border rounded hover:bg-red-100 
                ${
                  pageNum === current_page
                    ? "bg-red-500 text-white hover:!bg-red-700"
                    : ""
                }`}
            >
              {pageNum}
            </button>
          ))}

          <button
            onClick={() => onPageChange(current_page + 1)}
            disabled={current_page === last_page}
            className="px-3 py-1 border rounded hover:bg-red-100 disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
};
