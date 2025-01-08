"use client";
import React, { useState, useEffect, useMemo } from "react";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { ArrowUpDown, Download, FileDown, Pencil, Trash2 } from "lucide-react";
import { Modal } from "./Modal";

type CellValue = string | number | null;

interface TableData {
  id: string | number;
  [key: string]: CellValue;
}

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
}

interface DataTableProps {
  data: TableData[];
  columns: Column[];
  onSelectionChange?: (selectedItems: TableData[]) => void;
  onEdit?: (item: TableData) => void;
  onDelete?: (item: TableData) => void;
}

export const DataTable: React.FC<DataTableProps> = ({
  data,
  columns,
  onSelectionChange,
  onEdit,
  onDelete,
}) => {
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [lastSelected, setLastSelected] = useState<number | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);
  const [filterText, setFilterText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [editItem, setEditItem] = useState<TableData | null>(null);
  const [deleteItem, setDeleteItem] = useState<TableData | null>(null);

  const processedData = useMemo(() => {
    let result = [...data];

    if (filterText) {
      result = result.filter((item) =>
        Object.values(item).some((value) =>
          String(value ?? "")
            .toLowerCase()
            .includes(filterText.toLowerCase())
        )
      );
    }

    if (sortConfig) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key] ?? "";
        const bValue = b[sortConfig.key] ?? "";

        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, filterText, sortConfig]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return processedData.slice(startIndex, startIndex + itemsPerPage);
  }, [processedData, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(processedData.length / itemsPerPage);

  const selectedItems = useMemo(() => {
    return Array.from(selectedRows).map((index) => paginatedData[index]);
  }, [selectedRows, paginatedData]);

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

  const handleSort = (key: string) => {
    setSortConfig((current) => {
      if (current?.key === key) {
        return current.direction === "asc" ? { key, direction: "desc" } : null;
      }
      return { key, direction: "asc" };
    });
  };

  const handleEdit = (item: TableData) => {
    setEditItem(item);
  };

  const handleDelete = (item: TableData) => {
    setDeleteItem(item);
  };

  const handleConfirmDelete = () => {
    if (deleteItem && onDelete) {
      onDelete(deleteItem);
      setDeleteItem(null);
    }
  };

  const handleConfirmEdit = () => {
    if (editItem && onEdit) {
      onEdit(editItem);
      setEditItem(null);
    }
  };

  const exportToCSV = () => {
    const headers = columns.map((col) => col.label).join(",");
    const rows = data
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

    // Agregar cabeceras
    columns.forEach((col, index) => {
      page.drawText(col.label, {
        x: padding + index * 100,
        y: yOffset,
        font,
        size: fontSize,
      });
    });

    yOffset -= 20;

    // Agregar filas
    data.forEach((row) => {
      if (yOffset < padding) {
        // Agregar nueva página si se acaba el espacio
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
    link.setAttribute("download", "LogeX-export.pdf");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full">
      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <input
          type="text"
          placeholder="Filtrar datos..."
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
        />
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
      </div>

      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.map((row, index) => (
              <tr
                key={row.id}
                onClick={(e) => handleRowClick(index, e)}
                className={`
                  cursor-pointer hover:bg-gray-50 transition-colors
                  ${selectedRows.has(index) ? "bg-blue-50" : ""}
                `}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                  >
                    {row[column.key] ?? ""}
                  </td>
                ))}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(row);
                      }}
                      className="p-1 text-blue-600 hover:text-blue-800"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(row);
                      }}
                      className="p-1 text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-between items-center">
        <div className="text-sm text-gray-700">
          Mostrando {(currentPage - 1) * itemsPerPage + 1} a{" "}
          {Math.min(currentPage * itemsPerPage, processedData.length)} de{" "}
          {processedData.length} entradas
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
          >
            Anterior
          </button>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      </div>

      {editItem && (
        <Modal isOpen={!!editItem}>
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Editar Registro</h2>
            {editItem &&
              columns.map((column) => (
                <div key={column.key}>
                  <label className="block text-sm font-medium text-gray-700">
                    {column.label}
                  </label>
                  <input
                    type="text"
                    value={editItem[column.key] ?? ""}
                    onChange={(e) =>
                      setEditItem({
                        ...editItem,
                        [column.key]: e.target.value,
                      })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              ))}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditItem(null)}
                className="px-4 py-2 border rounded-md hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmEdit}
                className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600"
              >
                Guardar
              </button>
            </div>
          </div>
        </Modal>
      )}

      {deleteItem && (
        <Modal isOpen={!!deleteItem}>
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">
              Se va a eliminar el registro
            </h2>
            <p>
              ¿Estás seguro de que quieres eliminar el registro {deleteItem.id}{" "}
              de {deleteItem.name}?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteItem(null)}
                className="px-4 py-2 border rounded-md hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Eliminar
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
