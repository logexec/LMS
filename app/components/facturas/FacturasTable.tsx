/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHead,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import axios, { AxiosInstance, AxiosResponse } from "axios";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface ApiNote {
  id: number;
  name: string;
  description: string;
}

interface Factura {
  id: number;
  mes: number;
  razon_social_emisor: string;
  ruc_emisor: string;
  invoice_serial: string;
  fecha_emision: string;
  fecha_autorizacion: string;
  clave_acceso: string;
  importe_total: number;
  project: string | null;
  centro_costo: string | null;
  notas: string;
  observacion: string | null;
  contabilizado: string | null;
  tipo: string | null;
  proveedor_latinium: string | null;
  nota_latinium: string | null;
}

interface ProyectoLatinium {
  value: string;
  label: string;
}

interface ComboProyectoProps {
  selected: string | null;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}

const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  timeout: 120000,
});

// Combobox para proyectos
function ComboProyecto({ selected, options, onChange }: ComboProyectoProps) {
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.value === selected);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-[130px] justify-between"
        >
          {current?.label ?? "Selecciona"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[130px] max-h-[400px] p-0 overflow-y-auto">
        <Command>
          <CommandInput placeholder="Buscar..." />
          <CommandEmpty>No encontrado</CommandEmpty>
          <CommandGroup>
            {options.map((o) => (
              <CommandItem
                key={o.value}
                value={o.label}
                onSelect={() => {
                  onChange(o.value);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    o.value === selected ? "opacity-100" : "opacity-0"
                  )}
                />
                {o.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default function FacturasTable() {
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterMes, setFilterMes] = useState<string>("");
  const [filterProyecto, setFilterProyecto] = useState<string>("");
  const [filterCentro, setFilterCentro] = useState<string>("");
  const [filterTipo, setFilterTipo] = useState<string>("");

  const [proyectosLatinium, setProyectosLatinium] = useState<
    ProyectoLatinium[]
  >([]);

  useEffect(() => {
    const fetchProyectos = async () => {
      try {
        const response: AxiosResponse<{ data: ProyectoLatinium[] }> =
          await apiClient.get("/latinium/projects");
        setProyectosLatinium(response.data.data);
      } catch (err) {
        toast.error("No se pudieron cargar los proyectos de Latinium");
        console.error(err);
      }
    };
    fetchProyectos();
  }, []);

  const fetchFacturas = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = {};
      if (filterMes) params.mes = parseInt(filterMes.split("-")[1], 10);
      if (filterProyecto) params.project = filterProyecto;
      if (filterCentro) params.centro_costo = filterCentro;
      if (filterTipo) params.tipo = filterTipo;

      const response: AxiosResponse<{ data: any[] }> = await apiClient.get(
        "/facturas",
        { params }
      );
      const mapped: Factura[] = response.data.data.map((item) => ({
        id: item.id,
        mes: item.mes,
        razon_social_emisor: item.razon_social_emisor,
        ruc_emisor: item.ruc_emisor,
        invoice_serial: item.invoice_serial,
        fecha_emision: item.fecha_emision,
        fecha_autorizacion: item.fecha_autorizacion,
        clave_acceso: item.clave_acceso,
        importe_total: parseFloat(item.importe_total),
        project: item.project,
        centro_costo: item.centro_costo,
        notas: (item.notes as ApiNote[])
          .map((n) => `${n.name}: ${n.description}`)
          .join(", "),
        observacion: item.observacion,
        contabilizado: item.contabilizado,
        tipo: item.tipo,
        proveedor_latinium: item.proveedor_latinium,
        nota_latinium: item.nota_latinium,
      }));
      setFacturas(mapped);
    } catch (err) {
      toast.error("Error al cargar facturas");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filterMes, filterProyecto, filterCentro, filterTipo]);

  useEffect(() => {
    fetchFacturas();
  }, [fetchFacturas]);

  const updateFactura = async (id: number, data: Partial<Factura>) => {
    try {
      await apiClient.patch(`/facturas/${id}`, data);
      setFacturas((prev) =>
        prev.map((f) => (f.id === id ? ({ ...f, ...data } as Factura) : f))
      );
      toast.success("Factura actualizada");
    } catch (err) {
      toast.error("No se pudo actualizar");
      console.error(err);
    }
  };

  const renderSelect = (
    value: string | null,
    options: string[],
    onChange: (v: string) => void
  ) => (
    <Select value={value || "0"} onValueChange={onChange}>
      <SelectTrigger className="w-[120px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="0" defaultChecked disabled>
          Selecciona
        </SelectItem>
        {options.map((o) => (
          <SelectItem key={o} value={o}>
            {o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  return (
    <div className="space-y-6">
      {/* filtros */}
      <div className="flex gap-4 flex-wrap pt-3">
        <div className="relative">
          <small className="absolute -top-5 left-0">Mes</small>
          <Input
            type="month"
            value={filterMes}
            onChange={(e) => setFilterMes(e.target.value)}
            className="max-w-[180px]"
            placeholder="Filtrar por mes"
          />
        </div>
        <div className="relative">
          <small className="absolute -top-5 left-0">Proyecto</small>
          <ComboProyecto
            selected={filterProyecto}
            options={proyectosLatinium}
            onChange={setFilterProyecto}
          />
        </div>
        <div className="relative">
          <small className="absolute -top-5 left-0">Centro Costo</small>
          {renderSelect(filterCentro, ["CC101", "CC202"], setFilterCentro)}
        </div>
        <div className="relative">
          <small className="absolute -top-5 left-0">Tipo</small>
          {renderSelect(filterTipo, ["Bienes", "Servicios"], setFilterTipo)}
        </div>
      </div>

      <div className="h-full overflow-auto border border-gray-200 rounded-xl p-2">
        <Table>
          <TableHeader>
            <TableRow>
              {[
                "Mes",
                "Proveedor",
                "RUC",
                "Serie Factura",
                "Fecha Emisión",
                "Autorización",
                "Precio",
                "Proyecto",
                "Centro Costo",
                "Notas",
                "Observación",
                "Contabilizado",
                "Tipo",
                "Proveedor Latinium",
                "Nota Latinium",
              ].map((h) => (
                <TableHead key={h}>{h}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={15} className="text-center p-4">
                  Cargando...
                </TableCell>
              </TableRow>
            ) : facturas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={15} className="text-center p-4">
                  No hay facturas
                </TableCell>
              </TableRow>
            ) : (
              facturas.map((f) => (
                <TableRow key={f.id}>
                  <TableCell>{f.mes}</TableCell>
                  <TableCell>{f.razon_social_emisor}</TableCell>
                  <TableCell>{f.ruc_emisor}</TableCell>
                  <TableCell>{f.invoice_serial}</TableCell>
                  <TableCell>
                    {new Date(f.fecha_emision).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {new Date(f.fecha_autorizacion).toLocaleDateString()}
                  </TableCell>
                  <TableCell>${f.importe_total.toFixed(2)}</TableCell>
                  <TableCell>
                    <ComboProyecto
                      selected={f.project}
                      options={proyectosLatinium}
                      onChange={(v) => updateFactura(f.id, { project: v })}
                    />
                  </TableCell>
                  <TableCell>
                    {renderSelect(f.centro_costo, ["CC101", "CC202"], (v) =>
                      updateFactura(f.id, { centro_costo: v })
                    )}
                  </TableCell>
                  <TableCell>
                    <Input
                      value={f.notas}
                      className="w-max max-w-lg"
                      onBlur={(e) =>
                        updateFactura(f.id, { notas: e.target.value })
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={f.observacion || ""}
                      className="w-max max-w-lg"
                      onBlur={(e) =>
                        updateFactura(f.id, { observacion: e.target.value })
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <span className="w-max p-0.5 flex">{f.contabilizado ?? "Sin contabilizar"}</span>
                  </TableCell>
                  <TableCell>
                    {renderSelect(f.tipo, ["Bienes", "Servicios"], (v) =>
                      updateFactura(f.id, { tipo: v })
                    )}
                  </TableCell>
                  <TableCell>
                    <Input
                      value={f.proveedor_latinium || ""}
                      onBlur={(e) =>
                        updateFactura(f.id, {
                          proveedor_latinium: e.target.value,
                        })
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={f.nota_latinium || ""}
                      onBlur={(e) =>
                        updateFactura(f.id, { nota_latinium: e.target.value })
                      }
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
