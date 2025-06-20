"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FacturasTable from "../components/facturas/FacturasTable";
import {
  CheckIcon,
  ClockFadingIcon,
  FileUpIcon,
  UploadIcon,
} from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCallback, useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Factura, ParsedFactura } from "@/types/factura";
import api from "@/services/axios";
import { toast } from "sonner";
import axios, { AxiosInstance, AxiosResponse } from "axios";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { XmlDropzone } from "../components/facturas/XmlDropzone";
import { enviarFacturas } from "./importar/actions";

const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  timeout: 120_000,
});

export default function FacturasPage() {
  const [selectedValue, setSelectedValue] = useState("PREBAM");
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("tab-1");

  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const from = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    .toISOString()
    .split("T")[0];
  const [fromDate, setFromDate] = useState(from);
  const [toDate, setToDate] = useState(today);

  const [uploadedFacturas, setUploadedFacturas] = useState<ParsedFactura[]>([]);

  const fetchFacturas = useCallback(async () => {
    setLoading(true);
    try {
      const resp: AxiosResponse<{ data: Factura[] }> = await apiClient.get(
        "/facturas",
        {
          params: {
            empresa:
              selectedValue === "PREBAM" ? "0992301066001" : "1792162696001",
            desde: fromDate,
            hasta: toDate,
            ready: activeTab === "tab-2" ? true : false,
          },
        }
      );
      setFacturas(
        resp.data.data.map((item) => ({
          id: item.id,
          clave_acceso: item.clave_acceso,
          ruc_emisor: item.ruc_emisor,
          razon_social_emisor: item.razon_social_emisor,
          nombre_comercial_emisor: item.nombre_comercial_emisor,
          identificacion_comprador: item.identificacion_comprador,
          razon_social_comprador: item.razon_social_comprador,
          direccion_comprador: item.direccion_comprador,
          details: {
            id: item.details.id,
            descripcion: item.details.descripcion,
          },
          descripcion: {
            id: item.details.id,
            descripcion: item.details.descripcion,
          },
          estab: item.estab,
          pto_emi: item.pto_emi,
          secuencial: item.secuencial,
          invoice_serial: item.invoice_serial,
          ambiente: item.ambiente,
          fecha_emision: item.fecha_emision,
          fecha_autorizacion: item.fecha_autorizacion,
          tipo_identificacion_comprador: item.tipo_identificacion_comprador,
          cod_doc: item.cod_doc,
          total_sin_impuestos: item.total_sin_impuestos,
          importe_total: item.importe_total,
          iva: item.iva != null ? item.iva : null,
          propina: item.propina != null ? item.propina : null,
          moneda: item.moneda,
          forma_pago: item.forma_pago,
          placa: item.placa,
          mes: item.mes,
          project: item.project,
          centro_costo: item.centro_costo,
          notas: item.notas,
          observacion: item.observacion,
          contabilizado: item.contabilizado ? "CONTABILIZADO" : "PENDIENTE",
          cuenta_contable: item.cuenta_contable,
          proveedor_latinium: item.proveedor_latinium,
          nota_latinium: item.nota_latinium,
          estado: item.estado,
          numero_asiento: item.numero_asiento,
          numero_transferencia: item.numero_transferencia,
          correo_pago: item.correo_pago,
          purchase_order_id: item.purchase_order_id,
          empresa: item.empresa,
          xml_path: item.xml_path,
          pdf_path: item.pdf_path,
          deleted_at: item.deleted_at,
          created_at: item.created_at,
          updated_at: item.updated_at,
        }))
      );
    } finally {
      setLoading(false);
    }
  }, [selectedValue, fromDate, toDate, activeTab]);

  useEffect(() => {
    fetchFacturas();
  }, [activeTab, fromDate, toDate, fetchFacturas]);

  const updateFactura = async (id: number, data: Partial<Factura>) => {
    try {
      await api.patch(`/facturas/${id}`, data);
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
    <main>
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as "tab-1" | "tab-2")}
        className="items-center"
      >
        <div className="flex items-center justify-between">
          <TabsList className="h-auto rounded-none border-b bg-transparent p-0">
            <TabsTrigger
              value="tab-1"
              className="data-[state=active]:after:bg-primary relative flex-col rounded-none px-4 py-2 text-xs after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none text-gray-500 data-[state=active]:text-red-700"
            >
              <ClockFadingIcon
                className="mb-1.5 opacity-60"
                size={16}
                aria-hidden="true"
              />
              Pendientes
            </TabsTrigger>
            <TabsTrigger
              value="tab-2"
              className="data-[state=active]:after:bg-primary relative flex-col rounded-none px-4 py-2 text-xs after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none text-gray-500 data-[state=active]:text-red-700"
            >
              <CheckIcon
                className="mb-1.5 opacity-60"
                size={16}
                aria-hidden="true"
              />
              Completas
            </TabsTrigger>
          </TabsList>

          <AlertDialog>
            <AlertDialogTrigger className="bg-red-600 text-white rounded font-bold px-2.5 py-1 shadow hover:bg-red-500 transition-all duration-200 flex flex-row items-center justify-center space-x-2.5">
              <FileUpIcon className="size-5" />
              <span>Subir XML</span>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-h-[450ox] max-w-[810px] overflow-auto">
              <AlertDialogTitle>Adjuntar facturas</AlertDialogTitle>
              <AlertDialogDescription>
                Carga aqu&iacute; los archivos xml &uacute;nicamente o un
                archivo .zip con las facturas
              </AlertDialogDescription>
              <XmlDropzone
                onChange={(facturasXml) => setUploadedFacturas(facturasXml)}
              />
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={async () => {
                    const toastId = toast.loading("Importando facturas...");
                    try {
                      const result = await enviarFacturas(
                        uploadedFacturas.map((f) => f.rawFile)
                      );
                      toast.dismiss(toastId);

                      if (result.errors.length) {
                        result.errors.forEach((err) => {
                          const nombre = err.file
                            .replace(/^.*Factura-/, "")
                            .replace(/\.\w+$/, "");
                          toast.warning(
                            `Hay errores en la factura ${nombre}:\n${err.error}`,
                            { duration: 8000 }
                          );
                        });
                      }

                      if (result.imported.length > 0) {
                        toast.success(
                          `✓ ${result.imported.length} facturas importadas correctamente`
                        );
                        fetchFacturas();
                      }
                    } catch (err) {
                      toast.error("No se pudieron importar las facturas.");
                      console.error(err);
                    }
                  }}
                >
                  <UploadIcon /> Cargar XML
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Seccion de Filtros */}
        <div
          className={`bg-white rounded-md border border-gray-200 shadow px-5 py-4 my-2 flex items-center justify-between ${
            activeTab === "tab-1" && "py-7"
          }`}
        >
          {/* Mostrar siempre */}
          <RadioOptions
            selectedValue={selectedValue}
            onChange={() =>
              setSelectedValue(
                selectedValue === "PREBAM" ? "SERSUPPORT" : "PREBAM"
              )
            }
          />

          {/* Se muestra solo en completas */}
          {activeTab === "tab-2" && (
            <div className="flex flex-row items-center justify-evenly space-x-8 mb-4">
              <div className="flex flex-col">
                <Label htmlFor="from">Desde:</Label>
                <input
                  type="date"
                  id="from"
                  className="border border-gray-300 rounded pl-4 py-1"
                  defaultValue={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </div>
              <div className="flex flex-col">
                <Label htmlFor="to">Hasta:</Label>
                <input
                  type="date"
                  id="to"
                  className="border border-gray-300 rounded pl-4 py-1"
                  defaultValue={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        {/** Contenido **/}

        <TabsContent value="tab-1" className="p-6">
          <FacturasTable
            facturas={facturas}
            loading={loading}
            updateFactura={updateFactura} // si lo necesitas
            fetchFacturas={fetchFacturas}
          />
        </TabsContent>
        <TabsContent value="tab-2" className="p-6">
          <FacturasTable
            facturas={facturas}
            loading={loading}
            updateFactura={updateFactura} // si lo necesitas
            fetchFacturas={fetchFacturas}
          />
        </TabsContent>
      </Tabs>
    </main>
  );
}

function RadioOptions({
  selectedValue,
  onChange,
}: {
  selectedValue: string;
  onChange: () => void;
}) {
  return (
    <div className="bg-input/50 inline-flex h-9 rounded-md p-0.5">
      <RadioGroup
        value={selectedValue}
        onValueChange={onChange}
        className="group after:bg-background has-focus-visible:after:border-ring has-focus-visible:after:ring-ring/50 relative inline-grid grid-cols-[1fr_1fr] items-center gap-0 text-sm font-medium after:absolute after:inset-y-0 after:w-1/2 after:rounded-sm after:shadow-xs after:transition-[translate,box-shadow] after:duration-300 after:ease-[cubic-bezier(0.16,1,0.3,1)] has-focus-visible:after:ring-[3px] data-[state=PREBAM]:after:translate-x-0 data-[state=SERSUPPORT]:after:translate-x-full"
        data-state={selectedValue}
      >
        <label className="group-data-[state=SERSUPPORT]:text-muted-foreground/70 relative z-10 inline-flex h-full min-w-8 cursor-pointer items-center justify-center px-4 whitespace-nowrap transition-colors select-none">
          PREBAM
          <RadioGroupItem id={`PREBAM`} value="PREBAM" className="sr-only" />
        </label>
        <label className="group-data-[state=PREBAM]:text-muted-foreground/70 relative z-10 inline-flex h-full min-w-8 cursor-pointer items-center justify-center px-4 whitespace-nowrap transition-colors select-none">
          <span>SERSUPPORT</span>
          <RadioGroupItem
            id={`SERSUPPORT`}
            value="SERSUPPORT"
            className="sr-only"
          />
        </label>
      </RadioGroup>
    </div>
  );
}
