"use client";

import { motion } from "motion/react";
import Card from "./components/Card";
import Link from "next/link";
import Hr from "./components/Hr";
import Personnel from "./components/Personnel";
import Transport from "./components/Transport";
import {
  PendingRequests,
  ApprovedRequests,
  RejectedRequests,
  InRepositionRequests,
} from "./components/Requests";
import ChartComponent from "./components/Chart";
import { useEffect, useState } from "react";

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

const subtractHours = (date: Date) => {
  const currentHour = date.getHours();
  if (currentHour < 8 || currentHour >= 16) {
    return 0;
  }
  const remainingHours = 16 - currentHour;
  if (remainingHours <= 0 || remainingHours > 9) {
    return 0;
  }
  return remainingHours;
};

const subtractMinutes = (date: Date) => {
  const currentHour = date.getHours();
  const currentMinute = date.getMinutes();

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
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 0
  );
  const [isShiftOver, setIsShiftOver] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    const checkShiftStatus = () => {
      setIsShiftOver(
        subtractHours(new Date()) === 0 && subtractMinutes(new Date()) === 0
      );
    };

    window.addEventListener("resize", handleResize);
    const interval = setInterval(checkShiftStatus, 60000);

    checkShiftStatus();

    return () => {
      window.removeEventListener("resize", handleResize);
      clearInterval(interval);
    };
  }, []);

  const getChartDimensions = () => {
    if (windowWidth < 640) {
      // sm
      return { width: windowWidth - 40, height: 300 };
    } else if (windowWidth < 1024) {
      // md
      return { width: windowWidth - 80, height: 350 };
    }
    return { width: 500, height: 400 }; // lg y superiores
  };

  const chartDimensions = getChartDimensions();

  return (
    <motion.div
      initial="initial"
      animate="animate"
      className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8"
    >
      <motion.section
        variants={staggerContainer}
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6"
      >
        <motion.div variants={fadeInUp}>
          <Card className="h-52 p-4 md:p-5">
            <Link href="/gestion/solicitudes" className="block ">
              <h3 className="text-slate-500 font-semibold text-base md:text-lg">
                Solicitudes
              </h3>
              <p className="text-slate-400 text-xs md:text-sm font-normal">
                (Los números se inicializan mensualmente)
              </p>
              <Hr variant="red" />
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
                <motion.span
                  className="text-2xl md:text-3xl font-semibold"
                  whileHover={{ scale: 1.05 }}
                >
                  <PendingRequests />
                </motion.span>
                <motion.span
                  className="text-2xl md:text-3xl font-semibold"
                  whileHover={{ scale: 1.05 }}
                >
                  <ApprovedRequests />
                </motion.span>
                <motion.span
                  className="text-2xl md:text-3xl font-semibold"
                  whileHover={{ scale: 1.05 }}
                >
                  <RejectedRequests />
                </motion.span>
                <motion.span
                  className="text-2xl md:text-3xl font-semibold col-span-2 lg:col-span-3 place-self-center"
                  whileHover={{ scale: 1.05 }}
                >
                  <InRepositionRequests />
                </motion.span>
              </div>
            </Link>
          </Card>
        </motion.div>

        <motion.div variants={fadeInUp}>
          <Card className="h-52 p-4 md:p-5">
            <h3 className="text-slate-500 font-semibold text-base md:text-lg">
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
            <h3 className="text-slate-500 font-semibold text-base md:text-lg">
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
      </motion.section>

      <motion.section
        variants={fadeInUp}
        className="mt-8 md:mt-12 lg:mt-16 grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8"
      >
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:col-span-3">
          <motion.div variants={fadeInUp} className="w-full">
            <ChartComponent
              width={chartDimensions.width}
              height={chartDimensions.height}
              currentMonth={true}
            />
          </motion.div>
          <motion.div variants={fadeInUp} className="w-full">
            <ChartComponent
              width={chartDimensions.width}
              height={chartDimensions.height}
              currentMonth={false}
            />
          </motion.div>
        </section>

        <motion.section
          variants={staggerContainer}
          className="grid grid-cols-2 lg:grid-cols-1 gap-4"
        >
          {[
            {
              label: "Ingresos del mes",
              amount: 100000,
              color: "text-green-600",
            },
            {
              label: "Egresos del mes",
              amount: -100000,
              color: "text-red-600",
            },
            {
              label: "Balance del mes",
              amount: 100000,
              color: "text-blue-600",
            },
            {
              label: "Ingresos del mes",
              amount: 100000,
              color: "text-orange-600",
            },
          ].map((item, index) => (
            <motion.div
              key={`${item}-${index}`}
              variants={fadeInUp}
              whileHover={{ scale: 1.02 }}
              className="w-full"
            >
              <Card className="p-4">
                <p className="text-slate-400/80 font-medium text-sm mb-2">
                  {item.label}
                </p>
                <h3 className="font-semibold text-base">
                  <span className={`text-xl md:text-2xl ${item.color}`}>
                    {item.amount < 0 && "-"}
                    <strong>$</strong>
                    {Math.abs(item.amount).toLocaleString()}
                  </span>
                </h3>
              </Card>
            </motion.div>
          ))}
        </motion.section>
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
              {subtractHours(new Date()) !== 1 ? "Quedan" : "Queda"}{" "}
              {subtractHours(new Date())}{" "}
              {subtractHours(new Date()) !== 1 ? "horas" : "hora"} y{" "}
              {subtractMinutes(new Date())} minutos para que se termine la
              jornada, ¡&Aacute;nimo! <span className="text-3xl">🙌🏻</span>
            </>
          )}
        </motion.p>
      </motion.section>
    </motion.div>
  );
};

export default Home;
