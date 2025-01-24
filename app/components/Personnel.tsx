"use client";

import { useState } from "react";
import { useEffect } from "react";
import Loader from "../Loader";

const fetchPersonnel = async (): Promise<any> => {
  const response = await fetch("http://localhost:8000/api/responsibles", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch personnel");
  }

  const data = await response.json();
  return data;
};

const Personnel = () => {
  const [personnel, setPersonnel] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const personnel = await fetchPersonnel();
        setPersonnel(personnel);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return <Loader fullScreen={false} text="Cargando personal..." />;
  }

  return <>{personnel.length}</>;
};

export default Personnel;
