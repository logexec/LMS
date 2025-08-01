/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { LoadingState, RequestData } from "@/utils/types";
import NormalDiscountForm from "./NormalDiscountForm";
import MassDiscountForm from "./MassDiscountForm";
import LoanForm from "./LoanForm";
import ExcelUploadSection from "./ExcelUploadSection";
import { createRequestHelper } from "@/services/axios";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/hooks/useAuth";

// Tipo para los datos de lote
interface BatchRequestData {
  type: string;
  personnel_type: string;
  request_date: string;
  invoice_number: string;
  account_id: string;
  amount: number;  // <- NÚMERO, no string
  project: string;
  note: string;
  responsible_id?: string;
  vehicle_plate?: string;
  vehicle_number?: string;
}

// Tipo unión actualizado
type MassSubmitData =
  | BatchRequestData[]        // Array de datos batch
  | BatchRequestData          // Objeto batch individual
  | RequestData[]             // Array de datos legacy (con amount string)
  | RequestData               // Objeto legacy individual
  | FormData;                 // FormData tradicional

// Función para convertir RequestData a BatchRequestData
const convertToBatchRequestData = (data: RequestData): BatchRequestData => {
  return {
    type: data.type,
    personnel_type: data.personnel_type,
    request_date: data.request_date,
    invoice_number: data.invoice_number,
    account_id: data.account_id,
    amount: typeof data.amount === "string" ? parseFloat(data.amount) : data.amount,
    project: data.project,
    note: data.note,
    responsible_id: data.responsible_id,
  };
};

// Función validateAndConvertData actualizada
const validateAndConvertData = (data: any): BatchRequestData => {
  // Convertir amount a número si es string
  if (typeof data.amount === "string") {
    const numAmount = parseFloat(data.amount);
    if (isNaN(numAmount)) {
      throw new Error(`Valor de amount inválido: ${data.amount}`);
    }
    data.amount = numAmount;
  }

  // Asegurar que amount sea un número con máximo 2 decimales
  if (typeof data.amount === "number") {
    data.amount = Number(data.amount.toFixed(2));
  }

  // Validar campos requeridos
  const requiredFields = [
    "type",
    "personnel_type", 
    "request_date",
    "invoice_number",
    "account_id",
    "amount",
    "project",
    "note",
  ];

  const missingFields = requiredFields.filter((field) => {
    const value = data[field];
    return value === undefined || value === null || value === "";
  });

  if (missingFields.length > 0) {
    throw new Error(`Campos faltantes: ${missingFields.join(", ")}`);
  }

  // Validar tipos específicos
  if (typeof data.amount !== "number" || data.amount <= 0) {
    throw new Error(`Amount debe ser un número positivo: ${data.amount}`);
  }

  if (!["expense", "discount", "income"].includes(data.type)) {
    throw new Error(`Tipo inválido: ${data.type}`);
  }

  if (!["nomina", "transportista"].includes(data.personnel_type)) {
    throw new Error(`Tipo de personal inválido: ${data.personnel_type}`);
  }

  // Validar fecha
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(data.request_date)) {
    throw new Error(`Formato de fecha inválido: ${data.request_date}`);
  }

  return data as BatchRequestData;
};

