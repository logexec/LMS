"use client";

import React, { useState } from "react";
import TxtTable from "./TxtTable";
import { Button } from "@/components/ui/button";
import { RiFilePdf2Line } from "@remixicon/react";

interface ParsedFile {
  headers: string[];
  rows: Record<string, string>[];
}

const TxtUploader: React.FC = () => {
  const [parsedFile, setParsedFile] = useState<ParsedFile>({
    headers: [],
    rows: [],
  });

  const handleGenerateDocuments = async () => {
    try {
      const response = await fetch("/api/generate-documents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ parsedFile }),
      });

      if (!response.ok) {
        throw new Error("Error al generar documentos");
      }

      const result = await response.json();
      alert("Documentos generados correctamente");
      console.log("Archivos generados:", result);
      // Puedes redireccionar a la descarga aquí si quieres
    } catch (error) {
      console.error(error);
      alert("Error al generar XML y PDF");
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        const lines = content
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean);

        if (lines.length === 0) return;

        const headerLine = lines[0];
        const headers = headerLine.split("|").map((h) => h.trim());

        const rows = lines.slice(1).map((line) => {
          const fields = line.split("|").map((f) => f.trim());
          const row: Record<string, string> = {};

          headers.forEach((header, idx) => {
            row[header] = fields[idx] || "";
          });

          return row;
        });

        setParsedFile({ headers, rows });
      }
    };

    reader.readAsText(file);
  };

  return (
    <div className="w-full p-4 space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Cargar archivo TXT
        </label>
        <input
          type="file"
          accept=".txt"
          onChange={handleFileUpload}
          className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
                     file:rounded-full file:border-0 file:text-sm file:font-semibold
                     file:bg-primary file:text-white hover:file:bg-blue-100"
        />
      </div>
      <TxtTable headers={parsedFile.headers} data={parsedFile.rows} />

      <Button
        onClick={handleGenerateDocuments}
        disabled={parsedFile.rows.length === 0}
        className="bg-green-600 hover:bg-green-700 text-white"
      >
        <RiFilePdf2Line /> Generar XML y PDF
      </Button>
    </div>
  );
};

export default TxtUploader;
