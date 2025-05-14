/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DownloadIcon,
  BarChart2Icon,
  DollarSignIcon,
  Users2Icon,
  FileSpreadsheetIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/services/axios";
import { toast } from "sonner";

// Interfaces
interface StatsData {
  totalDocuments: number;
  totalAmount: number;
  providerCount: number;
  byProvider: { name: string; value: number; ruc?: string; amount?: number }[];
  byMonth: { name: string; amount: number; count: number }[];
}

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
  "#FFC658",
  "#8DD1E1",
  "#A4DE6C",
  "#D0ED57",
];

const ReportsTab = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedYear, setSelectedYear] = useState<string>(
    new Date().getFullYear().toString()
  );
  const [selectedMonth, setSelectedMonth] = useState<string>(
    (new Date().getMonth() + 1).toString().padStart(2, "0")
  );
  const [statsData, setStatsData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState<string>("compras");
  const [generatingReport, setGeneratingReport] = useState(false);

  useEffect(() => {
    fetchStatsData();
  }, []);

  const fetchStatsData = async () => {
    try {
      setLoading(true);
      const response = await api.get("/sri-documents-stats");
      setStatsData(response.data);
    } catch (error) {
      console.error("Error al cargar estadísticas:", error);
      toast.error("Error al cargar datos estadísticos");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    if (!reportType) {
      toast.warning("Selecciona un tipo de reporte");
      return;
    }

    try {
      setGeneratingReport(true);
      const period = `${selectedYear}-${selectedMonth}`;

      const response = await api.post(
        "/reports/generate",
        {
          type: reportType,
          period: period,
        },
        { responseType: "blob" }
      );

      // Crear y descargar el archivo
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `reporte-${reportType}-${period}.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Reporte generado correctamente");
    } catch (error) {
      console.error("Error al generar reporte:", error);
      toast.error("Error al generar el reporte");
    } finally {
      setGeneratingReport(false);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="dashboard">
            <BarChart2Icon className="mr-2 h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="reports">
            <FileSpreadsheetIcon className="mr-2 h-4 w-4" />
            Generar Reportes
          </TabsTrigger>
        </TabsList>

        {/* Dashboard */}
        <TabsContent value="dashboard" className="space-y-6">
          {loading ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Skeleton className="h-80 w-full" />
                <Skeleton className="h-80 w-full" />
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="py-4">
                    <CardTitle className="text-md flex items-center">
                      <DollarSignIcon className="mr-2 h-4 w-4 text-green-500" />
                      Total Facturado
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">
                      ${statsData?.totalAmount.toFixed(2) || "0.00"}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="py-4">
                    <CardTitle className="text-md flex items-center">
                      <BarChart2Icon className="mr-2 h-4 w-4 text-blue-500" />
                      Comprobantes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">
                      {statsData?.totalDocuments || 0}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="py-4">
                    <CardTitle className="text-md flex items-center">
                      <Users2Icon className="mr-2 h-4 w-4 text-orange-500" />
                      Proveedores
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">
                      {statsData?.providerCount || 0}
                    </p>
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
                            data={statsData?.byProvider || []}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            dataKey="value"
                            nameKey="name"
                            label={({ name, percent }) =>
                              `${name}: ${(percent * 100).toFixed(0)}%`
                            }
                          >
                            {statsData?.byProvider.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value) => [
                              `${value} documentos`,
                              "Cantidad",
                            ]}
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
                        <LineChart
                          data={statsData?.byMonth || []}
                          margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis yAxisId="left" orientation="left" />
                          <YAxis
                            yAxisId="right"
                            orientation="right"
                            domain={[0, "dataMax + 5"]}
                          />
                          <Tooltip
                            formatter={(value: any, name) => {
                              if (name === "amount")
                                return [`$${value.toFixed(2)}`, "Monto"];
                              return [value, "Documentos"];
                            }}
                          />
                          <Legend />
                          <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="amount"
                            stroke="#8884d8"
                            name="Monto ($)"
                            strokeWidth={2}
                          />
                          <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="count"
                            stroke="#82ca9d"
                            name="Cantidad"
                            strokeWidth={2}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Tabla de resumen por proveedor */}
              <Card>
                <CardHeader>
                  <CardTitle>Resumen por Proveedor</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Proveedor
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            RUC
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Documentos
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {statsData?.byProvider
                          .slice(0, 10)
                          .map((provider, index) => (
                            <tr key={index}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {provider.name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {provider.ruc || "-"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {provider.value}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                ${provider.amount?.toFixed(2) || "-"}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Generación de Reportes */}
        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card
              className={cn(
                "cursor-pointer transition-all",
                reportType === "compras"
                  ? "ring-2 ring-primary ring-offset-2"
                  : "hover:shadow-md"
              )}
              onClick={() => setReportType("compras")}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <FileSpreadsheetIcon className="h-12 w-12 text-blue-500" />
                  {reportType === "compras" && (
                    <div className="h-3 w-3 rounded-full bg-primary" />
                  )}
                </div>
                <CardTitle className="text-lg">Reporte de Compras</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Detalle de facturas recibidas por período
                </p>
              </CardContent>
            </Card>

            <Card
              className={cn(
                "cursor-pointer transition-all",
                reportType === "iva"
                  ? "ring-2 ring-primary ring-offset-2"
                  : "hover:shadow-md"
              )}
              onClick={() => setReportType("iva")}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <FileSpreadsheetIcon className="h-12 w-12 text-red-500" />
                  {reportType === "iva" && (
                    <div className="h-3 w-3 rounded-full bg-primary" />
                  )}
                </div>
                <CardTitle className="text-lg">Declaración de IVA</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Reporte para declaración mensual de IVA
                </p>
              </CardContent>
            </Card>

            <Card
              className={cn(
                "cursor-pointer transition-all",
                reportType === "ret"
                  ? "ring-2 ring-primary ring-offset-2"
                  : "hover:shadow-md"
              )}
              onClick={() => setReportType("ret")}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <FileSpreadsheetIcon className="h-12 w-12 text-green-500" />
                  {reportType === "ret" && (
                    <div className="h-3 w-3 rounded-full bg-primary" />
                  )}
                </div>
                <CardTitle className="text-lg">Retenciones</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Reporte de retenciones efectuadas
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col md:flex-row gap-4 p-4 bg-muted/40 rounded-lg">
            <div className="space-y-2 w-full md:w-1/3">
              <label className="text-sm font-medium">Año</label>
              <Select
                value={selectedYear}
                onValueChange={(value) => setSelectedYear(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un año" />
                </SelectTrigger>
                <SelectContent>
                  {[2025, 2024, 2023, 2022, 2021].map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 w-full md:w-1/3">
              <label className="text-sm font-medium">Mes</label>
              <Select
                value={selectedMonth}
                onValueChange={(value) => setSelectedMonth(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un mes" />
                </SelectTrigger>
                <SelectContent>
                  {[
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
                  ].map((month) => (
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
                disabled={generatingReport || !reportType}
                className="w-full"
              >
                {generatingReport ? (
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
            <p>
              Nota: Los reportes se generan en formato Excel para facilitar su
              revisión y edición. Los datos se basan en los comprobantes
              registrados en el sistema.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsTab;
