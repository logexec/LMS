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
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import axios, { AxiosInstance, AxiosResponse } from "axios";
import ComboBox from "../ui/Combobox";
import { CheckIcon, XIcon } from "lucide-react";
import { Factura } from "@/types/factura";

interface ProyectoLatinium {
  value: string;
  label: string;
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
  const [filterCuentaContable, setFilterCuentaContable] = useState<string>("");

  const [proyectosLatinium, setProyectosLatinium] = useState<
    ProyectoLatinium[]
  >([]);
  const [centrosCosto, setCentrosCosto] = useState<ProyectoLatinium[]>([]);
  const [accounts, setAccounts] = useState<ProyectoLatinium[]>([]);

  useEffect(() => {
    // Fetch proyectos
    apiClient
      .get<{ data: ProyectoLatinium[] }>("/latinium/projects")
      .then((res) => setProyectosLatinium(res.data.data))
      .catch((err) => {
        console.error(err);
        toast.error("No se pudieron cargar los proyectos");
      });

    // Fetch centros de costo
    apiClient
      .get<{ data: ProyectoLatinium[] }>("/latinium/centro-costo")
      .then((res) => setCentrosCosto(res.data.data))
      .catch((err) => {
        console.error(err);
        toast.error("No se pudieron cargar los centros de costo");
      });

    // Fetch cuentas contables
    apiClient
      .get<{ data: ProyectoLatinium[] }>("/latinium/accounts")
      .then((res) => setAccounts(res.data.data))
      .catch((err) => {
        console.error(err);
        toast.error("No se pudieron cargar las cuentas contables");
      });
  }, []);

  const fetchFacturas = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = {};
      if (filterMes) params.mes = parseInt(filterMes.split("-")[1], 10);
      if (filterProyecto) params.project = filterProyecto;
      if (filterCentro) params.centro_costo = filterCentro;
      if (filterCuentaContable) params.cuenta_contable = filterCuentaContable;

      const response: AxiosResponse<{ data: any[] }> = await apiClient.get(
        "/facturas",
        { params }
      );
      const mapped: Factura[] = response.data.data.map((item) => ({
        id: item.id,
        clave_acceso: item.clave_acceso,

        // Emisor y Comprador
        ruc_emisor: item.ruc_emisor,
        razon_social_emisor: item.razon_social_emisor,
        nombre_comercial_emisor: item.nombre_comercial_emisor,
        identificacion_comprador: item.identificacion_comprador,
        razon_social_comprador: item.razon_social_comprador,
        direccion_comprador: item.direccion_comprador,

        // Descripción (ahora un objeto)
        descripcion: {
          id: item.details.id,
          descripcion: item.details.descripcion,
        },

        // Datos de factura
        estab: item.estab,
        pto_emi: item.pto_emi,
        secuencial: item.secuencial,
        invoice_serial: item.invoice_serial,
        ambiente: item.ambiente,
        fecha_emision: item.fecha_emision,
        fecha_autorizacion: item.fecha_autorizacion,
        tipo_identificacion_comprador: item.tipo_identificacion_comprador,
        cod_doc: item.cod_doc,

        // Valores económicos
        total_sin_impuestos: parseFloat(item.total_sin_impuestos),
        importe_total: parseFloat(item.importe_total),
        iva: item.iva != null ? parseFloat(item.iva) : null,
        propina: item.propina != null ? parseFloat(item.propina) : null,
        moneda: item.moneda,
        forma_pago: item.forma_pago,
        placa: item.placa,

        // Campos editables / de flujo
        mes: item.mes,
        project: item.project,
        centro_costo: item.centro_costo,
        notas: item.notas,
        observacion: item.observacion,
        contabilizado: item.contabilizado ? "CONTABILIZADO" : "PENDIENTE",
        cuenta_contable: item.cuenta_contable,
        proveedor_latinium: item.proveedor_latinium,
        nota_latinium: item.nota_latinium,

        // Estado y referencias contables
        estado: item.estado,
        numero_asiento: item.numero_asiento,
        numero_transferencia: item.numero_transferencia,
        correo_pago: item.correo_pago,

        // Asociación y almacenamiento
        purchase_order_id: item.purchase_order_id,
        empresa: item.empresa,
        xml_path: item.xml_path,
        pdf_path: item.pdf_path,

        // Timestamps y soft delete
        deleted_at: item.deleted_at,
        created_at: item.created_at,
        updated_at: item.updated_at,
      }));

      setFacturas(mapped);
    } catch (err) {
      console.error(err);
      toast.error("Error al cargar facturas");
    } finally {
      setLoading(false);
    }
  }, [filterMes, filterProyecto, filterCentro, filterCuentaContable]);

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
      console.error(err);
      toast.error("No se pudo actualizar");
    }
  };

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
          />
        </div>
        <div className="relative">
          <small className="absolute -top-5 left-0">Proyecto</small>
          <ComboBox
            selected={filterProyecto}
            options={proyectosLatinium}
            onChange={setFilterProyecto}
          />
        </div>
        <div className="relative">
          <small className="absolute -top-5 left-0">Centro Costo</small>
          <ComboBox
            selected={filterCentro}
            options={centrosCosto}
            onChange={setFilterCentro}
            isDisabled={centrosCosto.length === 0}
          />
        </div>
        <div className="relative">
          <small className="absolute -top-5 left-0">Cuenta Contable</small>
          <ComboBox
            selected={filterCuentaContable}
            options={accounts}
            onChange={setFilterCuentaContable}
            isDisabled={accounts.length === 0}
          />
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
                "Descripción",
                "Observación",
                "Contabilizado",
                "Cuenta Contable",
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
              facturas.map((f) => {
                console.table(f);
                return (
                  <TableRow key={f.id}>
                    <TableCell>{f.mes}</TableCell>
                    <TableCell>{f.razon_social_emisor}</TableCell>
                    <TableCell>{f.ruc_emisor}</TableCell>
                    <TableCell>{f.secuencial}</TableCell>
                    <TableCell>{f.fecha_emision}</TableCell>
                    <TableCell>{f.fecha_autorizacion}</TableCell>
                    <TableCell>${f.importe_total}</TableCell>
                    <TableCell>
                      <ComboBox
                        selected={f.project}
                        options={proyectosLatinium}
                        onChange={(v) => updateFactura(f.id, { project: v })}
                      />
                    </TableCell>
                    <TableCell>
                      <ComboBox
                        selected={f.centro_costo}
                        options={centrosCosto}
                        onChange={(v) =>
                          updateFactura(f.id, { centro_costo: v })
                        }
                      />
                    </TableCell>
                    <TableCell>{f.descripcion.descripcion}</TableCell>
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
                      <span className="w-full p-0.5 flex justify-center items-center">
                        {f.contabilizado === "CONTABILIZADO" ? (
                          <CheckIcon className="size-4 text-green-500" />
                        ) : (
                          <XIcon className="size-4 text-red-500" />
                        )}
                      </span>
                    </TableCell>
                    <TableCell>
                      <ComboBox
                        selected={f.cuenta_contable}
                        options={accounts}
                        onChange={(v) =>
                          updateFactura(f.id, { cuenta_contable: v })
                        }
                      />
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
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
