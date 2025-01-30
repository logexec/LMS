import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { LoadingState, OptionsState, RequestData } from "@/utils/types";
import NormalDiscountForm from "./NormalDiscountForm";
import MassDiscountForm from "./MassDiscountForm";
import ExcelUploadSection from "./ExcelUploadSection";

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
            credentials: "include",
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/areas`, {
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
          projects: projectsData.map((project: any) => ({
            label: project.name,
            value: project.name,
          })),
          areas: areasData.map((area: any) => ({
            label: area.name,
            value: area.id,
          })),
        }));
      } catch (error) {
        toast.error("Error al cargar datos iniciales");
      } finally {
        setLoading((prev) => ({ ...prev, projects: false, areas: false }));
      }
    };

    fetchInitialData();
  }, []);

  const handleExcelUpload = async (file: File) => {
    setLoading((prev) => ({ ...prev, submit: true }));
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/upload-discounts`,
        {
          method: "POST",
          body: formData,
          credentials: "include",
        }
      );

      if (!response.ok) throw new Error("Error al procesar el archivo");

      toast.success("Archivo procesado correctamente");
    } catch (error) {
      toast.error("Error al procesar el archivo");
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
        `${process.env.NEXT_PUBLIC_API_URL}/massive-requests`,
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

      toast.success("Descuentos masivos registrados con éxito");
    } catch (error) {
      toast.error("Error al procesar los descuentos masivos");
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
