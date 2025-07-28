"use client";

import { motion } from "motion/react";
import Card from "./components/Card";
import Link from "next/link";
import Hr from "./components/Hr";
import Personnel from "./components/Personnel";
import Transport from "./components/Transport";
import {
  PendingRequests,
  PaidRequests,
  RejectedRequests,
  InRepositionRequests,
} from "./components/Requests";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

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

const subtractHours = (date = new Date()) => {
  const currentHour = getEcuadorHour(date);
  if (currentHour < 8 || currentHour >= 16) {
    return 0;
  }
  const remainingHours = 16 - currentHour;
  if (remainingHours <= 0 || remainingHours > 9) {
    return 0;
  }
  return remainingHours;
};

const subtractMinutes = (date = new Date()) => {
  const currentHour = getEcuadorHour(date);
  const currentMinute = getEcuadorMinute(date);

  if (currentHour < 8 || currentHour >= 17) {
    return 0;
  }

  const remainingMinutes = 60 - currentMinute;
  const remainingHours = 17 - currentHour;

  if (remainingHours === 0 && currentMinute >= 59) {
    return 0;
  }

  if (remainingHours === 0 && currentMinute === 0) {
    return 0;
  }

  return remainingMinutes;
};

const Home = () => {
  const [isShiftOver, setIsShiftOver] = useState(false);
  const [canSeeLogexInfo, setCanSeeLogexInfo] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const user = useAuth();

  useEffect(() => {
    setCanSeeLogexInfo(user.hasRole("admin") || user.hasRole("developer"));
  }, [user]);

  useEffect(() => {
    const checkShiftStatus = () => {
      const now = new Date();
      setCurrentTime(now);
      setIsShiftOver(subtractHours(now) === 0 && subtractMinutes(now) === 0);
    };
    const interval = setInterval(checkShiftStatus, 60000);

    checkShiftStatus();

    return () => {
      clearInterval(interval);
    };
  }, []);

  const ecuadorHour = getEcuadorHour(currentTime);

  const ecuadorDate = new Intl.DateTimeFormat("es-EC", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "America/Guayaquil",
  }).format(currentTime);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25, delay: 0.5 }}
      className="min-h-screen p-4 md:p-6 lg:p-8 bg-white dark:bg-black"
    >
      <motion.h3
        initial={{ opacity: 0, bottom: -500 }}
        animate={{ opacity: 1, bottom: 0 }}
        transition={{ duration: 0.5, delay: 0.75 }}
        className="-mt-7 mb-4"
      >
        <span className="text-2xl font-bold text-opacity-70 text-black dark:text-white">
          {ecuadorHour >= 5 && ecuadorHour < 12
            ? "¡Buen día, "
            : ecuadorHour >= 12 && ecuadorHour < 18
            ? "¡Buenas tardes, "
            : "¡Buenas noches, "}
          {user.user?.nombre.split(" ")[0]}!
        </span>
        <motion.span
          initial={{ opacity: 0, left: -50 }}
          animate={{ opacity: 1, left: 0 }}
          transition={{ duration: 0.75, delay: 0.5 }}
          className="block text-sm text-stone-600 dark:text-stone-400"
        >
          Hoy es {ecuadorDate}
        </motion.span>
      </motion.h3>
      <motion.section
        variants={staggerContainer}
        className={`grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6`}
      >
        <motion.div variants={fadeInUp}>
          <Card className="h-52 p-4 md:p-5">
            <Link href="/registros/reposiciones" className="flex flex-col">
              <h3 className="text-slate-500 dark:text-slate-400 font-semibold text-base md:text-lg">
                Registros
              </h3>
              <p className="text-slate-400 dark:text-slate-600 text-xs md:text-sm font-normal">
                (Los números se inicializan mensualmente)
              </p>
              <Hr variant="red" />

              <div className="grid grid-cols-2 gap-3 mt-4">
                <motion.span className="text-2xl md:text-3xl font-semibold place-self-center text-orange-500 flex flex-row items-center justify-center">
                  <div className="flex flex-row gap-2 items-center">
                    <PendingRequests />
                    <span className="text-xs font-normal">
                      solicitudes pendientes
                    </span>
                  </div>
                </motion.span>
                <motion.span className="text-2xl md:text-3xl font-semibold place-self-center text-green-500 flex flex-row items-center justify-center">
                  <div className="flex flex-row gap-2 items-center">
                    <PaidRequests />
                    <span className="text-xs font-normal ml-2 flex flex-row">
                      solicitudes pagadas
                    </span>
                  </div>
                </motion.span>
                <motion.span className="text-2xl md:text-3xl font-semibold place-self-center text-red-500 flex flex-row items-center justify-center">
                  <div className="flex flex-row gap-2 items-center">
                    <RejectedRequests />
                    <span className="text-xs font-normal ml-2 flex flex-row">
                      solicitudes rechazadas
                    </span>
                  </div>
                </motion.span>
                <motion.span className="text-2xl md:text-3xl font-semibold place-self-center text-indigo-500 flex flex-row items-center justify-center">
                  <div className="flex flex-row gap-2 items-center">
                    <InRepositionRequests />
                    <span className="text-xs font-normal ml-2 flex flex-row">
                      solicitudes en reposición
                    </span>
                  </div>
                </motion.span>
              </div>
            </Link>
          </Card>
        </motion.div>

        {canSeeLogexInfo && (
          <>
            <motion.div variants={fadeInUp}>
              <Card className="h-52 p-4 md:p-5">
                <h3 className="text-slate-500 dark:text-slate-400 font-semibold text-base md:text-lg">
                  Personal activo de Logex
                </h3>
                <p className="opacity-0 text-xs md:text-sm font-normal">
                  (Los números se actualizan diariamente)
                </p>
                <Hr variant="red" />
                <div className="flex gap-3 mt-4">
                  <Personnel />
                </div>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="h-52 p-4 md:p-5">
                <h3 className="text-slate-500 dark:text-slate-400 font-semibold text-base md:text-lg">
                  Camiones activos de Logex
                </h3>
                <p className="opacity-0 text-xs md:text-sm font-normal">
                  (Los números se actualizan diariamente)
                </p>
                <Hr variant="red" />
                <div className="flex gap-3 mt-4">
                  <Transport />
                </div>
              </Card>
            </motion.div>
          </>
        )}
      </motion.section>

      <motion.section variants={fadeInUp} className="mt-8 md:mt-12 text-center">
        <motion.p
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-sm md:text-base lg:text-lg"
        >
          {isShiftOver ? (
            <span>
              ¡Lo lograste! Sobreviviste a otro día en el trabajo, ¡La jornada
              de hoy ha terminado! <span className="text-xl">🍻</span>🤣
            </span>
          ) : (
            <>
              {subtractHours() !== 1 ? "Quedan" : "Queda"} {subtractHours()}{" "}
              {subtractHours() !== 1 ? "horas" : "hora"} y {subtractMinutes()}{" "}
              minutos para que se termine la jornada, ¡&Aacute;nimo!{" "}
              <span className="text-3xl">🙌🏻</span>
            </>
          )}
        </motion.p>
      </motion.section>
    </motion.div>
  );
};

export default Home;
