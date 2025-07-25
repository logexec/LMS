/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FacturasTable from "../components/facturas/FacturasTable";
import {
  ArrowBigUpIcon,
  CheckIcon,
  ClockFadingIcon,
  FileUpIcon,
  XIcon,
  // UploadIcon,
} from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCallback, useEffect, useRef, useState } from "react";
import { Label } from "@/components/ui/label";
import { Factura, ParsedFactura } from "@/types/factura";
import api from "@/services/axios";
import { toast } from "sonner";
import axios, { AxiosInstance, AxiosResponse } from "axios";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { XmlDropzone } from "../components/facturas/XmlDropzone";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

type Uploaded = {
  rawFile: File;
  archivoOriginal: string;
  isTxt: boolean;
  // …otros campos
};

type LogEntry = {
  file: string;
  imported: number;
  skipped: number;
};

export default function FacturasPage() {
  const [selectedValue, setSelectedValue] = useState("PREBAM");
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("tab-1");

  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const from = new Date(now.getFullYear(), now.getMonth(), 0, 1)
    .toISOString()
    .split("T")[0];
  const [fromDate, setFromDate] = useState(from);
  const [toDate, setToDate] = useState(today);

  const [uploadedFacturas, setUploadedFacturas] = useState<ParsedFactura[]>([]);

  // NUEVOS ESTADOS para la importación en background
  const [countTotal, setCountTotal] = useState(0);
  const [countDone, setCountDone] = useState(0);

  // Nuevo: controlar el AlertDialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  // Nuevo: llevar un log por archivo
  const [fileLogs, setFileLogs] = useState<
    { file: string; imported: number; skipped: number }[]
  >([]);

  const xmlDropzoneRef = useRef<{ clearFiles: () => void }>(null);

  /**
   * Cuenta líneas no vacías en un .txt
   */
  async function fileLinesCount(file: File): Promise<number> {
    const text = await file.text();
    return text.split(/\r?\n/).filter((l) => l.trim() !== "").length;
  }

  const handleImport = async () => {
    const xmls = uploadedFacturas.filter((f) =>
      f.rawFile.name.endsWith(".xml")
    );
    const txts = uploadedFacturas.filter((f) =>
      f.rawFile.name.endsWith(".txt")
    );

    let total = 0;
    if (xmls.length) total = xmls.length;
    else if (txts.length === 1) total = await fileLinesCount(txts[0].rawFile);
    else return toast.error("Sube XMLs o un solo TXT");

    setCountTotal(total);
    setCountDone(0);
    setFileLogs([]);
    toast.loading("Consultando con el SRI…", { id: "import" });

    let sseUrl = "";
    if (xmls.length) {
      const fm = new FormData();
      xmls.forEach((f) => fm.append("xml", f.rawFile, f.rawFile.name));
      const { data } = await api.post<{ paths: string[] }>(
        "/facturas/importar-xml",
        fm,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      sseUrl =
        "/facturas/importar-xml/stream?" +
        data.paths.map((p) => `paths[]=${encodeURIComponent(p)}`).join("&");
    } else {
      const fm = new FormData();
      fm.append("txt", txts[0].rawFile, txts[0].rawFile.name);
      const { data } = await api.post<{ path: string }>(
        "/facturas/importar-txt",
        fm,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      sseUrl =
        "/facturas/importar-txt/stream?path=" + encodeURIComponent(data.path);
    }

    const es = new EventSource(`${process.env.NEXT_PUBLIC_API_URL}${sseUrl}`, {
      withCredentials: true,
    });

    es.addEventListener("file_done", (e) => {
      const raw: any = JSON.parse(e.data);
      const label = raw.file ?? raw.clave ?? `Línea ${raw.line}`;
      setFileLogs((prev) => [
        ...prev,
        {
          file: label,
          imported: raw.imported,
          skipped: raw.skipped,
        },
      ]);
      setCountDone((c) => c + 1);
      if (raw.imported > 0) {
        toast.success(`${label} importada`);
      } else {
        toast.warning(`${label} duplicada o sin factura`);
      }
    });

    es.addEventListener("end", (e) => {
      const sum: any = JSON.parse(e.data);
      toast.dismiss("import");
      toast.success(
        `Importación finalizada: ${sum.imported} importadas, ${sum.skipped} omitidas`
      );
      es.close();
      fetchFacturas();
      setIsDialogOpen(false);
      xmlDropzoneRef.current?.clearFiles();
    });
  };

  const progress = countTotal ? Math.floor((countDone / countTotal) * 100) : 0;

  const fetchFacturas = useCallback(async () => {
    setLoading(true);
    try {
      // 1) Construimos dinámicamente los params
      const params: Record<string, any> = {
        empresa: selectedValue === "PREBAM" ? "0992301066001" : "1792162696001",
        ready: activeTab === "tab-2", // tab-2 = contabilizadas
      };

      // 2) Sólo aplicamos filtro de fechas en la pestaña “Contabilizadas”
      if (activeTab === "tab-2") {
        params.desde = fromDate;
        params.hasta = toDate;
      }

      // 3) Llamada al endpoint
      const resp: AxiosResponse<{ data: Factura[] }> = await api.get(
        "/facturas",
        { params }
      );

      // 4) Mapeo completo (igual que tu versión original)
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
          contabilizado: item.contabilizado,
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
    } catch (error) {
      console.error("Error al cargar facturas:", error);
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
      fetchFacturas();
    } catch (err) {
      console.error(err);
      toast.error("No se pudo actualizar");
      fetchFacturas();
    }
  };

  return (
    <main>
      <Notification />
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
              Contabilizadas
            </TabsTrigger>
          </TabsList>

          <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                onClick={() => setIsDialogOpen(true)}
              >
                Importar Facturas
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogTitle>Adjuntar comprobantes</AlertDialogTitle>
              <AlertDialogDescription>
                Puedes subir un archivo TXT con claves de acceso o uno o más
                archivos XML o ZIP para importar facturas.
              </AlertDialogDescription>

              <XmlDropzone
                ref={xmlDropzoneRef}
                onChange={(data) => setUploadedFacturas(data)}
                disabled={countTotal !== 0}
                accept="*"
              />

              {countTotal !== 0 && (
                <div className="mt-4 space-y-2">
                  <span className="text-sm">
                    Procesadas: {countDone} de {countTotal}
                  </span>
                  <Progress value={progress} />
                </div>
              )}

              <AlertDialogFooter>
                <AlertDialogCancel
                  onClick={() => {
                    setIsDialogOpen(false);
                    xmlDropzoneRef.current?.clearFiles();
                  }}
                >
                  Cancelar
                </AlertDialogCancel>

                {/* Botón principal: detecta si es XML o TXT */}
                <Button onClick={handleImport}>Cargar Facturas</Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Seccion de Filtros */}
        <div
          className={`bg-white dark:bg-black rounded-md border border-gray-200 dark:border-gray-800 shadow px-5 py-4 my-2 flex items-center justify-between ${
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
                  className="border border-gray-300 dark:border-gray-700 rounded pl-4 py-1"
                  defaultValue={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </div>
              <div className="flex flex-col">
                <Label htmlFor="to">Hasta:</Label>
                <input
                  type="date"
                  id="to"
                  className="border border-gray-300 dark:border-gray-700 rounded pl-4 py-1"
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
            updateFactura={updateFactura}
            fetchFacturas={fetchFacturas}
            isCompleteView={false}
          />
        </TabsContent>
        <TabsContent value="tab-2" className="p-6">
          <FacturasTable
            facturas={facturas}
            loading={loading}
            updateFactura={updateFactura}
            fetchFacturas={fetchFacturas}
            isCompleteView
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

function Notification() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="dark bg-muted text-foreground px-4 py-3 md:py-2">
      <div className="flex gap-2 md:items-center">
        <div className="flex grow gap-3 md:items-center md:justify-center">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <p className="text-sm">
              Para desplazarte r&aacute;pidamente por la tabla, presiona la
              tecla{" "}
              <Button variant="outline" className="mx-2" size="sm">
                <ArrowBigUpIcon /> shift
              </Button>
              y haz scroll con la rueda del mouse.
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          className="group -my-1.5 -me-2 size-8 shrink-0 p-0 hover:bg-transparent"
          onClick={() => setIsVisible(false)}
          aria-label="Close banner"
        >
          <XIcon
            size={16}
            className="opacity-60 transition-opacity group-hover:opacity-100"
            aria-hidden="true"
          />
        </Button>
      </div>
    </div>
  );
}
