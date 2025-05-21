/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import * as XLSX from "xlsx";
import axios from "axios";
import { getAuthToken } from "@/services/auth.service";

// Define tipos para los datos basados en las cabeceras del PREBAM Excel
export type ExcelRow = {
  // Datos que vienen precargados desde COMPRAS.xlsx
  proveedor: string;
  proveedor_ruc: string;
  compra: string;
  fecha: string;
  aut_factura: string;
  precio: number;

  // Datos que ingresa el usuario en PREBAM
  mes: string;
  proyecto: string;
  centro_costo: string;
  notas: string;
  observacion: string;

  // Datos que vienen desde la API
  contabilizado: string;
  serie_factura: string;
  proveedor_latinium: string;

  // IDs para los comboboxes
  proyecto_id?: number;
  centro_costo_id?: number;
  proveedor_id?: number;
};

// Tipos para los datos de los comboboxes
type Provider = {
  id: number;
  name: string;
};

type Project = {
  id: number;
  name: string;
};

type CentroCosto = {
  id: number;
  name: string;
};

// Estado de la app
interface SriState {
  currentStep: number;
  excelFile: File | null;
  excelData: ExcelRow[];
  isLoading: boolean;
  error: string | null;
  fetchingData: boolean;
  // Datos para comboboxes
  providers: Provider[];
  projects: Project[];
  centrosCosto: CentroCosto[];
  // Opciones de paginación
  rowsPerPage: number;
}

// Acciones
interface SriActions {
  setStep: (step: number) => void;
  setExcelFile: (file: File | null) => void;
  parseExcelFile: (file: File) => Promise<void>;
  updateRow: (index: number, updatedRow: Partial<ExcelRow>) => void;
  fetchProjects: () => Promise<void>;
  fetchProviders: () => Promise<void>;
  setRowsPerPage: (rows: number) => void;
}

// Contexto
const SriContext = createContext<
  | {
      state: SriState;
      actions: SriActions;
    }
  | undefined
>(undefined);

