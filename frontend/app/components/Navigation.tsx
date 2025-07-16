import React from "react";
import { LogOut, User2 } from "lucide-react";
import { motion } from "motion/react";
import { logout } from "@/services/auth.service";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

// Get current hour in Ecuador time zone
const getEcuadorHour = (date = new Date()) => {
  return parseInt(
    Intl.DateTimeFormat("es-EC", {
      hour: "numeric",
      hour12: false,
      timeZone: "America/Guayaquil",
    }).format(date)
  );
};

// Get current minute in Ecuador time zone
const getEcuadorMinute = (date = new Date()) => {
  return parseInt(
    Intl.DateTimeFormat("es-EC", {
      minute: "numeric",
      timeZone: "America/Guayaquil",
    }).format(date)
  );
};

const Navigation = () => {
  const user = useAuth();
  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-30 w-full bg-slate-950/70 text-white shadow-lg backdrop-blur-xs"
    >
      <div className="flex items-center justify-between px-4 py-3 lg:px-6">
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center space-x-2 text-sm md:text-base pointer-events-none select-none"
        >
          <div className="ml-9 flex items-center space-x-1 border-l border-gray-600 pl-2 lg:ml-0 ">
            <span className="font-medium">{getEcuadorHour(new Date())}</span>
            <motion.span
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="text-red-600 font-bold"
            >
              :
            </motion.span>
            <span className="font-medium">
              {getEcuadorMinute(new Date()) < 10
                ? `0${getEcuadorMinute(new Date())}`
                : getEcuadorMinute(new Date())}
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center space-x-6"
        >
          <motion.div>
            <Link
              href="/profile"
              className="flex flex-row items-center space-x-2"
            >
              <User2 size={24} className="rounded-full border border-white" />
              <span className="font-bold">{user.user!.name}</span>
            </Link>
          </motion.div>
          <motion.button
            whileHover={{ scale: 0.99 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center space-x-2 rounded-lg bg-primary px-4 py-2 text-xs lg:text-sm font-medium text-white dark:text-black transition-colors hover:bg-red-700 focus:outline-hidden focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            onClick={() => logout()}
          >
            <LogOut size={18} />
            <span className="sm:text-[.5rem] lg:text-sm">Cerrar Sesión</span>
          </motion.button>
        </motion.div>
      </div>
    </motion.nav>
  );
};

export default Navigation;
