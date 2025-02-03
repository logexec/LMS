import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { LoadingState, OptionsState, RequestData } from "@/utils/types";
import NormalDiscountForm from "./NormalDiscountForm";
import MassDiscountForm from "./MassDiscountForm";
import ExcelUploadSection from "./ExcelUploadSection";
import * as XLSX from "xlsx";
import { getAuthToken } from "@/services/auth.service";

const DescuentosForm = () => {
  const [loading, setLoading] = useState<LoadingState>({
    submit: false,
    projects: false,
    responsibles: false,
    transports: false,
    accounts: false,
    areas: false,
  });

  const [options, setOptions] = useState<OptionsState>({
    projects: [],
    responsibles: [],
    transports: [],
    accounts: [],
    areas: [],
  });

  const [isDownloading, setIsDownloading] = useState(false);
  const [activeTab, setActiveTab] = useState("normal");

  // Fetch inicial de datos
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading((prev) => ({ ...prev, projects: true, areas: true }));
      try {
        const [projectsRes, areasRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects`, {
            headers: { Authorization: `Bearer ${getAuthToken()}` },
            credentials: "include",
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/areas`, {
            headers: {
              Authorization: `Bearer ${getAuthToken()}`,
            },
            credentials: "include",
          }),
        ]);

        if (!projectsRes.ok) throw new Error("Error al cargar proyectos");
        if (!areasRes.ok) throw new Error("Error al cargar áreas");

        const [projectsData, areasData] = await Promise.all([
          projectsRes.json(),
          areasRes.json(),
        ]);

        setOptions((prev) => ({
          ...prev,
          projects: projectsData.map(
            (project: { name: string; id: string }) => ({
              label: project.name,
              value: project.id,
            })
          ),

          areas: areasData.map((area: { name: string; id: string }) => ({
            label: area.name,
            value: area.id,
          })),
        }));
      } catch (error) {
        toast.error("Error al cargar datos iniciales");
        console.error("Error al cargar datos iniciales:", error);
      } finally {
        setLoading((prev) => ({ ...prev, projects: false, areas: false }));
      }
    };

    fetchInitialData();
  }, []);

  const handleExcelUpload = async (file: File) => {
    setLoading((prev) => ({ ...prev, submit: true }));
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, {
        cellDates: true,
        dateNF: "yyyy-mm-dd",
      });

      // Obtener la primera hoja
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: false });

      // Validar estructura del Excel
      const requiredColumns = [
        "Fecha",
        "Tipo",
        "No. Factura",
        "Cuenta",
        "Valor",
        "Proyecto",
        "Responsable",
        "Placa", // Opcional, solo para transportistas
        "Observación",
      ];

      const rawHeaderRow = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
      })[0];
      const headerRow = Array.isArray(rawHeaderRow)
        ? rawHeaderRow.map(String)
        : [];

      const missingColumns = requiredColumns.filter(
        (col) => col !== "Placa" && !headerRow.includes(col)
      );

      if (missingColumns.length > 0) {
        throw new Error(`Columnas faltantes: ${missingColumns.join(", ")}`);
      }

      // Preparar FormData con los datos procesados
      const formData = new FormData();
      formData.append("file", file);
      formData.append("data", JSON.stringify(jsonData));

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/upload-discounts`,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
          method: "POST",
          body: formData,
          credentials: "include",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        if (result.errors) {
          // Crear mensaje de error detallado para cada fila con error
          const errorMessage = result.errors
            .map(
              (err: { row: number; error: string }) =>
                `Fila ${err.row}: ${err.error}`
            )
            .join("\n");
          throw new Error(errorMessage);
        }
        throw new Error(result.message || "Error al procesar el archivo");
      }

      toast.success(`${result.processed} descuentos procesados correctamente`);
    } catch (error) {
      console.error("Error:", error);
      // Si el error tiene múltiples líneas, usar toast.error para cada línea
      if (error instanceof Error && error.message.includes("\n")) {
        error.message.split("\n").forEach((line) => toast.error(line));
      } else {
        toast.error(
          error instanceof Error
            ? error.message
            : "Error al procesar el archivo"
        );
      }
    } finally {
      setLoading((prev) => ({ ...prev, submit: false }));
    }
  };

  const handleDownloadTemplate = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/download-excel-template`,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
          method: "GET",
          credentials: "include",
        }
      );

      if (!response.ok) throw new Error("Error al descargar la plantilla");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "Plantilla Descuentos Masivos | LogeX.xlsx";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Plantilla descargada correctamente");
    } catch (error) {
      toast.error("Error al descargar la plantilla");
      console.error("Error al descargar la plantilla:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleNormalSubmit = async (formData: FormData) => {
    setLoading((prev) => ({ ...prev, submit: true }));
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/requests`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al crear el descuento");
      }

      toast.success("Descuento registrado con éxito");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Error al procesar el descuento"
      );
    } finally {
      setLoading((prev) => ({ ...prev, submit: false }));
    }
  };

  const handleMassSubmit = async (data: RequestData | FormData) => {
    setLoading((prev) => ({ ...prev, submit: true }));
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/requests`,
        {
          method: "POST",
          credentials: "include",
          body: data instanceof FormData ? data : JSON.stringify(data),
          headers:
            data instanceof FormData
              ? {}
              : { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) {
        throw new Error("Error al crear los descuentos masivos");
      }
      toast.success("Descuento registrado con éxito");
    } catch (error) {
      toast.error("Error al procesar el descuento");
      console.error("Error al procesar el descuento:", error);
    } finally {
      setLoading((prev) => ({ ...prev, submit: false }));
    }
  };

  return (
    <div className="container pb-8 space-y-8">
      {/* Sección de Excel */}
      <motion.div
        key="excel-upload"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <ExcelUploadSection
          onFileUpload={handleExcelUpload}
          onDownloadTemplate={handleDownloadTemplate}
          isUploading={loading.submit}
          isDownloading={isDownloading}
        />
      </motion.div>

      {/* Sección de Formularios */}
      <motion.div
        key="form-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="mt-8"
      >
        <Tabs
          defaultValue="normal"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <div className="space-y-1 mb-4 sm:mb-0">
              <h2 className="text-2xl font-bold tracking-tight">
                Registrar Descuentos
              </h2>
              <p className="text-sm text-slate-500">
                Selecciona el tipo de descuento que deseas registrar
              </p>
            </div>
            <TabsList className="bg-slate-100 p-1">
              <TabsTrigger
                value="normal"
                className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
              >
                Individual
              </TabsTrigger>
              <TabsTrigger
                value="masivo"
                className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
              >
                Masivo
              </TabsTrigger>
            </TabsList>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === "normal" && (
              <motion.div
                key="normal-form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <NormalDiscountForm
                  options={options}
                  loading={loading}
                  onSubmit={handleNormalSubmit}
                />
              </motion.div>
            )}

            {activeTab === "masivo" && (
              <motion.div
                key="mass-form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <MassDiscountForm
                  options={options}
                  loading={loading}
                  onSubmit={handleMassSubmit}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </Tabs>
      </motion.div>

      {/* Feedback global */}
      <div
        className="fixed bottom-0 right-0 p-6 pointer-events-none"
        aria-live="polite"
        aria-atomic="true"
      >
        <AnimatePresence />
      </div>
    </div>
  );
};

export default DescuentosForm;
