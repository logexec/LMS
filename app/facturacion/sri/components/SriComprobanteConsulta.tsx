/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { sriApi } from "@/services/axios";
import { Loader2, FileSearchIcon, RefreshCw } from "lucide-react";
import ExtendedDocumentTable from "./ExtendedDocumentTable";

const SriComprobanteConsulta: React.FC = () => {
  const [claveAcceso, setClaveAcceso] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [documentInfo, setDocumentInfo] = useState<any | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!claveAcceso || claveAcceso.length !== 49) {
      toast.error("La clave de acceso debe tener 49 dígitos");
      return;
    }

    setLoading(true);
    setDocumentInfo(null);

    try {
      const response = await sriApi.obtenerInfoDesdeClaveAcceso(claveAcceso);

      if (response.success) {
        setDocumentInfo(response.data);
      } else {
        toast.error(response.message || "Error al consultar el comprobante");
      }
    } catch (error) {
      console.error("Error al consultar comprobante:", error);
      toast.error("Error al consultar información desde el SRI");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setClaveAcceso("");
    setDocumentInfo(null);
  };

  const handleSaveToDatabase = async () => {
    if (!documentInfo) {
      toast.error("No hay información para guardar");
      return;
    }

    try {
      setLoading(true);

      // Preparar los datos para guardar
      const datosGuardar = {
        CLAVE_ACCESO: documentInfo.datosBasicos?.claveAcceso || "",
        RUC_EMISOR: documentInfo.datosBasicos?.rucEmisor || "",
        RAZON_SOCIAL_EMISOR: documentInfo.emisor?.razonSocial || "",
        TIPO_COMPROBANTE: documentInfo.datosBasicos?.tipoComprobante || "",
        SERIE_COMPROBANTE: `${
          documentInfo.datosBasicos?.establecimiento || "001"
        }-${documentInfo.datosBasicos?.puntoEmision || "001"}-${
          documentInfo.datosBasicos?.secuencial || "000000000"
        }`,
        FECHA_EMISION: documentInfo.datosBasicos?.fechaEmision || "",
        FECHA_AUTORIZACION: documentInfo.comprobante?.fechaAutorizacion || "",
        VALOR_SIN_IMPUESTOS:
          documentInfo.comprobante?.comprobante?.infoFactura
            ?.totalSinImpuestos || "",
        IVA: documentInfo.comprobante?.iva || "",
        IMPORTE_TOTAL:
          documentInfo.comprobante?.comprobante?.infoFactura?.importeTotal ||
          "",
        IDENTIFICACION_RECEPTOR:
          documentInfo.comprobante?.comprobante?.infoFactura
            ?.identificacionComprador || "",
      };

      // Llamar a la API para guardar
      const response = await sriApi.generateDocuments([datosGuardar]);

      if (response && response.count > 0) {
        toast.success("Documento guardado correctamente");
      } else {
        toast.error("No se pudo guardar el documento");
      }
    } catch (error) {
      console.error("Error al guardar documento:", error);
      toast.error("Error al guardar el documento");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileSearchIcon className="mr-2 h-5 w-5" />
            Consulta de Comprobantes SRI
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col space-y-2">
              <label htmlFor="claveAcceso" className="font-medium text-sm">
                Clave de Acceso (49 dígitos)
              </label>
              <div className="flex space-x-2">
                <Input
                  id="claveAcceso"
                  placeholder="Ingrese la clave de acceso del comprobante"
                  value={claveAcceso}
                  onChange={(e) => setClaveAcceso(e.target.value)}
                  disabled={loading}
                  className="flex-1"
                  maxLength={49}
                />
                <Button
                  type="submit"
                  disabled={loading || claveAcceso.length !== 49}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Consultar"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClear}
                  disabled={loading}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Ingrese la clave de acceso para consultar información del
                comprobante en el SRI.
              </p>
            </div>
          </form>
        </CardContent>
      </Card>

      {documentInfo && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button
              onClick={handleSaveToDatabase}
              disabled={loading || !documentInfo}
            >
              Guardar en Base de Datos
            </Button>
          </div>
          <ExtendedDocumentTable documentData={documentInfo} loading={false} />
        </div>
      )}

      {loading && !documentInfo && (
        <div className="p-8 border rounded-lg text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Consultando información del comprobante...</p>
        </div>
      )}
    </div>
  );
};

export default SriComprobanteConsulta;
