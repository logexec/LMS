import { createContext, useContext } from "react";
import { Status, ReposicionUpdateData, RequestProps } from "@/utils/types";

interface ReposicionContextType {
  onUpdateReposicion?: (
    id: number,
    data: ReposicionUpdateData,
    previousStatus: Status
  ) => Promise<void>;

  //Optimistic update
  updateRequestsInReposicion?: (
    reposicionId: number,
    data: Partial<RequestProps>
  ) => void;
}

export const ReposicionContext = createContext<ReposicionContextType>({});
export const useReposicion = () => useContext(ReposicionContext);

export const ReposicionProvider: React.FC<
  ReposicionContextType & { children: React.ReactNode }
> = ({ children, onUpdateReposicion }) => {
  // Implementación de actualización optimista para las solicitudes
  const updateRequestsInReposicion = (
    reposicionId: number,
    data: Partial<RequestProps>
  ) => {
    // Implementación básica para evitar el error de parámetro no utilizado
    console.log(
      `Actualizando solicitudes para reposición ${reposicionId}`,
      data
    );
    // La implementación real se hará en RequestsTable
  };

  return (
    <ReposicionContext.Provider
      value={{
        onUpdateReposicion,
        updateRequestsInReposicion,
      }}
    >
      {children}
    </ReposicionContext.Provider>
  );
};
