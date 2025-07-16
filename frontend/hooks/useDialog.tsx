/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";

interface UseDialogOptions {
  /**
   * Opciones para refrescar las consultas después de cerrar el diálogo
   */
  refetchOptions?: {
    /**
     * Las claves de las consultas a invalidar después de cerrar el diálogo
     */
    queryKeys?: string[];
    /**
     * Tiempo de espera antes de invalidar las consultas (en ms)
     */
    delay?: number;
  };
  /**
   * Estado inicial del diálogo
   */
  initialState?: boolean;
}

/**
 * Hook personalizado para gestionar estados de diálogos con integración para React Query
 */
export function useDialog(options: UseDialogOptions = {}) {
  const {
    refetchOptions = { queryKeys: ["users"], delay: 100 },
    initialState = false,
  } = options;

  const [isOpen, setIsOpen] = useState(initialState);
  const [data, setData] = useState<any>(null);
  const queryClient = useQueryClient();

  /**
   * Abre el diálogo y opcionalmente establece datos para él
   */
  const open = useCallback((dialogData?: any) => {
    if (dialogData) {
      setData(dialogData);
    }
    setIsOpen(true);
  }, []);

  /**
   * Cierra el diálogo y opcionalmente realiza un refetch de las consultas especificadas
   */
  const close = useCallback(() => {
    setIsOpen(false);
    setData(null);

    // Refrescar consultas después de un corto retraso para permitir que el diálogo se cierre completamente
    if (refetchOptions.queryKeys && refetchOptions.queryKeys.length > 0) {
      setTimeout(() => {
        refetchOptions.queryKeys?.forEach((key) => {
          queryClient.invalidateQueries({ queryKey: [key] });
        });
      }, refetchOptions.delay || 100);
    }
  }, [queryClient, refetchOptions]);

  return {
    isOpen,
    open,
    close,
    data,
  };
}

export default useDialog;
