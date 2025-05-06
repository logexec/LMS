/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import TxtTable from "./TxtTable";
import { Button } from "@/components/ui/button";
import { RiFilePdf2Line } from "@remixicon/react";
// import { useRouter } from "next/router";
import { toast } from "sonner";
import axios from "axios";

interface ParsedFile {
  headers: string[];
  rows: Record<string, string>[];
}

const TxtUploader: React.FC = () => {
  const [parsedFile, setParsedFile] = useState<ParsedFile>({
    headers: [],
    rows: [],
  });

  // const router = useRouter();

  const handleGenerateDocuments = async () => {
    if (parsedFile.rows.length === 0) {
      toast.warning("No hay registros cargados");
      return;
    }

    const folderName = prompt(
      "Ingresa un nombre para la carpeta de documentos:"
    );
    if (!folderName) {
      toast.info("Cancelado por el usuario");
      return;
    }

    try {
      await axios.post("/api/generate-documents", {
        folder: folderName,
        data: parsedFile.rows,
      });

      toast.success("Documentos generados correctamente");

      // Redirigir a la pestaña de compras con la carpeta como parámetro
      // router.push(`/compras?folder=${encodeURIComponent(folderName)}`);
    } catch (error: any) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "Error al generar XML y PDF"
      );
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
