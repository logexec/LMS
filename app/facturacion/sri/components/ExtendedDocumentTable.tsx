/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface ExtendedDocumentTableProps {
  documentData: any | null;
  loading: boolean;
}

const ExtendedDocumentTable: React.FC<ExtendedDocumentTableProps> = ({
  documentData,
  loading,
}) => {
  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!documentData) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        <p>Selecciona un documento para ver sus detalles completos.</p>
      </div>
    );
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return format(date, "dd/MM/yyyy HH:mm:ss", { locale: es });
    } catch (e) {
      console.error(e);
      toast.error(
        e instanceof Error
          ? e.message
          : "Se produjo un error al tratar de dar formato a la fecha."
      );
      return dateString;
    }
  };

  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return "-";
    return new Intl.NumberFormat("es-EC", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  // Extract relevant data structures
  const {
    datosBasicos = {},
    emisor = { success: false },
    comprobante = { success: false },
  } = documentData;

  // Extract nested data if available
  const infoComprobante = comprobante?.success ? comprobante.comprobante : {};
  const infoEmisor = emisor?.success ? emisor : {};

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Información completa del documento</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="general">Información General</TabsTrigger>
            <TabsTrigger value="emisor">Datos Emisor</TabsTrigger>
            <TabsTrigger value="detalles">Detalles</TabsTrigger>
            <TabsTrigger value="adicional">Información Adicional</TabsTrigger>
          </TabsList>

          {/* Información General */}
          <TabsContent value="general" className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/3">Campo</TableHead>
                  <TableHead>Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Clave de Acceso</TableCell>
                  <TableCell>{datosBasicos.claveAcceso || "-"}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Fecha Emisión</TableCell>
                  <TableCell>{datosBasicos.fechaEmision || "-"}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">
                    Tipo de Comprobante
                  </TableCell>
                  <TableCell>{datosBasicos.tipoComprobante || "-"}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Serie</TableCell>
                  <TableCell>{datosBasicos.serie || "-"}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Establecimiento</TableCell>
                  <TableCell>{datosBasicos.establecimiento || "-"}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Punto Emisión</TableCell>
                  <TableCell>{datosBasicos.puntoEmision || "-"}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Secuencial</TableCell>
                  <TableCell>{datosBasicos.secuencial || "-"}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Ambiente</TableCell>
                  <TableCell>{datosBasicos.ambiente || "-"}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Tipo de Emisión</TableCell>
                  <TableCell>{datosBasicos.tipoEmision || "-"}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">
                    Fecha Autorización
                  </TableCell>
                  <TableCell>
                    {comprobante?.fechaAutorizacion
                      ? formatDate(comprobante.fechaAutorizacion)
                      : "-"}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">
                    Número Autorización
                  </TableCell>
                  <TableCell>
                    {comprobante?.numeroAutorizacion || "-"}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Estado</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-md text-sm font-medium ${
                        comprobante?.estado === "AUTORIZADO"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {comprobante?.estado || "PENDIENTE"}
                    </span>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TabsContent>

          {/* Datos Emisor */}
          <TabsContent value="emisor" className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/3">Campo</TableHead>
                  <TableHead>Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">RUC</TableCell>
                  <TableCell>{datosBasicos.rucEmisor || "-"}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Razón Social</TableCell>
                  <TableCell>{infoEmisor.razonSocial || "-"}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">
                    Nombre Comercial
                  </TableCell>
                  <TableCell>{infoEmisor.nombreComercial || "-"}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">
                    Obligado a llevar Contabilidad
                  </TableCell>
                  <TableCell>
                    {infoEmisor.obligadoContabilidad || "NO"}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">
                    Clase de Contribuyente
                  </TableCell>
                  <TableCell>{infoEmisor.claseSujeto || "-"}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">
                    Tipo de Contribuyente
                  </TableCell>
                  <TableCell>{infoEmisor.tipoContribuyente || "-"}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Estado</TableCell>
                  <TableCell>{infoEmisor.estado || "-"}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">
                    Actividad Económica
                  </TableCell>
                  <TableCell>{infoEmisor.actividadEconomica || "-"}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">
                    Dirección Matriz
                  </TableCell>
                  <TableCell>
                    {infoEmisor.direccionMatriz || infoEmisor.direccion || "-"}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Teléfonos</TableCell>
                  <TableCell>{infoEmisor.telefonos || "-"}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Correo</TableCell>
                  <TableCell>{infoEmisor.email || "-"}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TabsContent>

          {/* Detalles del comprobante */}
          <TabsContent value="detalles" className="space-y-4">
            <h3 className="text-lg font-semibold mb-2">
              Información de Valores
            </h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/3">Campo</TableHead>
                  <TableHead>Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">
                    Identificación Receptor
                  </TableCell>
                  <TableCell>
                    {infoComprobante?.infoFactura?.identificacionComprador ||
                      "-"}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">
                    Razón Social Receptor
                  </TableCell>
                  <TableCell>
                    {infoComprobante?.infoFactura?.razonSocialComprador ||
                      "PREBAM S.A."}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">
                    Total Sin Impuestos
                  </TableCell>
                  <TableCell>
                    {formatCurrency(
                      infoComprobante?.infoFactura?.totalSinImpuestos
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Subtotal 0%</TableCell>
                  <TableCell>
                    {formatCurrency(infoComprobante?.subtotal0)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Subtotal 12%</TableCell>
                  <TableCell>
                    {formatCurrency(infoComprobante?.subtotal12)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">IVA</TableCell>
                  <TableCell>{formatCurrency(infoComprobante?.iva)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Total Descuento</TableCell>
                  <TableCell>
                    {formatCurrency(
                      infoComprobante?.infoFactura?.totalDescuento
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Total</TableCell>
                  <TableCell className="font-bold">
                    {formatCurrency(infoComprobante?.infoFactura?.importeTotal)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>

            {infoComprobante?.detalles &&
              infoComprobante.detalles.length > 0 && (
                <>
                  <h3 className="text-lg font-semibold mt-4 mb-2">
                    Detalle de Productos
                  </h3>
                  <div className="max-h-96 overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Descripción</TableHead>
                          <TableHead className="text-right">Cantidad</TableHead>
                          <TableHead className="text-right">
                            Precio Unitario
                          </TableHead>
                          <TableHead className="text-right">
                            Descuento
                          </TableHead>
                          <TableHead className="text-right">Subtotal</TableHead>
                          <TableHead className="text-right">IVA</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {infoComprobante.detalles.map(
                          (detalle: any, index: number) => (
                            <TableRow key={index}>
                              <TableCell>{detalle.descripcion}</TableCell>
                              <TableCell className="text-right">
                                {detalle.cantidad?.toFixed(2)}
                              </TableCell>
                              <TableCell className="text-right">
                                {formatCurrency(detalle.precioUnitario)}
                              </TableCell>
                              <TableCell className="text-right">
                                {formatCurrency(detalle.descuento)}
                              </TableCell>
                              <TableCell className="text-right">
                                {formatCurrency(detalle.precioTotal)}
                              </TableCell>
                              <TableCell className="text-right">
                                {formatCurrency(detalle.valorIVA)}
                              </TableCell>
                            </TableRow>
                          )
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </>
              )}

            {infoComprobante?.impuestos &&
              infoComprobante.impuestos.length > 0 && (
                <>
                  <h3 className="text-lg font-semibold mt-4 mb-2">Impuestos</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Código</TableHead>
                        <TableHead>Código Porcentaje</TableHead>
                        <TableHead className="text-right">
                          Base Imponible
                        </TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {infoComprobante.impuestos.map(
                        (impuesto: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell>
                              {impuesto.codigo === "2"
                                ? "IVA"
                                : impuesto.codigo}
                            </TableCell>
                            <TableCell>
                              {impuesto.codigoPorcentaje === "2"
                                ? "12%"
                                : impuesto.codigoPorcentaje === "0"
                                ? "0%"
                                : impuesto.codigoPorcentaje}
                            </TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(impuesto.baseImponible)}
                            </TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(impuesto.valor)}
                            </TableCell>
                          </TableRow>
                        )
                      )}
                    </TableBody>
                  </Table>
                </>
              )}
          </TabsContent>

          {/* Información Adicional */}
          <TabsContent value="adicional" className="space-y-4">
            {infoComprobante?.infoAdicional ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-1/3">Campo</TableHead>
                    <TableHead>Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(infoComprobante.infoAdicional).map(
                    ([key, value]) => (
                      <TableRow key={key}>
                        <TableCell className="font-medium">{key}</TableCell>
                        <TableCell>{String(value)}</TableCell>
                      </TableRow>
                    )
                  )}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center p-4 text-muted-foreground">
                <p>No hay información adicional disponible.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ExtendedDocumentTable;
