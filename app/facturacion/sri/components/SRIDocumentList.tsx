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
import api from "@/services/axios";

interface Document {
  id: number;
  clave_acceso: string;
  ruc_emisor: string;
  razon_social_emisor: string;
  fecha_emision: string;
  gcs_path_xml: string;
  gcs_path_pdf: string;
}

const SRIDocumentList = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await api.get("/sri-documents");
        setDocuments(response.data);
      } catch (error) {
        console.error("Error al cargar documentos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  if (loading)
    return <p className="text-sm text-muted-foreground">Cargando...</p>;

  return (
    <div className="w-full space-y-4">
      <h2 className="text-lg font-semibold">Documentos generados</h2>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Clave de Acceso</TableHead>
            <TableHead>RUC Emisor</TableHead>
            <TableHead>Razón Social</TableHead>
            <TableHead>Fecha Emisión</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((doc) => (
            <TableRow key={doc.id}>
              <TableCell>{doc.clave_acceso}</TableCell>
              <TableCell>{doc.ruc_emisor}</TableCell>
              <TableCell>{doc.razon_social_emisor}</TableCell>
              <TableCell>{doc.fecha_emision}</TableCell>
              <TableCell className="space-x-2">
                <a
                  href={`https://storage.googleapis.com/${process.env.NEXT_PUBLIC_GCS_BUCKET}/${doc.gcs_path_xml}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="sm">
                    XML
                  </Button>
                </a>
                <a
                  href={`https://storage.googleapis.com/${process.env.NEXT_PUBLIC_GCS_BUCKET}/${doc.gcs_path_pdf}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="sm">
                    PDF
                  </Button>
                </a>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default SRIDocumentList;