const DescuentosForm = () => {
  const [loading, setLoading] = useState<LoadingState>({
    submit: false,
    projects: false,
    responsibles: false,
    transports: false,
    accounts: false,
    areas: false,
  });

  // Usar el contexto de datos global
  const { options } = useData();
  const [activeTab, setActiveTab] = useState("normal");

  // Estado para progreso de lotes
  const [batchProgress, setBatchProgress] = useState<{
    current: number;
    total: number;
    percentage: number;
  } | null>(null);

  const handleNormalSubmit = async (formData: FormData) => {
    setLoading((prev) => ({ ...prev, submit: true }));
    try {
      const response = await createRequestHelper.individual(formData);
      // toast.success("Registro ingresado exitosamente");
      return response;
    } catch (error: any) {
      console.error("Error en envío individual:", error);
      toast.error("Error al procesar el descuento");
      throw error;
    } finally {
      setLoading((prev) => ({ ...prev, submit: false }));
    }
  };

  // Función handleMassSubmit corregida para batch submit
const handleMassSubmit = async (data: MassSubmitData): Promise<void> => {
  setLoading((prev) => ({ ...prev, submit: true }));
  setBatchProgress({ current: 0, total: 0, percentage: 0 });

  const progressToastId = toast.loading("Registrando descuentos...");

  try {
    let batchData: BatchRequestData[];

    // Procesar datos según el tipo de entrada
    if (data instanceof FormData) {
      const batchDataString = data.get('batch_data') as string;
      
      if (batchDataString) {
        const parsedBatchData = JSON.parse(batchDataString);
        const rawBatchData = Array.isArray(parsedBatchData) ? parsedBatchData : [parsedBatchData];
        
        // CORREGIDO: Validar y convertir cada elemento
        batchData = rawBatchData.map((item, index) => {
          try {
            return validateAndConvertData(item);
          } catch (error) {
            throw new Error(
              `Error en elemento ${index + 1}: ${
                error instanceof Error ? error.message : "Error desconocido"
              }`
            );
          }
        });
      } else {
        const formDataObj = Object.fromEntries(data.entries());
        const cleanedData: any = {};
        Object.entries(formDataObj).forEach(([key, value]) => {
          if (value !== "" && value !== null && value !== undefined) {
            cleanedData[key] = value;
          }
        });
        batchData = [validateAndConvertData(cleanedData)];
      }
    } else if (Array.isArray(data)) {
      // CORREGIDO: Validar y convertir array de datos
      batchData = data.map((item, index) => {
        try {
          // Si es RequestData (con amount string), convertir a BatchRequestData
          if ('amount' in item && typeof item.amount === 'string') {
            return validateAndConvertData(convertToBatchRequestData(item as RequestData));
          } else {
            return validateAndConvertData(item);
          }
        } catch (error) {
          throw new Error(
            `Error en elemento ${index + 1}: ${
              error instanceof Error ? error.message : "Error desconocido"
            }`
          );
        }
      });
    } else {
      // CORREGIDO: Validar y convertir objeto individual
      try {
        if ('amount' in data && typeof data.amount === 'string') {
          batchData = [validateAndConvertData(convertToBatchRequestData(data as RequestData))];
        } else {
          batchData = [validateAndConvertData(data as any)];
        }
      } catch (error) {
        throw new Error(
          `Error en datos: ${
            error instanceof Error ? error.message : "Error desconocido"
          }`
        );
      }
    }

    if (!batchData || batchData.length === 0) {
      throw new Error("No hay datos para procesar en el lote");
    }

    console.log(`Procesando batch de ${batchData.length} registros`);

    // Decidir entre batch normal o chunked según el tamaño
    let response;
    if (batchData.length <= 500) {
      // Usar batch normal para lotes pequeños-medianos
      response = await createRequestHelper.createBatchRequests(
        batchData,
        (progress: {
          current: number;
          total: number;
          percentage: number;
        }) => {
          setBatchProgress({
            current: progress.current,
            total: progress.total,
            percentage: progress.percentage,
          });
        }
      );
    } else {
      // Usar batch chunked para lotes grandes
      response = await createRequestHelper.createBatchRequestsChunked(
        batchData,
        200, // Tamaño de chunk
        (progress: {
          current: number;
          total: number;
          percentage: number;
          chunk: number;
          totalChunks: number;
        }) => {
          setBatchProgress({
            current: progress.current,
            total: progress.total,
            percentage: progress.percentage,
          });
          
          // Actualizar el toast con información del chunk
          toast.loading(
            `Procesando chunk ${progress.chunk}/${progress.totalChunks} (${progress.percentage}%)`,
            { id: progressToastId }
          );
        }
      );
    }

    toast.dismiss(progressToastId);
    
    // Mostrar resultado según el tipo de respuesta
    if (response.chunks) {
      toast.success(`${response.total_items} registros creados en ${response.chunks} chunks`);
    } else if (response.summary) {
      toast.success(
        `${response.summary.success} registros creados exitosamente${
          response.summary.errors > 0 ? `, ${response.summary.errors} errores` : ''
        }`
      );
    } else {
      toast.success(`${batchData.length} registros creados exitosamente`);
    }

  } catch (error: any) {
    console.error("Error en envío masivo:", error);
    toast.dismiss(progressToastId);
    
    const errorMessage = error?.message || "Error al registrar los descuentos";
    toast.error(errorMessage);
    
    throw error;
  } finally {
    setLoading((prev) => ({ ...prev, submit: false }));
    setBatchProgress(null);
  }
};

// Función validateAndConvertData actualizada
const validateAndConvertData = (data: any): BatchRequestData => {
  // Convertir amount a número si es string
  if (typeof data.amount === "string") {
    const numAmount = parseFloat(data.amount);
    if (isNaN(numAmount)) {
      throw new Error(`Valor de amount inválido: ${data.amount}`);
    }
    data.amount = numAmount;
  }

  // Asegurar que amount sea un número con máximo 2 decimales
  if (typeof data.amount === "number") {
    data.amount = Number(data.amount.toFixed(2));
  }

  // Validar campos requeridos
  const requiredFields = [
    "type",
    "personnel_type", 
    "request_date",
    "invoice_number",
    "account_id",
    "amount",
    "project",
    "note",
  ];

  const missingFields = requiredFields.filter((field) => {
    const value = data[field];
    return value === undefined || value === null || value === "";
  });

  if (missingFields.length > 0) {
    throw new Error(`Campos faltantes: ${missingFields.join(", ")}`);
  }

  // Validar tipos específicos
  if (typeof data.amount !== "number" || data.amount <= 0) {
    throw new Error(`Amount debe ser un número positivo: ${data.amount}`);
  }

  if (!["expense", "discount", "income"].includes(data.type)) {
    throw new Error(`Tipo inválido: ${data.type}`);
  }

  if (!["nomina", "transportista"].includes(data.personnel_type)) {
    throw new Error(`Tipo de personal inválido: ${data.personnel_type}`);
  }

  // Validar fecha
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(data.request_date)) {
    throw new Error(`Formato de fecha inválido: ${data.request_date}`);
  }

  return data as BatchRequestData;
};

  // Variantes de animación para una transición más fluida
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        duration: 0.4,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  };

  const tabContentVariants: Variants = {
    initial: { opacity: 0, x: -10 },
    animate: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3, ease: "easeOut" },
    },
    exit: { opacity: 0, x: 10, transition: { duration: 0.2 } },
  };

  const currentUser = useAuth();

  return (
    <div className="container pb-8 max-w-(--breakpoint-2xl) mx-auto px-4 sm:px-6">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="space-y-8"
      >
        {/* Sección de Excel */}
        <motion.div
          key="excel-upload"
          variants={itemVariants}
          className="rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-shadow duration-300"
        >
          <ExcelUploadSection context="discounts" />
        </motion.div>

        {/* Sección de Formularios */}
        <motion.div
          key="form-section"
          variants={itemVariants}
          className="mt-8 bg-linear-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 rounded-xl shadow-xs border border-slate-100 dark:border-slate-800"
        >
          <Tabs
            defaultValue="normal"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 border-b border-slate-100 dark:border-slate-800">
              <div className="space-y-1 mb-4 sm:mb-0">
                <h2 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-linear-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300">
                  Registrar Descuentos y Préstamos
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Selecciona el tipo de operación que deseas registrar
                </p>
              </div>
              <TabsList className="bg-slate-100/80 dark:bg-slate-800/80 backdrop-blur-xs p-1 rounded-lg border border-slate-200 dark:border-slate-700">
                <TabsTrigger
                  value="normal"
                  className="rounded-md text-sm font-medium data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:shadow-xs data-[state=active]:text-slate-600 dark:data-[state=active]:text-red-400 transition-all duration-200"
                >
                  Individual
                </TabsTrigger>
                <TabsTrigger
                  value="masivo"
                  className="rounded-md text-sm font-medium data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:shadow-xs data-[state=active]:text-slate-600 dark:data-[state=active]:text-red-400 transition-all duration-200"
                >
                  Masivo
                </TabsTrigger>
                {
                  // Solo se muestra la pestaña a los usuarios autorizados
                  (currentUser.user?.email === "nicolas.iza@logex.ec" ||
                    currentUser.user?.email === "ricardo.estrella@logex.ec" ||
                    currentUser.user?.email === "michelle.quintana@logex.ec" ||
                    currentUser.user?.email === "diego.merisalde@logex.ec" ||
                    currentUser.user?.email === "luis.espinosa@logex.ec" ||
                    currentUser.user?.email === "lorena.herrera@logex.ec" ||
                    currentUser.user?.email === "claudia.pereira@logex.ec" ||
                    currentUser.user?.email === "jk@logex.ec") && (
                    <TabsTrigger
                      value="loans"
                      className="rounded-md text-sm font-medium data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:shadow-xs data-[state=active]:text-slate-600 dark:data-[state=active]:text-red-400 transition-all duration-200"
                    >
                      Préstamos
                    </TabsTrigger>
                  )
                }
              </TabsList>
            </div>

            <div className="p-6">
              <AnimatePresence mode="wait">
                {activeTab === "normal" && (
                  <motion.div
                    key="normal-form"
                    variants={tabContentVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
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
                    variants={tabContentVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
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
                    variants={tabContentVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  >
                    <LoanForm options={options} loading={loading} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Tabs>
        </motion.div>
      </motion.div>

      {/* Feedback global */}
      <div
        className="fixed bottom-6 right-6 p-6 pointer-events-none z-50"
        aria-live="polite"
        aria-atomic="true"
      >
        <AnimatePresence />
      </div>
    </div>
  );
};

export default DescuentosForm;
