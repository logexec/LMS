import React, { ChangeEvent, FormEvent, useEffect, useState } from "react";
import Input from "../Input";
import Select from "../Select";
import { OptionsState, LoadingState } from "@/utils/types";
import Datalist from "../Datalist";
import { toast } from "sonner";

const GastosForm = () => {
  const [formData, setFormData] = useState({
    fechaGasto: new Date().toISOString().split("T")[0],
    type: "expense",
    tipo: "",
    factura: "",
    cuenta: "",
    valor: "",
    proyecto: "",
    empresa: "",
    responsable: "",
    transporte: "",
    adjunto: null as File | null,
    observacion: "",
  });

  const [localOptions, setLocalOptions] = React.useState<OptionsState>({
    projects: [],
    responsibles: [],
    transports: [],
    accounts: [],
    areas: [],
  });

  const [localLoading, setLocalLoading] = React.useState<LoadingState>({
    submit: false,
    projects: false,
    responsibles: false,
    transports: false,
    accounts: false,
    areas: false,
  });

  const [formValid, setFormValid] = React.useState(false);

  const tipoOptions = [
    { value: "nomina", label: "Nómina" },
    { value: "transportista", label: "Transportista" },
  ];

  const empresaOptions = [
    { value: "SERSUPPORT", label: "SERSUPPORT" },
    { value: "PREBAM", label: "PREBAM" },
  ];

  const resetForm = () => {
    setFormData({
      fechaGasto: new Date().toISOString().split("T")[0],
      type: "expense",
      tipo: "",
      factura: "",
      cuenta: "",
      valor: "",
      proyecto: "",
      empresa: "",
      responsable: "",
      transporte: "",
      adjunto: null,
      observacion: "",
    });
  };

  useEffect(() => {
    if (!formData.tipo) return;

    const fetchAccounts = async () => {
      setLocalLoading((prev) => ({ ...prev, accounts: true }));
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/accounts/?account_type=${formData.tipo}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        if (!response.ok) throw new Error();

        const data: Array<{ name: string; id: string }> = await response.json();
        setLocalOptions((prev) => ({
          ...prev,
          accounts: data.map((account) => ({
            label: account.name,
            value: account.id,
          })),
        }));
      } catch (error) {
        console.error("Error cargando cuentas:", error);
      } finally {
        setLocalLoading((prev) => ({ ...prev, accounts: false }));
      }
    };

    fetchAccounts();
  }, [formData.tipo]);

  useEffect(() => {
    if (!formData.tipo) return;

    const fetchProjects = async () => {
      setLocalLoading((prev) => ({ ...prev, projects: true }));
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/projects`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        if (!response.ok) throw new Error();

        const data: Array<{ name: string; id: string }> = await response.json();
        setLocalOptions((prev) => ({
          ...prev,
          projects: data.map((project) => ({
            label: project.name,
            value: project.id,
          })),
        }));
      } catch (error) {
        console.error("Error cargando proyectos:", error);
      } finally {
        setLocalLoading((prev) => ({ ...prev, projects: false }));
      }
    };

    fetchProjects();
  }, [formData.tipo]);

  // Efecto para cargar responsables cuando cambia el proyecto
  useEffect(() => {
    if (!formData.proyecto || !formData.tipo) return;

    const fetchResponsibles = async () => {
      setLocalLoading((prev) => ({ ...prev, responsibles: true }));
      try {
        const response = await fetch(
          `${
            process.env.NEXT_PUBLIC_API_URL
          }/responsibles?proyecto=${formData.proyecto.toUpperCase()}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        if (!response.ok) throw new Error();

        const data: Array<{ nombre_completo: string; id: string }> =
          await response.json();

        setLocalOptions((prev) => ({
          ...prev,
          responsibles: data.map((responsible) => ({
            label: responsible.nombre_completo,
            value: responsible.id,
          })),
        }));
      } catch (error) {
        console.error("Error cargando responsables:", error);
      } finally {
        setLocalLoading((prev) => ({ ...prev, responsibles: false }));
      }
    };

    fetchResponsibles();
  }, [formData.proyecto, formData.tipo]);

  // Efecto para cargar transportes cuando el tipo es transportista
  useEffect(() => {
    if (formData.tipo !== "transportista") return;

    const fetchTransports = async () => {
      setLocalLoading((prev) => ({ ...prev, transports: true }));
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/transports`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        if (!response.ok) throw new Error();

        const data: Array<{ name: string; id: string }> = await response.json();
        setLocalOptions((prev) => ({
          ...prev,
          transports: data.map((transport) => ({
            label: transport.name,
            value: transport.id,
          })),
        }));
      } catch (error) {
        console.error("Error cargando transportes:", error);
      } finally {
        setLocalLoading((prev) => ({ ...prev, transports: false }));
      }
    };

    fetchTransports();
  }, [formData.tipo]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFormData((prev) => ({
        ...prev,
        adjunto: e.target.files![0],
      }));
    }
  };

  const submitForm = async (formData: FormData) => {
    setLocalLoading((prev) => ({ ...prev, submit: true }));
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/requests`,
        {
          method: "POST",
          credentials: "include",
          body: formData, // No incluir Content-Type para que el navegador lo maneje
        }
      );

      if (!response.ok) {
        const responseData = await response.json();
        throw new Error(responseData.message || "Error al crear el gasto");
      }

      toast.success("Gasto registrado con éxito");

      // Limpiar formulario solo si fue exitoso
      setFormData({
        fechaGasto: new Date().toISOString().split("T")[0],
        type: "expense",
        tipo: "",
        factura: "",
        cuenta: "",
        valor: "",
        proyecto: "",
        empresa: "",
        responsable: "",
        transporte: "",
        adjunto: null as File | null,
        observacion: "",
      });
    } catch (error) {
      console.error("Error details:", error);
      toast.error(
        error instanceof Error ? error.message : "Error al procesar el gasto"
      );
    } finally {
      setLocalLoading((prev) => ({ ...prev, submit: false }));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validar campos requeridos antes de enviar
    if (
      !formData.fechaGasto ||
      !formData.tipo ||
      !formData.factura ||
      !formData.cuenta ||
      !formData.valor ||
      !formData.proyecto ||
      !formData.empresa ||
      !formData.observacion
    ) {
      toast.error("Todos los campos son obligatorios");
      return;
    }

    const submitData = new FormData();

    // Campos con los nombres exactos que espera el backend
    submitData.append("type", "expense");
    submitData.append("request_date", formData.fechaGasto);
    submitData.append("personnel_type", formData.tipo);
    submitData.append("invoice_number", formData.factura);
    submitData.append("account_id", formData.cuenta);
    submitData.append("amount", formData.valor);
    submitData.append("project", formData.proyecto);
    submitData.append("company", formData.empresa);
    submitData.append("note", formData.observacion);

    // Campos condicionales
    if (formData.tipo === "nomina" && formData.responsable) {
      submitData.append("responsible_id", formData.responsable);
    } else if (formData.tipo === "transportista" && formData.transporte) {
      submitData.append("transport_id", formData.transporte);
    }

    // Archivo adjunto
    if (formData.adjunto instanceof File) {
      // Cambio de Blob a File
      submitData.append("attachment", formData.adjunto);
    }

    console.log("Datos a enviar:", Object.fromEntries(submitData.entries()));
    await submitForm(submitData);
  };

  const isFormValid = (): boolean => {
    const requiredFields: { [key: string]: string | File | boolean } = {
      request_date: formData.fechaGasto,
      personnel_type: formData.tipo,
      invoice_number: formData.factura,
      account_id: formData.cuenta,
      amount: formData.valor,
      project: formData.proyecto,
      company: formData.empresa,
      note: formData.observacion,
      attachment: formData.adjunto instanceof File,
    };

    // Validación específica según el tipo
    if (formData.tipo === "nomina") {
      requiredFields["responsible_id"] = formData.responsable;
    } else if (formData.tipo === "transportista") {
      requiredFields["transport_id"] = formData.transporte;
    }

    const isValid = Object.entries(requiredFields).every(([key, value]) => {
      const valid = Boolean(value);
      if (!valid) {
        console.log(`Campo requerido vacío: ${key}`);
      }
      return valid;
    });

    return isValid;
  };

  useEffect(() => {
    setFormValid(isFormValid());
  }, [handleInputChange, handleSelectChange, handleFileChange]);

  return (
    <section className="container pt-10">
      <div className="flex">
        <div className="w-1/4">
          <h3 className="text-slate-700 text-sm font-bold">Detalles gastos</h3>
          <p className="text-sm text-slate-500">
            <strong>
              <i>Todos</i>
            </strong>{" "}
            los campos son obligatorios.
          </p>
        </div>

        <form className="w-3/4 mr-5" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            <Input
              required
              id="fechaGasto"
              name="fechaGasto"
              currentDate={true}
              label="Fecha del Gasto"
              type="date"
              value={formData.fechaGasto}
              onChange={handleInputChange}
              allowPastDates={false}
            />
            <Select
              label="Tipo"
              name="tipo"
              id="tipo"
              options={tipoOptions}
              onChange={handleSelectChange}
              value={formData.tipo}
            />
            <Datalist
              label="Cuenta"
              name="cuenta"
              id="cuenta"
              options={localOptions.accounts}
              onChange={handleInputChange}
              value={formData.cuenta}
              disabled={localLoading.accounts}
            />
            <Datalist
              label="Proyecto"
              name="proyecto"
              id="proyecto"
              options={
                localLoading.projects
                  ? [{ label: "Cargando...", value: "" }]
                  : localOptions.projects
              }
              onChange={handleInputChange}
              disabled={localLoading.projects}
            />
            <Select
              label="Empresa"
              name="empresa"
              id="empresa"
              options={empresaOptions}
              onChange={handleSelectChange}
            />

            {formData.tipo === "nomina" && (
              <Datalist
                label="Responsable"
                name="responsable"
                id="responsable"
                options={
                  localLoading.responsibles
                    ? [{ label: "Cargando...", value: "" }]
                    : localOptions.responsibles
                }
                onChange={handleInputChange}
                disabled={localLoading.responsibles}
              />
            )}

            {formData.tipo === "transportista" && (
              <Datalist
                label="No. De Transporte"
                name="transporte"
                id="transporte"
                options={
                  localLoading.transports
                    ? [{ label: "Cargando...", value: "" }]
                    : localOptions.transports
                }
                onChange={handleInputChange}
                disabled={localLoading.transports}
              />
            )}

            <Input
              required
              type="number"
              step="0.01"
              id="factura"
              name="factura"
              value={formData.factura}
              onChange={handleInputChange}
              label="No. Factura o Vale"
              disabled={localLoading.submit}
            />
            <Input
              required
              type="number"
              step="0.01"
              id="valor"
              name="valor"
              value={formData.valor}
              onChange={handleInputChange}
              label="Valor"
              disabled={localLoading.submit}
            />
            <Input
              required
              type="text"
              id="observacion"
              name="observacion"
              value={formData.observacion}
              onChange={handleInputChange}
              label="Observación"
              disabled={localLoading.submit}
            />

            <div className="col-span-1 md:col-span-2 lg:col-span-3">
              <input
                type="file"
                id="adjunto"
                name="adjunto"
                onChange={handleFileChange}
                required
                className="block w-full text-sm text-slate-500
                           file:mr-4 file:py-2 file:px-4
                           file:rounded file:border-0
                           file:text-sm file:font-semibold
                           file:bg-red-50 file:text-red-700
                           hover:file:bg-red-100 border border-slate-300 focus:border-sky-200 rounded-lg [&:not(:empty)]:border-green-500"
              />
            </div>
          </div>

          <div className="flex w-full items-center justify-end gap-5 mt-6">
            <button
              type="reset"
              className="bg-slate-600 hover:bg-slate-700 text-white py-1 px-4 rounded font-semibold shadow-md hover:shadow-none transition-all duration-300"
              onClick={() => resetForm}
            >
              Borrar Formulario
            </button>
            <button
              type="submit"
              className="bg-red-600 hover:bg-red-700 text-white py-1 px-4 rounded font-semibold shadow-md hover:shadow-none transition-all duration-300"
              disabled={localLoading.submit || !formValid}
            >
              {localLoading.submit ? "Procesando..." : "Registrar Gasto"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default GastosForm;
