import React from "react";
import { LogOut } from "lucide-react";
import { motion } from "motion/react";
import { logout } from "@/services/auth.service";

const Navigation = () => {
  const formatMinutes = (minutes: number) =>
    minutes < 10 ? `0${minutes}` : minutes;
  const formatHours = (hours: number) => (hours < 10 ? `0${hours}` : hours);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-30 w-full bg-slate-950 text-white shadow-lg backdrop-blur-sm bg-opacity-80"
    >
      <div className="flex items-center justify-between px-4 py-3 lg:px-6">
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center space-x-2 text-sm md:text-base"
        >
          <div className="ml-9 flex items-center space-x-1 border-l border-gray-600 pl-2 lg:ml-0 ">
            <span className="font-medium">
              {formatHours(new Date().getHours())}
            </span>
            <motion.span
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="text-red-600 font-bold"
            >
              :
            </motion.span>
            <span className="font-medium">
              {formatMinutes(new Date().getMinutes())}
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center space-x-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            onClick={() => (logout(), (window.location.href = "/"))}
          >
            <LogOut size={18} />
            <span className="hidden sm:inline">Cerrar Sesión</span>
          </motion.button>
        </motion.div>
      </div>
    </motion.nav>
  );
};

export default Navigation;
