"use client";

import { useEffect, useState } from "react";
import Loader from "../Loader";
import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { getAuthToken } from "@/services/auth.service";
import { toast } from "sonner";
import { Status } from "@/utils/types";

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
  return data.count;
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
    return <Loader fullScreen={false} text="Cargando..." />;
  }

  return (
    <div className="flex flex-row flex-wrap text-orange-500 items-center">
      <motion.pre>{rounded}</motion.pre>
      <span className="text-xs font-normal ml-2">Pendientes</span>
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
    return <Loader fullScreen={false} text="Cargando..." />;
  }

  return (
    <div className="flex flex-row flex-wrap text-green-500 items-center">
      <motion.pre>{rounded}</motion.pre>
      <span className="text-xs font-normal ml-2">Pagadas</span>
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
    return <Loader fullScreen={false} text="Cargando..." />;
  }

  return (
    <div className="flex flex-row flex-wrap text-red-500 items-center">
      <motion.pre>{rounded}</motion.pre>
      <span className="text-xs font-normal ml-2">Rechazadas</span>
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
        const data = await fetchRequests(Status.in_reposition);
        setInRepositionRequests(data);
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
    if (inRepositionRequests > 0) {
      const controls = animate(count, inRepositionRequests, { duration: 0.25 });
      return () => controls.stop(); // Detener la animación si el componente se desmonta
    }
  }, [inRepositionRequests, count]);

  if (isLoading) {
    return <Loader fullScreen={false} text="Cargando..." />;
  }

  return (
    <div className="flex flex-row flex-wrap text-indigo-500 items-center">
      <motion.pre>{rounded}</motion.pre>
      <span className="text-xs font-normal ml-2">En reposición</span>
    </div>
  );
};
