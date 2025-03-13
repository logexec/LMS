"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sheet, FileSpreadsheet, Loader2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import apiService from "@/services/api.service";
import { toast } from "sonner"; // Ajusta según tu librería de notificaciones

interface ExcelUploadSectionProps {
  context: "discounts" | "expenses"; // Solo el contexto es obligatorio
}

const ExcelUploadSection: React.FC<ExcelUploadSectionProps> = ({ context }) => {
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const result = await apiService.importExcelData(file, context);
      toast.success(result.message);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : `Se produjo un error desconocido al importar el archivo. Por favor ponte en contacto con soporte.`
      );
      console.error("Error al importar:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    setIsDownloading(true);
    try {
      const result = await apiService.downloadTemplate(context);
      toast.success(result.message);
    } catch (error) {
      toast.error(
        "Se produjo un error al descargar la plantilla. Por favor, revisa la consola o contacta a soporte."
      );
      console.error("Error al descargar:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-white">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sección de carga */}
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-slate-900">
                  Carga de Excel
                </h3>
                <p className="text-sm text-slate-500">
                  Importa tus{" "}
                  {context === "discounts" ? "descuentos" : "gastos"} desde un
                  archivo Excel
                </p>
              </div>

              <div
                className={`
                  relative rounded-lg border-2 border-dashed p-8
                  transition-colors duration-200 ease-in-out
                  ${
                    dragActive
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-slate-200 hover:border-slate-300"
                  }
                `}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="relative">
                    <AnimatePresence mode="wait">
                      {isUploading ? (
                        <motion.div
                          key="loading"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <Loader2 className="h-10 w-10 text-emerald-500 animate-spin" />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="upload"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <FileSpreadsheet className="h-10 w-10 text-emerald-500" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="text-center">
                    <p className="text-sm font-medium text-slate-700">
                      {isUploading
                        ? "Procesando archivo..."
                        : "Arrastra tu archivo aquí o"}
                    </p>
                    {!isUploading && (
                      <label className="mt-2 inline-block">
                        <span className="text-sm font-medium text-emerald-600 hover:text-emerald-500 cursor-pointer">
                          selecciona un archivo
                        </span>
                        <input
                          type="file"
                          name="excel-upload"
                          accept=".xlsx,.xls,.csv"
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              handleFileUpload(e.target.files[0]);
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">
                    Archivos soportados: .xlsx, .xls, .csv
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Sección de plantilla */}
            <motion.div
              className="space-y-4 flex flex-col justify-between"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-slate-900">
                  ¿Necesitas la plantilla?
                </h3>
                <p className="text-sm text-slate-500">
                  Descarga la plantilla actualizada para importar{" "}
                  {context === "discounts" ? "descuentos" : "gastos"}
                </p>
              </div>

              <div className="flex items-center justify-start">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={handleDownloadTemplate}
                        disabled={isDownloading}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white transition-all duration-200"
                      >
                        {isDownloading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Descargando...
                          </>
                        ) : (
                          <>
                            <Sheet className="mr-2 h-4 w-4" />
                            Descargar Plantilla
                          </>
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      Descarga la plantilla oficial para importar{" "}
                      {context === "discounts" ? "descuentos" : "gastos"}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ExcelUploadSection;
