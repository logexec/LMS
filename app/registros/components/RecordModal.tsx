"use client";
import React, { useState } from "react";
import { Check, ScanSearch, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Status = "pending" | "approved" | "rejected" | "review";

interface Data {
  id: number;
  unique_id?: string;
  type: "discount" | "expense";
  status: Status;
  date?: string;
  invoice_number: string;
  account_id: number;
  amount: number;
  project: string;
  responsible_id: string | null;
  transport_id: string | null;
  attachment_path: string | "";
  note: string | "";
  created_at: string;
  updated_at: string;
}

interface RecordModalProps {
  children: React.ReactNode;
  data: Data;
}

interface Record {
  id: number;
  unique_id: string;
  type: "discount" | "expense";
  status: Status;
  request_date: string;
  invoice_number: number | string;
  account_id: number;
  amount: number;
  project: string;
  responsible_id: string;
  transport_id: string;
  attachment_path: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export function RecordModal({ children, data }: RecordModalProps) {
  const [record, setRecord] = useState<Record>();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOpen(true);
  };

  const handleOpenChange = async (isOpen: boolean) => {
    setOpen(isOpen);

    if (isOpen && !record) {
      setLoading(true);
      try {
        const newData = await fetchRecordData(data.id);
        setRecord(newData);
      } catch (error) {
        console.error("Error fetching record:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const fetchRecordData = async (id: number): Promise<Record> => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/requests?id=${id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "Application/json",
        },
        credentials: "include",
      }
    );

    if (!response.ok) throw new Error("Failed to fetch the record.");
    return response.json();
  };

  const handleOpen = async (isOpen: boolean) => {
    setOpen(isOpen);

    if (isOpen && !record) {
      setLoading(true);
      try {
        const newData = await fetchRecordData(data.id);
        setRecord(newData);
      } catch (error) {
        console.error("Error fetching record:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild className="cursor-pointer">
        {children}
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {data.type === "discount"
              ? "Información del Descuento"
              : "Información del Gasto"}
          </DialogTitle>
          <DialogDescription>
            Asegúrate de que la información cargada sea la correcta.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center h-32">
            <p>Cargando información...</p>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 flex-1 gap-2 mb-4">
              <div className="flex flex-col">
                <h5 className="text-slate-400 text-xs font-medium">
                  Fecha del gasto
                </h5>
                <span className="text-base text-slate-950">
                  {data.updated_at.split("T")[0]}
                </span>
              </div>

              <div className="flex flex-col">
                <h5 className="text-slate-400 text-xs font-medium">Tipo</h5>
                <span className="text-base text-slate-950">
                  {data.responsible_id !== undefined &&
                  data.responsible_id !== null &&
                  data.responsible_id.length > 1
                    ? "Nómina"
                    : "Transporte"}
                </span>
              </div>

              <div className="flex flex-col">
                <h5 className="text-slate-400 text-xs font-medium">Proyecto</h5>
                <span className="text-base text-slate-950">{data.project}</span>
              </div>

              <div className="flex flex-col">
                <h5 className="text-slate-400 text-xs font-medium">Cuenta</h5>
                <span className="text-base text-slate-950">
                  {data.account_id}
                </span>
              </div>

              <div className="flex flex-col">
                <h5 className="text-slate-400 text-xs font-medium">
                  No. Factura o Vale
                </h5>
                <span className="text-base text-slate-950">
                  {data.invoice_number}
                </span>
              </div>

              <div className="flex flex-col">
                <h5 className="text-slate-400 text-xs font-medium">Valor</h5>
                <span className="text-slate-950 font-medium text-lg">
                  ${data.amount}
                </span>
              </div>

              {data.responsible_id !== null &&
                data.responsible_id !== undefined &&
                data.responsible_id.length > 1 && (
                  <div className="flex flex-col">
                    <h5 className="text-slate-400 text-xs font-medium">
                      Responsable
                    </h5>
                    <span className="text-base text-slate-950 font-medium">
                      {data.responsible_id}
                    </span>
                  </div>
                )}

              {data.transport_id !== null &&
                data.transport_id !== undefined &&
                data.transport_id.length > 1 && (
                  <div className="flex flex-col">
                    <h5 className="text-slate-400 text-xs font-medium">
                      Placa
                    </h5>
                    <span className="text-base text-slate-950 font-medium">
                      {data.transport_id}
                    </span>
                  </div>
                )}

              <div className="flex flex-col">
                <h5 className="text-slate-400 text-xs font-medium">
                  Observación
                </h5>
                <span className="text-base text-slate-950">{data.note}</span>
              </div>

              <div className="flex flex-col">
                <h5 className="text-slate-400 text-xs font-medium">Adjunto</h5>
                <a
                  href={data.attachment_path}
                  className="text-blue-600 underline underline-offset-4"
                  download
                >
                  Descargar archivo
                </a>
              </div>

              <div className="flex flex-col col-span-1 max-w-min">
                <h5 className="text-slate-400 text-xs font-medium">Estado</h5>
                <p
                  className={`font-semibold text-center ${
                    data.status === "pending"
                      ? "text-orange-700"
                      : data.status === "rejected"
                      ? "text-red-700"
                      : data.status === "review"
                      ? "text-indigo-700"
                      : "text-emerald-700"
                  }`}
                >
                  {data.status === "pending"
                    ? "Pendiente"
                    : data.status === "rejected"
                    ? "Rechazado"
                    : data.status === "review"
                    ? "Revisar"
                    : "Aprobado"}
                </p>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="sm:justify-start">
          <div className="flex flex-row flex-wrap items-center justify-around gap-1 w-full">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    className="text-white bg-red-600 hover:bg-red-700"
                    onClick={() => {
                      console.log(
                        "¡Solicitud rechazada! (Agregar funcionalidad)"
                      );
                    }}
                  >
                    <X />
                    <span className="sr-only">Rechazar</span>
                    <span>Rechazar</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="bg-red-600 font-medium px-1.5 py-0.5 rounded-xl">
                    Rechazar
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button className="text-white bg-indigo-600 hover:bg-indigo-700">
                    <ScanSearch />
                    <span className="sr-only">Revisón</span>
                    <span>Revisón</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="bg-indigo-600 font-medium px-1.5 py-0.5 rounded-xl">
                    Revisón
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button className="text-white bg-emerald-600 hover:bg-emerald-700">
                    <Check />
                    <span className="sr-only">Aprobar</span>
                    <span>Aprobar</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="bg-emerald-600 font-medium px-1.5 pt-0.5 pb-1 rounded-xl">
                    Aprobar
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
