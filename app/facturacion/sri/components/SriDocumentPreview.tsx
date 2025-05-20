/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { sriApi } from "@/services/axios";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert } from "@/components/ui/alert";
import {
  Loader2,
  UploadIcon,
  FileTextIcon,
  CheckCircleIcon,
  TableIcon,
  LayoutIcon,
  Save,
  Server,
} from "lucide-react";
import ExtendedDocumentTable from "./ExtendedDocumentTable";
import TsvTable from "./TsvTable";
import SriComprobanteConsulta from "./SriComprobanteConsulta";

interface TsvRow {
  CLAVE_ACCESO: string;
  RUC_EMISOR: string;
  RAZON_SOCIAL_EMISOR: string;
  TIPO_COMPROBANTE: string;
  SERIE_COMPROBANTE: string;
  FECHA_EMISION: string;
  FECHA_AUTORIZACION: string;
  VALOR_SIN_IMPUESTOS: string;
  IVA: string;
  IMPORTE_TOTAL: string;
  IDENTIFICACION_RECEPTOR: string;
  [key: string]: string;
}

interface SriDocumentPreviewProps {
  onFinish?: (folderName: string) => void;
}

const SriDocumentPreview: React.FC<SriDocumentPreviewProps> = ({
  onFinish,
}) => {
  const [parsedRows, setParsedRows] = useState<TsvRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string>("");
  const [dragActive, setDragActive] = useState(false);
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);
  const [documentInfo, setDocumentInfo] = useState<any | null>(null);
  const [loadingDocumentInfo, setLoadingDocumentInfo] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("search");
  const [viewMode, setViewMode] = useState<string>("detail");
  const [generatingDocuments, setGeneratingDocuments] = useState(false);

  const parseTsv = (content: string): TsvRow[] => {
    try {
      const lines = content
        .split("\n")
        .filter((line) => line.trim().length > 0);

      if (lines.length === 0) {
        toast.error("El archivo está vacío");
        return [];
      }

      const headerLine = lines[0];
      const headers = headerLine.split("\t").map((h) => h.trim());

      // Validate required headers
      const requiredHeaders = [
        "CLAVE_ACCESO",
        "RUC_EMISOR",
        "RAZON_SOCIAL_EMISOR",
      ];
      const missingHeaders = requiredHeaders.filter(
        (h) => !headers.includes(h)
      );

      if (missingHeaders.length > 0) {
        toast.error(`Faltan columnas requeridas: ${missingHeaders.join(", ")}`);
        return [];
      }

      // Parse rows
      const rows = lines.slice(1).map((line) => {
        const values = line.split("\t");
        const row: Record<string, string> = {};

        headers.forEach((header, index) => {
          row[header] = values[index]?.trim() || "";
        });

        // Asegurar que todos los campos requeridos existan
        const requiredFields = [
          "CLAVE_ACCESO",
          "RUC_EMISOR",
          "RAZON_SOCIAL_EMISOR",
          "TIPO_COMPROBANTE",
          "SERIE_COMPROBANTE",
          "FECHA_EMISION",
          "FECHA_AUTORIZACION",
          "VALOR_SIN_IMPUESTOS",
          "IVA",
          "IMPORTE_TOTAL",
          "IDENTIFICACION_RECEPTOR",
        ];

        requiredFields.forEach((field) => {
          if (row[field] === undefined) {
            row[field] = "";
          }
        });

        return row as TsvRow;
      });

      return rows;
    } catch (error) {
      console.error("Error parsing TSV file:", error);
      toast.error("Error al procesar el archivo TSV");
      return [];
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    processFile(file);
  };

  const processFile = (file: File) => {
    if (!file.name.endsWith(".txt") && !file.name.endsWith(".tsv")) {
      toast.error("Por favor, selecciona un archivo .txt o .tsv");
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        const rows = parseTsv(content);
        setParsedRows(rows);
        setSelectedRowIndex(null);
        setDocumentInfo(null);

        if (rows.length > 0) {
          toast.success(
            `Archivo cargado: ${rows.length} registros encontrados`
          );
          setActiveTab("preview");
        }
      }
    };

    reader.readAsText(file);
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleSelectRow = async (index: number) => {
    if (loadingDocumentInfo) return;

    // Prevent reloading if selecting the same row
    if (selectedRowIndex === index && documentInfo) return;

    setSelectedRowIndex(index);
    setLoadingDocumentInfo(true);
    setDocumentInfo(null);

    const row = parsedRows[index];

    try {
      if (!row.CLAVE_ACCESO) {
        toast.error("La fila seleccionada no tiene clave de acceso");
        setLoadingDocumentInfo(false);
        return;
      }

      const response = await sriApi.obtenerInfoDesdeClaveAcceso(
        row.CLAVE_ACCESO
      );
      if (response.success) {
        setDocumentInfo(response.data);
      } else {
        toast.error(
          response.message || "Error al consultar información del documento"
        );
      }
    } catch (error) {
      console.error("Error al consultar información del documento:", error);
      toast.error("Error al consultar información desde el SRI");
    } finally {
      setLoadingDocumentInfo(false);
    }
  };

  const handleSaveToDatabase = async () => {
    if (parsedRows.length === 0) {
      toast.warning("No hay documentos para guardar");
      return;
    }

    // Confirm before saving
    if (
      !window.confirm(
        `¿Estás seguro de guardar ${parsedRows.length} documentos?`
      )
    ) {
      return;
    }

    try {
      setLoading(true);

      // Show loading toast
      const loadingToast = toast.loading(
        `Guardando ${parsedRows.length} documentos en la base de datos...`
      );

      // Call the API to generate documents
      const response = await sriApi.generateDocuments(parsedRows);

      // Dismiss loading toast
      toast.dismiss(loadingToast);

      if (response && response.count > 0) {
        toast.success(
          `Se han guardado ${response.count} documentos correctamente`
        );
        if (onFinish) {
          onFinish("documents");
        }
      } else {
        toast.error("No se pudieron guardar los documentos");
      }
    } catch (error) {
      console.error("Error al guardar documentos:", error);
      toast.error("Error al guardar los documentos");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateFromSri = async () => {
    if (parsedRows.length === 0) {
      toast.warning("No hay documentos para actualizar");
      return;
    }

    try {
      setLoading(true);

      // Show loading toast
      const loadingToast = toast.loading(
        "Actualizando información desde el SRI..."
      );

      // Call the API to update documents
      const response = await sriApi.actualizarTodosDocumentos(
        parsedRows.length,
        true
      );

      // Dismiss loading toast
      toast.dismiss(loadingToast);

      if (response && response.success) {
        toast.success(
          `Se han actualizado ${response.actualizados} documentos correctamente`
        );
        if (onFinish) {
          onFinish("updated");
        }
      } else {
        toast.error(
          response.message || "No se pudieron actualizar los documentos"
        );
      }
    } catch (error) {
      console.error("Error al actualizar documentos:", error);
      toast.error("Error al actualizar los documentos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Loader overlay */}
      {loading && (
        <div className="fixed top-0 left-0 bg-black/30 backdrop-blur-sm w-screen h-screen overflow-hidden flex items-center justify-center z-50">
          <Alert variant="default" className="max-w-lg py-5">
            <div className="w-fit flex space-x-4 items-center">
              <Loader2 className="text-red-500 size-4 animate-spin" />
              <span className="text-slate-700 dark:text-slate-300 animate-pulse">
                Procesando... Por favor espera.
              </span>
            </div>
          </Alert>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="search">Consulta Directa</TabsTrigger>
          <TabsTrigger value="file">Subir Archivo</TabsTrigger>
          <TabsTrigger value="preview" disabled={parsedRows.length === 0}>
            Previsualización
          </TabsTrigger>
          <TabsTrigger value="rawdata" disabled={parsedRows.length === 0}>
            Datos Crudos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="search">
          <SriComprobanteConsulta />
        </TabsContent>

        <TabsContent value="file">
          <div
            className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors ${
              dragActive
                ? "border-primary/70 bg-primary/5"
                : "border-gray-300 hover:border-gray-400"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => document.getElementById("file-upload")?.click()}
          >
            <input
              id="file-upload"
              type="file"
              accept=".txt,.tsv"
              onChange={handleFileUpload}
              className="hidden"
            />

            <div className="flex flex-col items-center justify-center space-y-2">
              {fileName ? (
                <>
                  <CheckCircleIcon className="h-12 w-12 text-green-500" />
                  <p className="font-medium">{fileName}</p>
                  <p className="text-sm text-muted-foreground">
                    {parsedRows.length} registros cargados
                  </p>
                </>
              ) : (
                <>
                  <UploadIcon className="h-12 w-12 text-muted-foreground" />
                  <p className="font-medium">
                    Arrastra un archivo aquí o haz clic para seleccionar
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Soporta archivos de texto (.txt, .tsv) con valores separados
                    por tabulaciones
                  </p>
                </>
              )}
            </div>
          </div>

          {parsedRows.length > 0 && (
            <div className="mt-4 flex justify-end">
              <Button onClick={() => setActiveTab("preview")}>
                <FileTextIcon className="mr-2 h-4 w-4" />
                Ver Previsualización
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="preview">
          {parsedRows.length > 0 ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="bg-muted rounded-md p-1">
                  <Button
                    variant={viewMode === "detail" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("detail")}
                    className="px-3"
                  >
                    <LayoutIcon className="h-4 w-4 mr-2" />
                    Detalle
                  </Button>
                  <Button
                    variant={viewMode === "table" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("table")}
                    className="px-3"
                  >
                    <TableIcon className="h-4 w-4 mr-2" />
                    Tabla
                  </Button>
                </div>

                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={handleUpdateFromSri}
                    disabled={loading || generatingDocuments}
                  >
                    <Server className="h-4 w-4 mr-2" />
                    Actualizar desde SRI
                  </Button>
                  <Button
                    variant="default"
                    onClick={handleSaveToDatabase}
                    disabled={loading || generatingDocuments}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Guardar en Base de Datos
                  </Button>
                </div>
              </div>

              {viewMode === "detail" ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-1 space-y-4">
                    <div className="border rounded-lg p-4">
                      <h3 className="font-semibold mb-2">
                        Registros ({parsedRows.length})
                      </h3>
                      <div className="max-h-[500px] overflow-y-auto border rounded-md">
                        <ul className="divide-y">
                          {parsedRows.map((row, index) => (
                            <li key={index}>
                              <Button
                                variant="ghost"
                                className={`w-full justify-start px-4 py-2 text-sm font-medium rounded-none h-auto ${
                                  selectedRowIndex === index
                                    ? "bg-primary/10 text-primary"
                                    : ""
                                }`}
                                onClick={() => handleSelectRow(index)}
                              >
                                <span className="truncate overflow-hidden">
                                  {row.CLAVE_ACCESO || `Registro ${index + 1}`}
                                </span>
                              </Button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    {selectedRowIndex !== null ? (
                      <ExtendedDocumentTable
                        documentData={documentInfo}
                        loading={loadingDocumentInfo}
                      />
                    ) : (
                      <div className="text-center p-8 border rounded-lg">
                        <p className="text-muted-foreground">
                          Selecciona un registro para ver la información
                          detallada
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <TsvTable data={parsedRows} />
              )}
            </div>
          ) : (
            <div className="text-center p-8 border rounded-lg">
              <p className="text-muted-foreground">
                No hay registros cargados. Por favor, sube un archivo primero.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="rawdata">
          {parsedRows.length > 0 ? (
            <div className="space-y-4">
              <div className="flex justify-end">
                <Button
                  variant="default"
                  onClick={handleSaveToDatabase}
                  disabled={loading || generatingDocuments}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Guardar en Base de Datos
                </Button>
              </div>
              <TsvTable data={parsedRows} />
            </div>
          ) : (
            <div className="text-center p-8 border rounded-lg">
              <p className="text-muted-foreground">
                No hay datos para mostrar. Por favor, sube un archivo primero.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SriDocumentPreview;
