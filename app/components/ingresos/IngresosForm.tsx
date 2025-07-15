import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { LoadingState } from "@/utils/types";
import { useData } from "@/contexts/DataContext";
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

  // Usar el contexto de datos global en lugar de mantener estado local de opciones
  const { options } = useData();

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
