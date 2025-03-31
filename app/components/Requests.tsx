"use client";

import { useEffect, useState } from "react";
import Loader from "../Loader";
import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { toast } from "sonner";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
const currentMonth = new Date().getMonth() + 1;

const fetchRequests = async (status: string): Promise<number> => {
  const response = await fetch(
    `${API_URL}/requests?status=${status}&month=${currentMonth}&action=count`,
    {
      method: "GET",
      credentials: "include", // Para enviar cookies de Sanctum
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `Failed to fetch ${status} requests`);
  }

  const data = await response.json();
  return data.data; // Asumimos que el backend devuelve { data: number }
};

export const PendingRequests = () => {
  const [requests, setRequests] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  const count = useMotionValue(requests);
  const rounded = useTransform(count, (value) => Math.round(value));

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
      return () => controls.stop();
    }
  }, [requests, count]);

  if (isLoading) {
    return <Loader fullScreen={false} text="Cargando..." />;
  }

  return (
    <div className="flex flex-row flex-wrap text-orange-500 items-center">
      <motion.pre>{rounded}</motion.pre>
    </div>
  );
};

export const PaidRequests = () => {
  const [paidRequests, setPaidRequests] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  const count = useMotionValue(paidRequests);
  const rounded = useTransform(count, (value) => Math.round(value));

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
      return () => controls.stop();
    }
  }, [paidRequests, count]);

  if (isLoading) {
    return <Loader fullScreen={false} text="Cargando..." />;
  }

  return (
    <div className="flex flex-row flex-wrap text-green-500 items-center">
      <motion.pre>{rounded}</motion.pre>
    </div>
  );
};

export const RejectedRequests = () => {
  const [rejectedRequests, setRejectedRequests] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  const count = useMotionValue(rejectedRequests);
  const rounded = useTransform(count, (value) => Math.round(value));

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
      return () => controls.stop();
    }
  }, [rejectedRequests, count]);

  if (isLoading) {
    return <Loader fullScreen={false} text="Cargando..." />;
  }

  return (
    <div className="flex flex-row flex-wrap text-red-500 items-center">
      <motion.pre>{rounded}</motion.pre>
    </div>
  );
};

export const InRepositionRequests = () => {
  const [inRepositionRequests, setInRepositionRequests] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  const count = useMotionValue(inRepositionRequests);
  const rounded = useTransform(count, (value) => Math.round(value));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchRequests("in_reposition");
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
      return () => controls.stop();
    }
  }, [inRepositionRequests, count]);

  if (isLoading) {
    return <Loader fullScreen={false} text="Cargando..." />;
  }

  return (
    <span className="flex flex-row items-center justify-center w-min">
      <motion.pre>{rounded}</motion.pre>
    </span>
  );
};
