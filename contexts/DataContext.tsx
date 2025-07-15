/* eslint-disable react-hooks/exhaustive-deps */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useRef,
  useCallback,
} from "react";
import { fetchWithAuth, getAuthToken } from "@/services/auth.service";
import { toast } from "sonner";
import { OptionsState, Option } from "@/utils/types";
import apiService from "@/services/api.service";
import { useAuth } from "@/hooks/useAuth";

// Definir el tipo para el estado del contexto
interface DataContextType {
  options: OptionsState;
  loading: {
    projects: boolean;
    areas: boolean;
    accounts: boolean;
    responsibles: boolean;
    transports: boolean;
  };
  fetchResponsibles: (proyecto: string) => Promise<void>;
  fetchAccounts: (tipo: string, action?: string) => Promise<void>;
  fetchTransports: () => Promise<void>;
}

// Crear el contexto
const DataContext = createContext<DataContextType | undefined>(undefined);

// Proveedor del contexto
export const DataProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  console.log("Renderizando DataProvider");

  const auth = useAuth();

  // Estado global de opciones
  const [options, setOptions] = useState<OptionsState>({
    projects: [],
    responsibles: [],
    transports: [],
    accounts: [],
    areas: [],
  });

  // Estado global de carga
  const [loading, setLoading] = useState({
    projects: false,
    areas: false,
    accounts: false,
    responsibles: false,
    transports: false,
  });

  // Referencias para controlar el estado de carga y evitar ciclos
  const loadingRef = useRef({
    hasStartedLoading: false,
    hasFinishedLoading: false,
    projectsLoading: false,
    areasLoading: false,
  });

  // Cache para evitar peticiones repetidas
  const responsiblesCache = useRef(new Map<string, Option[]>());
  const accountsCache = useRef(new Map<string, Option[]>());

  // Carga inicial de datos - solo se ejecuta una vez
  useEffect(() => {
    // Función IIFE para cargar datos solo una vez
    (async function loadDataOnce() {
      // Si ya hemos iniciado la carga, no hacer nada
      if (loadingRef.current.hasStartedLoading) {
        return;
      }

      // Marcar que estamos iniciando la carga
      loadingRef.current.hasStartedLoading = true;

      try {
        // Marcar estados de carga
        loadingRef.current.projectsLoading = true;
        loadingRef.current.areasLoading = true;

        // Actualizar UI para mostrar estados de carga
        setLoading((prev) => ({
          ...prev,
          projects: true,
          areas: true,
        }));

        console.log("🚨 INICIO DE CARGA ÚNICA - NO DEBERÍA REPETIRSE");

        const assignedProjectIds = auth.hasProjects();

        const [projectsRes, areasRes] = await Promise.all([
          fetchWithAuth(`/projects?projects=${assignedProjectIds.join(",")}`),
          fetchWithAuth(`/areas?projects=${assignedProjectIds.join(",")}`),
        ]);

        // Procesar los datos
        if (!projectsRes.ok) throw new Error("Error al cargar proyectos");
        if (!areasRes.ok) throw new Error("Error al cargar áreas");

        const projectsData = Object.values(projectsRes).filter(
          (item): item is { name: string; id: string } =>
            typeof item === "object" &&
            item !== null &&
            "name" in item &&
            "id" in item
        );

        const areasData = Object.values(areasRes).filter(
          (item): item is { name: string; id: string } =>
            typeof item === "object" &&
            item !== null &&
            "name" in item &&
            "id" in item
        );

        // Actualizar estado SOLO UNA VEZ, después de que todo esté listo
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
        }));

        console.log("✅ CARGA COMPLETA");
      } catch (error) {
        console.error("Error al cargar datos:", error);
        toast.error("Error al cargar datos iniciales");
      } finally {
        // Marcar que terminamos de cargar
        loadingRef.current.hasFinishedLoading = true;
        loadingRef.current.projectsLoading = false;
        loadingRef.current.areasLoading = false;

        // Una última actualización del estado loading
        setLoading((prev) => ({
          ...prev,
          projects: false,
          areas: false,
        }));
      }
    })(); // Ejecuta inmediatamente la función asíncrona

    // Sin dependencias, para que solo se ejecute una vez durante el montaje
  }, []);

  // Función para obtener responsables según el proyecto (con caché)
  const fetchResponsibles = useCallback(async (proyecto: string) => {
    if (!proyecto) return;

    // Verificar si ya tenemos esta información en caché
    if (responsiblesCache.current.has(proyecto)) {
      setOptions((prev) => ({
        ...prev,
        responsibles: responsiblesCache.current.get(proyecto) || [],
      }));
      return;
    }

    setLoading((prev) => ({ ...prev, responsibles: true }));

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/responsibles?proyecto=${proyecto}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getAuthToken()}`,
          },
          credentials: "include",
        }
      );

      if (!response.ok) throw new Error("Error al cargar responsables");

      const data = await response.json();
      const responsiblesData = data.map(
        (responsible: { nombre_completo: string; id: string }) => ({
          label: responsible.nombre_completo,
          value: responsible.nombre_completo,
        })
      );

      // Almacenar en caché
      responsiblesCache.current.set(proyecto, responsiblesData);

      // Actualizar estado
      setOptions((prev) => ({
        ...prev,
        responsibles: responsiblesData,
      }));
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al cargar responsables"
      );
    } finally {
      setLoading((prev) => ({ ...prev, responsibles: false }));
    }
  }, []);

  // Función para obtener cuentas (con caché)
  const fetchAccounts = useCallback(
    async (tipo: string, action: string = "expense") => {
      const cacheKey = `${tipo}-${action}`;

      // Verificar si ya tenemos esta información en caché
      if (accountsCache.current.has(cacheKey)) {
        setOptions((prev) => ({
          ...prev,
          accounts: accountsCache.current.get(cacheKey) || [],
        }));
        return;
      }

      setLoading((prev) => ({ ...prev, accounts: true }));

      try {
        const response = await apiService.getAccounts(tipo, action);
        if (!response.ok) throw new Error("Error al cargar las cuentas");

        const data = await response.data;
        const activeAccounts = data.filter(
          (account: { account_status: string }) =>
            account.account_status === "active"
        );

        const accountsData = activeAccounts.map(
          (account: { name: string; id: string }) => ({
            label: account.name,
            value: account.name,
          })
        );

        // Almacenar en caché
        accountsCache.current.set(cacheKey, accountsData);

        // Actualizar estado
        setOptions((prev) => ({
          ...prev,
          accounts: accountsData,
        }));
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Error al cargar las cuentas"
        );
      } finally {
        setLoading((prev) => ({ ...prev, accounts: false }));
      }
    },
    []
  );

  // Función para obtener transportes
  const fetchTransports = useCallback(async () => {
    // Evitamos cargar transportes si ya tenemos datos
    if (options.transports.length > 0) {
      return;
    }

    setLoading((prev) => ({ ...prev, transports: true }));

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/transports`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getAuthToken()}`,
          },
          credentials: "include",
        }
      );

      if (!response.ok) throw new Error("Error al cargar transportes");

      const data = await response.json();

      setOptions((prev) => ({
        ...prev,
        transports: data.map(
          (transport: { name: string; vehicle_plate: string }) => ({
            label: transport.vehicle_plate || transport.name,
            value: transport.vehicle_plate || transport.name,
          })
        ),
      }));
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Error al cargar los transportes"
      );
    } finally {
      setLoading((prev) => ({ ...prev, transports: false }));
    }
  }, [options.transports.length]);

  // Memoiza el contexto para evitar re-renderizados innecesarios
  const contextValue = React.useMemo(
    () => ({
      options,
      loading,
      fetchResponsibles,
      fetchAccounts,
      fetchTransports,
    }),
    [
      options.projects.length,
      options.areas.length,
      options.accounts.length,
      options.responsibles.length,
      options.transports.length,
      loading.projects,
      loading.areas,
      loading.accounts,
      loading.responsibles,
      loading.transports,
      fetchResponsibles,
      fetchAccounts,
      fetchTransports,
    ]
  );

  return (
    <DataContext.Provider value={contextValue}>{children}</DataContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData debe ser usado dentro de un DataProvider");
  }
  return context;
};
