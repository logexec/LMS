"use client";

import { animate, motion, useTransform } from "motion/react";
import { useMotionValue } from "motion/react";
import { useEffect, useState } from "react";

const fetchVehicles = async (): Promise<any> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/transports?action=count`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch users");
  }

  const data = await response.json();
  return data;
};

const Transport = () => {
  const [vehicles, setVehicles] = useState<number>(0);
  const count = useMotionValue(vehicles);
  const rounded = useTransform(count, (value) => Math.round(value));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const vehicles = await fetchVehicles();
        setVehicles(vehicles);
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
