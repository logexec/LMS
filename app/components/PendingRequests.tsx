"use client";

import { useEffect, useState } from "react";
import Loader from "../Loader";

const fetchRequests = async (): Promise<any> => {
  const responsePending = await fetch(
    "http://localhost:8000/api/requests?status=pending",
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    }
  );

  const responseRejected = await fetch(
    "http://localhost:8000/api/requests?status=rejected",
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    }
  );

  const responseApproved = await fetch(
    "http://localhost:8000/api/requests?status=approved",
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    }
  );

  if (!responsePending.ok) {
    throw new Error("Failed to fetch pending requests");
  }
  if (!responseApproved.ok) {
    throw new Error("Failed to fetch approved requests");
  }
  if (!responseRejected.ok) {
    throw new Error("Failed to fetch rejected requests");
  }

  const dataPending = await responsePending.json();
  const dataRejected = await responseRejected.json();
  const dataApproved = await responseApproved.json();
  return [dataPending, dataApproved, dataRejected];
};

export const PendingRequests = () => {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const requests = await fetchRequests();
        setRequests(requests);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return <Loader fullScreen={false} text="Cargando solicitudes..." />;
  }

  return (
    <>
      {requests.length}
      <span className="text-sm text-slate-400 font-normal ml-2">
        Pendientes
      </span>
    </>
  );
};

export const ApprovedRequests = () => {
  const [approvedRequests, setApprovedRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const requests = await fetchRequests();
        setApprovedRequests(requests);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return <Loader fullScreen={false} text="Cargando solicitudes..." />;
  }

  return (
    <>
      {approvedRequests.length}
      <span className="text-sm text-emerald-400 font-normal ml-2">
        Aprobadas
      </span>
    </>
  );
};

export const RejectedRequests = () => {
  const [rejectedRequests, setRejectedRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const requests = await fetchRequests();
        setRejectedRequests(requests);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return <Loader fullScreen={false} text="Cargando solicitudes..." />;
  }

  return (
    <>
      {rejectedRequests.length}
      <span className="text-sm text-red-400 font-normal ml-2">Rechazadas</span>
    </>
  );
};
