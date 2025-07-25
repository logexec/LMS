import React, {
  useCallback,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import { useDropzone } from "react-dropzone";
import { unzipFiles } from "@/lib/unzip";
import { parseFacturaXml } from "@/lib/xmlParser";
import { ParsedFactura } from "@/types/factura";
import { toast } from "sonner";
import { Upload, X } from "lucide-react";
import { cn, formatBytes } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export type FilePreview =
  | {
      status: "pending";
      file: File;
      name: string;
      size: number;
    }
  | {
      status: "valid";
      parsed: ParsedFactura;
      file: File;
      name: string;
      size: number;
    }
  | {
      status: "invalid";
      file: File;
      name: string;
      size: number;
    };

interface Props {
  onChange: (data: ParsedFactura[]) => void;
  disabled?: boolean;
  accept?: string;
}

export interface XmlDropzoneRef {
  clearFiles: () => void;
}

export const XmlDropzone = forwardRef<XmlDropzoneRef, Props>(
  ({ onChange, disabled, accept }, ref) => {
    const [files, setFiles] = useState<FilePreview[]>([]);

    // Permitir al padre limpiar archivos
    useImperativeHandle(ref, () => ({
      clearFiles: () => {
        setFiles([]);
        onChange([]);
      },
    }));

    const handleDrop = useCallback(
      async (droppedFiles: File[]) => {
        const allFiles: File[] = [];

        for (const file of droppedFiles) {
          if (file.name.endsWith(".zip")) {
            const unzipped = await unzipFiles(file);
            allFiles.push(...unzipped);
          } else {
            allFiles.push(file);
          }
        }

        const previews: FilePreview[] = allFiles.map((f) => ({
          file: f,
          name: f.name,
          size: f.size,
          status: "pending",
        }));

        setFiles(previews);

        const parsedFacturas: ParsedFactura[] = [];
        const updated: FilePreview[] = [];

        for (const preview of previews) {
          try {
            const content = await preview.file.text();

            let parsed: ParsedFactura | null = null;

            if (preview.name.toLowerCase().endsWith(".txt")) {
              parsed = {
                rawFile: preview.file,
                archivoOriginal: preview.name,
                isTxt: true,
              } as ParsedFactura;
            } else {
              parsed = await parseFacturaXml(content, preview.name);
            }

            if (!parsed) {
              toast.warning(`Archivo inválido: ${preview.name}`);
              updated.push({ ...preview, status: "invalid" });
              continue;
            }

            updated.push({
              ...preview,
              status: "valid",
              parsed: {
                ...parsed,
                rawFile: preview.file,
                archivoOriginal: preview.name,
              },
            });
            parsedFacturas.push({
              ...parsed,
              rawFile: preview.file,
              archivoOriginal: preview.name,
            });
          } catch (e) {
            toast.error(`Error leyendo: ${preview.name}`);
            updated.push({ ...preview, status: "invalid" });
            console.error(e);
          }
        }

        setFiles(updated);
        onChange(parsedFacturas);
      },
      [onChange]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop: handleDrop,
      multiple: true,
      disabled,
      accept:
        accept === "xml"
          ? {
              "text/xml": [".xml"],
              "application/zip": [".zip"],
            }
          : accept === "txt"
          ? {
              "text/plain": [".txt"],
            }
          : {
              "text/xml": [".xml"],
              "application/zip": [".zip"],
              "text/plain": [".txt"],
            },
    });

    return (
      <div className="space-y-4">
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed border-muted rounded-xl p-6 text-center transition-all cursor-pointer",
            isDragActive ? "bg-muted/40" : "hover:bg-muted/20"
          )}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center gap-2">
            <Upload className="text-muted-foreground w-6 h-6" />
            <p className="text-sm">
              Arrastra o selecciona archivos txt, XML o ZIP
            </p>
          </div>
        </div>

        {files.length > 0 && (
          <div className="space-y-2">
            {files.map((f, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-3 bg-background border rounded-lg px-4 py-2"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    {f.status === "pending" && (
                      <div className="size-6 animate-spin rounded-full border-2 border-muted border-t-transparent" />
                    )}
                    {f.status === "valid" && (
                      <div className="size-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold">
                        ✓
                      </div>
                    )}
                    {f.status === "invalid" && (
                      <div className="size-6 rounded-full bg-red-500 text-white flex items-center justify-center text-xs font-bold">
                        ✗
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{f.name}</span>
                    <span className="text-muted-foreground text-xs">
                      {formatBytes(f.size)}
                    </span>
                  </div>
                </div>

                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    const updatedList = files.filter((_, idx) => idx !== i);
                    setFiles(updatedList);

                    const remaining = updatedList
                      .filter(
                        (f): f is Extract<typeof f, { status: "valid" }> =>
                          f.status === "valid"
                      )
                      .map((f) => f.parsed);
                    onChange(remaining);
                  }}
                  disabled={disabled}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}

            {files.length > 1 && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setFiles([]);
                  onChange([]);
                }}
                disabled={disabled}
              >
                Eliminar todos
              </Button>
            )}
          </div>
        )}
      </div>
    );
  }
);

XmlDropzone.displayName = "XmlDropzone";
