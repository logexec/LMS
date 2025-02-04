"use client";

import React from "react";
import { TbHierarchy2 } from "react-icons/tb";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
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
        <div className="flex gap-2">
          <Button asChild className="bg-red-600 hover:bg-red-700">
            <Link href="/roles" className="flex items-center gap-2">
              <TbHierarchy2 className="h-4 w-4" />
              Gestionar Roles
            </Link>
          </Button>
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
