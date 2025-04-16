"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sheet, FileSpreadsheet, Loader2, UploadCloud } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import apiService from "@/services/api.service";
import { toast } from "sonner";

interface ExcelUploadSectionProps {
  context: "discounts" | "expenses" | "income";
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
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Se produjo un error desconocido al tratar de cargar el archivo";
      let errors = [];
      try {
        errors = JSON.parse(errorMessage);
      } catch {
        errors = [errorMessage]; // Si no es JSON, tratar como mensaje único
      }
      errors.forEach((err: string) => toast.error(err)); // Mostrar un toast por cada error
      console.error("Error al importar:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadTemplate = async (
    context: "discounts" | "expenses" | "income"
  ) => {
    setIsDownloading(true);
    try {
      const result = await apiService.downloadTemplate(context);
      toast.success(result.message);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Se produjo un error desconocido al tratar de descargar la plantilla. Por favor, contacta a soporte."
      );
      console.error("Error al descargar:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  // Variantes para animaciones
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25,
      },
    },
  };

  const contextLabel = {
    discounts: "descuentos",
    expenses: "gastos",
    income: "ingresos",
  }[context];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <Card className="border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-950 shadow-md hover:shadow-lg transition-all duration-300 rounded-xl">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Sección de carga */}
            <motion.div variants={itemVariants} className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center">
                  <UploadCloud className="w-5 h-5 mr-2 text-emerald-500 dark:text-emerald-400" />
                  Carga de Excel
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Importa tus {contextLabel} desde un archivo Excel de forma
                  fácil y rápida
                </p>
              </div>

              <div
                className={`
                  relative rounded-xl border-2 border-dashed p-8
                  transition-all duration-300 ease-in-out
                  ${
                    dragActive
                      ? "border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/30"
                      : "border-slate-200 hover:border-emerald-300 dark:border-slate-800 dark:hover:border-emerald-800"
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
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.2 }}
                          className="flex flex-col items-center"
                        >
                          <div className="relative">
                            <div className="absolute inset-0 bg-emerald-100 dark:bg-emerald-900/20 rounded-full blur-md"></div>
                            <Loader2 className="h-12 w-12 text-emerald-500 dark:text-emerald-400 animate-spin relative z-10" />
                          </div>
                          <span className="mt-4 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                            Procesando archivo...
                          </span>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="upload"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.2 }}
                          className="flex flex-col items-center"
                        >
                          <div className="p-3 bg-emerald-100 dark:bg-emerald-900/20 rounded-full">
                            <FileSpreadsheet className="h-10 w-10 text-emerald-500 dark:text-emerald-400" />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="text-center mt-4">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {isUploading
                        ? "Procesando tu archivo"
                        : "Arrastra tu archivo Excel aquí"}
                    </p>
                    {!isUploading && (
                      <div className="mt-2">
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                          o
                        </span>
                        <label className="mt-2 inline-block">
                          <span className="mx-1 text-sm font-medium text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300 cursor-pointer transition-colors">
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
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-500 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-full">
                    Formatos soportados: .xlsx, .xls, .csv
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Sección de plantilla */}
            <motion.div
              variants={itemVariants}
              className="space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center">
                  <Sheet className="w-5 h-5 mr-2 text-emerald-500 dark:text-emerald-400" />
                  ¿Necesitas la plantilla?
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Descarga nuestra plantilla actualizada para importar{" "}
                  {contextLabel} correctamente
                </p>
              </div>

              <div className="mt-8 bg-slate-50 dark:bg-slate-900/50 rounded-xl p-6 border border-slate-100 dark:border-slate-800">
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center text-slate-700 dark:text-slate-300">
                    <div className="bg-emerald-100 dark:bg-emerald-900/20 p-2 rounded-full mr-4">
                      <FileSpreadsheet className="h-6 w-6 text-emerald-500 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="font-medium">Plantilla de {contextLabel}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-500">
                        Excel (.xlsx)
                      </p>
                    </div>
                  </div>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={() => handleDownloadTemplate(context)}
                          disabled={isDownloading}
                          className="w-full mt-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white border-0 transition-all duration-200 shadow-sm"
                        >
                          {isDownloading ? (
                            <div className="flex items-center justify-center">
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              <span>Descargando...</span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center">
                              <Sheet className="mr-2 h-4 w-4" />
                              <span>Descargar Plantilla</span>
                            </div>
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-lg text-slate-700 dark:text-slate-300">
                        Descarga la plantilla oficial para importar{" "}
                        {contextLabel}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                <div className="mt-6 text-sm text-slate-500 dark:text-slate-400">
                  <p className="flex items-center">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2"></span>
                    Plantilla verificada y actualizada
                  </p>
                  <p className="flex items-center mt-1">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2"></span>
                    Incluye todos los campos necesarios
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ExcelUploadSection;
