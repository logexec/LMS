"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { RiFilePdf2Line } from "@remixicon/react";
import { toast } from "sonner";
import { sriApi } from "@/services/axios";
import { Alert } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import ResultsTable from "./ResultsTable";

interface ParsedFile {
  headers: string[];
  rows: Record<string, string>[];
}

interface Props {
  onFinish: (folderName: string) => void;
}

const TxtUploader: React.FC<Props> = ({ onFinish }) => {
  const [parsedFile, setParsedFile] = useState<ParsedFile>({
    headers: [],
    rows: [],
  });

  const [loading, setLoading] = useState<boolean>(false);

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
      setLoading(true);
      await sriApi.generateDocuments(folderName, parsedFile.rows);
      toast.success("Documentos generados correctamente");
      if (onFinish) onFinish(folderName); // cambiar de pestaña
    } catch (error) {
      // El error ya lo maneja el interceptor
      console.error("[handleGenerateDocuments] Error:", error);
    } finally {
      setLoading(false);
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
        const headers = headerLine.split("\t").map((h) => h.trim());

        const rows = lines.slice(1).map((line) => {
          const fields = line.split("\t").map((f) => f.trim());
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
      {/* Loader */}
      {loading && (
        <div className="fixed top-0 left-0 bg-black/30 backdrop-blur-sm w-screen h-screen overflow-hidden flex items-center justify-center z-50">
          <Alert variant="default" className="max-w-lg py-5">
            <div className="w-fit flex space-x-4 items-center">
              <Loader2 className="!text-red-500 size-4 animate-spin" />
              <span className="text-slate-700 dark:text-slate-300 animate-pulse">
                Por favor, espera unos instantes. Se están generando los
                archivos...
              </span>
            </div>
          </Alert>
        </div>
      )}
      <div>
        <div className="mt-2 flex items-center">
          <label
            htmlFor="file-upload"
            className="cursor-pointer file:mr-4 file:py-2 file:px-4
                 rounded bg-primary text-white text-sm font-semibold
                 hover:bg-red-400 py-2 px-4 inline-block"
          >
            Carga el archivo .txt aquí
          </label>
          <input
            id="file-upload"
            type="file"
            accept=".txt"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </div>

      {/* <TxtTable headers={parsedFile.headers} data={parsedFile.rows} /> */}
      <ResultsTable data={parsedFile.rows} />

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
