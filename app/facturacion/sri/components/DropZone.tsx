/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  AlertCircleIcon,
  FileIcon,
  FileSpreadsheetIcon,
  FileUpIcon,
  XIcon,
  ArrowRightIcon,
  LoaderIcon
} from "lucide-react";

import { formatBytes, useFileUpload } from "@/hooks/use-file-upload";
import { Button } from "@/components/ui/button";
import { useSri } from "@/contexts/SriContext";
import { useState } from "react";

const getFileIcon = (file: { file: File | { type: string; name: string } }) => {
  const fileType = file.file instanceof File ? file.file.type : file.file.type;
  const fileName = file.file instanceof File ? file.file.name : file.file.name;

  if (
    fileType.includes("excel") ||
    fileName.endsWith(".xls") ||
    fileName.endsWith(".xlsm") ||
    fileName.endsWith(".xlsx") ||
    fileName.endsWith(".txt") ||
    fileName.endsWith(".tsv")
  ) {
    return <FileSpreadsheetIcon className="size-4 opacity-60" />;
  }
  return <FileIcon className="size-4 opacity-60" />;
};

export default function DropZone() {
  const { state, actions } = useSri();
  const { parseExcelFile, setExcelFile } = actions;
  const { isLoading, error } = state;
  
  const [processingFile, setProcessingFile] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  
  const maxSize = 200 * 1024 * 1024; // 200MB
  const maxFiles = 1;

  const handleFileDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setExcelFile(file);
      
      setProcessingFile(true);
      try {
        // Generar una vista previa simple
        const data = await file.arrayBuffer();
        const XLSX = await import("xlsx");
        const workbook = XLSX.read(data);
        
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Mostrar solo las primeras 5 filas como vista previa
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
          header: 1,
          range: 0,
          defval: ""
        });
        
        setPreviewData(jsonData.slice(0, 5));
      } catch (error) {
        console.error("Error al generar vista previa:", error);
      }
      setProcessingFile(false);
    }
  };

  const [
    { files, isDragging, errors },
    {
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      removeFile,
      clearFiles,
      getInputProps,
    },
  ] = useFileUpload({
    multiple: false,
    maxFiles,
    maxSize,
    accept: ".xls,.xlsx,.xlsm,.txt,.tsv",
    onDrop: handleFileDrop
  });

  const handleProcess = async () => {
    if (files.length > 0 && files[0].file instanceof File) {
      await parseExcelFile(files[0].file);
    }
  };

  return (
    <div className="flex flex-col gap-4 py-8">
      {/* Drop area */}
      <div
        role="button"
        onClick={openFileDialog}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        data-dragging={isDragging || undefined}
        className={`border-input hover:bg-accent/50 data-[dragging=true]:bg-accent/50 has-[input:focus]:border-ring has-[input:focus]:ring-ring/50 flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed p-4 transition-colors has-disabled:pointer-events-none has-disabled:opacity-50 has-[input:focus]:ring-[3px] ${
          files.length > 0 ? "bg-accent/20" : ""
        }`}
      >
        <input
          {...getInputProps()}
          className="sr-only"
          aria-label="Subir archivos"
          accept=".xls, .xlsx, .xlsm, .txt, .tsv"
        />

        <div className="flex flex-col items-center justify-center text-center">
          <div
            className="bg-background mb-2 flex size-11 shrink-0 items-center justify-center rounded-full border"
            aria-hidden="true"
          >
            <FileUpIcon className="size-4 opacity-60" />
          </div>
          <p className="mb-1.5 text-sm font-medium">Subir archivo</p>
          <p className="text-muted-foreground mb-2 text-xs">
            Arrastra y suelta o haz click para seleccionar
          </p>
          <div className="text-muted-foreground/70 flex flex-wrap justify-center gap-1 text-xs">
            <span>Hasta {formatBytes(maxSize)}</span>
          </div>
        </div>
      </div>

      {errors.length > 0 && (
        <div
          className="text-destructive flex items-center gap-1 text-xs"
          role="alert"
        >
          <AlertCircleIcon className="size-3 shrink-0" />
          <span>{errors[0]}</span>
        </div>
      )}

      {error && (
        <div
          className="text-destructive flex items-center gap-1 text-xs"
          role="alert"
        >
          <AlertCircleIcon className="size-3 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-4">
          <div className="bg-background flex items-center justify-between gap-2 rounded-lg border p-2 pe-3">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="flex aspect-square size-10 shrink-0 items-center justify-center rounded border">
                {getFileIcon(files[0])}
              </div>
              <div className="flex min-w-0 flex-col gap-0.5">
                <p className="truncate text-[13px] font-medium">
                  {files[0].file instanceof File
                    ? files[0].file.name
                    : files[0].file.name}
                </p>
                <p className="text-muted-foreground text-xs">
                  {formatBytes(
                    files[0].file instanceof File
                      ? files[0].file.size
                      : files[0].file.size
                  )}
                </p>
              </div>
            </div>

            <Button
              size="icon"
              variant="ghost"
              className="text-muted-foreground/80 hover:text-foreground -me-2 size-8 hover:bg-transparent"
              onClick={() => removeFile(files[0].id)}
              aria-label="Remove file"
            >
              <XIcon className="size-4" aria-hidden="true" />
            </Button>
          </div>

          {/* Vista previa de datos */}
          {previewData.length > 0 && (
            <div className="rounded-lg border overflow-hidden">
              <div className="bg-muted/50 p-2 border-b">
                <h3 className="text-sm font-medium">Vista previa</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/30">
                    <tr>
                      {/* Mostrar hasta 8 columnas en la vista previa */}
                      {previewData[0]?.slice(0, 8).map((header: any, index: number) => (
                        <th key={index} className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                          {header || `Columna ${index + 1}`}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.slice(1, 5).map((row: any, rowIndex: number) => (
                      <tr key={rowIndex} className="border-t">
                        {row.slice(0, 8).map((cell: any, cellIndex: number) => (
                          <td key={cellIndex} className="px-3 py-2 truncate max-w-xs">
                            {cell || ""}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={clearFiles}
              disabled={isLoading}
              size="sm"
            >
              Cancelar
            </Button>
            
            <Button 
              onClick={handleProcess}
              disabled={isLoading || processingFile || files.length === 0}
              className="gap-2"
              size="sm"
            >
              {isLoading ? (
                <>
                  <LoaderIcon className="size-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  Siguiente
                  <ArrowRightIcon className="size-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}