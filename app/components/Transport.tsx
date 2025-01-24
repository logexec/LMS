"use client";

import { useEffect, useState } from "react";
import Loader from "../Loader";

const fetchVehicles = async (): Promise<any> => {
  const response = await fetch("http://localhost:8000/api/transports", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch users");
  }

  const data = await response.json();
  return data;
};

const Transport = () => {
  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const vehicles = await fetchVehicles();
        setVehicles(vehicles);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return <Loader fullScreen={false} text="Cargando vehículos..." />;
  }

  return <>{vehicles.length}</>;
};

export default Transport;
