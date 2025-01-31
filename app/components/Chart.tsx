"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Chart from "chart.js/auto";
import type { ChartData, ChartOptions } from "chart.js";
import Loader from "../Loader";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface ChartComponentProps {
  width?: number;
  height?: number;
  currentMonth?: boolean;
}

interface RequestData {
  pendingRequests: number[];
  rejectedRequests: number[];
  paidRequests: number[];
  inRepositionRequests: number[];
}

const getData = async (currentMonth: boolean = false): Promise<RequestData> => {
  const fetchData = async (status: string): Promise<number[]> => {
    try {
      const url = currentMonth
        ? `${process.env.NEXT_PUBLIC_API_URL}/requests?status=${status}&action=count&currentMonth=true`
        : `${
            process.env.NEXT_PUBLIC_API_URL
          }/requests?status=${status}&action=count&year=${new Date().getFullYear()}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      if (Array.isArray(data)) return data.map(Number);
      if (typeof data === "number") return [data];
      return [];
    } catch (error) {
      toast.error(
        "Error al obtener los datos. Por favor, refresca la página o contacta a soporte.",
        {
          duration: 5000,
        }
      );
      console.error(`Error fetching ${status} data:`, error);
      return [];
    }
  };

  try {
    const [
      pendingRequests,
      rejectedRequests,
      paidRequests,
      inRepositionRequests,
    ] = await Promise.all([
      fetchData("pending"),
      fetchData("rejected"),
      fetchData("paid"),
      fetchData("in_reposition"),
    ]);

    return {
      pendingRequests,
      rejectedRequests,
      paidRequests,
      inRepositionRequests,
    };
  } catch (error) {
    console.error("Error in getData:", error);
    toast.error(
      "Error al obtener los datos. Por favor, refresca la página o contacta a soporte.",
      {
        duration: 5000,
      }
    );
    return {
      pendingRequests: [],
      rejectedRequests: [],
      paidRequests: [],
      inRepositionRequests: [],
    };
  }
};

const ChartComponent: React.FC<ChartComponentProps> = ({
  width: initialWidth = 800,
  height: initialHeight = 800,
  currentMonth = false,
}) => {
  const chartInstanceRef = useRef<Chart | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartData, setChartData] = useState<RequestData | null>(null);
  const [dimensions, setDimensions] = useState({
    width: initialWidth,
    height: initialHeight,
  });

  const updateDimensions = useCallback(() => {
    if (containerRef.current) {
      const container = containerRef.current;
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      const aspectRatio = initialWidth / initialHeight;

      let newWidth = containerWidth;
      let newHeight = containerWidth / aspectRatio;

      // Asegurarse de que el gráfico no sea demasiado alto en dispositivos móviles
      if (window.innerWidth < 768 && newHeight > 400) {
        newHeight = 400;
      }

      setDimensions({ width: newWidth, height: newHeight });
    }
  }, [initialWidth, initialHeight]);

  useEffect(() => {
    updateDimensions();
    const handleResize = () => {
      updateDimensions();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [updateDimensions]);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getData(currentMonth);
      setChartData(data);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Error al obtener los datos"
      );
      toast.error("Error al obtener los datos");
    } finally {
      setIsLoading(false);
    }
  }, [currentMonth]);

  useEffect(() => {
    fetchData();
    // Actualizar datos cada 5 minutos
    const interval = setInterval(fetchData, 300000);
    return () => clearInterval(interval);
  }, [fetchData]);

  useEffect(() => {
    if (!chartData || !canvasRef.current) return;

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) {
      setError("No se pudo obtener el contexto del canvas");
      return;
    }

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const today = new Date();
    const currentDay = today.getDate();
    const labels = currentMonth
      ? Array.from({ length: currentDay }, (_, i) => `${i + 1}`)
      : [
          "Enero",
          "Febrero",
          "Marzo",
          "Abril",
          "Mayo",
          "Junio",
          "Julio",
          "Agosto",
          "Septiembre",
          "Octubre",
          "Noviembre",
          "Diciembre",
        ];

    const getMaxValue = () => {
      const allValues = [
        ...chartData.pendingRequests,
        ...chartData.rejectedRequests,
        ...chartData.paidRequests,
        ...chartData.inRepositionRequests,
      ];
      return Math.max(...allValues, 1) * 1.2;
    };

    const maxValue = getMaxValue();

    const data: ChartData = {
      labels,
      datasets: [
        {
          label: "Solicitudes pendientes",
          data: chartData.pendingRequests,
          backgroundColor: "rgba(255, 206, 86, 0.2)",
          borderColor: "rgba(255, 206, 86, 1)",
          borderWidth: 2,
          tension: 0.4,
          fill: true,
        },
        {
          label: "Solicitudes rechazadas",
          data: chartData.rejectedRequests,
          backgroundColor: "rgba(255, 99, 132, 0.2)",
          borderColor: "rgba(255, 99, 132, 1)",
          borderWidth: 2,
          tension: 0.4,
          fill: true,
        },
        {
          label: "Solicitudes pagadas",
          data: chartData.paidRequests,
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 2,
          tension: 0.4,
          fill: true,
        },
        {
          label: "Solicitudes en proceso de reposición",
          data: chartData.inRepositionRequests,
          backgroundColor: "rgba(54, 162, 235, 0.2)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 2,
          tension: 0.4,
          fill: true,
        },
      ],
    };

    const options: ChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          suggestedMax: maxValue,
          ticks: {
            stepSize: Math.ceil(maxValue / 10),
            font: {
              size: window.innerWidth < 768 ? 10 : 12,
            },
          },
        },
        x: {
          grid: {
            display: false,
          },
          ticks: {
            font: {
              size: window.innerWidth < 768 ? 10 : 12,
            },
          },
        },
      },
      plugins: {
        tooltip: {
          callbacks: {
            title: (context) => {
              if (!currentMonth) return context[0].label;
              const day = context[0].label;
              const date = new Date();
              const month = date.toLocaleString("es-ES", { month: "long" });
              return `${day} de ${month}`;
            },
          },
          enabled: true,
          padding: 12,
          mode: "index",
          intersect: false,
        },
        title: {
          display: true,
          text: currentMonth
            ? `Solicitudes del mes de ${today.toLocaleString("es-ES", {
                month: "long",
              })}`
            : "Solicitudes del año",
          font: {
            size: window.innerWidth < 768 ? 14 : 16,
            weight: "bold",
          },
          padding: {
            top: 10,
            bottom: 15,
          },
        },
        legend: {
          position:
            window.innerWidth < 768 ? ("bottom" as const) : ("top" as const),
          labels: {
            padding: window.innerWidth < 768 ? 10 : 20,
            usePointStyle: true,
            font: {
              size: window.innerWidth < 768 ? 10 : 12,
            },
          },
        },
      },
      interaction: {
        intersect: false,
        mode: "nearest",
      },
    };

    try {
      chartInstanceRef.current = new Chart(ctx, {
        type: "line",
        data,
        options,
      });
    } catch (error) {
      console.error("Error creating chart:", error);
      setError("Error al crear el gráfico");
      toast.error("Error al crear el gráfico");
    }

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [chartData, currentMonth, dimensions]);

  const retryFetch = () => {
    fetchData();
  };

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full h-full relative bg-white rounded-lg border border-slate-100 shadow p-1 sm:p-2 md:p-4"
    >
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Loader fullScreen={false} text="Cargando gráfico..." />
          </motion.div>
        ) : error ? (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center p-4"
          >
            <p className="text-red-500 text-center mb-4">{error}</p>
            <button
              onClick={retryFetch}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Reintentar
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="chart"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              width: `${dimensions.width}px`,
              height: `${dimensions.height}px`,
            }}
            className="transition-all duration-300 ease-in-out"
          >
            <canvas
              ref={canvasRef}
              width={dimensions.width}
              height={dimensions.height}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ChartComponent;
