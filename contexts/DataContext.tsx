"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import api from "@/lib/api";
import { toast } from "sonner";

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
}

const DataContext = createContext<DataContextProps | undefined>(undefined);

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Agregado para mantener compatibilidad con el sistema anterior
  const [options, setOptions] = useState<OptionsState>({
    projects: [],
    responsibles: [],
    transports: [],
    accounts: [],
    areas: [],
  });

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
        fetchEmpresas,
        fetchProyectos,
        options,   
        setOptions,
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
