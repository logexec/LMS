"use client";

import { useEffect, useState } from "react";
import { animate, motion, useMotionValue, useTransform } from "motion/react";
import api from "@/lib/api";

const fetchPersonnel = async (): Promise<number> => {
  const res = await api.get("/responsibles?action=count");
  return res.data;
};

const Personnel = () => {
  const [personnel, setPersonnel] = useState<number>(0);
  const count = useMotionValue(personnel);
  const rounded = useTransform(count, (value) => Math.round(value));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const total = await fetchPersonnel();
        setPersonnel(total);
      } catch (error) {
        console.error("Error fetching data:", error);
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
