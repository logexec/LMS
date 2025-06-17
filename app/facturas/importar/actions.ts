/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/services/axios";

export async function enviarFacturas(files: File[]) {
  const form = new FormData();

  files.forEach((file) => {
    form.append("xml_files[]", file, file.name);
  });

  try {
    const res = await api.post("/facturas/importar", form, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return res.data as {
      success: boolean;
      imported: string[];
      errors: { file: string; error: string }[];
    };
  } catch (error: any) {
    const message = error?.response?.data?.message || "Error al importar";
    throw new Error(message);
  }
}
