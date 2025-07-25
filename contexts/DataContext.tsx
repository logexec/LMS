/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Option, OptionsState } from "@/utils/types";
import api from "@/lib/api";

// Tipos internos para este contexto
interface DataContextProps {
  options: OptionsState;
  loading: {
    projects: boolean;
    areas: boolean;
    accounts: boolean;
    responsibles: boolean;
    transports: boolean;
  };
  fetchEmpresas: () => Promise<void>;
  fetchProyectos: () => Promise<void>;
  fetchResponsibles: (proyecto: string) => Promise<void>;
  fetchAccounts: (tipo: string, action?: string) => Promise<void>;
  fetchTransports: () => Promise<void>;
}

const DataContext = createContext<DataContextProps | undefined>(undefined);

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();

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

  const responsiblesCache = useRef(new Map<string, Option[]>());
  const accountsCache = useRef(new Map<string, Option[]>());

  const fetchEmpresas = async () => {
    try {
      setLoading((prev) => ({ ...prev, projects: true }));
      const { data } = await api.get("/accounts");
      setOptions((prev) => ({
        ...prev,
        accounts: data.map((account: any) => ({
          label: account.name,
          value: account.name,
        })),
      }));
    } catch (error) {
      console.error(error);
      toast.error("Error cargando empresas");
    } finally {
      setLoading((prev) => ({ ...prev, projects: false }));
    }
  };

  const fetchProyectos = async () => {
    try {
      setLoading((prev) => ({ ...prev, areas: true }));
      const { data } = await api.get("/projects");
      setOptions((prev) => ({
        ...prev,
        projects: data.map((proj: any) => ({
          label: proj.nombre,
          value: proj.nombre,
        })),
      }));
    } catch (error) {
      console.error(error);
      toast.error("Error cargando proyectos");
    } finally {
      setLoading((prev) => ({ ...prev, areas: false }));
    }
  };

  const fetchResponsibles = useCallback(async (proyecto: string) => {
    if (!proyecto) return;

    if (responsiblesCache.current.has(proyecto)) {
      setOptions((prev) => ({
        ...prev,
        responsibles: responsiblesCache.current.get(proyecto) || [],
      }));
      return;
    }

    setLoading((prev) => ({ ...prev, responsibles: true }));

    try {
      const { data } = await api.get(`/responsibles?proyecto=${proyecto}`);
      const responsiblesData = data.map(
        (responsible: { nombre_completo: string }) => ({
          label: responsible.nombre_completo,
          value: responsible.nombre_completo,
        })
      );

      responsiblesCache.current.set(proyecto, responsiblesData);

      setOptions((prev) => ({
        ...prev,
        responsibles: responsiblesData,
      }));
    } catch (error) {
      console.error(error);
      toast.error("Error al cargar responsables");
    } finally {
      setLoading((prev) => ({ ...prev, responsibles: false }));
    }
  }, []);

  const fetchAccounts = useCallback(
    async (tipo: string, action: string = "expense") => {
      const cacheKey = `${tipo}-${action}`;

      if (accountsCache.current.has(cacheKey)) {
        setOptions((prev) => ({
          ...prev,
          accounts: accountsCache.current.get(cacheKey) || [],
        }));
        return;
      }

      setLoading((prev) => ({ ...prev, accounts: true }));

      try {
        const { data } = await api.get(`/accounts?tipo=${tipo}&action=${action}`);
        const activeAccounts = data.filter(
          (acc: any) => acc.account_status === "active"
        );

        const accountsData = activeAccounts.map((acc: any) => ({
          label: acc.name,
          value: acc.name,
        }));

        accountsCache.current.set(cacheKey, accountsData);

        setOptions((prev) => ({
          ...prev,
          accounts: accountsData,
        }));
      } catch (error) {
        console.error(error);
        toast.error("Error al cargar las cuentas");
      } finally {
        setLoading((prev) => ({ ...prev, accounts: false }));
      }
    },
    []
  );

  const fetchTransports = useCallback(async () => {
    if (options.transports.length > 0) return;

    setLoading((prev) => ({ ...prev, transports: true }));

    try {
      const { data } = await api.get("/transports");

      setOptions((prev) => ({
        ...prev,
        transports: data.map((t: any) => ({
          label: t.vehicle_plate || t.name,
          value: t.vehicle_plate || t.name,
        })),
      }));
    } catch (error) {
      console.error(error);
      toast.error("Error al cargar los transportes");
    } finally {
      setLoading((prev) => ({ ...prev, transports: false }));
    }
  }, [options.transports.length]);

  useEffect(() => {
    if (user) {
      fetchEmpresas();
      fetchProyectos();
    }
  }, [user]);

  return (
    <DataContext.Provider
      value={{
        options,
        loading,
        fetchEmpresas,
        fetchProyectos,
        fetchAccounts,
        fetchResponsibles,
        fetchTransports,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextProps => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData debe usarse dentro de un DataProvider");
  }
  return context;
};
