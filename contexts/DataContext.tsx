"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { useAuth } from "@/hooks/useAuth";
import api from "@/lib/api";
import apiService from "@/services/api.service";
import { toast } from "sonner";
import { getAuthToken } from "@/services/auth.service";

interface Empresa {
  id: number;
  nombre: string;
}

interface Proyecto {
  id: number;
  nombre: string;
  empresa_id: number;
}

interface Option {
  label: string;
  value: string;
}

interface OptionsState {
  projects: Option[];
  responsibles: Option[];
  transports: Option[];
  accounts: Option[];
  areas: Option[];
}

interface DataContextProps {
  empresas: Empresa[];
  proyectos: Proyecto[];
  loading: boolean;
  options: OptionsState;
  setOptions: React.Dispatch<React.SetStateAction<OptionsState>>;
  fetchEmpresas: () => Promise<void>;
  fetchProyectos: () => Promise<void>;
  fetchResponsibles: (proyecto: string) => Promise<void>;
  fetchAccounts: (tipo: string, action?: string) => Promise<void>;
  fetchTransports: () => Promise<void>;
}

const DataContext = createContext<DataContextProps | undefined>(undefined);

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();

  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [options, setOptions] = useState<OptionsState>({
    projects: [],
    responsibles: [],
    transports: [],
    accounts: [],
    areas: [],
  });

  const responsiblesCache = useRef(new Map<string, Option[]>());
  const accountsCache = useRef(new Map<string, Option[]>());

  const fetchEmpresas = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/accounts");
      setEmpresas(data);
    } catch (error) {
      console.error(error);
      toast.error("Error cargando empresas");
    } finally {
      setLoading(false);
    }
  };

  const fetchProyectos = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/projects");
      setProyectos(data);
    } catch (error) {
      console.error(error);
      toast.error("Error cargando proyectos");
    } finally {
      setLoading(false);
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

    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/responsibles?proyecto=${proyecto}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getAuthToken()}`,
          },
          credentials: "include",
        }
      );
      if (!res.ok) throw new Error("Error al cargar responsables");
      const data = await res.json();

      const responsibles = data.map(
        (r: { nombre_completo: string }) => ({
          label: r.nombre_completo,
          value: r.nombre_completo,
        })
      );

      responsiblesCache.current.set(proyecto, responsibles);
      setOptions((prev) => ({ ...prev, responsibles }));
    } catch (error) {
      console.error(error)
      toast.error("Error al cargar responsables");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAccounts = useCallback(async (tipo: string, action = "expense") => {
    const cacheKey = `${tipo}-${action}`;

    if (accountsCache.current.has(cacheKey)) {
      setOptions((prev) => ({
        ...prev,
        accounts: accountsCache.current.get(cacheKey) || [],
      }));
      return;
    }

    setLoading(true);
    try {
      const res = await apiService.getAccounts(tipo, action);
      const data = await res.data;

      const active = data.filter(
        (acc: { account_status: string }) => acc.account_status === "active"
      );

      const accounts = active.map((acc: { name: string }) => ({
        label: acc.name,
        value: acc.name,
      }));

      accountsCache.current.set(cacheKey, accounts);
      setOptions((prev) => ({ ...prev, accounts }));
    } catch (error) {
      console.error(error)
      toast.error("Error al cargar cuentas");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTransports = useCallback(async () => {
    if (options.transports.length > 0) return;

    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/transports`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getAuthToken()}`,
          },
          credentials: "include",
        }
      );
      if (!res.ok) throw new Error("Error al cargar transportes");
      const data = await res.json();

      const transports = data.map(
        (t: { name: string; vehicle_plate: string }) => ({
          label: t.vehicle_plate || t.name,
          value: t.vehicle_plate || t.name,
        })
      );

      setOptions((prev) => ({ ...prev, transports }));
    } catch (error) {
      console.error(error)
      toast.error("Error al cargar transportes");
    } finally {
      setLoading(false);
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
        empresas,
        proyectos,
        loading,
        options,
        setOptions,
        fetchEmpresas,
        fetchProyectos,
        fetchResponsibles,
        fetchAccounts,
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