// Provider
export function SriProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SriState>({
    currentStep: 1,
    excelFile: null,
    excelData: [],
    isLoading: false,
    error: null,
    fetchingData: false,
    // Datos iniciales para comboboxes
    providers: [],
    projects: [],
    centrosCosto: [
      { id: 1, name: "Centro de Costo 1" },
      { id: 2, name: "Centro de Costo 2" },
      { id: 3, name: "Centro de Costo 3" },
    ],
    rowsPerPage: 10,
  });

  // Configurar axios con token
  const getAxiosConfig = () => {
    const token = getAuthToken();
    return {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      withCredentials: true,
    };
  };

  // Función para obtener proyectos usando Axios
  const fetchProjects = async () => {
    setState((prev) => ({ ...prev, fetchingData: true }));
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/projects`,
        getAxiosConfig()
      );

      setState((prev) => ({
        ...prev,
        projects: response.data,
        fetchingData: false,
      }));
    } catch (error) {
      console.error("Error al cargar proyectos:", error);
      setState((prev) => ({
        ...prev,
        error: "Error al cargar proyectos. Por favor intente de nuevo.",
        fetchingData: false,
      }));
    }
  };

  // Función para obtener proveedores usando Axios
  const fetchProviders = async () => {
    setState((prev) => ({ ...prev, fetchingData: true }));
    try {
      // Por ahora usamos la misma ruta como dummy
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/projects`,
        getAxiosConfig()
      );

      // Simulamos que son proveedores con los mismos datos
      const providers = response.data.map((p: any) => ({
        id: p.id,
        name: `Proveedor ${p.name}`,
      }));

      setState((prev) => ({
        ...prev,
        providers,
        fetchingData: false,
      }));
    } catch (error) {
      console.error("Error al cargar proveedores:", error);
      setState((prev) => ({
        ...prev,
        error: "Error al cargar proveedores. Por favor intente de nuevo.",
        fetchingData: false,
      }));
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    fetchProjects();
    fetchProviders();
  }, []);

  // Acciones
  const actions: SriActions = {
    setStep: (step) => {
      setState((prev) => ({ ...prev, currentStep: step }));
    },

    setExcelFile: (file) => {
      setState((prev) => ({ ...prev, excelFile: file }));
    },

    parseExcelFile: async (file) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        console.log("Procesando archivo Excel:", file.name);
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data);

        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Mostrar información sobre el estado del parsing para debugging
        console.log("Hojas en el Excel:", workbook.SheetNames);

        // Convertir a JSON con opciones avanzadas
        const rawData = XLSX.utils.sheet_to_json(worksheet, {
          header: 1, // Usar la primera fila como encabezados
          raw: true, // Obtener celdas sin formato
          defval: "", // Valor predeterminado para celdas vacías
          blankrows: false, // Ignorar filas vacías
        });

        console.log("Datos crudos del Excel:", rawData.slice(0, 3));

        // Si no hay datos o menos de 2 filas (encabezados + al menos 1 fila de datos)
        if (!rawData || rawData.length < 2) {
          throw new Error("El archivo Excel no contiene suficientes datos");
        }

        // Extraer los encabezados (primera fila) y convertirlos a strings
        const headers = (rawData[0] as any[]).map((h) =>
          String(h || "").trim()
        );
        console.log("Encabezados detectados:", headers);

        // Mapeo directo basado en índices para mayor fiabilidad
        // Asumimos que las columnas están en este orden en el Excel de Compras:
        // MES, PROVEEDOR: RUC, Compra, Fecha, Aut. Factura, Precio Proyecto, ...

        // Procesar todas las filas de datos (excepto encabezados)
        const formattedData: ExcelRow[] = [];

        for (let i = 1; i < rawData.length; i++) {
          const row = rawData[i] as any[];

          // Verificar si la fila tiene datos significativos
          if (row.length === 0 || row.every((cell) => !cell)) {
            continue; // Saltar filas vacías
          }

          // Extraer valores directamente por posición
          const newRow: ExcelRow = {
            compra: String(row[5] || "").trim(),
            proveedor: String(row[1] || "").trim(),
            proveedor_ruc: String(row[4] || "").trim(),
            fecha: new Date(row[12]).toDateString(),
            aut_factura: String(row[13] || "").trim(),
            precio:
              typeof row[81] === "number"
                ? row[81]
                : parseFloat(String(row[81] || "0")),

            // Campos que completa el usuario (inicializados vacíos)
            mes: "",
            proyecto: "",
            centro_costo: "",
            notas: "",
            observacion: "",

            // Datos de la API (inicializados vacíos)
            contabilizado: "",
            serie_factura: "",
            proveedor_latinium: "",
          };

          formattedData.push(newRow);
        }

        console.log("Datos formateados:", formattedData.slice(0, 3));

        setState((prev) => ({
          ...prev,
          excelData: formattedData,
          isLoading: false,
          currentStep: 2, // Avanzar automáticamente al siguiente paso
        }));
      } catch (error) {
        console.error("Error parsing Excel file:", error);
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error:
            "Error al procesar el archivo Excel. Verifique que el formato sea correcto.",
        }));
      }
    },

    updateRow: (index, updatedRow) => {
      setState((prev) => {
        const newData = [...prev.excelData];
        newData[index] = { ...newData[index], ...updatedRow };
        return { ...prev, excelData: newData };
      });
    },

    // Exportamos las funciones de fetch para poder llamarlas desde los componentes
    fetchProjects,
    fetchProviders,

    // Función para ajustar el número de filas por página
    setRowsPerPage: (rows) => {
      setState((prev) => ({ ...prev, rowsPerPage: rows }));
    },
  };

  return (
    <SriContext.Provider value={{ state, actions }}>
      {children}
    </SriContext.Provider>
  );
}

// Hook para usar el contexto
export function useSri() {
  const context = useContext(SriContext);
  if (context === undefined) {
    throw new Error("useSri must be used within a SriProvider");
  }
  return context;
}
