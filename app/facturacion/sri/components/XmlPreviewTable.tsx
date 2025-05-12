"use client";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import api from "@/services/axios";

interface XmlPreviewTableProps {
  folder: string;
}

const XmlPreviewTable: React.FC<XmlPreviewTableProps> = ({ folder }) => {
  const [xmlData, setXmlData] = useState<Record<string, string>[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadXmls = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(`/load-xmls?folder=${folder}`);
        setXmlData(response.data.data || []);
      } catch (error) {
        console.error("Error al cargar XMLs:", error);
        toast.error("No se pudo cargar la vista previa");
      } finally {
        setIsLoading(false);
      }
    };

    if (folder) loadXmls();
  }, [folder]);

  if (isLoading)
    return (
      <p className="text-center text-muted-foreground">Cargando XMLs...</p>
    );
  if (!xmlData.length)
    return (
      <p className="text-center text-muted-foreground">
        No se encontraron XMLs
      </p>
    );

  const columns = Object.keys(xmlData[0]);

  return (
    <div className="overflow-x-auto p-2">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead key={col}>{col.replace(/_/g, " ")}</TableHead>
            ))}
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {xmlData.map((row, idx) => (
            <TableRow key={idx}>
              {columns.map((col) => (
                <TableCell key={col}>{row[col]}</TableCell>
              ))}
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    window.open(
                      `${process.env.NEXT_PUBLIC_API_URL}/storage/comprobantes/${folder}/XML/${row.clave_acceso}.xml`,
                      "_blank"
                    )
                  }
                >
                  Ver XML
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default XmlPreviewTable;
