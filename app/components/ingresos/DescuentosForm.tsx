/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { LoadingState, OptionsState, RequestData } from "@/utils/types";
import NormalDiscountForm from "./NormalDiscountForm";
import MassDiscountForm from "./MassDiscountForm";
import LoanForm from "./LoanForm";
import ExcelUploadSection from "./ExcelUploadSection";
import { fetchWithAuth, fetchWithAuthFormData } from "@/services/auth.service";
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
      setLoading((prev) => ({
        ...prev,
        projects: true,
        areas: true,
        accounts: true,
        responsibles: true,
        transports: true,
      }));
      const assignedProjectIds = auth.hasProjects();

      try {
        const [
          projectsRes,
          areasRes,
          accountsRes,
          responsiblesRes,
          transportsRes,
        ] = await Promise.all([
          fetchWithAuth(`/projects?projects=${assignedProjectIds.join(",")}`),
          fetchWithAuth(`/areas?projects=${assignedProjectIds.join(",")}`),
          fetchWithAuth(`/accounts`),
          fetchWithAuth(`/responsibles?fields=id,nombre_completo`),
          fetchWithAuth(`/vehicles`),
        ]);

        if (!projectsRes.ok) throw new Error("Error al cargar proyectos");
        if (!areasRes.ok) throw new Error("Error al cargar áreas");
        if (!accountsRes.ok) throw new Error("Error al cargar cuentas");
        if (!responsiblesRes.ok)
          throw new Error("Error al cargar responsables");
        if (!transportsRes.ok) throw new Error("Error al cargar vehículos");

        // Convertir respuestas a arreglos con tipado explícito
        const projectsData: { name: string; id: string }[] = Object.values(
          projectsRes
        ).filter(
          (item): item is { name: string; id: string } =>
            typeof item === "object" &&
            item !== null &&
            "name" in item &&
            "id" in item
        );
        const areasData: { name: string; id: string }[] = Object.values(
          areasRes
        ).filter(
          (item): item is { name: string; id: string } =>
            typeof item === "object" &&
            item !== null &&
            "name" in item &&
            "id" in item
        );
        const accountsData: { name: string; id: string }[] =
          accountsRes.data || [];
        const responsiblesData: { nombre_completo: string; id: string }[] =
          Object.values(responsiblesRes).filter(
            (item): item is { nombre_completo: string; id: string } =>
              typeof item === "object" &&
              item !== null &&
              "nombre_completo" in item &&
              "id" in item
          );
        const transportsData: { name: string; id: string }[] = Object.values(
          transportsRes
        ).filter(
          (item): item is { name: string; id: string } =>
            typeof item === "object" &&
            item !== null &&
            "name" in item &&
            "id" in item
        );

        setOptions((prev) => ({
          ...prev,
          projects: projectsData.map((project) => ({
            label: project.name,
            value: project.name,
          })),
          areas: areasData.map((area) => ({
            label: area.name,
            value: area.name,
          })),
          accounts: accountsData.map((account) => ({
            label: account.name,
            value: account.id,
          })),
          responsibles: responsiblesData.map((resp) => ({
            label: resp.nombre_completo,
            value: resp.id,
          })),
          transports: transportsData.map((vehicle) => ({
            label: vehicle.name,
            value: vehicle.name,
          })),
        }));
      } catch (error) {
        toast.error("Error al cargar datos iniciales");
        console.error("Error al cargar datos iniciales:", error);
      } finally {
        setLoading((prev) => ({
          ...prev,
          projects: false,
          areas: false,
          accounts: false,
          responsibles: false,
          transports: false,
        }));
      }
    };

    fetchInitialData();
  }, []);

  const handleNormalSubmit = async (formData: FormData) => {
    setLoading((prev) => ({ ...prev, submit: true }));
    try {
      const response = await fetchWithAuthFormData(`/requests`, {
        method: "POST",
        body: formData,
      });

      if (response.status === 201) {
        toast.success("Descuento registrado exitosamente");
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
      const response = await fetchWithAuthFormData(`/requests`, {
        method: "POST",
        body: data instanceof FormData ? data : JSON.stringify(data),
        headers:
          data instanceof FormData
            ? {}
            : { "Content-Type": "application/json" },
      });
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
                Registrar Descuentos y Préstamos
              </h2>
              <p className="text-sm text-slate-500">
                Selecciona el tipo de operación que deseas registrar
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
              <TabsTrigger
                value="loans"
                className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
              >
                Préstamos
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
                  type="discount"
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

            {activeTab === "loans" && (
              <motion.div
                key="loan-form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <LoanForm options={options} loading={loading} />
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
