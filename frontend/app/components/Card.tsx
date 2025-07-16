"use client";
import React from "react";
import { motion } from "motion/react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className }) => {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileTap={{ scale: 0.95 }}
      className={`bg-white dark:bg-slate-950 rounded p-5 shadow-md border border-slate-100 dark:border-slate-900 ${className}`}
    >
      {children}
    </motion.div>
  );
};

export default Card;
