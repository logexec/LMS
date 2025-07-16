/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { toast } from "sonner";
import { Loader2Icon } from "lucide-react";
import api from "@/services/axios";
// import { Status } from "@/utils/types";

const currentMonth = new Date().getMonth() + 1;

// Función para obtener solo el conjunto de datos específico
const fetchRequests = async (status: string): Promise<number> => {
  // le pasamos los params en un objeto en vez de concatenar strings
  const response = await api.get<number>("/requests", {
    params: { status, month: currentMonth, action: "count" },
  });

  // chequea el status
  if (response.status !== 200) {
    throw new Error(
      `Failed to fetch ${status} requests (status ${response.status})`
    );
  }

  return response.data;
};

// Hook auxiliar genérico para contar
async function fetchCount(status: string): Promise<number> {
  const { data, status: code } = await api.get<number>("/requests", {
    params: { status, month: currentMonth, action: "count" },
  })
  if (code !== 200) throw new Error(`Error fetching ${status}`)
  return data
}

export const PendingRequests = () => {
  const [countValue, setCountValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const motionVal = useMotionValue(0);
  const rounded = useTransform(motionVal, (v) => Math.round(v));

  useEffect(() => {
    fetchRequests("pending")
      .then((n) => setCountValue(n))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (countValue > 0) {
      const controls = animate(motionVal, countValue, { duration: 0.25 });
      return () => controls.stop();
    }
  }, [countValue, motionVal]);

  if (loading) return <Loader2Icon className="animate-spin" />;

  return (
    <div className="flex items-center text-orange-500">
      <motion.pre>{rounded}</motion.pre>
    </div>
  );
};

export const PaidRequests = () => {
  const [countValue, setCountValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const motionVal = useMotionValue(0);
  const rounded = useTransform(motionVal, (v) => Math.round(v));

  useEffect(() => {
    fetchCount("paid")
      .then((n) => setCountValue(n))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (countValue > 0) {
      const controls = animate(motionVal, countValue, { duration: 0.25 });
      return () => controls.stop();
    }
  }, [countValue, motionVal]);

  if (loading) return <Loader2Icon className="animate-spin" />;

  return (
    <div className="flex items-center text-green-500">
      <motion.pre>{rounded}</motion.pre>
    </div>
  );
};

export const RejectedRequests = () => {
  const [countValue, setCountValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const motionVal = useMotionValue(0);
  const rounded = useTransform(motionVal, (v) => Math.round(v));

  useEffect(() => {
    fetchCount("rejected")
      .then((n) => setCountValue(n))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (countValue > 0) {
      const controls = animate(motionVal, countValue, { duration: 0.25 });
      return () => controls.stop();
    }
  }, [countValue, motionVal]);

  if (loading) return <Loader2Icon className="animate-spin" />;

  return (
    <div className="flex items-center text-red-500">
      <motion.pre>{rounded}</motion.pre>
    </div>
  );
};

export const InRepositionRequests = () => {
  const [countValue, setCountValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const motionVal = useMotionValue(0);
  const rounded = useTransform(motionVal, (v) => Math.round(v));

  useEffect(() => {
    api
      .get<any[]>("/requests", { params: { status: "in_reposition" } })
      .then(({ data }) => {
        const month = new Date().getMonth() + 1;
        const year = new Date().getFullYear();
        const cnt = data.filter((r) => {
          const d = new Date(r.created_at || r.updated_at);
          return d.getMonth() + 1 === month && d.getFullYear() === year;
        }).length;
        setCountValue(cnt);
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (countValue > 0) {
      const controls = animate(motionVal, countValue, { duration: 0.25 });
      return () => controls.stop();
    }
  }, [countValue, motionVal]);

  if (loading) return <Loader2Icon className="animate-spin" />;

  return (
    <span className="flex items-center justify-center text-yellow-500">
      <motion.pre>{rounded}</motion.pre>
    </span>
  );
};

export const RepositionRequests = () => {
  const [countValue, setCountValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const motionVal = useMotionValue(0);
  const rounded = useTransform(motionVal, (v) => Math.round(v));

  useEffect(() => {
    api
      .get<any[]>("/reposiciones", { params: { status: "pending" } })
      .then(({ data }) => {
        const month = new Date().getMonth() + 1;
        const year = new Date().getFullYear();
        const cnt = data.filter((r) => {
          const d = new Date(r.created_at || r.updated_at);
          return d.getMonth() + 1 === month && d.getFullYear() === year;
        }).length;
        setCountValue(cnt);
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (countValue > 0) {
      const controls = animate(motionVal, countValue, { duration: 0.25 });
      return () => controls.stop();
    }
  }, [countValue, motionVal]);

  if (loading) return <Loader2Icon className="animate-spin" />;

  return (
    <span className="flex items-center justify-center text-blue-500">
      <motion.pre>{rounded}</motion.pre>
    </span>
  );
};
