// import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableCell,
  TableBody,
} from "@/components/ui/table";

type Payroll = {
  id: number;
  user: { name: string };
  period_start: string;
  period_end: string;
  net_pay: number;
  pdf_path: string;
};

export function PayrollList() {
  //   const { data = [] } = useQuery<Payroll[]>({
  //     queryKey: ["payrolls"],
  //     queryFn: () => axios.get("/payrolls").then((res) => res.data),
  //   });
  const data = [];

  return (
    <Card className="p-6 mt-6 rounded-2xl shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Historial de Pagos</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableCell>Empleado</TableCell>
            <TableCell>Período</TableCell>
            <TableCell>Total Neto</TableCell>
            <TableCell>Respaldo</TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length ? (
            data.map((p) => (
              <TableRow key={p.id}>
                <TableCell>{p.user.name}</TableCell>
                <TableCell>
                  {p.period_start} → {p.period_end}
                </TableCell>
                <TableCell>${p.net_pay.toFixed(2)}</TableCell>
                <TableCell>
                  <a
                    href={`https://storage.googleapis.com/lms-archivos/${p.pdf_path}`}
                    target="_blank"
                    className="text-blue-600 underline"
                  >
                    Ver
                  </a>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={4}
                className="text-center text-gray-500 italic"
              >
                No se encontraron datos.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Card>
  );
}
