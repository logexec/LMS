import { createContext } from "react";
import { Status, ReposicionUpdateData } from "@/utils/types";

interface ReposicionContextType {
  onUpdateReposicion?: (
    id: number,
    data: ReposicionUpdateData,
    previousStatus: Status
  ) => Promise<void>;
}

export const ReposicionContext = createContext<ReposicionContextType>({});

export const ReposicionProvider: React.FC<
  ReposicionContextType & { children: React.ReactNode }
> = ({ children, onUpdateReposicion }) => {
  return (
    <ReposicionContext.Provider value={{ onUpdateReposicion }}>
      {children}
    </ReposicionContext.Provider>
  );
};
