"use client";

import { useEffect, useState } from "react";
import { animate, motion, useMotionValue, useTransform } from "motion/react";
import apiService from "@/services/api.service";

const User = () => {
  const [userCount, setUserCount] = useState<number>(0);
  const count = useMotionValue(userCount);
  const rounded = useTransform(count, (value) => Math.round(value));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const users = await apiService.getUsers();
        setUserCount(users.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (userCount > 0) {
      animate(count, userCount, { duration: 0.25 });
    }
  }, [userCount, count]);

  return (
    <span className="text-3xl font-semibold text-slate-800 ml-5 flex flex-row items-center">
      <motion.pre>{rounded}</motion.pre>
      <span className="text-sm text-slate-400 font-normal ml-3">Usuarios</span>
    </span>
  );
};

export default User;
