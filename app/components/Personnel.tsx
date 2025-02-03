"use client";

import { useState } from "react";
import { useEffect } from "react";
import { animate, motion, useMotionValue } from "motion/react";
import { useTransform } from "motion/react";
import { getAuthToken } from "@/services/auth.service";

const fetchPersonnel = async (): Promise<number> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/responsibles?action=count`,
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
    throw new Error("Failed to fetch personnel");
  }

  const data = await response.json();
  return data;
};

const Personnel = () => {
  const [personnel, setPersonnel] = useState<number>(0);
  const count = useMotionValue(personnel);
  const rounded = useTransform(count, (value) => Math.round(value));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const personnel = await fetchPersonnel();
        setPersonnel(personnel);
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
