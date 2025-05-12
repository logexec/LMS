import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Props {
  data: Record<string, string>[];
}

const ResultsTable: React.FC<Props> = ({ data }) => {
  const columns = [
    "RUC_EMISOR",
    "RAZON_SOCIAL_EMISOR",
    "TIPO_COMPROBANTE",
    "SERIE_COMPROBANTE",
    "CLAVE_ACCESO",
    "FECHA_AUTORIZACION",
    "FECHA_EMISION",
    "IDENTIFICACION_RECEPTOR",
    "VALOR_SIN_IMPUESTOS",
    "IVA",
    "IMPORTE_TOTAL",
    "NUMERO_DOCUMENTO_MODIFICADO",
  ];

  const currencyColumns = ["VALOR_SIN_IMPUESTOS", "IVA", "IMPORTE_TOTAL"];

  return (
    <div>
      <div className="[&>div]:max-h-96">
        {data.length ? (
          <Table className="[&_td]:border-border [&_th]:border-border border-separate border-spacing-0 [&_tfoot_td]:border-t [&_th]:border-b [&_tr]:border-none [&_tr:not(:last-child)_td]:border-b">
            <TableHeader className="bg-background/90 sticky top-0 z-10 backdrop-blur-xs">
              <TableRow className="hover:bg-transparent">
                <TableHead>RUC Emisor</TableHead>
                <TableHead>Razón Social</TableHead>
                <TableHead>Tipo </TableHead>
                <TableHead>Serie del Comprobante</TableHead>
                <TableHead>Clave de acceso</TableHead>
                <TableHead>Fecha de Autorización</TableHead>
                <TableHead>Fecha de Emisión</TableHead>
                <TableHead>Identificación del Receptor</TableHead>
                <TableHead>Valor sin Impuestos</TableHead>
                <TableHead>IVA</TableHead>
                <TableHead>Importe Total</TableHead>
                <TableHead>Número de Documento Modificado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item, idx) => (
                <TableRow key={idx}>
                  {columns.map((col) => (
                    <TableCell key={col}>
                      {currencyColumns.includes(col) && item[col]
                        ? Intl.NumberFormat("en-GY", {
                            style: "currency",
                            currency: "USD",
                          }).format(parseFloat(item[col]))
                        : item[col] || "-"}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-slate-500 text-base">
            Carga un archivo .txt para comenzar
          </p>
        )}
      </div>
    </div>
  );
};

export default ResultsTable;
