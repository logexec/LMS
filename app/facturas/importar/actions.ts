import api from "@/services/axios";
import axios from "axios";

export interface ImportError {
  file: string;
  error: string;
}

export interface ImportResult {
  success: boolean;
  imported: number[];
  errors: ImportError[];
}

/**
 * Envía un array de File (.xml y .txt) a sus endpoints correspondientes,
 * y devuelve un solo ImportResult agregando importados y errores.
 */
export async function enviarFacturas(files: File[]): Promise<ImportResult> {
  // Separamos archivos por extensión
  const xmlFiles: File[] = [];
  const txtFiles: File[] = [];

  files.forEach((file) => {
    // extraemos la extensión de forma segura
    const extension = file.name.split(".").pop()?.toLowerCase() ?? "";

    if (extension === "txt") {
      txtFiles.push(file);
    } else {
      xmlFiles.push(file);
    }
  });

  // Resultado acumulado
  const result: ImportResult = {
    success: true,
    imported: [],
    errors: [],
  };

  // 1) Procesar todos los .txt
  for (const file of txtFiles) {
    const form = new FormData();
    form.append("file", file, file.name);

    try {
      const resp = await api.post<ImportResult>("/import-sri-txt", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      result.imported.push(...resp.data.imported);
      result.errors.push(...resp.data.errors);
    } catch (error: unknown) {
      let message = "Error al importar TXT";
      if (axios.isAxiosError(error)) {
        message =
          (error.response?.data as { message?: string })?.message || message;
      }
      result.errors.push({ file: file.name, error: message });
      result.success = false;
    }
  }

  // 2) Procesar el lote de .xml (si hay)
  if (xmlFiles.length > 0) {
    const form = new FormData();
    xmlFiles.forEach((file) => form.append("xml_files[]", file, file.name));

    try {
      const resp = await api.post<ImportResult>("/facturas/importar", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      result.imported.push(...resp.data.imported);
      result.errors.push(...resp.data.errors);
    } catch (error: unknown) {
      let message = "Error al importar XML";
      if (axios.isAxiosError(error)) {
        message =
          (error.response?.data as { message?: string })?.message || message;
      }
      // Si falló toda la llamada, marcamos todos los xml como error
      xmlFiles.forEach((file) =>
        result.errors.push({ file: file.name, error: message })
      );
      result.success = false;
    }
  }

  return result;
}
