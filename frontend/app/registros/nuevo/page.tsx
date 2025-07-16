"use client";

import DescuentosForm from "../../components/ingresos/DescuentosForm";
import GastosForm from "../../components/ingresos/GastosForm";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import IngresosForm from "@/app/components/ingresos/IngresosForm";
import { AnimatePresence, motion, Variants } from "motion/react";
import { useState } from "react";

const RegistroPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("discount");

  const tabContentVariants: Variants = {
    initial: { opacity: 0, x: -10 },
    animate: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3, ease: "easeOut" },
    },
    exit: { opacity: 0, x: 10, transition: { duration: 0.2 } },
  };
  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  };
  return (
    <motion.div key="form-section" variants={itemVariants}>
      <Tabs
        defaultValue="discount"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-t-xl bg-linear-to-r from-gray-50 to-slate-100 dark:from-gray-950 dark:to-slate-900 border-t border-x">
          <h3 className="text-lg font-bold">Categoría</h3>
          <TabsList className="bg-slate-100/80 dark:bg-slate-800/80 backdrop-blur-xs p-1 rounded-lg border border-slate-200 dark:border-slate-700">
            <TabsTrigger
              value="discount"
              className="rounded-md text-sm font-medium data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:shadow-xs data-[state=active]:text-slate-600 dark:data-[state=active]:text-red-400 transition-all duration-200"
            >
              Descuentos
            </TabsTrigger>
            <TabsTrigger
              value="expense"
              className="rounded-md text-sm font-medium data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:shadow-xs data-[state=active]:text-slate-600 dark:data-[state=active]:text-red-400 transition-all duration-200"
            >
              Gastos
            </TabsTrigger>
            <TabsTrigger
              value="income"
              className="rounded-md text-sm font-medium data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:shadow-xs data-[state=active]:text-slate-600 dark:data-[state=active]:text-red-400 transition-all duration-200"
            >
              Ingresos
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="p-6 border-x border-b rounded-b-xl shadow-xs">
          <AnimatePresence mode="wait">
            {activeTab === "discount" && (
              <motion.div
                key="normal-form"
                variants={tabContentVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <DescuentosForm />
              </motion.div>
            )}

            {activeTab === "expense" && (
              <motion.div
                key="expense"
                variants={tabContentVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <GastosForm />
              </motion.div>
            )}

            {activeTab === "income" && (
              <motion.div
                key="loan-form"
                variants={tabContentVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <IngresosForm />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Tabs>
    </motion.div>
  );
};

export default RegistroPage;
