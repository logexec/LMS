"use client";

import { useEffect, useState } from "react";
import Loader from "../Loader";
import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { getAuthToken } from "@/services/auth.service";

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
        console.error("Error fetching data:", error);
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
    return <Loader fullScreen={false} text="Cargando solicitudes..." />;
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchRequests("paid");
        setPaidRequests(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return <Loader fullScreen={false} text="Cargando solicitudes..." />;
  }

  return (
    <div className="flex flex-row text-green-500 flex-wrap items-center">
      {paidRequests}
      <span className="text-xs font-normal ml-2">Pagadas</span>
    </div>
  );
};

export const RejectedRequests = () => {
  const [rejectedRequests, setRejectedRequests] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchRequests("rejected");
        setRejectedRequests(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return <Loader fullScreen={false} text="Cargando solicitudes..." />;
  }

  return (
    <div className="flex flex-row flex-wrap text-red-500 items-center">
      {rejectedRequests}
      <span className="text-xs font-normal ml-2">Rechazadas</span>
    </div>
  );
};

export const InRepositionRequests = () => {
  const [inRepositionRequests, setInRepositionRequests] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchRequests("in_reposition");
        setInRepositionRequests(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return <Loader fullScreen={false} text="Cargando solicitudes..." />;
  }

  return (
    <div className="flex flex-row flex-wrap text-indigo-500 items-center">
      {inRepositionRequests}
      <span className="text-xs font-normal ml-2">En proceso de reposición</span>
    </div>
  );
};

// Por cada status:

// id_unico, valor, fecha, proyecto

// Mostrar tabla dinamica quiza jstable para mostrar los datos de las solicitudes pendientes, pagadas y rechazadas en una linea de tiempo.
// Se debe mostrar el id_unico, valor, fecha, proyecto, status, y un boton para ver el detalle de la solicitud.
