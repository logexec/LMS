/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { LoadingState, OptionsState, RequestData } from "@/utils/types";
import NormalDiscountForm from "./NormalDiscountForm";
import MassDiscountForm from "./MassDiscountForm";
import ExcelUploadSection from "./ExcelUploadSection";
import { getAuthToken } from "@/services/auth.service";
import { useAuth } from "@/hooks/useAuth";

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

  const [activeTab, setActiveTab] = useState("normal");
  const auth = useAuth();

  // Fetch inicial de datos
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading((prev) => ({ ...prev, projects: true, areas: true }));
      const assignedProjectIds = auth.hasProjects();

      try {
        const [projectsRes, areasRes] = await Promise.all([
          fetch(
            `${
              process.env.NEXT_PUBLIC_API_URL
            }/projects?projects=${assignedProjectIds.join(",")}`,
            {
              headers: { Authorization: `Bearer ${getAuthToken()}` },
              credentials: "include",
            }
          ),
          fetch(
            `${
              process.env.NEXT_PUBLIC_API_URL
            }/areas?projects=${assignedProjectIds.join(",")}`,
            {
              headers: { Authorization: `Bearer ${getAuthToken()}` },
              credentials: "include",
            }
          ),
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
    toast.warning("Registrando descuentos...");
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
        <ExcelUploadSection context="discounts" />
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
