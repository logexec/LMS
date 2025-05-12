import { createContext, useContext, ReactNode } from "react";

// Define el tipo para los datos de Request
export interface Request {
  id: string;
  unique_id: string;
  request_date: Date;
  invoice_number: string;
  account_id: string;
  amount: string;
  project: string;
  responsible_id?: string;
  cedula_responsable?: string;
  vehicle_plate?: string;
  vehicle_number?: string;
  note: string;
  status?: "paid" | "rejected" | "pending" | "in_reposition";
  type?: string;
  personnel_type?: string;
  month?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface Reposition {
  id?: string;
  fecha_reposicion?: Date;
  total_reposicion?: number;
  status: "paid" | "rejected" | "pending";
  project?: string;
  detail?: string[];
  month?: string;
  when?: string;
  attachment_url?: string;
  attachment_name?: string;
  note: string;
  created_at?: Date;
  updated_at?: Date;
}

// Define el tipo para el contexto
export interface TableContextType {
  data: Request[] | Reposition[];
  setData:
    | React.Dispatch<React.SetStateAction<Request[]>>
    | React.Dispatch<React.SetStateAction<Reposition[]>>;
  refreshData: () => Promise<void>;
  isLoading: boolean;
  mode: "discount" | "expense" | "income" | "all";
}

// Crea el contexto con valores por defecto
export const TableContext = createContext<TableContextType>({
  data: [],
  setData: () => {},
  refreshData: async () => {},
  isLoading: false,
  mode: "discount",
});

// Hook personalizado para usar el contexto
export const useTableContext = () => useContext(TableContext);

// Proveedor del contexto
interface TableContextProviderProps {
  children: ReactNode;
  value: TableContextType;
}

export const TableContextProvider = ({
  children,
  value,
}: TableContextProviderProps) => {
  return (
    <TableContext.Provider value={value}>{children}</TableContext.Provider>
  );
};
