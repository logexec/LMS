import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TsvTableProps {
  data: Record<string, string>[];
}

const TsvTable: React.FC<TsvTableProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center p-4 text-muted-foreground">
        <p>No hay datos para mostrar</p>
      </div>
    );
  }

  // Get all unique keys from the data
  const allKeys = Array.from(new Set(data.flatMap((row) => Object.keys(row))));

  // Define priority keys that should appear first
  const priorityKeys = [
    "CLAVE_ACCESO",
    "RUC_EMISOR",
    "RAZON_SOCIAL_EMISOR",
    "TIPO_COMPROBANTE",
    "SERIE_COMPROBANTE",
    "FECHA_EMISION",
    "FECHA_AUTORIZACION",
    "VALOR_SIN_IMPUESTOS",
    "IVA",
    "IMPORTE_TOTAL",
    "IDENTIFICACION_RECEPTOR",
  ];

  // Sort keys to ensure priority keys come first
  const sortedKeys = [
    ...priorityKeys.filter((key) => allKeys.includes(key)),
    ...allKeys.filter((key) => !priorityKeys.includes(key)),
  ];

  const formatCurrency = (value: string | undefined) => {
    if (!value) return "-";
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return value;

    return new Intl.NumberFormat("es-EC", {
      style: "currency",
      currency: "USD",
    }).format(numValue);
  };

  const formatDate = (value: string | undefined) => {
    if (!value) return "-";
    // Try to parse date in format DD/MM/YYYY
    const dateMatch = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (dateMatch) {
      const [, day, month, year] = dateMatch;
      return `${day}/${month}/${year}`;
    }
    return value;
  };

  const formatValue = (key: string, value: string | undefined) => {
    if (
      key.includes("VALOR") ||
      key.includes("IVA") ||
      key.includes("IMPORTE") ||
      key.includes("TOTAL")
    ) {
      return formatCurrency(value);
    }
    if (key.includes("FECHA")) {
      return formatDate(value);
    }
    return value || "-";
  };

  return (
    <div className="rounded-md border">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {sortedKeys.map((key) => (
                <TableHead key={key}>{key}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {sortedKeys.map((key) => (
                  <TableCell key={key}>{formatValue(key, row[key])}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TsvTable;
