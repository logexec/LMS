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
import { LoaderCircle, NotepadText } from "lucide-react";
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

  async function getRepositionDetails(reposition: number) {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`reposiciones/${reposition}`);

      // Verificar si la respuesta contiene datos de requests
      if (
        response.data &&
        response.data.requests &&
        Array.isArray(response.data.requests)
      ) {
        setRequestData(response.data.requests);
      } else {
        // Si no hay datos o no tienen el formato esperado, mostrar un mensaje informativo
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

  // Solo cargamos los datos cuando se abre el diálogo
  useEffect(() => {
    if (isOpen) {
      getRepositionDetails(reposition);
    }
  }, [isOpen, reposition]);

  // Función para manejar la apertura del diálogo
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    // Si se cierra el diálogo, limpiamos los datos para liberar memoria
    if (!open) {
      setRequestData(null);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger className="flex flex-row space-x-1.5 items-center justify-center border border-black/8 dark:border-white/8 rounded py-1 px-2 shadow-xs cursor-pointer hover:bg-gray-100/70 dark:hover:bg-slate-900/70">
        <NotepadText className="size-4" />
        <span>Detalle</span>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-11/12">
        <AlertDialogHeader>
          <AlertDialogTitle>
            Detalles de la reposición No. {reposition}
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
                  <TableHead>Acciones</TableHead>
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
                        {/* Editar linea */}
                        Editar
                        {/* <ItemActions item={item} /> */}
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
  );
};

export default RepositionDetailsTableComponent;
