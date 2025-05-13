"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { sriApi } from "@/services/axios";
import { Alert } from "@/components/ui/alert";
import {
  Loader2,
  UploadIcon,
  FileTextIcon,
  CheckCircleIcon,
} from "lucide-react";
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
  const [fileName, setFileName] = useState<string>("");
  const [dragActive, setDragActive] = useState(false);

  const validateRow = (row: Record<string, string>): string[] => {
    const errors: string[] = [];

    // Validar campos obligatorios
    const requiredFields = [
      "RUC_EMISOR",
      "RAZON_SOCIAL_EMISOR",
      "TIPO_COMPROBANTE",
      "SERIE_COMPROBANTE",
      "CLAVE_ACCESO",
    ];

    for (const field of requiredFields) {
      if (!row[field]) {
        errors.push(`El campo ${field} es obligatorio`);
      }
    }

    // Validar que el RUC tenga formato válido (Ecuador - 13 dígitos)
    if (row.RUC_EMISOR && !/^\d{13}$/.test(row.RUC_EMISOR)) {
      errors.push(
        `El RUC ${row.RUC_EMISOR} no tiene formato válido (debe tener 13 dígitos)`
      );
    }

    // Validar que la clave de acceso tenga 49 caracteres
    if (row.CLAVE_ACCESO && row.CLAVE_ACCESO.length !== 49) {
      errors.push(
        `La clave de acceso debe tener 49 caracteres (tiene ${row.CLAVE_ACCESO.length})`
      );
    }

    // Validar valores numéricos
    if (row.VALOR_SIN_IMPUESTOS && isNaN(parseFloat(row.VALOR_SIN_IMPUESTOS))) {
      errors.push("VALOR_SIN_IMPUESTOS debe ser un número");
    }

    if (row.IVA && isNaN(parseFloat(row.IVA))) {
      errors.push("IVA debe ser un número");
    }

    if (row.IMPORTE_TOTAL && isNaN(parseFloat(row.IMPORTE_TOTAL))) {
      errors.push("IMPORTE_TOTAL debe ser un número");
    }

    return errors;
  };

  const handleGenerateDocuments = async () => {
    if (parsedFile.rows.length === 0) {
      toast.warning("No hay registros cargados");
      return;
    }

    // Validar cada fila individualmente
    const errors: string[] = [];
    parsedFile.rows.forEach((row, index) => {
      const rowErrors = validateRow(row);
      if (rowErrors.length > 0) {
        // Agregar el número de fila a cada error
        const prefixedErrors = rowErrors.map(
          (err) => `Fila ${index + 1}: ${err}`
        );
        errors.push(...prefixedErrors);
      }
    });

    if (errors.length > 0) {
      // Mostrar los primeros 5 errores para no saturar la UI
      const errorsToShow = errors.slice(0, 5);
      toast.error(
        <div>
          <p>Hay errores en los datos:</p>
          <ul className="list-disc pl-4 mt-2">
            {errorsToShow.map((error, i) => (
              <li key={i}>{error}</li>
            ))}
          </ul>
          {errors.length > 5 && (
            <p className="mt-2">... y {errors.length - 5} errores más.</p>
          )}
        </div>
      );
      return;
    }

    try {
      setLoading(true);
      await sriApi.generateDocuments(parsedFile.rows);
      toast.success(
        `${parsedFile.rows.length} documento(s) generados correctamente`
      );
      onFinish("done"); // Activa la pestaña 2
    } catch (error) {
      console.error("[handleGenerateDocuments] Error:", error);
      // El error lo maneja el interceptor
    } finally {
      setLoading(false);
    }
  };

  const processFile = (file: File) => {
    if (!file.name.endsWith(".txt")) {
      toast.error("Por favor, selecciona un archivo .txt");
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        try {
          const lines = content
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean);

          if (lines.length === 0) {
            toast.error("El archivo está vacío");
            return;
          }

          const headerLine = lines[0];
          const headers = headerLine.split("\t").map((h) => h.trim());

          // Validar que el encabezado tenga las columnas necesarias
          const requiredColumns = [
            "RUC_EMISOR",
            "RAZON_SOCIAL_EMISOR",
            "CLAVE_ACCESO",
            "SERIE_COMPROBANTE",
          ];
          const missingColumns = requiredColumns.filter(
            (col) => !headers.includes(col)
          );

          if (missingColumns.length > 0) {
            toast.error(
              `Faltan columnas requeridas: ${missingColumns.join(", ")}`
            );
            return;
          }

          const rows = lines.slice(1).map((line) => {
            const fields = line.split("\t").map((f) => f.trim());
            const row: Record<string, string> = {};

            headers.forEach((header, idx) => {
              row[header] = fields[idx] || "";
            });

            return row;
          });

          setParsedFile({ headers, rows });
          toast.success(
            `Archivo cargado: ${rows.length} registros encontrados`
          );
        } catch (error) {
          console.error("Error parsing file:", error);
          toast.error("Error al procesar el archivo");
        }
      }
    };

    reader.readAsText(file);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    processFile(file);
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Loader */}
      {loading && (
        <div className="fixed top-0 left-0 bg-black/30 backdrop-blur-sm w-screen h-screen overflow-hidden flex items-center justify-center z-50">
          <Alert variant="default" className="max-w-lg py-5">
            <div className="w-fit flex space-x-4 items-center">
              <Loader2 className="text-red-500 size-4 animate-spin" />
              <span className="text-slate-700 dark:text-slate-300 animate-pulse">
                Generando documentos... Por favor espera.
              </span>
            </div>
          </Alert>
        </div>
      )}

      <div
        className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors ${
          dragActive
            ? "border-primary/70 bg-primary/5"
            : "border-gray-300 hover:border-gray-400"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => document.getElementById("file-upload")?.click()}
      >
        <input
          id="file-upload"
          type="file"
          accept=".txt"
          onChange={handleFileUpload}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center space-y-2">
          {fileName ? (
            <>
              <CheckCircleIcon className="h-12 w-12 text-green-500" />
              <p className="font-medium">{fileName}</p>
              <p className="text-sm text-muted-foreground">
                {parsedFile.rows.length} registros cargados
              </p>
            </>
          ) : (
            <>
              <UploadIcon className="h-12 w-12 text-muted-foreground" />
              <p className="font-medium">
                Arrastra un archivo aquí o haz clic para seleccionar
              </p>
              <p className="text-sm text-muted-foreground">
                Soporta archivos de texto (.txt) con valores separados por
                tabulaciones
              </p>
            </>
          )}
        </div>
      </div>

      {parsedFile.rows.length > 0 && (
        <>
          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Vista previa del archivo</h3>
            <ResultsTable data={parsedFile.rows} />
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleGenerateDocuments}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <FileTextIcon className="mr-2 h-4 w-4" />
              {loading ? "Generando documentos..." : "Generar XML y PDF"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default TxtUploader;
