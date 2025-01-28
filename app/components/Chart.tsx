"use client";
import { useEffect, useState, useRef } from "react";
import Chart from "chart.js/auto";

interface ChartComponentProps {
  currentMonth: string;
}

const ChartComponent: React.FC<ChartComponentProps> = ({ currentMonth }) => {
  const [pendingData, setPendingData] = useState<any>(null);
  const [approvedData, setApprovedData] = useState<any>(null);
  const [rejectedData, setRejectedData] = useState<any>(null);
  const chartRef = useRef<HTMLCanvasElement | null>(null); // Ref para el canvas
  const chartInstanceRef = useRef<Chart | null>(null); // Ref para la instancia del gráfico

  // Función para hacer el fetch de las solicitudes
  const fetchRequests = async (status: string): Promise<any> => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/requests?status=${status}&month=${currentMonth}&action=count`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch ${status} requests`);
    }

    const data = await response.json();
    return data;
  };

  useEffect(() => {
    // Fetch de las solicitudes para cada estado
    const fetchData = async () => {
      try {
        const pending = await fetchRequests("pending");
        const approved = await fetchRequests("approved");
        const rejected = await fetchRequests("rejected");

        setPendingData(pending);
        setApprovedData(approved);
        setRejectedData(rejected);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, [currentMonth]); // Re-fetch si cambia el mes

  useEffect(() => {
    // Si no hay datos, no hacer nada
    if (!pendingData || !approvedData || !rejectedData) return;

    // Si hay un canvas, destruir el gráfico anterior
    if (chartRef.current) {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }

      // Crear una nueva instancia de gráfico con los datos obtenidos
      chartInstanceRef.current = new Chart(chartRef.current, {
        type: "bar", // Puedes cambiar el tipo de gráfico aquí
        data: {
          labels: ["Pending", "Approved", "Rejected"], // Etiquetas de las barras
          datasets: [
            {
              label: "Requests Count",
              data: [pendingData.count, approvedData.count, rejectedData.count], // Datos de la respuesta
              backgroundColor: ["#FFB74D", "#81C784", "#E57373"], // Colores de las barras
              borderColor: ["#FF9800", "#66BB6A", "#F44336"],
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: "top",
            },
          },
          scales: {
            x: {
              beginAtZero: true,
            },
            y: {
              beginAtZero: true,
            },
          },
        },
      });
    }

    // Cleanup al desmontar el componente
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [pendingData, approvedData, rejectedData]); // Dependemos de los datos obtenidos

  return <canvas ref={chartRef}></canvas>;
};

export default ChartComponent;
