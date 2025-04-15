import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { LoadingState, OptionsState } from "@/utils/types";
import { getAuthToken } from "@/services/auth.service";
import { useAuth } from "@/hooks/useAuth";
import NormalDiscountForm from "./NormalDiscountForm";
import ExcelUploadSection from "./ExcelUploadSection";

const IngresosForm = () => {
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

  const auth = useAuth();

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading((prev) => ({
        ...prev,
        projects: true,
        areas: true,
        accounts: true,
      }));

      const assignedProjectIds = auth.hasProjects();

      try {
        const [projectsRes, areasRes, accountsRes] = await Promise.all([
          fetch(
            `${
              process.env.NEXT_PUBLIC_API_URL
            }/projects?projects=${assignedProjectIds.join(",")}`,
            {
              headers: { Authorization: `Bearer ${getAuthToken()}` },
              credentials: "include",
            }
          ),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/areas`, {
            headers: {
              Authorization: `Bearer ${getAuthToken()}`,
            },
            credentials: "include",
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/accounts`, {
            headers: {
              Authorization: `Bearer ${getAuthToken()}`,
            },
            credentials: "include",
          }),
        ]);

        if (!projectsRes.ok || !areasRes.ok || !accountsRes.ok) {
          throw new Error("Error al cargar datos iniciales");
        }

        const [projectsData, areasData, accountsData] = await Promise.all([
          projectsRes.json(),
          areasRes.json(),
          accountsRes.json(),
        ]);

        setOptions((prev) => ({
          ...prev,
          accounts: accountsData.data.map(
            (acc: { name: string; id: string }) => ({
              label: acc.name,
              value: acc.name, // o acc.id, si es lo que usas
            })
          ),
          projects: projectsData.map((proj: { name: string; id: string }) => ({
            label: proj.name,
            value: proj.id,
          })),
          areas: areasData.map((area: { name: string; id: string }) => ({
            label: area.name,
            value: area.id,
          })),
        }));
      } catch (error) {
        toast.error("Error al cargar datos iniciales");
        console.error(error);
      } finally {
        setLoading((prev) => ({
          ...prev,
          projects: false,
          areas: false,
          accounts: false,
        }));
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
        throw new Error(data.message || "Error al crear el ingreso");
      }

      toast.success("Ingreso registrado con éxito");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al procesar el ingreso"
      );
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
        <ExcelUploadSection context="income" />
      </motion.div>

      {/* Sección del Formulario */}
      <motion.div
        key="form-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="mt-8"
      >
        <div className="w-full">
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <NormalDiscountForm
                options={options}
                loading={loading}
                onSubmit={handleNormalSubmit}
                type="income"
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default IngresosForm;
