"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import api, { sriApi } from "@/services/axios";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { DownloadIcon, FileTextIcon, RefreshCcw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Document {
  id: number;
  clave_acceso: string;
  ruc_emisor: string;
  razon_social_emisor: string;
  tipo_comprobante: string;
  serie_comprobante: string;
  fecha_emision: string;
  fecha_autorizacion: string;
  valor_sin_impuestos?: string;
  iva?: string;
  importe_total?: string;
  identificacion_receptor?: string;
  gcs_path_xml: string;
  gcs_path_pdf: string;
}

interface DocumentTableProps {
  refreshTrigger?: number; // Para forzar actualizaciones
}

const DocumentTable = ({ refreshTrigger = 0 }: DocumentTableProps) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    fetchDocuments();
  }, [refreshTrigger]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await api.get("/sri-documents");
      setDocuments(response.data);
    } catch (error) {
      console.error("Error al cargar documentos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (id: number, field: string, value: string) => {
    setDocuments((prev) =>
      prev.map((doc) => (doc.id === id ? { ...doc, [field]: value } : doc))
    );
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await sriApi.batchUpdateDocuments(documents);
      toast.success("Cambios guardados correctamente");
    } catch (err) {
      console.error("Error al guardar:", err);
    } finally {
      setSaving(false);
    }
  };

  const filteredDocuments = documents.filter(
    (doc) =>
      doc.razon_social_emisor.toLowerCase().includes(filter.toLowerCase()) ||
      doc.ruc_emisor.includes(filter) ||
      doc.serie_comprobante.includes(filter) ||
      doc.clave_acceso.includes(filter)
  );

  const handleRefresh = () => {
    fetchDocuments();
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("es-EC", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <h2 className="text-lg font-semibold">Documentos generados</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCcw className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex space-x-2">
          <Input
            placeholder="Filtrar por RUC, serie o razón social..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="max-w-xs"
          />
          <Button
            onClick={handleSave}
            disabled={saving || loading}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {saving ? "Guardando..." : "Guardar cambios"}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead>Serie</TableHead>
                <TableHead>RUC</TableHead>
                <TableHead>Razón Social</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Receptor</TableHead>
                <TableHead>Subtotal</TableHead>
                <TableHead>IVA</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDocuments.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={10}
                    className="text-center py-4 text-muted-foreground"
                  >
                    No se encontraron documentos
                  </TableCell>
                </TableRow>
              ) : (
                filteredDocuments.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell>{doc.tipo_comprobante}</TableCell>
                    <TableCell>{doc.serie_comprobante}</TableCell>
                    <TableCell>{doc.ruc_emisor}</TableCell>
                    <TableCell
                      className="max-w-[200px] truncate"
                      title={doc.razon_social_emisor}
                    >
                      {doc.razon_social_emisor}
                    </TableCell>
                    <TableCell>{formatDate(doc.fecha_emision)}</TableCell>
                    <TableCell>
                      <Input
                        value={doc.identificacion_receptor || ""}
                        onChange={(e) =>
                          handleChange(
                            doc.id,
                            "identificacion_receptor",
                            e.target.value
                          )
                        }
                        className="h-8"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={doc.valor_sin_impuestos || ""}
                        onChange={(e) =>
                          handleChange(
                            doc.id,
                            "valor_sin_impuestos",
                            e.target.value
                          )
                        }
                        className="h-8 w-24"
                        type="number"
                        step="0.01"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={doc.iva || ""}
                        onChange={(e) =>
                          handleChange(doc.id, "iva", e.target.value)
                        }
                        className="h-8 w-24"
                        type="number"
                        step="0.01"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={doc.importe_total || ""}
                        onChange={(e) =>
                          handleChange(doc.id, "importe_total", e.target.value)
                        }
                        className="h-8 w-24"
                        type="number"
                        step="0.01"
                      />
                    </TableCell>
                    <TableCell className="flex space-x-1">
                      <a
                        href={`${process.env.NEXT_PUBLIC_API_URL}/sri-documents/${doc.id}/generate-xml`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-2"
                        >
                          <FileTextIcon className="h-4 w-4 mr-1" />
                          XML
                        </Button>
                      </a>
                      <a
                        href={`${process.env.NEXT_PUBLIC_API_URL}/sri-documents/${doc.id}/generate-pdf`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-2"
                        >
                          <DownloadIcon className="h-4 w-4 mr-1" />
                          PDF
                        </Button>
                      </a>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default DocumentTable;
