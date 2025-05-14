/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
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
import {
  DownloadIcon,
  FileTextIcon,
  SearchIcon,
  DownloadCloudIcon,
  ChevronRightIcon,
  RefreshCcw,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import JSZip from "jszip";
import { saveAs } from "file-saver";

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
  xml_path_identifier: string;
  pdf_path_identifier: string;
}

interface DocumentTableProps {
  refreshTrigger?: number;
}

const DocumentTable = ({ refreshTrigger = 0 }: DocumentTableProps) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState<{
    from: Date | null;
    to: Date | null;
  }>({
    from: null,
    to: null,
  });
  const [selectedDocuments, setSelectedDocuments] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [downloadingZip, setDownloadingZip] = useState(false);
  const [expandedDocument, setExpandedDocument] = useState<Document | null>(
    null
  );
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, [refreshTrigger]);

  useEffect(() => {
    if (documents.length > 0) {
      applyFilters();
    }
  }, [documents, searchTerm, dateRange]);

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

  const applyFilters = () => {
    let filtered = [...documents];

    // Aplicar filtro de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(
        (doc) =>
          doc.razon_social_emisor
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          doc.ruc_emisor.includes(searchTerm) ||
          doc.serie_comprobante.includes(searchTerm) ||
          doc.clave_acceso.includes(searchTerm)
      );
    }

    // Aplicar filtro de fechas
    if (dateRange.from) {
      filtered = filtered.filter((doc) => {
        const docDate = new Date(doc.fecha_emision);
        return docDate >= dateRange.from!;
      });
    }

    if (dateRange.to) {
      filtered = filtered.filter((doc) => {
        const docDate = new Date(doc.fecha_emision);
        return docDate <= dateRange.to!;
      });
    }

    setFilteredDocuments(filtered);

    // Limpiar selecciones cuando cambian los filtros
    setSelectedDocuments([]);
    setSelectAll(false);
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

  const handleCheckbox = (id: number) => {
    setSelectedDocuments((prev) => {
      if (prev.includes(id)) {
        return prev.filter((docId) => docId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedDocuments([]);
    } else {
      setSelectedDocuments(filteredDocuments.map((doc) => doc.id));
    }
    setSelectAll(!selectAll);
  };

  const downloadZip = async () => {
    if (selectedDocuments.length === 0) {
      toast.warning(
        "Por favor, selecciona al menos un documento para descargar"
      );
      return;
    }

    try {
      setDownloadingZip(true);
      const zip = new JSZip();

      // Crear carpetas dentro del zip
      const xmlFolder = zip.folder("XML");
      const pdfFolder = zip.folder("PDF");

      // Procesar cada documento seleccionado
      for (const docId of selectedDocuments) {
        const doc = documents.find((d) => d.id === docId);
        if (!doc) continue;

        // Obtener XML
        const xmlResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/sri-documents/${docId}/generate-xml`
        );
        const xmlContent = await xmlResponse.text();
        xmlFolder?.file(`${doc.clave_acceso}.xml`, xmlContent);

        // Obtener PDF
        const pdfResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/sri-documents/${docId}/generate-pdf`
        );
        const pdfContent = await pdfResponse.arrayBuffer();
        pdfFolder?.file(`${doc.clave_acceso}.pdf`, pdfContent);
      }

      // Generar y descargar el zip
      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, "documentos_sri.zip");

      toast.success(
        `${selectedDocuments.length} documentos descargados en formato ZIP`
      );
    } catch (error) {
      console.error("Error al generar ZIP:", error);
      toast.error("Error al generar el archivo ZIP");
    } finally {
      setDownloadingZip(false);
    }
  };

  const openDetail = (doc: Document) => {
    setExpandedDocument(doc);
    setIsDetailOpen(true);
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
      console.error("Error al formatear fecha:", e);
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
            onClick={fetchDocuments}
            disabled={loading}
          >
            <RefreshCcw className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={downloadZip}
            disabled={downloadingZip || selectedDocuments.length === 0}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {downloadingZip ? (
              <>Generando ZIP...</>
            ) : (
              <>
                <DownloadCloudIcon className="mr-2 h-4 w-4" />
                Descargar seleccionados ({selectedDocuments.length})
              </>
            )}
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || loading}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {saving ? "Guardando..." : "Guardar cambios"}
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 p-4 bg-muted/40 rounded-lg">
        <div className="flex-1">
          <label className="text-sm font-medium mb-1 block">Buscar</label>
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="RUC, razón social, serie..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <div className="flex-1">
          <label className="text-sm font-medium mb-1 block">
            Rango de fechas
          </label>
          <div className="grid grid-cols-2 gap-2">
            {/* Desde */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "justify-start text-left font-normal",
                    !dateRange.from && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from ? (
                    format(dateRange.from, "dd/MM/yyyy", { locale: es })
                  ) : (
                    <span>Desde</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dateRange.from || undefined}
                  onSelect={(date: any) =>
                    setDateRange((prev) => ({ ...prev, from: date }))
                  }
                  autoFocus
                />
              </PopoverContent>
            </Popover>

            {/* Hasta */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "justify-start text-left font-normal",
                    !dateRange.to && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.to ? (
                    format(dateRange.to, "dd/MM/yyyy", { locale: es })
                  ) : (
                    <span>Hasta</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dateRange.to || undefined}
                  onSelect={(date: any) =>
                    setDateRange((prev) => ({ ...prev, to: date }))
                  }
                  autoFocus
                />
              </PopoverContent>
            </Popover>
          </div>
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
                <TableHead className="w-12">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                    className="h-4 w-4"
                  />
                </TableHead>
                <TableHead>Emisor</TableHead>
                <TableHead>RUC</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Serie</TableHead>
                <TableHead>Fecha</TableHead>
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
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedDocuments.includes(doc.id)}
                        onChange={() => handleCheckbox(doc.id)}
                        className="h-4 w-4"
                      />
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => openDetail(doc)}
                        className="text-left hover:underline text-black dark:text-white flex items-center font-semibold"
                      >
                        <span className="truncate max-w-[200px]">
                          {doc.razon_social_emisor}
                        </span>
                        <ChevronRightIcon className="h-4 w-4 ml-1" />
                      </button>
                    </TableCell>
                    <TableCell>{doc.ruc_emisor}</TableCell>
                    <TableCell>{doc.tipo_comprobante}</TableCell>
                    <TableCell>{doc.serie_comprobante}</TableCell>
                    <TableCell>{formatDate(doc.fecha_emision)}</TableCell>
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

      {/* Modal de detalle */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Detalle del documento</DialogTitle>
          </DialogHeader>

          {expandedDocument && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold">Emisor</p>
                  <p>{expandedDocument.razon_social_emisor}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold">RUC Emisor</p>
                  <p>{expandedDocument.ruc_emisor}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold">Tipo de Comprobante</p>
                  <p>{expandedDocument.tipo_comprobante}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold">Serie</p>
                  <p>{expandedDocument.serie_comprobante}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold">Fecha Emisión</p>
                  <p>{formatDate(expandedDocument.fecha_emision)}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold">Fecha Autorización</p>
                  <p>{expandedDocument.fecha_autorizacion}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold">Receptor</p>
                  <p>
                    {expandedDocument.identificacion_receptor ||
                      "No especificado"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold">Clave de Acceso</p>
                  <p className="text-xs truncate">
                    {expandedDocument.clave_acceso}
                  </p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">Valores</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-semibold">Subtotal</p>
                    <p>
                      $
                      {Number(
                        expandedDocument.valor_sin_impuestos || 0
                      ).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">IVA</p>
                    <p>${Number(expandedDocument.iva || 0).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Total</p>
                    <p className="font-bold">
                      ${Number(expandedDocument.importe_total || 0).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 mt-4">
                <a
                  href={`${process.env.NEXT_PUBLIC_API_URL}/sri-documents/${expandedDocument.id}/generate-xml`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline">
                    <FileTextIcon className="h-4 w-4 mr-2" />
                    Descargar XML
                  </Button>
                </a>
                <a
                  href={`${process.env.NEXT_PUBLIC_API_URL}/sri-documents/${expandedDocument.id}/generate-pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="default">
                    <DownloadIcon className="h-4 w-4 mr-2" />
                    Descargar PDF
                  </Button>
                </a>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DocumentTable;
