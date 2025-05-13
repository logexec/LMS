"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileIcon, DownloadIcon } from "lucide-react";
import api from "@/services/axios";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface ReportType {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
}

const ReportsTab = () => {
  const [selectedReport, setSelectedReport] = useState<string>("");
  const [period, setPeriod] = useState<string>(
    new Date().toISOString().substring(0, 7)
  ); // YYYY-MM format
  const [loading, setLoading] = useState(false);

  const reportTypes: ReportType[] = [
    {
      id: "compras",
      name: "Reporte de Compras",
      description: "Detalle de facturas recibidas por período",
      icon: <FileIcon className="h-8 w-8 text-blue-500" />,
    },
    {
      id: "iva",
      name: "Declaración de IVA",
      description: "Reporte para declaración mensual de IVA",
      icon: <FileIcon className="h-8 w-8 text-red-500" />,
    },
    {
      id: "ret",
      name: "Retenciones",
      description: "Reporte de retenciones efectuadas",
      icon: <FileIcon className="h-8 w-8 text-green-500" />,
    },
  ];

  const [stats, setStats] = useState({
    totalDocuments: 0,
    totalAmount: 0,
    providerCount: 0,
    byProvider: [],
    byMonth: [],
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get("/sri-documents/stats");
        setStats(response.data);
      } catch (error) {
        console.error("Error al cargar estadísticas:", error);
      }
    };

    fetchStats();
  }, []);

  const handleGenerateReport = async () => {
    if (!selectedReport) {
      toast.warning("Selecciona un tipo de reporte");
      return;
    }

    try {
      setLoading(true);

      // Aquí llamarías a tu endpoint para generar el reporte
      const response = await api.post(
        "/reports/generate",
        {
          type: selectedReport,
          period: period,
        },
        { responseType: "blob" }
      );

      // Crear un enlace para descargar el archivo
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `reporte-${selectedReport}-${period}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success("Reporte generado correctamente");
    } catch (error) {
      console.error("Error al generar reporte:", error);
    } finally {
      setLoading(false);
    }
  };

  const months = [
    { value: "01", label: "Enero" },
    { value: "02", label: "Febrero" },
    { value: "03", label: "Marzo" },
    { value: "04", label: "Abril" },
    { value: "05", label: "Mayo" },
    { value: "06", label: "Junio" },
    { value: "07", label: "Julio" },
    { value: "08", label: "Agosto" },
    { value: "09", label: "Septiembre" },
    { value: "10", label: "Octubre" },
    { value: "11", label: "Noviembre" },
    { value: "12", label: "Diciembre" },
  ];

  const years = [2025, 2024, 2023, 2022, 2021].map((year) => ({
    value: year.toString(),
    label: year.toString(),
  }));

  //   const currentYear = new Date().getFullYear().toString();
  //   const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, "0");

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-xl font-semibold">Generación de Reportes</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {reportTypes.map((report) => (
          <Card
            key={report.id}
            className={`cursor-pointer transition-all ${
              selectedReport === report.id
                ? "ring-2 ring-primary ring-offset-2"
                : "hover:shadow-md"
            }`}
            onClick={() => setSelectedReport(report.id)}
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                {report.icon}
                {selectedReport === report.id && (
                  <div className="h-3 w-3 rounded-full bg-primary" />
                )}
              </div>
              <CardTitle className="text-lg">{report.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>{report.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Dashboard</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-md">Total Documentos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.totalDocuments}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-md">Monto Total</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                ${stats.totalAmount.toFixed(2)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-md">Proveedores</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.providerCount}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Documentos por Proveedor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.byProvider}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {stats.byProvider.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={`#${(index * 1234 + 5678)
                            .toString(16)
                            .substring(0, 6)}`}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [`${value} documentos`, "Cantidad"]}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tendencia Mensual</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={stats.byMonth}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: number) => [
                        `$${value.toFixed(2)}`,
                        "Monto",
                      ]}
                    />
                    <Legend />
                    <Bar dataKey="amount" fill="#8884d8" name="Monto" />
                    <Bar dataKey="count" fill="#82ca9d" name="Cantidad" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 pt-4">
        <div className="space-y-2 w-full md:w-1/3">
          <label className="text-sm font-medium">Año</label>
          <Select
            value={period.split("-")[0]}
            onValueChange={(value) =>
              setPeriod(`${value}-${period.split("-")[1]}`)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un año" />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year.value} value={year.value}>
                  {year.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 w-full md:w-1/3">
          <label className="text-sm font-medium">Mes</label>
          <Select
            value={period.split("-")[1]}
            onValueChange={(value) =>
              setPeriod(`${period.split("-")[0]}-${value}`)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un mes" />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={month.value} value={month.value}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full md:w-1/3 flex items-end">
          <Button
            onClick={handleGenerateReport}
            disabled={loading || !selectedReport}
            className="w-full"
          >
            {loading ? (
              <>Generando...</>
            ) : (
              <>
                <DownloadIcon className="mr-2 h-4 w-4" />
                Generar Reporte
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="text-sm text-muted-foreground pt-2">
        Nota: Los reportes se generan en formato Excel para facilitar su
        revisión y edición.
      </div>
    </div>
  );
};

export default ReportsTab;
