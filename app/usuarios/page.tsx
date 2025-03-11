"use client";

import React from "react";
import { motion } from "motion/react";
import { UsersTable } from "../components/users/UsersTable";
import { InfoIcon } from "lucide-react";

const UsersPage = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="container space-y-6"
    >
      <div className="rounded-md border border-blue-500/50 px-4 py-3 text-sky-600 bg-sky-100/70">
        <p className="text-sm">
          <InfoIcon
            className="me-3 -mt-0.5 inline-flex opacity-60"
            size={16}
            aria-hidden="true"
          />
          Debido a un bug sin identificar, al momento de editar o eliminar un
          usuario, deberás refrescar la página para poder seguir utilizando el
          sistema. Este problema será solucionado lo antes posible.
        </p>
      </div>
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

      <div className="p-6">
        <UsersTable />
      </div>
    </motion.div>
  );
};

export default UsersPage;
