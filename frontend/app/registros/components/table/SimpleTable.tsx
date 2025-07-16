/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/lib/api";
import React, { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

interface SimpleTableProps {
  mode: "requests" | "reposiciones";
  type?: string;
}

const SimpleTable: React.FC<SimpleTableProps> = ({ mode, type }) => {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);

      const params = new URLSearchParams({
        period: "last_month",
      });

      if (type && mode === "requests") {
        params.append("type", type);
      }

      const url = `/${mode}?${params.toString()}`;
      console.log(`[SimpleTable] Fetching data from: ${url}`);

      const response = await api.get(url);

      if ("ok" in response && response.ok === true) {
        delete response.ok;
      }

      console.log("[SimpleTable] Raw response:", response);

      // Determinar formato de respuesta y extraer datos
      let extractedData: any[] = [];

      if (Array.isArray(response)) {
        extractedData = response;
      } else if (response && typeof response === "object") {
        if (response.data && Array.isArray(response.data)) {
          extractedData = response.data;
        } else {
          // Buscar índices numéricos (0, 1, 2, etc.)
          const numericKeys = Object.keys(response).filter(
            (k) => !isNaN(Number(k))
          );
          if (numericKeys.length > 0) {
            extractedData = numericKeys.map((key) => response.data[key]);
          } else {
            extractedData = Object.values(response).filter(
              (val) => val && typeof val === "object" && !Array.isArray(val)
            );
          }
        }
      }

      console.log("[SimpleTable] Extracted data:", extractedData);
      console.log("[SimpleTable] Data count:", extractedData.length);

      if (extractedData.length === 0) {
        toast.warning("No se encontraron datos para mostrar");
      }

      setData(extractedData);
      setError(null);
    } catch (err) {
      console.error("[SimpleTable] Error fetching data:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
      toast.error("Error al cargar los datos");
    } finally {
      setIsLoading(false);
    }
  }, [mode, type]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = () => {
    fetchData();
  };

  if (isLoading) {
    return (
      <div className="w-full p-8 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-3">Cargando...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-red-600">Error: {error}</p>
        <button
          onClick={handleRefresh}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="w-full p-4 bg-yellow-50 border border-yellow-200 rounded-md">
        <p className="text-yellow-600">No hay datos para mostrar</p>
        <button
          onClick={handleRefresh}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Actualizar
        </button>
      </div>
    );
  }

  // Obtener las columnas del primer elemento
  const columns = Object.keys(data[0]);

  // Filtrar columnas demasiado complejas o anidadas
  const simpleColumns = columns.filter((column) => {
    const value = data[0][column];
    return typeof value !== "object" || value === null;
  });

  return (
    <div className="w-full overflow-x-auto">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-bold">
          {mode === "requests" ? "Solicitudes" : "Reposiciones"}
          {type ? ` (${type})` : ""}
        </h2>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Actualizar
        </button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {simpleColumns.map((column) => (
                <th
                  key={column}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column}
                </th>
              ))}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50">
                {simpleColumns.map((column) => (
                  <td
                    key={column}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                  >
                    {item[column] !== null && item[column] !== undefined
                      ? String(item[column])
                      : "-"}
                  </td>
                ))}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button
                    onClick={() => console.log("Item details:", item)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    Ver detalles
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-sm text-gray-500">
        Mostrando {data.length} registros
      </div>
    </div>
  );
};

export default SimpleTable;
