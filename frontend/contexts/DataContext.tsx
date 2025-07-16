/* eslint-disable @typescript-eslint/no-explicit-any */
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useRef,
  useCallback,
} from "react";
import { toast } from "sonner";
import { OptionsState, Option } from "@/utils/types";
import { useAuth } from "@/hooks/useAuth";
import api from "@/services/axios";

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

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { hasProjects } = useAuth();

  const [options, setOptions] = useState<OptionsState>({
    projects: [],
    responsibles: [],
    transports: [],
    accounts: [],
    areas: [],
  });
  const [loading, setLoading] = useState({
    projects: false,
    areas: false,
    accounts: false,
    responsibles: false,
    transports: false,
  });

  const loadingRef = useRef({
    hasStartedLoading: false,
    hasFinishedLoading: false,
  });

  const responsiblesCache = useRef(new Map<string, Option[]>());
  const accountsCache = useRef(new Map<string, Option[]>());

  // Carga inicial de proyectos y áreas
  useEffect(() => {
    if (loadingRef.current.hasStartedLoading) return;
    loadingRef.current.hasStartedLoading = true;
    setLoading((l) => ({ ...l, projects: true, areas: true }));
    (async () => {
      try {
        const ids = hasProjects().join(",");
        const [projRes, areaRes] = await Promise.all([
          api.get<{ id: string; name: string }[]>("/projects", {
            params: { projects: ids },
          }),
          api.get<{ id: string; name: string }[]>("/areas", {
            params: { projects: ids },
          }),
        ]);

        // console.log("Projects: ", projRes.data);
        // console.log("Areas: ", areaRes.data);

        setOptions((o) => ({
          ...o,
          // **Ahora el value es el nombre, no el UUID**
          projects: projRes.data.map((p) => ({
            label: p.name,
            value: p.name,
          })),
          areas: areaRes.data.map((a) => ({
            label: a.name,
            value: a.name, // si las áreas siguen usándose por ID, déjalo así
          })),
        }));
      } catch (e: any) {
        console.error(e);
        toast.error("Error al cargar proyectos o áreas");
      } finally {
        loadingRef.current.hasFinishedLoading = true;
        setLoading((l) => ({ ...l, projects: false, areas: false }));
      }
    })();
  }, [hasProjects]);

  // Responsables por proyecto (con caché)
  const fetchResponsibles = useCallback(async (proyecto: string) => {
    if (!proyecto) return;
    if (responsiblesCache.current.has(proyecto)) {
      setOptions((o) => ({
        ...o,
        responsibles: responsiblesCache.current.get(proyecto)!,
      }));
      return;
    }
    setLoading((l) => ({ ...l, responsibles: true }));
    try {
      const res = await api.get<{ id: string; nombre_completo: string }[]>(
        "/responsibles",
        { params: { proyecto } }
      );
      const opts = res.data.map((r) => ({
        label: r.nombre_completo,
        // **value = nombre_completo, no ID**
        value: r.nombre_completo,
      }));
      responsiblesCache.current.set(proyecto, opts);
      setOptions((o) => ({ ...o, responsibles: opts }));
    } catch (e: any) {
      console.error("Error al cargar responsables: ", e);
      toast.error("Error al cargar responsables");
    } finally {
      setLoading((l) => ({ ...l, responsibles: false }));
    }
  }, []);

  // Cuentas (con caché)
  const fetchAccounts = useCallback(
    async (account_type: string, action: string = "expense") => {
      const key = `${account_type}-${action}`;
      if (accountsCache.current.has(key)) {
        setOptions((o) => ({
          ...o,
          accounts: accountsCache.current.get(key)!,
        }));
        return;
      }
      setLoading((l) => ({ ...l, accounts: true }));
      try {
        const res = await api.get<{
          data: { id: number; name: string; account_status: string }[];
        }>("/accounts", { params: { account_type, action } });
        // Extrae el array real:
        const arr = Array.isArray(res.data) ? res.data : res.data.data;
        const opts = arr
          .filter((a) => a.account_status === "active")
          .map((a) => ({ label: a.name, value: a.name })); // value=name
        accountsCache.current.set(key, opts);
        setOptions((o) => ({ ...o, accounts: opts }));
      } catch (e: any) {
        console.error("Error al cargar cuentas: ", e);
        toast.error("Error al cargar cuentas");
      } finally {
        setLoading((l) => ({ ...l, accounts: false }));
      }
    },
    []
  );

  // Transportes
  const fetchTransports = useCallback(async () => {
    if (options.transports.length > 0) return;
    setLoading((l) => ({ ...l, transports: true }));
    try {
      const res = await api.get<{ name: string; vehicle_plate: string }[]>(
        "/transports"
      );
      const opts = res.data.map((t) => ({
        label: t.vehicle_plate || t.name,
        value: t.vehicle_plate || t.name,
      }));
      setOptions((o) => ({ ...o, transports: opts }));
    } catch (e: any) {
      console.error("Error al cargar transportes: ", e);
      toast.error("Error al cargar transportes");
    } finally {
      setLoading((l) => ({ ...l, transports: false }));
    }
  }, [options.transports.length]);

  const contextValue = React.useMemo(
    () => ({
      options,
      loading,
      fetchResponsibles,
      fetchAccounts,
      fetchTransports,
    }),
    [options, loading, fetchResponsibles, fetchAccounts, fetchTransports]
  );

  return (
    <DataContext.Provider value={contextValue}>{children}</DataContext.Provider>
  );
};

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData debe usarse dentro de DataProvider");
  return ctx;
};
