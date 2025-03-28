import { useState } from "react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, SendHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SubmitFileProps {
  customText?: string;
  showBadge?: boolean;
  isLoading: boolean;
  onCreateReposicion: (
    requestIds: string[],
    attachment: File
  ) => Promise<Response | null>;
  selectedRequests: string[];
}

export function SubmitFile({
  onCreateReposicion,
  selectedRequests,
  isLoading = false,
  customText,
  showBadge = true,
}: SubmitFileProps) {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    multiple: false,
  });

  const handleConfirmSend = async () => {
    if (!selectedFile) {
      toast.error("Debes subir un archivo antes de enviar la solicitud");
      return;
    }

    try {
      const response = await onCreateReposicion(selectedRequests, selectedFile);
      if (response?.status === 201) {
        // Usamos optional chaining para manejar null
        toast.success("Solicitud enviada con éxito");
        setSelectedFile(null);
      }
    } catch (error) {
      console.error("Error in handleConfirmSend:", error);
      // Los errores ya se manejan en handleCreateLoan, no añadimos toast aquí
    } finally {
      setIsDialogOpen(false);
    }
  };

  return (
    <>
      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogTrigger asChild>
          <Button onClick={() => setIsDialogOpen(true)}>
            <SendHorizontal className="mr-2 h-4 w-4" />
            {customText ? customText : "Enviar solicitud"}
            {showBadge && (
              <Badge variant="secondary" className="ml-2">
                {Object.keys(selectedRequests).length}
              </Badge>
            )}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Subir Archivo</AlertDialogTitle>
            <AlertDialogDescription>
              Arrastra o selecciona un archivo para adjuntar a la solicitud.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div
            {...getRootProps()}
            className="border border-dashed p-4 text-center cursor-pointer"
          >
            <input {...getInputProps()} />
            {selectedFile ? (
              <p>{selectedFile.name}</p>
            ) : (
              <p>Arrastra aquí un archivo o haz click para seleccionarlo</p>
            )}
          </div>
          <AlertDialogFooter>
            <Button onClick={() => setIsDialogOpen(false)} variant="outline">
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmSend}
              disabled={!selectedFile || isLoading}
            >
              {!isLoading ? (
                "Confirmar Envío"
              ) : (
                <span className="flex flex-row">
                  <Loader2 className="animate-spin" /> Procesando...
                </span>
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
