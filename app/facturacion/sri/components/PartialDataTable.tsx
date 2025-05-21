/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  SortingState,
  getSortedRowModel,
  ColumnFiltersState,
  getFilteredRowModel,
} from "@tanstack/react-table";
import { useSri, ExcelRow } from "@/contexts/SriContext";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  SaveIcon,
  ArrowLeftIcon,
  LoaderIcon,
  CheckCircleIcon,
  SearchIcon,
  XIcon,
  CheckIcon,
  ChevronsUpDownIcon,
  RefreshCwIcon,
  SlidersHorizontalIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import axios from "axios";
import { getAuthToken } from "@/services/auth.service";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Opciones para número de filas por página
const rowsPerPageOptions = [10, 25, 50, 100, 0]; // 0 significa "Todas"

const PartialDataTable = () => {
  const { state, actions } = useSri();
  const { 
    excelData, 
    providers, 
    projects, 
    centrosCosto, 
    isLoading, 
    fetchingData,
    rowsPerPage 
  } = state;
  const { updateRow, setStep, fetchProjects, fetchProviders, setRowsPerPage } = actions;

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");
  const [projectsOpen, setProjectsOpen] = useState<boolean[]>([]);
  const [centrosOpen, setCentrosOpen] = useState<boolean[]>([]);

  // Inicializar estados de popover para cada fila
  useEffect(() => {
    setProjectsOpen(new Array(excelData.length).fill(false));
    setCentrosOpen(new Array(excelData.length).fill(false));
  }, [excelData.length]);

  // Definición de columnas basadas en las cabeceras del PREBAM
  const columns: ColumnDef<ExcelRow>[] = [
    // Datos que vienen del Excel (solo lectura)
    {
      accessorKey: "mes",
      header: () => <span className="font-medium text-sky-600">MES</span>,
      cell: ({ row }) => (
        <Input
          className="h-8 text-xs w-20 border-sky-600/30"
          defaultValue={row.getValue("mes") as string}
          onChange={(e) => updateRow(row.index, { mes: e.target.value })}
          placeholder="Mes"
        />
      ),
    },
    {
      accessorKey: "proveedor",
      header: () => (
        <span className="font-medium text-emerald-600">PROVEEDOR</span>
      ),
      cell: ({ row }) => (
        <div className="font-mono">
          <TooltipProvider>
            <Tooltip delayDuration={100}>
              <TooltipTrigger className="w-32 truncate">
                {row.getValue("proveedor")}
              </TooltipTrigger>
              <TooltipContent className="bg-white dark:bg-black text-black dark:text-white border border-slate-100 dark:border-slate-900 rounded shadow-sm">
                {row.getValue("proveedor")}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      ),
    },
    {
      accessorKey: "proveedor_ruc",
      header: () => <span className="font-medium text-emerald-600">RUC</span>,
      cell: ({ row }) => (
        <div className="w-32 truncate font-mono">
          {row.getValue("proveedor_ruc")}
        </div>
      ),
    },
    {
      accessorKey: "compra",
      header: () => (
        <span className="font-medium text-emerald-600">Compra</span>
      ),
      cell: ({ row }) => (
        <div className="w-24 truncate">{row.getValue("compra")}</div>
      ),
    },
    {
      accessorKey: "fecha",
      header: () => <span className="font-medium text-emerald-600">Fecha</span>,
      cell: ({ row }) => (
        <div className="w-24 truncate">{row.getValue("fecha")}</div>
      ),
    },
    {
      accessorKey: "aut_factura",
      header: () => (
        <span className="font-medium text-emerald-600">Aut. Factura</span>
      ),
      cell: ({ row }) => (
        <div className="w-32">
          <TooltipProvider>
            <Tooltip delayDuration={100}>
              <TooltipTrigger className="w-32 truncate">
                {row.getValue("aut_factura")}
              </TooltipTrigger>
              <TooltipContent className="bg-white dark:bg-black text-black dark:text-white border border-slate-100 dark:border-slate-900 rounded shadow-sm">
                {row.getValue("aut_factura")}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      ),
    },
    {
      accessorKey: "precio",
      header: () => (
        <span className="font-medium text-emerald-600">Precio</span>
      ),
      cell: ({ row }) => (
        <div className="w-24 text-right font-medium">
          ${Number(row.getValue("precio")).toFixed(2)}
        </div>
      ),
    },

    // Datos que el usuario debe ingresar/seleccionar
    {
      accessorKey: "proyecto",
      header: () => <span className="font-medium text-sky-600">Proyecto</span>,
      cell: ({ row }) => {
        const rowIndex = row.index;
        const currentValue = row.original.proyecto;
        const selectedId = row.original.proyecto_id;

        return (
          <div className="min-w-36 max-w-44">
            <Popover
              open={projectsOpen[rowIndex]}
              onOpenChange={(open) => {
                const newOpenStates = [...projectsOpen];
                newOpenStates[rowIndex] = open;
                setProjectsOpen(newOpenStates);
              }}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={projectsOpen[rowIndex]}
                  className="w-full justify-between h-8 text-xs border-sky-600/30"
                >
                  {selectedId
                    ? projects.find((project: any) => project.id === selectedId)
                        ?.name
                    : currentValue || "Selecciona el proyecto"}
                  <ChevronsUpDownIcon className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-0">
                <Command>
                  <CommandInput
                    placeholder="Buscar proyecto..."
                    className="h-9"
                  />
                  <CommandEmpty>No hay resultados.</CommandEmpty>
                  <CommandGroup>
                    <CommandList>
                      {projects.map((project: any) => (
                        <CommandItem
                          key={project.id}
                          value={project.name}
                          onSelect={() => {
                            updateRow(rowIndex, {
                              proyecto_id: project.id,
                              proyecto: project.name,
                            });
                            const newOpenStates = [...projectsOpen];
                            newOpenStates[rowIndex] = false;
                            setProjectsOpen(newOpenStates);
                          }}
                        >
                          <CheckIcon
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedId === project.id
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {project.name}
                        </CommandItem>
                      ))}
                    </CommandList>
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        );
      },
    },
    {
      accessorKey: "centro_costo",
      header: () => <span className="font-medium text-sky-600">Centro C.</span>,
      cell: ({ row }) => {
        const rowIndex = row.index;
        const currentValue = row.original.centro_costo;
        const selectedId = row.original.centro_costo_id;

        return (
          <div className="min-w-36 max-w-44">
            <Popover
              open={centrosOpen[rowIndex]}
              onOpenChange={(open) => {
                const newOpenStates = [...centrosOpen];
                newOpenStates[rowIndex] = open;
                setCentrosOpen(newOpenStates);
              }}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={centrosOpen[rowIndex]}
                  className="w-full justify-between h-8 text-xs border-sky-600/30"
                >
                  {selectedId
                    ? centrosCosto.find(
                        (centro: any) => centro.id === selectedId
                      )?.name
                    : currentValue || "Selecciona un centro"}
                  <ChevronsUpDownIcon className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-0">
                <Command>
                  <CommandInput
                    placeholder="Buscar centro..."
                    className="h-9"
                  />
                  <CommandEmpty>No hay resultados.</CommandEmpty>
                  <CommandGroup>
                    <CommandList>
                      {centrosCosto.map((centro: any) => (
                        <CommandItem
                          key={centro.id}
                          value={centro.name}
                          onSelect={() => {
                            updateRow(rowIndex, {
                              centro_costo_id: centro.id,
                              centro_costo: centro.name,
                            });
                            const newOpenStates = [...centrosOpen];
                            newOpenStates[rowIndex] = false;
                            setCentrosOpen(newOpenStates);
                          }}
                        >
                          <CheckIcon
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedId === centro.id
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {centro.name}
                        </CommandItem>
                      ))}
                    </CommandList>
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        );
      },
    },
    {
      accessorKey: "notas",
      header: () => <span className="font-medium text-sky-600">NOTAS</span>,
      cell: ({ row }) => {
        return (
          <Input
            className="h-8 text-xs w-40 border-sky-600/30"
            defaultValue={row.getValue("notas") as string}
            onChange={(e) => updateRow(row.index, { notas: e.target.value })}
            placeholder="Escribe una nota..."
          />
        );
      },
    },
    {
      accessorKey: "observacion",
      header: () => (
        <span className="font-medium text-sky-600">OBSERVACIÓN</span>
      ),
      cell: ({ row }) => {
        return (
          <Input
            className="h-8 text-xs w-40 border-sky-600/30"
            defaultValue={row.getValue("observacion") as string}
            onChange={(e) =>
              updateRow(row.index, { observacion: e.target.value })
            }
            placeholder="Escribe la observación..."
          />
        );
      },
    },

    // Datos que vienen de la API
    {
      accessorKey: "contabilizado",
      header: () => (
        <span className="font-medium text-purple-700">CONTABILIZADO</span>
      ),
      cell: ({ row }) => (
        <div className="w-32 truncate">
          {row.getValue("contabilizado") === "SI" ? (
            <Badge
              variant="outline"
              className="font-normal bg-green-600 text-white"
            >
              Sí
            </Badge>
          ) : row.getValue("contabilizado") === "NO" ? (
            <Badge variant="destructive" className="font-normal">
              No
            </Badge>
          ) : (
            <Badge variant="outline" className="font-normal bg-purple-50">
              {row.getValue("contabilizado") || "Pendiente"}
            </Badge>
          )}
        </div>
      ),
    },
    {
      accessorKey: "serie_factura",
      header: () => (
        <span className="font-medium text-purple-700">Serie Factura</span>
      ),
      cell: ({ row }) => (
        <div className="w-32 truncate">
          <Badge variant="outline" className="font-normal bg-purple-50">
            {row.getValue("serie_factura") || "Pendiente"}
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: "proveedor_latinium",
      header: () => (
        <span className="font-medium text-purple-700">
          PROVEEDOR (LATINIUM).
        </span>
      ),
      cell: ({ row }) => (
        <div className="w-40 truncate">
          <Badge variant="outline" className="font-normal bg-purple-50">
            {row.getValue("proveedor_latinium") || "Pendiente"}
          </Badge>
        </div>
      ),
    },
  ];

  // Calcular el tamaño de página
  const pageSize = rowsPerPage === 0 ? excelData.length : rowsPerPage;

  const table = useReactTable({
    data: excelData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
      globalFilter,
      pagination: {
        pageIndex: 0,
        pageSize
      }
    },
    enableGlobalFilter: true,
    onGlobalFilterChange: setGlobalFilter,
  });

  // Función para guardar los datos
  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // Obtener el token de autenticación
      const token = getAuthToken();
      
      // Enviar datos al backend
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/save-sri-data`,
        { data: excelData },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      );
      
      // Simulamos un tiempo de espera para ver la animación de carga
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSaveSuccess(true);
      
      setTimeout(() => {
        // Reiniciamos el estado de éxito después de un tiempo
        setSaveSuccess(false);
        // Opcionalmente, podríamos avanzar al siguiente paso
        // setStep(3);
      }, 2000);
    } catch (error) {
      console.error("Error al guardar datos:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Refrescar datos
  const handleRefresh = async () => {
    await Promise.all([fetchProjects(), fetchProviders()]);
  };

  // Verificar si hay elementos sin completar
  const incompleteItems = excelData.filter((item: any) => 
    !item.proyecto_id || !item.centro_costo_id || !item.mes || !item.notas || !item.observacion
  ).length;

  return (
    <div className="flex flex-col gap-5 py-4">
      {/* Encabezado y acciones */}
      <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
        <div>
          <h3 className="text-lg font-medium">Completa la Información</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Campos en <span className="text-emerald-600 font-medium">esmeralda</span> son los que se cargaron desde el excel
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Campos en <span className="text-purple-700 font-medium">morado</span> son los que vienen de Latinium
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Campos en <span className="text-sky-600 font-medium">celeste</span> son los que debes completar
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Búsqueda global */}
          <div className="relative">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              value={globalFilter || ''}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-8 h-9 w-full md:w-64"
            />
            {globalFilter && (
              <button
                type="button"
                onClick={() => setGlobalFilter('')}
                className="absolute right-2 top-2.5"
              >
                <XIcon className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>
          
          {/* Botones de acción */}
          <div className="flex gap-2 justify-end">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={fetchingData}
              className="flex items-center gap-1"
            >
              {fetchingData ? (
                <LoaderIcon className="size-3.5 animate-spin" />
              ) : (
                <RefreshCwIcon className="size-3.5" />
              )}
              <span className="hidden sm:inline">Actualizar</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setStep(1)}
              className="flex items-center gap-1"
            >
              <ArrowLeftIcon className="size-3.5" />
              <span className="hidden sm:inline">Volver</span>
            </Button>
            <Button 
              size="sm" 
              onClick={handleSave}
              className="flex items-center gap-1"
              disabled={isSaving || saveSuccess || incompleteItems > 0}
            >
              {isSaving ? (
                <>
                  <LoaderIcon className="size-3.5 animate-spin" />
                  <span className="hidden sm:inline">Guardando...</span>
                </>
              ) : saveSuccess ? (
                <>
                  <CheckCircleIcon className="size-3.5" />
                  <span className="hidden sm:inline">Guardado</span>
                </>
              ) : (
                <>
                  <SaveIcon className="size-3.5" />
                  <span className="hidden sm:inline">Guardar</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Resumen de datos y opciones de filas por página */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-grow">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="bg-sky-600/10 rounded-full p-2">
                <SearchIcon className="h-5 w-5 text-sky-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total registros</p>
                <p className="text-xl font-semibold">{excelData.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="bg-amber-500/10 rounded-full p-2">
                <AlertTriangleIcon className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pendientes</p>
                <p className="text-xl font-semibold">{incompleteItems}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="bg-green-500/10 rounded-full p-2">
                <CheckCircleIcon className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completados</p>
                <p className="text-xl font-semibold">{excelData.length - incompleteItems}</p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Selector de filas por página */}
        <Card className="md:w-60">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-gray-100 rounded-full p-2">
                <SlidersHorizontalIcon className="h-5 w-5 text-gray-500" />
              </div>
              <div className="flex-grow">
                <p className="text-sm text-muted-foreground mb-2">Filas por página</p>
                <Select
                  value={rowsPerPage.toString()}
                  onValueChange={(value) => setRowsPerPage(Number(value))}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="Selecciona" />
                  </SelectTrigger>
                  <SelectContent>
                    {rowsPerPageOptions.map((option) => (
                      <SelectItem key={option} value={option.toString()}>
                        {option === 0 ? "Todos" : option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Estado de carga de datos */}
      {fetchingData && (
        <div className="flex items-center justify-center gap-2 py-2 px-4 bg-blue-50 text-blue-800 rounded-md">
          <LoaderIcon className="size-4 animate-spin" />
          <span className="text-sm">Cargando datos...</span>
        </div>
      )}

      {/* Mensaje si no hay datos completos */}
      {incompleteItems > 0 && (
        <div className="flex items-center justify-between gap-2 py-3 px-4 bg-amber-50 text-amber-800 rounded-md">
          <div className="flex items-center gap-2">
            <AlertTriangleIcon className="size-4" />
            <span className="text-sm">Hay {incompleteItems} registros pendientes por completar.</span>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="bg-amber-100 border-amber-200 text-amber-800 hover:bg-amber-200 hover:text-amber-900"
            onClick={() => {
              // Enfoque en el primer elemento incompleto
              const incompleteIndex = excelData.findIndex(
                (item: any) => !item.proyecto_id || !item.centro_costo_id || !item.mes || !item.notas || !item.observacion
              );
              if (incompleteIndex >= 0) {
                table.setPageIndex(Math.floor(incompleteIndex / pageSize));
                // Enfocar ese elemento en la tabla
                setTimeout(() => {
                  const row = document.querySelector(`[data-row-index="${incompleteIndex}"]`);
                  if (row) {
                    row.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }
                }, 100);
              }
            }}
          >
            Ir al primero
          </Button>
        </div>
      )}

      {/* Tabla de datos */}
      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 sticky top-0 z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th 
                      key={header.id}
                      className="px-4 py-3 text-left text-xs font-medium text-muted-foreground"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row, i) => (
                  <tr 
                    key={row.id}
                    data-row-index={row.index}
                    className={`border-t hover:bg-muted/20 ${
                      !row.original.proyecto_id || 
                      !row.original.centro_costo_id || 
                      !row.original.mes || 
                      !row.original.notas || 
                      !row.original.observacion
                        ? 'bg-amber-50/40' 
                        : i % 2 === 0 
                          ? 'bg-muted/10' 
                          : ''
                    }`}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-2">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="p-4 text-center text-muted-foreground"
                  >
                    No hay datos para mostrar
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación - solo mostrar si no estamos viendo todas las filas */}
        {rowsPerPage !== 0 && (
          <div className="flex items-center justify-between border-t p-2">
            <div className="flex-1 text-xs text-muted-foreground">
              Mostrando {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} a {' '}
              {Math.min(
                (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                table.getFilteredRowModel().rows.length
              )}{' '}
              de {table.getFilteredRowModel().rows.length} registros
            </div>
            <div className="flex items-center space-x-1">
              <Button
                variant="outline"
                size="icon"
                className="size-7"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronsLeftIcon className="size-3" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="size-7"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronLeftIcon className="size-3" />
              </Button>
              <span className="text-xs mx-2">
                Página{' '}
                <strong>
                  {table.getState().pagination.pageIndex + 1} de{' '}
                  {table.getPageCount()}
                </strong>
              </span>
              <Button
                variant="outline"
                size="icon"
                className="size-7"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <ChevronRightIcon className="size-3" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="size-7"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <ChevronsRightIcon className="size-3" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Componente adicional para el icono de alerta
const AlertTriangleIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </svg>
);

export default PartialDataTable;