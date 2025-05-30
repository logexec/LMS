/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { fetchWithAuth, getAuthToken } from "@/services/auth.service";
import { toast } from "sonner";
import { Loader2Icon } from "lucide-react";
// import { Status } from "@/utils/types";

const currentMonth = new Date().getMonth() + 1;

// Función para obtener solo el conjunto de datos específico
const fetchRequests = async (status: string): Promise<number> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/requests?status=${status}&month=${currentMonth}&action=count`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      credentials: "include",
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch ${status} requests`);
  }

  const data = await response.json();
  return data;
};

export const PendingRequests = () => {
  const [requests, setRequests] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  const count = useMotionValue(requests); // Iniciar con el valor actual
  const rounded = useTransform(count, (value) => Math.round(value)); // Redondear el valor de count

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchRequests("pending");
        setRequests(data);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Error desconocido"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (requests > 0) {
      const controls = animate(count, requests, { duration: 0.25 });
      return () => controls.stop(); // Detener la animación si el componente se desmonta
    }
  }, [requests, count]);

  if (isLoading) {
    // return <Loader fullScreen={false} text="Cargando..." />;
    return <Loader2Icon className="animate-spin" />;
  }

  return (
    <div className="flex flex-row flex-wrap text-orange-500 items-center">
      <motion.pre>{rounded}</motion.pre>
      {/* <span className="text-xs font-normal ml-2">Pendientes</span> */}
    </div>
  );
};

export const PaidRequests = () => {
  const [paidRequests, setPaidRequests] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  const count = useMotionValue(paidRequests); // Iniciar con el valor actual
  const rounded = useTransform(count, (value) => Math.round(value)); // Redondear el valor de count

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchRequests("paid");
        setPaidRequests(data);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Error desconocido"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (paidRequests > 0) {
      const controls = animate(count, paidRequests, { duration: 0.25 });
      return () => controls.stop(); // Detener la animación si el componente se desmonta
    }
  }, [paidRequests, count]);

  if (isLoading) {
    // return <Loader fullScreen={false} text="Cargando..." />;
    return <Loader2Icon className="animate-spin" />;
  }

  return (
    <div className="flex flex-row flex-wrap text-green-500 items-center">
      <motion.pre>{rounded}</motion.pre>
      {/* <span className="text-xs font-normal ml-2">Pagadas</span> */}
    </div>
  );
};

export const RejectedRequests = () => {
  const [rejectedRequests, setRejectedRequests] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  const count = useMotionValue(rejectedRequests); // Iniciar con el valor actual
  const rounded = useTransform(count, (value) => Math.round(value)); // Redondear el valor de count

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchRequests("rejected");
        setRejectedRequests(data);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Error desconocido"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (rejectedRequests > 0) {
      const controls = animate(count, rejectedRequests, { duration: 0.25 });
      return () => controls.stop(); // Detener la animación si el componente se desmonta
    }
  }, [rejectedRequests, count]);

  if (isLoading) {
    // return <Loader fullScreen={false} text="Cargando..." />;
    return <Loader2Icon className="animate-spin" />;
  }

  return (
    <div className="flex flex-row flex-wrap text-red-500 items-center">
      <motion.pre>{rounded}</motion.pre>
      {/* <span className="text-xs font-normal ml-2">Rechazadas</span> */}
    </div>
  );
};

export const InRepositionRequests = () => {
  const [inRepositionRequests, setInRepositionRequests] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  const count = useMotionValue(inRepositionRequests); // Iniciar con el valor actual
  const rounded = useTransform(count, (value) => Math.round(value)); // Redondear el valor de count

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtenemos todos los datos y hacemos el conteo localmente
        const response = await fetchWithAuth(`/requests?status=in_reposition`);

        if (!response.ok) {
          throw new Error(response.message || "Failed to fetch data");
        }

        let requests = [];
        if (Array.isArray(response)) {
          requests = response;
        } else if (response.data && Array.isArray(response.data)) {
          requests = response.data;
        } else {
          requests = Object.values(response).filter(
            (item) => item !== null && typeof item === "object"
          );
        }

        // Filtramos por mes actual y contamos
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1;
        const currentYear = currentDate.getFullYear();

        const count = requests.filter((req: any) => {
          const reqDate = new Date(req.created_at || req.updated_at);
          return (
            reqDate.getMonth() + 1 === currentMonth &&
            reqDate.getFullYear() === currentYear
          );
        }).length;

        setInRepositionRequests(count);
      } catch (error) {
        console.error("Error fetching counts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (inRepositionRequests > 0) {
      const controls = animate(count, inRepositionRequests, { duration: 0.25 });
      return () => controls.stop(); // Detener la animación si el componente se desmonta
    }
  }, [inRepositionRequests, count]);

  if (isLoading) {
    // return <Loader fullScreen={false} text="Cargando..." />;
    return <Loader2Icon className="animate-spin" />;
  }

  return (
    <span className={`flex flex-row items-center justify-center w-min`}>
      <motion.pre>{rounded}</motion.pre>
    </span>
  );
};
export const RepositionRequests = () => {
  const [RepositionRequests, setRepositionRequests] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  const count = useMotionValue(RepositionRequests); // Iniciar con el valor actual
  const rounded = useTransform(count, (value) => Math.round(value)); // Redondear el valor de count

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtenemos todos los datos y hacemos el conteo localmente
        const response = await fetchWithAuth(`/reposiciones?status=pending`);

        if (!response.ok) {
          throw new Error(response.message || "Failed to fetch data");
        }

        let requests = [];
        if (Array.isArray(response)) {
          requests = response;
        } else if (response.data && Array.isArray(response.data)) {
          requests = response.data;
        } else {
          requests = Object.values(response).filter(
            (item) => item !== null && typeof item === "object"
          );
        }

        // Filtramos por mes actual y contamos
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1;
        const currentYear = currentDate.getFullYear();

        const count = requests.filter((req: any) => {
          const reqDate = new Date(req.created_at || req.updated_at);
          return (
            reqDate.getMonth() + 1 === currentMonth &&
            reqDate.getFullYear() === currentYear
          );
        }).length;

        setRepositionRequests(count);
      } catch (error) {
        console.error("Error fetching counts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (RepositionRequests > 0) {
      const controls = animate(count, RepositionRequests, { duration: 0.25 });
      return () => controls.stop(); // Detener la animación si el componente se desmonta
    }
  }, [RepositionRequests, count]);

  if (isLoading) {
    // return <Loader fullScreen={false} text="Cargando..." />;
    return <Loader2Icon className="animate-spin" />;
  }

  return (
    <span className={`flex flex-row items-center justify-center w-min`}>
      <motion.pre>{rounded}</motion.pre>
    </span>
  );
};
