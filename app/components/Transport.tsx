"use client";

import { useState, useEffect } from "react";
import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { apiService } from "@/services/api.service";
import { toast } from "sonner";

const Transport = () => {
  const [vehicles, setVehicles] = useState<number>(0);
  const count = useMotionValue(vehicles);
  const rounded = useTransform(count, (value) => Math.round(value));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const vehicleCount = await apiService.getVehiclesCount();
        setVehicles(vehicleCount);
      } catch (error) {
        console.error("Error fetching vehicles count:", error);
        toast.error(
          error instanceof Error ? error.message : "Error desconocido"
        );
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
