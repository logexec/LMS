// Inserta este componente en tu aplicación para diagnosticar el problema
// Puedes colocarlo justo antes de tu tabla principal o en una ruta de prueba
/* eslint-disable @typescript-eslint/no-explicit-any */

import api from "@/lib/api";
import React, { useEffect, useState } from "react";

const TableDebugger = ({
  mode,
  type,
}: {
  mode: "requests" | "reposiciones";
  type?: string;
}) => {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const url = `/${mode}?period=last_3_months${
          type ? `&type=${type}` : ""
        }`;
        console.log(`[TableDebugger] Fetching from: ${url}`);

        const response = await api.get(url);
        console.log("[TableDebugger] Raw response:", response);

        // Normalizar la respuesta para extraer los datos
        let normalizedData: any[] = [];

        if (Array.isArray(response)) {
          normalizedData = response;
        } else if (response && typeof response === "object") {
          if (response.data && Array.isArray(response.data)) {
            normalizedData = response.data;
          } else {
            // Si es un objeto con índices numéricos
            const numericKeys = Object.keys(response).filter(
              (k) => !isNaN(Number(k))
            );
            if (numericKeys.length) {
              normalizedData = numericKeys.map((key) => response.data[key]);
            } else {
              // Si es otro tipo de objeto, intentar extraer valores
              normalizedData = Object.values(response).filter(
                (val) => val && typeof val === "object" && !Array.isArray(val)
              );
            }
          }
        }

        console.log("[TableDebugger] Normalized data:", normalizedData);
        setData(normalizedData);
      } catch (err) {
        console.error("[TableDebugger] Error:", err);
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [mode, type]);

  if (isLoading) return <div>Cargando datos para depuración...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-4 border rounded bg-gray-50 my-4">
      <h2 className="text-lg font-bold mb-2">Depurador de Tabla ({mode})</h2>
      <div className="mb-2">
        <span className="font-semibold">Total de registros:</span> {data.length}
      </div>

      {data.length > 0 && (
        <>
          <h3 className="font-semibold mb-1">Primer registro (muestra):</h3>
          <pre className="bg-gray-100 p-2 rounded overflow-auto max-h-60 text-xs">
            {JSON.stringify(data[0], null, 2)}
          </pre>

          <h3 className="font-semibold mt-4 mb-1">Tabla básica de datos:</h3>
          <div className="overflow-auto max-h-96">
            <table className="min-w-full border">
              <thead>
                <tr className="bg-gray-200">
                  {data.length > 0 &&
                    Object.keys(data[0]).map((key) => (
                      <th
                        key={key}
                        className="px-2 py-1 border text-left text-xs"
                      >
                        {key}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody>
                {data.map((item, idx) => (
                  <tr key={idx} className="border hover:bg-gray-100">
                    {Object.entries(item).map(([key, value]) => (
                      <td key={key} className="px-2 py-1 border text-xs">
                        {typeof value === "object"
                          ? JSON.stringify(value).substring(0, 50) +
                            (JSON.stringify(value).length > 50 ? "..." : "")
                          : String(value)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <div className="mt-4">
        <h3 className="font-semibold">Verificación de campos clave:</h3>
        <ul className="list-disc pl-5 text-sm">
          {mode === "requests" && (
            <>
              <li>
                Campo unique_id presente:{" "}
                {data.every((item) => "unique_id" in item) ? "✅" : "❌"}
              </li>
              <li>
                Campo type presente:{" "}
                {data.every((item) => "type" in item) ? "✅" : "❌"}
              </li>
              <li>
                Campo status presente:{" "}
                {data.every((item) => "status" in item) ? "✅" : "❌"}
              </li>
            </>
          )}
          {mode === "reposiciones" && (
            <>
              <li>
                Campo fecha_reposicion presente:{" "}
                {data.every((item) => "fecha_reposicion" in item) ? "✅" : "❌"}
              </li>
              <li>
                Campo status presente:{" "}
                {data.every((item) => "status" in item) ? "✅" : "❌"}
              </li>
              <li>
                Campo total_reposicion presente:{" "}
                {data.every((item) => "total_reposicion" in item) ? "✅" : "❌"}
              </li>
            </>
          )}
          <li>
            Campo project presente:{" "}
            {data.every((item) => "project" in item) ? "✅" : "❌"}
          </li>
          <li>
            Campo id presente:{" "}
            {data.every((item) => "id" in item) ? "✅" : "❌"}
          </li>
        </ul>
      </div>
    </div>
  );
};

export default TableDebugger;
