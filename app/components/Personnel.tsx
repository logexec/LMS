"use client";

import { useState, useEffect } from "react";
import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { apiService } from "@/services/api.service"; // Importamos apiService
import { toast } from "sonner"; // Para manejar errores

const Personnel = () => {
  const [personnel, setPersonnel] = useState<number>(0);
  const count = useMotionValue(personnel);
  const rounded = useTransform(count, (value) => Math.round(value));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const personnelCount = await apiService.getPersonnelCount();
        setPersonnel(personnelCount);
      } catch (error) {
        console.error("Error fetching personnel count:", error);
        toast.error(
          error instanceof Error ? error.message : "Error desconocido"
        );
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (personnel > 0) {
      animate(count, personnel, { duration: 0.5 });
    }
  }, [personnel, count]);

  return (
    <span className="text-3xl font-semibold text-slate-800 ml-5 flex flex-row items-center">
      <motion.pre>{rounded}</motion.pre>
      <span className="text-sm text-slate-400 font-normal ml-3">Empleados</span>
    </span>
  );
};

export default Personnel;
