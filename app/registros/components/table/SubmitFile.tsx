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
import { useDropzone, FileRejection } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { SendHorizontal } from "lucide-react";

interface SubmitFileProps {
  onCreateReposicion: (requestIds: string[], file: File) => Promise<void>;
  selectedRequests: string[];
}

export function SubmitFile({
  onCreateReposicion,
  selectedRequests,
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
      await onCreateReposicion(selectedRequests, selectedFile);
      toast.success("Solicitud enviada con éxito");
      setIsDialogOpen(false);
      setSelectedFile(null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al enviar la solicitud"
      );
      console.error(error);
    }
  };

  return (
    <>
      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogTrigger asChild>
          <Button onClick={() => setIsDialogOpen(true)}>
            <SendHorizontal className="mr-2 h-4 w-4" />
            Enviar Solicitud
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
            <Button onClick={handleConfirmSend} disabled={!selectedFile}>
              Confirmar Envío
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
