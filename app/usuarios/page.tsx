"use client";

import React from "react";
import { motion } from "motion/react";
import { Card, CardContent } from "@/components/ui/card";
import { UsersTable } from "../components/users/UsersTable";

const UsersPage = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="container py-8 space-y-6"
    >
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">
            Gestión de Usuarios
          </h2>
          <p className="text-sm text-slate-500">
            Administra los usuarios del sistema
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <UsersTable />
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default UsersPage;
