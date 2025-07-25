"use client";

import { useEffect, useState } from "react";
import { animate, motion, useMotionValue, useTransform } from "motion/react";
import api from "@/lib/api";

const fetchVehicles = async (): Promise<number> => {
  const res = await api.get("/transports?action=count");
  return res.data;
};

const Transport = () => {
  const [vehicles, setVehicles] = useState<number>(0);
  const count = useMotionValue(vehicles);
  const rounded = useTransform(count, (value) => Math.round(value));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const total = await fetchVehicles();
        setVehicles(total);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (vehicles > 0) {
      animate(count, vehicles, { duration: 0.25 });
    }
  }, [vehicles, count]);

  return (
    <span className="text-3xl font-semibold text-slate-800 ml-5 flex flex-row items-center">
      <motion.pre>{rounded}</motion.pre>
      <span className="text-sm text-slate-400 font-normal ml-3">Camiones</span>
    </span>
  );
};

export default Transport;
