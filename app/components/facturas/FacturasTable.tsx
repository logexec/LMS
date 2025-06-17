/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHead,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import axios, { AxiosInstance, AxiosResponse } from "axios";

interface ApiNote {
  id: number;
  name: string;
  description: string;
}

interface Factura {
  id: number;
  mes: number;
  razon_social_emisor: string;
  ruc_emisor: string;
  invoice_serial: string;
  fecha_emision: string;
  fecha_autorizacion: string;
  clave_acceso: string;
  importe_total: number;
  project: string | null;
  centro_costo: string | null;
  notas: string;
  observacion: string | null;
  contabilizado: boolean;
  tipo: string | null;
  proveedor_latinium: string | null;
  nota_latinium: string | null;
}

const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  timeout: 120000,
});

export default function FacturasTable() {
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterMes, setFilterMes] = useState<string>("");
  const [filterProyecto, setFilterProyecto] = useState<string>("");
  const [filterCentro, setFilterCentro] = useState<string>("");
  const [filterTipo, setFilterTipo] = useState<string>("");

  const fetchFacturas = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = {};
      if (filterMes) params.mes = parseInt(filterMes.split("-")[1], 10);
      if (filterProyecto) params.project = filterProyecto;
      if (filterCentro) params.centro_costo = filterCentro;
      if (filterTipo) params.tipo = filterTipo;

      const response: AxiosResponse<{ data: any[] }> = await apiClient.get(
        "/facturas",
        { params }
      );
      const mapped: Factura[] = response.data.data.map((item) => ({
        id: item.id,
        mes: item.mes,
        razon_social_emisor: item.razon_social_emisor,
        ruc_emisor: item.ruc_emisor,
        invoice_serial: item.invoice_serial,
        fecha_emision: item.fecha_emision,
        fecha_autorizacion: item.fecha_autorizacion,
        clave_acceso: item.clave_acceso,
        importe_total: parseFloat(item.importe_total),
        project: item.project,
        centro_costo: item.centro_costo,
        notas: (item.notes as ApiNote[])
          .map((n) => `${n.name}: ${n.description}`)
          .join(", "),
        observacion: item.observacion,
        contabilizado: item.contabilizado,
        tipo: item.tipo,
        proveedor_latinium: item.proveedor_latinium,
        nota_latinium: item.nota_latinium,
      }));
      setFacturas(mapped);
    } catch (err) {
      toast.error("Error al cargar facturas");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filterMes, filterProyecto, filterCentro, filterTipo]);

  useEffect(() => {
    fetchFacturas();
  }, [fetchFacturas]);

  const updateFactura = async (id: number, data: Partial<Factura>) => {
    try {
      await apiClient.patch(`/facturas/${id}`, data);
      setFacturas((prev) =>
        prev.map((f) => (f.id === id ? ({ ...f, ...data } as Factura) : f))
      );
      toast.success("Factura actualizada");
    } catch (err) {
      toast.error("No se pudo actualizar");
      console.error(err);
    }
  };

  const renderSelect = (
    value: string | null,
    options: string[],
    onChange: (v: string) => void
  ) => (
    <Select value={value || "0"} onValueChange={onChange}>
      <SelectTrigger className="w-[140px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="0" defaultChecked disabled>
          Selecciona
        </SelectItem>
        {options.map((o) => (
          <SelectItem key={o} value={o}>
            {o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  return (
    <div className="space-y-6">
      {/* filtros */}
      <div className="flex gap-4 flex-wrap pt-3">
        <div className="relative">
          <small className="absolute -top-5 left-0">Mes</small>
          <Input
            type="month"
            value={filterMes}
            onChange={(e) => setFilterMes(e.target.value)}
            className="max-w-[180px]"
            placeholder="Filtrar por mes"
          />
        </div>
        <div className="relative">
          <small className="absolute -top-5 left-0">Proyecto</small>
          {renderSelect(
            filterProyecto,
            ["Proyecto A", "Proyecto B"],
            setFilterProyecto
          )}
        </div>
        <div className="relative">
          <small className="absolute -top-5 left-0">Centro Costo</small>
          {renderSelect(filterCentro, ["CC101", "CC202"], setFilterCentro)}
        </div>
        <div className="relative">
          <small className="absolute -top-5 left-0">Tipo</small>
          {renderSelect(filterTipo, ["Bienes", "Servicios"], setFilterTipo)}
        </div>
      </div>

      <div className="h-full overflow-auto border border-gray-200 rounded-xl p-2">
        <Table>
          <TableHeader>
            <TableRow>
              {[
                "Mes",
                "Proveedor",
                "RUC",
                "Serie Factura",
                "Fecha Emisión",
                "Autorización",
                "Precio",
                "Proyecto",
                "Centro Costo",
                "Notas",
                "Observación",
                "Contabilizado",
                "Tipo",
                "Proveedor Latinium",
                "Nota Latinium",
              ].map((h) => (
                <TableHead key={h}>{h}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={15} className="text-center p-4">
                  Cargando...
                </TableCell>
              </TableRow>
            ) : facturas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={15} className="text-center p-4">
                  No hay facturas
                </TableCell>
              </TableRow>
            ) : (
              facturas.map((f) => (
                <TableRow key={f.id}>
                  <TableCell>{f.mes}</TableCell>
                  <TableCell>{f.razon_social_emisor}</TableCell>
                  <TableCell>{f.ruc_emisor}</TableCell>
                  <TableCell>{f.invoice_serial}</TableCell>
                  <TableCell>
                    {new Date(f.fecha_emision).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {new Date(f.fecha_autorizacion).toLocaleDateString()}
                  </TableCell>
                  <TableCell>${f.importe_total.toFixed(2)}</TableCell>
                  <TableCell>
                    {renderSelect(
                      f.project,
                      ["Proyecto A", "Proyecto B"],
                      (v) => updateFactura(f.id, { project: v })
                    )}
                  </TableCell>
                  <TableCell>
                    {renderSelect(f.centro_costo, ["CC101", "CC202"], (v) =>
                      updateFactura(f.id, { centro_costo: v })
                    )}
                  </TableCell>
                  <TableCell>
                    <Input
                      value={f.notas}
                      className="w-max max-w-lg"
                      onBlur={(e) =>
                        updateFactura(f.id, { notas: e.target.value })
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={f.observacion || ""}
                      className="w-max max-w-lg"
                      onBlur={(e) =>
                        updateFactura(f.id, { observacion: e.target.value })
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Checkbox
                      checked={f.contabilizado}
                      onCheckedChange={(v) =>
                        updateFactura(f.id, { contabilizado: v === true })
                      }
                    />
                  </TableCell>
                  <TableCell>
                    {renderSelect(f.tipo, ["Bienes", "Servicios"], (v) =>
                      updateFactura(f.id, { tipo: v })
                    )}
                  </TableCell>
                  <TableCell>
                    <Input
                      value={f.proveedor_latinium || ""}
                      onBlur={(e) =>
                        updateFactura(f.id, {
                          proveedor_latinium: e.target.value,
                        })
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={f.nota_latinium || ""}
                      onBlur={(e) =>
                        updateFactura(f.id, { nota_latinium: e.target.value })
                      }
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
