/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useCallback, useEffect, useState } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { AlertCircle, Calendar as CalendarIcon, RefreshCw } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { getAuthToken } from "@/services/auth.service";
import apiService from "@/services/api.service";
import debounce from "lodash/debounce";
import { LoadingState, OptionsState, AccountProps } from "@/utils/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

const formSchema = z.object({
  fechaGasto: z.coerce.date(),
  tipo: z.string().min(1, "Debes seleccionar un tipo"),
  proyecto: z.string().min(2, "El proyecto es obligatorio"),
  cuenta: z.string().min(2, "La cuenta es obligatoria"),
  responsable: z.string().optional(),
  vehicle_plate: z.string().optional(),
  vehicle_number: z.string().optional(),
  factura: z
    .string()
    .min(3, "El número de factura debe tener al menos 3 caracteres")
    .max(10, "El número de factura no puede tener más de 10 caracteres"),
  valor: z.string().min(3, "El valor debe tener al menos 3 dígitos"),
  observacion: z.string().min(1, "Debes escribir una observación"),
});

interface MyFormProps {
  options: OptionsState;
  loading?: LoadingState;
  type: "discount" | "income";
  onSubmit: (data: FormData) => Promise<void>;
}

export default function NormalDiscountForm({
  options,
  type,
  onSubmit,
}: MyFormProps) {
  const [localOptions, setLocalOptions] = useState<OptionsState>({
    projects: options.projects,
    responsibles: [],
    transports: [],
    accounts: [],
    areas: options.areas,
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState<boolean>(false);
  const [isLoadingProjects, setIsLoadingProjects] = useState<boolean>(false);
  const [isLoadingResponsibles, setIsLoadingResponsibles] =
    useState<boolean>(false);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState<boolean>(false);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fechaGasto: new Date(),
      tipo: "",
      proyecto: "",
      cuenta: "",
      responsable: "",
      vehicle_plate: "",
      vehicle_number: "",
      factura: "",
      valor: "0",
      observacion: "",
    },
  });

  // Autoscroll al error
  useEffect(() => {
    const errorField = Object.keys(form.formState.errors)[0];
    if (errorField) {
      const el = document.querySelector(`[name="${errorField}"]`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [form.formState.errors]);

  useEffect(() => {
    setIsLoadingProjects(true);

    const timeout = setTimeout(() => {
      setLocalOptions((prevOptions) => ({
        ...prevOptions,
        projects: options.projects,
        areas: options.areas,
      }));
      setIsLoadingProjects(false);
    }, 300); // lo suficiente para permitir un render son 200ms

    return () => clearTimeout(timeout);
  }, [options.projects, options.areas]);

  const fetchAccounts = useCallback(async (tipo: string) => {
    try {
      setIsLoading(true);
      setIsLoadingAccounts(true);
      const response = await apiService.getAccounts(tipo, "discount");
      if (!response.ok) throw new Error("Error al cargar las cuentas");

      const data = await response.data;

      const activeAccounts = data.filter(
        (account: AccountProps) => account.account_status === "active"
      );

      setLocalOptions((prev) => ({
        ...prev,
        accounts: activeAccounts.map((account: { name: string }) => ({
          label: account.name,
          value: account.name,
        })),
      }));
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al cargar las cuentas"
      );
      console.error(error);
    } finally {
      setIsLoading(false);
      setIsLoadingAccounts(false);
    }
  }, []);

  useEffect(() => {
    form.resetField("cuenta");
    fetchAccounts(form.watch("tipo"));
  }, [form.watch("tipo")]);

  const fetchResponsibles = useCallback(
    debounce(async (proyecto: string) => {
      if (!proyecto) return;
      try {
        setIsLoading(true);
        setIsLoadingResponsibles(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/responsibles?proyecto=${proyecto}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${getAuthToken()}`,
            },
            credentials: "include",
          }
        );

        if (!response.ok) throw new Error("Error al cargar responsables");

        const data = await response.json();
        setLocalOptions((prev) => ({
          ...prev,
          responsibles: data.map(
            (responsible: { nombre_completo: string }) => ({
              label: responsible.nombre_completo,
              value: responsible.nombre_completo,
            })
          ),
        }));
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Error al cargar responsables"
        );
      } finally {
        setIsLoading(false);
        setIsLoadingResponsibles(false);
      }
    }, 300),
    []
  );

  const fetchTransports = useCallback(async () => {
    try {
      setIsLoading(true);
      setIsLoadingVehicles(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/transports`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getAuthToken()}`,
          },
          credentials: "include",
        }
      );

      if (!response.ok) throw new Error("Error al cargar transportes");

      const data = await response.json();
      setLocalOptions((prev) => ({
        ...prev,
        transports: data.map((transport: { name: string }) => ({
          label: transport.name,
          value: transport.name,
        })),
      }));
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Error al cargar los transportes"
      );
    } finally {
      setIsLoading(false);
      setIsLoadingVehicles(false);
    }
  }, []);

  useEffect(() => {
    const tipo = form.watch("tipo");
    if (tipo) {
      fetchAccounts(tipo);
    }
  }, [form.watch("tipo"), fetchAccounts]);

  useEffect(() => {
    const proyecto = form.watch("proyecto");
    const tipo = form.watch("tipo");
    if (proyecto && tipo) {
      fetchResponsibles(proyecto);
    }
  }, [form.watch("proyecto"), form.watch("tipo"), fetchResponsibles]);

  useEffect(() => {
    const tipo = form.watch("tipo");
    if (tipo === "transportista") {
      fetchTransports();
    }
  }, [form.watch("tipo"), fetchTransports]);

  const resetForm = () => {
    form.reset();
  };

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append("request_date", format(values.fechaGasto, "yyyy-MM-dd"));
      formData.append("type", type === "discount" ? "discount" : "income");
      formData.append("status", "pending");
      formData.append("invoice_number", values.factura.toString());
      formData.append("account_id", values.cuenta);
      formData.append("amount", values.valor.toString());
      formData.append("project", values.proyecto);
      if (values.responsable) {
        formData.append("responsible_id", values.responsable);
      }
      if (values.vehicle_plate) {
        formData.append("vehicle_plate", values.vehicle_plate);
      }
      if (values.vehicle_number) {
        formData.append("vehicle_number", values.vehicle_number);
      }
      formData.append("note", values.observacion);
      formData.append("personnel_type", values.tipo);

      await onSubmit(formData);
      toast.success(
        type === "discount"
          ? "Descuento registrado correctamente"
          : "Ingreso registrado correctamente"
      );
      resetForm();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Hubo un error al registrar el descuento"
      );
    } finally {
      setIsLoading(false);
      setIsSubmitting(false);
    }
  };

  const today = new Date();
  const firstAllowedDate = new Date(
    today.getFullYear(),
    today.getMonth() - 1,
    29
  );
  const lastAllowedDate = new Date(today.getFullYear(), today.getMonth(), 28);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Formulario de Descuentos</CardTitle>
          <CardDescription>
            Completa todos los datos requeridos para registrar un nuevo
            descuento.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 items-center">
              <Alert className="border-indigo-200 dark:border-indigo-800">
                <AlertDescription className="flex items-center space-x-4">
                  <AlertCircle className="h-4 w-4 flex mt-[3px]" />
                  <span>
                    Los campos son obligatorios y deben ser completados.
                  </span>
                </AlertDescription>
              </Alert>
            </div>

            <div className="md:col-span-2">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handleSubmit)}
                  className="space-y-2 mx-auto -mt-4"
                >
                  <div className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-4">
                      <FormField
                        control={form.control}
                        name="fechaGasto"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Fecha del Descuento</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "w-full pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP")
                                    ) : (
                                      <span>Selecciona una Fecha</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-auto p-0"
                                align="start"
                              >
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) =>
                                    date < firstAllowedDate ||
                                    date > lastAllowedDate
                                  }
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="col-span-4">
                      <FormField
                        control={form.control}
                        name="tipo"
                        render={({ field }) => (
                          <FormItem className="-mt-[10px]">
                            <FormLabel>Tipo</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="-- Selecciona --" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="nomina">Nómina</SelectItem>
                                <SelectItem value="transportista">
                                  Transportista
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="col-span-4">
                      <FormField
                        control={form.control}
                        name="proyecto"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Proyecto</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    role="combobox"
                                    className={cn(
                                      "w-full justify-between",
                                      !field.value && "text-muted-foreground"
                                    )}
                                    disabled={isLoadingProjects}
                                  >
                                    {field.value
                                      ? localOptions.projects.find(
                                          (project) =>
                                            project.value === field.value
                                        )?.label
                                      : "-- Selecciona --"}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-full p-0">
                                <Command>
                                  <CommandInput placeholder="Buscar proyecto..." />
                                  <CommandList>
                                    <CommandEmpty>
                                      No se pudieron cargar los proyectos.
                                    </CommandEmpty>
                                    <CommandGroup>
                                      {localOptions.projects.map((project) => (
                                        <CommandItem
                                          value={project.label}
                                          key={project.value}
                                          onSelect={() => {
                                            form.setValue(
                                              "proyecto",
                                              project.value
                                            );
                                          }}
                                        >
                                          <Check
                                            className={cn(
                                              "mr-2 h-4 w-4",
                                              project.value === field.value
                                                ? "opacity-100"
                                                : "opacity-0"
                                            )}
                                          />
                                          {project.label}
                                        </CommandItem>
                                      ))}
                                    </CommandGroup>
                                  </CommandList>
                                </Command>
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {form.watch("tipo") && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="grid grid-cols-12 gap-4 items-center">
                        <div className="col-span-4">
                          <FormField
                            control={form.control}
                            name="cuenta"
                            render={({ field }) => (
                              <FormItem className="flex flex-col">
                                <FormLabel>Cuenta</FormLabel>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <FormControl>
                                      <Button
                                        variant="outline"
                                        role="combobox"
                                        className={cn(
                                          "w-full justify-between truncate",
                                          !field.value &&
                                            "text-muted-foreground"
                                        )}
                                        disabled={isLoadingAccounts}
                                      >
                                        {isLoadingAccounts
                                          ? "Cargando cuentas..."
                                          : field.value
                                          ? localOptions.accounts.find(
                                              (account) =>
                                                account.value === field.value
                                            )?.label
                                          : "-- Selecciona --"}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                      </Button>
                                    </FormControl>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-full p-0">
                                    <Command>
                                      <CommandInput placeholder="Buscar cuenta..." />
                                      <CommandList>
                                        <CommandEmpty>
                                          No se encontraron cuentas.
                                        </CommandEmpty>
                                        <CommandGroup>
                                          {localOptions.accounts.map(
                                            (account) => (
                                              <CommandItem
                                                value={account.label}
                                                key={account.value}
                                                onSelect={() => {
                                                  form.setValue(
                                                    "cuenta",
                                                    account.value
                                                  );
                                                }}
                                              >
                                                <Check
                                                  className={cn(
                                                    "mr-2 h-4 w-4",
                                                    account.value ===
                                                      field.value
                                                      ? "opacity-100"
                                                      : "opacity-0"
                                                  )}
                                                />
                                                {account.label}
                                              </CommandItem>
                                            )
                                          )}
                                        </CommandGroup>
                                      </CommandList>
                                    </Command>
                                  </PopoverContent>
                                </Popover>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {form.watch("tipo") === "nomina" && (
                          <div className="col-span-4">
                            <FormField
                              control={form.control}
                              name="responsable"
                              render={({ field }) => (
                                <FormItem className="flex flex-col">
                                  <FormLabel>Responsable</FormLabel>
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <FormControl>
                                        <Button
                                          variant="outline"
                                          role="combobox"
                                          className={cn(
                                            "w-full justify-between truncate",
                                            !field.value &&
                                              "text-muted-foreground"
                                          )}
                                          disabled={
                                            isLoadingResponsibles ||
                                            form.watch("proyecto") ===
                                              undefined ||
                                            form.watch("proyecto") === null ||
                                            form.watch("proyecto") === ""
                                          }
                                        >
                                          {isLoadingResponsibles
                                            ? "Cargando personal..."
                                            : field.value
                                            ? localOptions.responsibles.find(
                                                (responsible) =>
                                                  responsible.value ===
                                                  field.value
                                              )?.label
                                            : "-- Selecciona --"}
                                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                      </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-full p-0">
                                      <Command>
                                        <CommandInput placeholder="Buscar responsable..." />
                                        <CommandList>
                                          <CommandEmpty>
                                            No se encontraron responsables.
                                          </CommandEmpty>
                                          <CommandGroup>
                                            {localOptions.responsibles.map(
                                              (responsible) => (
                                                <CommandItem
                                                  value={responsible.label}
                                                  key={responsible.value}
                                                  onSelect={() => {
                                                    form.setValue(
                                                      "responsable",
                                                      responsible.value
                                                    );
                                                  }}
                                                >
                                                  <Check
                                                    className={cn(
                                                      "mr-2 h-4 w-4",
                                                      responsible.value ===
                                                        field.value
                                                        ? "opacity-100"
                                                        : "opacity-0"
                                                    )}
                                                  />
                                                  {responsible.label}
                                                </CommandItem>
                                              )
                                            )}
                                          </CommandGroup>
                                        </CommandList>
                                      </Command>
                                    </PopoverContent>
                                  </Popover>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        )}

                        {form.watch("tipo") === "transportista" && (
                          <div className="col-span-4">
                            <FormField
                              control={form.control}
                              name="vehicle_plate"
                              render={({ field }) => (
                                <FormItem className="flex flex-col">
                                  <FormLabel>Placa</FormLabel>
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <FormControl>
                                        <Button
                                          variant="outline"
                                          role="combobox"
                                          className={cn(
                                            "w-full justify-between",
                                            !field.value &&
                                              "text-muted-foreground"
                                          )}
                                          disabled={
                                            isLoadingVehicles ||
                                            form.watch("proyecto") ===
                                              undefined ||
                                            form.watch("proyecto") === null ||
                                            form.watch("proyecto") === ""
                                          }
                                        >
                                          {isLoadingVehicles
                                            ? "Obteniendo Placas..."
                                            : field.value
                                            ? localOptions.transports.find(
                                                (transport) =>
                                                  transport.value ===
                                                  field.value
                                              )?.label
                                            : "-- Selecciona --"}
                                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                      </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-full p-0">
                                      <Command>
                                        <CommandInput placeholder="Buscar placa..." />
                                        <CommandList>
                                          <CommandEmpty>
                                            No se encontró ninguna placa.
                                          </CommandEmpty>
                                          <CommandGroup>
                                            {localOptions.transports.map(
                                              (transport) => (
                                                <CommandItem
                                                  value={transport.label}
                                                  key={transport.value}
                                                  onSelect={() => {
                                                    form.setValue(
                                                      "vehicle_plate",
                                                      transport.value
                                                    );
                                                  }}
                                                >
                                                  <Check
                                                    className={cn(
                                                      "mr-2 h-4 w-4",
                                                      transport.value ===
                                                        field.value
                                                        ? "opacity-100"
                                                        : "opacity-0"
                                                    )}
                                                  />
                                                  {transport.label}
                                                </CommandItem>
                                              )
                                            )}
                                          </CommandGroup>
                                        </CommandList>
                                      </Command>
                                    </PopoverContent>
                                  </Popover>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        )}

                        <div className="col-span-4">
                          <FormField
                            control={form.control}
                            name="vehicle_number"
                            render={({ field }) => (
                              <FormItem className="-mt-[10px]">
                                <FormLabel>No. Transporte</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder=""
                                    type="number"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-12 gap-4 items-center">
                        <div className="col-span-4">
                          <FormField
                            control={form.control}
                            name="factura"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Factura</FormLabel>
                                <FormControl>
                                  <Input required type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="col-span-4">
                          <FormField
                            control={form.control}
                            name="valor"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Valor</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    required
                                    step="0.01"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="col-span-4">
                          <FormField
                            control={form.control}
                            name="observacion"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Observación</FormLabel>
                                <FormControl>
                                  <Input type="text" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div className="flex flex-row space-x-3 items-center justify-end mt-2">
                    <Button
                      type="button"
                      className="bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-900 border"
                      onClick={resetForm}
                      disabled={isSubmitting}
                    >
                      {" "}
                      <RefreshCw className="mr-2 h-4 w-4" /> Limpiar
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      Registrar
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
