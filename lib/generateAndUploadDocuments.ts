import api from "@/services/axios";
import { jsPDF } from "jspdf";

// Genera un XML simple a partir de metadata
function buildXML(metadata: Record<string, string>): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<factura>
  ${Object.entries(metadata)
    .map(([key, value]) => `<${key}>${value}</${key}>`)
    .join("\n  ")}
</factura>`;
}

// Genera PDF base64
function buildPDF(metadata: Record<string, string>): string {
  const doc = new jsPDF();
  doc.setFontSize(12);
  doc.text("Factura electrónica", 10, 10);

  let y = 20;
  for (const [key, value] of Object.entries(metadata)) {
    doc.text(`${key}: ${value}`, 10, y);
    y += 7;
  }

  return doc.output("datauristring").split(",")[1]; // solo base64
}

// Función principal
export async function generateAndUploadDocuments(
  rows: Record<string, string>[]
): Promise<void> {
  const documents = rows.map((row) => ({
    metadata: row,
    xml: buildXML(row),
    pdf: buildPDF(row),
  }));

  try {
    const response = await api.post("/upload-documents", { documents });
    console.log("Respuesta del backend:", response.data);
  } catch (err) {
    console.error("Error al subir documentos:", err);
    throw err;
  }
}
