/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
} from "@/components/ui/alert-dialog";
import { Request } from "@/contexts/TableContext";
import api from "@/services/axios";
import { toast } from "sonner";
import { LoaderCircle, NotepadText, Download, Eye } from "lucide-react";
import {
  AlertDialogCancel,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@radix-ui/react-alert-dialog";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import EditRequestComponent from "./EditRequestComponent";

interface RepositionDetailsProp {
  reposition: number;
  total: number;
}

const RepositionDetailsTableComponent: React.FC<RepositionDetailsProp> = ({
  reposition,
  total,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [requestData, setRequestData] = useState<Request[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [attachment, setAttachment] = useState<{
    filePath: string;
    fileName: string;
  } | null>(null);
  const [isAttachmentViewable, setIsAttachmentViewable] =
    useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [savedDetails, setSavedDetails] = useState<{
    requestData: Request[] | null;
    attachment: { filePath: string; fileName: string } | null;
    error: string | null;
  } | null>(null);

  // List of file extensions that can be displayed in an iframe
  const viewableExtensions = ["pdf", "png", "jpg", "jpeg", "gif"];

  useEffect(() => {
    if (attachment) {
      const extension = attachment.filePath.split(".").pop()?.toLowerCase();
      setIsAttachmentViewable(viewableExtensions.includes(extension || ""));
    }
  }, [attachment]);

  async function getRepositionDetails(reposition: number) {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`reposiciones/${reposition}`);

      if (
        response.data &&
        response.data.requests &&
        Array.isArray(response.data.requests)
      ) {
        setRequestData(response.data.requests);
        if (response.data.attachment_url && response.data.attachment_name) {
          setAttachment({
            fileName: response.data.attachment_name,
            filePath: response.data.attachment_url,
          });
        }
      } else {
        setRequestData([]);
        toast.info(
          "No se encontraron solicitudes asociadas a esta reposición."
        );
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error desconocido";
      setError(errorMessage);
      toast.error(
        "No se pudo cargar la información. Por favor, inténtalo nuevamente."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isOpen) {
      getRepositionDetails(reposition);
    }
  }, [isOpen, reposition]);

  const handleOpenChange = (open: boolean) => {
    // Solo manejar el cierre normal cuando el visor no está abierto
    if (!isModalOpen) {
      setIsOpen(open);
      if (!open) {
        setRequestData(null);
        setAttachment(null);
        setSavedDetails(null);
      }
    } else {
      // Prevenir cierre del AlertDialog mientras el visor está abierto
      return false;
    }
  };

  // Función para abrir el visor de archivos
  const openFileViewer = () => {
    // Guardamos los datos actuales para restaurarlos después
    setSavedDetails({
      requestData,
      attachment,
      error,
    });

    // Cerramos temporalmente el AlertDialog
    setIsOpen(false);

    // Abrimos el visor después de un pequeño retraso
    setTimeout(() => {
      setIsModalOpen(true);
    }, 100);
  };

  // Función para cerrar el visor y restaurar el AlertDialog
  const closeFileViewer = () => {
    setIsModalOpen(false);

    // Restauramos el AlertDialog después de un pequeño retraso
    setTimeout(() => {
      setIsOpen(true);
      // Si hay datos guardados, restaurarlos
      if (savedDetails) {
        setRequestData(savedDetails.requestData);
        setAttachment(savedDetails.attachment);
        setError(savedDetails.error);
      }
    }, 100);
  };

  const handleIframeError = () => {
    toast.error("No se pudo cargar el archivo en el visor.");
    closeFileViewer();
  };

  // Componente de visor de archivos
  const FileViewer = () => {
    if (!attachment || !isAttachmentViewable) return null;

    return (
      <div className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center">
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 max-w-4xl w-full max-h-[90vh] flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              {attachment.fileName}
            </h3>
            <button
              onClick={closeFileViewer}
              className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 rounded-full p-1"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
          </div>

          <div className="flex-1 bg-slate-100 dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700 overflow-hidden">
            <iframe
              src={attachment.filePath}
              title={attachment.fileName}
              className="w-full h-[65vh] border-0"
              onError={handleIframeError}
            />
          </div>

          <div className="mt-4 flex justify-end">
            <a
              href={attachment.filePath}
              download={attachment.fileName}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <Download size={16} />
              <span>Descargar archivo</span>
            </a>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
        <AlertDialogTrigger className="flex flex-row space-x-1.5 items-center justify-center border border-black/8 dark:border-white/8 rounded py-1 px-2 shadow-xs cursor-pointer hover:bg-gray-100/70 dark:hover:bg-slate-900/70">
          <NotepadText className="size-4" />
          <span>Detalle</span>
        </AlertDialogTrigger>
        <AlertDialogContent className="max-w-11/12">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex flex-row space-x-4 items-center">
              <span className="font-semibold text-lg border-r border-slate-500 pr-4">
                Viendo reposición No. {reposition}
              </span>
              {attachment && (
                <>
                  {isAttachmentViewable ? (
                    <button
                      onClick={openFileViewer}
                      className="flex items-center space-x-2 px-4 py-1.5 bg-slate-600 text-white rounded hover:bg-slate-700 w-fit"
                      aria-label={`Ver archivo ${attachment.fileName}`}
                    >
                      <Eye className="size-4" />
                      <span>Ver {attachment.fileName}</span>
                    </button>
                  ) : (
                    <a
                      href={attachment.filePath}
                      download={attachment.fileName}
                      className="flex items-center space-x-2 px-4 py-1.5 bg-slate-600 text-white rounded hover:bg-slate-700 w-fit"
                      aria-label={`Descargar archivo ${attachment.fileName}`}
                    >
                      <Download className="size-4" />
                      <span>Descargar {attachment.fileName}</span>
                    </a>
                  )}
                </>
              )}
            </AlertDialogTitle>
          </AlertDialogHeader>
          <div className="flex flex-col">
            <AlertDialogCancel className="bg-black hover:bg-black/80 hover:cursor-pointer text-white w-max px-2 py-0.5 rounded font-semibold absolute top-4 right-4">
              X
            </AlertDialogCancel>
            <div className="[&>div]:max-h-96">
              <Table className="[&_td]:border-border [&_th]:border-border border-separate border-spacing-0 [&_tfoot_td]:border-t [&_th]:border-b [&_tr]:border-none [&_tr:not(:last-child)_td]:border-b">
                <TableHeader className="bg-background/90 sticky top-0 z-10 backdrop-blur-xs">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="min-w-[10ch]">ID</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Area</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Mes/Rol</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Factura</TableHead>
                    <TableHead>Cuenta</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Proyecto</TableHead>
                    <TableHead>Responsable</TableHead>
                    <TableHead>Vehículo</TableHead>
                    <TableHead>Observación</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {error ? (
                    <TableRow>
                      <TableCell colSpan={14} className="text-center py-8">
                        Error al cargar las solicitudes: {error}
                      </TableCell>
                    </TableRow>
                  ) : loading ? (
                    <TableRow>
                      <TableCell colSpan={14} className="text-center py-8">
                        <div className="flex items-center justify-center space-x-2">
                          <LoaderCircle className="animate-spin" size={20} />
                          <span className="animate-pulse">
                            Cargando solicitudes...
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : requestData && requestData.length > 0 ? (
                    requestData.map((item: Request, idx: number) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">
                          {item.unique_id}
                        </TableCell>
                        <TableCell>
                          {item.type === "discount" ? "Descuento" : "Gasto"}
                        </TableCell>
                        <TableCell>
                          {item.personnel_type === "nomina"
                            ? "Nómina"
                            : "Transporte"}
                        </TableCell>
                        <TableCell>
                          {new Date(item.request_date).toLocaleDateString(
                            "es-EC",
                            {
                              year: "numeric",
                              month: "short",
                              day: "2-digit",
                            }
                          )}
                        </TableCell>
                        <TableCell>{item.month}</TableCell>
                        <TableCell
                          className={`${
                            item.status === "in_reposition"
                              ? "text-indigo-600"
                              : item.status === "paid"
                              ? "text-emerald-600"
                              : item.status === "rejected"
                              ? "text-red-600"
                              : "text-gray-700"
                          } font-medium`}
                        >
                          {item.status === "in_reposition"
                            ? "En reposición"
                            : item.status === "paid"
                            ? "Pagada"
                            : item.status === "rejected"
                            ? "Rechazada"
                            : "Estado desconocdo"}
                        </TableCell>
                        <TableCell>
                          <TooltipProvider>
                            <Tooltip delayDuration={200}>
                              <TooltipTrigger className="max-w-[18ch] truncate pr-2">
                                {item.invoice_number}
                              </TooltipTrigger>
                              <TooltipContent
                                side="top"
                                className="bg-white dark:bg-black text-black dark:text-white shadow outline-0 rounded"
                              >
                                {item.invoice_number}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                        <TableCell>{item.account_id}</TableCell>
                        <TableCell className="text-indigo-700 font-medium">
                          {
                            Intl.NumberFormat("en-GY", {
                              currency: "USD",
                              style: "currency",
                              currencyDisplay: "symbol",
                            })
                              .format(parseFloat(item.amount))
                              .split("US")[1]
                          }
                        </TableCell>
                        <TableCell>{item.project}</TableCell>
                        <TableCell>
                          {item.responsible_id ? (
                            <span>{item.responsible_id}</span>
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            {item.vehicle_plate && (
                              <div className="flex flex-row space-x-1">
                                <span className="text-gray-500">Placa:</span>
                                <span>{item.vehicle_plate}</span>
                              </div>
                            )}
                            {item.vehicle_number && (
                              <div className="flex flex-row space-x-1">
                                <span className="text-gray-500">
                                  No. Transporte:
                                </span>
                                <TooltipProvider>
                                  <Tooltip delayDuration={200}>
                                    <TooltipTrigger className="max-w-[12ch] truncate pr-2">
                                      {item.vehicle_number}
                                    </TooltipTrigger>
                                    <TooltipContent
                                      side="top"
                                      className="bg-white dark:bg-black text-black dark:text-white shadow outline-0 rounded"
                                    >
                                      {item.vehicle_number}
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            )}
                            {!item.vehicle_plate && !item.vehicle_number && (
                              <span className="text-gray-400">N/A</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <TooltipProvider>
                            <Tooltip delayDuration={200}>
                              <TooltipTrigger className=" max-w-[35ch] truncate pr-2">
                                {item.note}
                              </TooltipTrigger>
                              <TooltipContent
                                side="top"
                                className="bg-white dark:bg-black text-black dark:text-white shadow outline-0 rounded"
                              >
                                {item.note}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                        <TableCell>
                          <EditRequestComponent row={item} />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={14} className="text-center py-8">
                        No se encontraron solicitudes para esta reposición.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
                <TableFooter className="bg-transparent">
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={8}>Total reposición:</TableCell>
                    <TableCell
                      colSpan={6}
                      className="text-start font-bold text-slate-800"
                    >
                      ${total}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Renderizar el visor de archivos fuera del AlertDialog cuando esté activo */}
      {isModalOpen && <FileViewer />}
    </>
  );
};

export default RepositionDetailsTableComponent;
