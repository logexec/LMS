"use client";
import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import Input from "../Input";
import File from "../File";
import Select from "../Select";
import { Sheet } from "lucide-react";
import Loader from "@/app/Loader";

interface FormData {
  fechaGasto: string;
  tipo: string;
  factura: string;
  cuenta: string;
  valor: string;
  proyecto: string;
  responsable: string;
  transporte: string;
  adjunto: File | null;
  observacion: string;
}

interface LoadingState {
  submit: boolean;
  projects: boolean;
  responsibles: boolean;
  transports: boolean;
  accounts: boolean;
}

interface SelectOption {
  label: string;
  value: string;
}

interface OptionsState {
  projects: SelectOption[];
  responsibles: SelectOption[];
  transports: SelectOption[];
  accounts: SelectOption[];
}

interface RequestData {
  type: "discount";
  personnel_type: string;
  request_date: string;
  invoice_number: string;
  account_id: string;
  amount: string;
  project: string;
  responsible_id: string;
  transport_id: string | null;
  note: string;
}

const DescuentosForm = () => {
  const [formData, setFormData] = useState<FormData>({
    fechaGasto: "",
    tipo: "",
    factura: "",
    cuenta: "",
    valor: "",
    proyecto: "",
    responsable: "",
    transporte: "",
    adjunto: null,
    observacion: "",
  });

  const [loading, setLoading] = useState<LoadingState>({
    submit: false,
    projects: false,
    responsibles: false,
    transports: false,
    accounts: false,
  });

  const [options, setOptions] = useState<OptionsState>({
    projects: [],
    responsibles: [],
    transports: [],
    accounts: [],
  });

  useEffect(() => {
    if (!formData.tipo) return;

    const fetchAccounts = async () => {
      setLoading((prev) => ({ ...prev, accounts: true }));
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

        const data: Array<{ name: string; id: string }> = await response.json();
        setOptions((prev) => ({
          ...prev,
          accounts: data.map((account) => ({
            label: account.name,
            value: account.id,
          })),
        }));
      } catch (error) {
        console.error("Error cargando Cuentas:", error);
      } finally {
        setLoading((prev) => ({ ...prev, accounts: false }));
      }
    };

    fetchAccounts();
  }, [formData.tipo]);

  useEffect(() => {
    if (!formData.tipo) return;

    const fetchProjects = async () => {
      setLoading((prev) => ({ ...prev, projects: true }));
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
        const data: Array<{ name: string; id: string }> = await response.json();
        setOptions((prev) => ({
          ...prev,
          projects: data.map((project) => ({
            label: project.name,
            value: project.name,
          })),
        }));
      } catch (error) {
        console.error("Error cargando proyectos:", error);
      } finally {
        setLoading((prev) => ({ ...prev, projects: false }));
      }
    };

    fetchProjects();
  }, [formData.tipo]);

  useEffect(() => {
    if (!formData.proyecto || !formData.tipo) return;

    const fetchResponsibles = async () => {
      setLoading((prev) => ({ ...prev, responsibles: true }));
      try {
        const response = await fetch(
          // `${process.env.NEXT_PUBLIC_API_URL}/responsibles?type=${formData.tipo}&proyecto=${formData.proyecto}`,
          `${process.env.NEXT_PUBLIC_API_URL}/responsibles?proyecto=${formData.proyecto}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );
        const data: Array<{ nombres: string; id: string }> =
          await response.json();
        setOptions((prev) => ({
          ...prev,
          responsibles: data.map((responsible) => ({
            label: responsible.nombres,
            value: responsible.id,
          })),
        }));
      } catch (error) {
        console.error("Error cargando responsables:", error);
      } finally {
        setLoading((prev) => ({ ...prev, responsibles: false }));
      }
    };

    fetchResponsibles();
  }, [formData.proyecto, formData.tipo]);

  useEffect(() => {
    if (formData.tipo !== "transportista") return;

    const fetchTransports = async () => {
      setLoading((prev) => ({ ...prev, transports: true }));
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
        const data: Array<{ name: string; id: string }> = await response.json();
        setOptions((prev) => ({
          ...prev,
          transports: data.map((transport) => ({
            label: transport.name,
            value: transport.id,
          })),
        }));
      } catch (error) {
        console.error("Error cargando transportes:", error);
      } finally {
        setLoading((prev) => ({ ...prev, transports: false }));
      }
    };

    fetchTransports();
  }, [formData.tipo]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setFormData((prev) => ({
        ...prev,
        [name]: files[0],
      }));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading((prev) => ({ ...prev, submit: true }));

    try {
      let reqBody: globalThis.FormData | RequestData = {
        type: "discount",
        personnel_type: formData.tipo,
        request_date: formData.fechaGasto,
        invoice_number: formData.factura,
        account_id: formData.cuenta,
        amount: formData.valor,
        project: formData.proyecto,
        responsible_id: formData.responsable,
        transport_id:
          formData.tipo === "transportista" ? formData.transporte : null,
        note: formData.observacion,
      };

      // Si hay archivo adjunto, usar FormData
      if (formData.adjunto) {
        const formDataToSend = new FormData();
        Object.entries(reqBody).forEach(([key, value]) => {
          if (value !== null) {
            formDataToSend.append(key, value);
          }
        });
        formDataToSend.append("attachment_path", formData.adjunto);
        reqBody = formDataToSend;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/requests`,
        {
          method: "POST",
          headers: formData.adjunto
            ? undefined
            : {
                "Content-Type": "application/json",
              },
          body: formData.adjunto
            ? (reqBody as globalThis.FormData)
            : JSON.stringify(reqBody as RequestData),
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Error al crear el descuento");
      }

      alert("Descuento registrado con éxito");
    } catch (error) {
      console.error("Error:", error);
      alert("Error al registrar el descuento");
    } finally {
      setLoading((prev) => ({ ...prev, submit: false }));
    }
  };

  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/download-excel-template`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Error al descargar la plantilla");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "Plantilla Descuentos Masivos | LogeX.xlsx"; //Nombre de la plantilla de excel.
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      alert("Hubo un problema al descargar la plantilla.");
    } finally {
      setIsLoading(false);
    }
  };

  const tipoOptions: SelectOption[] = [
    { value: "nomina", label: "Nómina" },
    { value: "transportista", label: "Transportista" },
  ];

  return (
    <>
      <section className="container pt-10">
        <div className="flex w-full">
          <div className="w-1/4">
            <h3 className="text-slate-700 text-sm font-bold">
              ¿Carga masiva de información?
            </h3>
            <p className="text-sm text-slate-500">
              Por favor, carga tu archivo .xlsx, .xls o .csv.
            </p>
          </div>
          <div className="w-3/4 grid grid-cols-[auto_auto] items-center">
            <form className="w-full" onSubmit={handleSubmit}>
              <div className="grid w-full max-w-xs items-center gap-1.5">
                <File
                  name="adjunto"
                  label="Archivo"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileChange}
                />
              </div>
              <button
                type="submit"
                disabled={loading.submit}
                className="mt-4 bg-red-600 hover:bg-red-700 text-white py-1 px-4 rounded font-semibold shadow-md hover:shadow-none hover:scale-[.98] transition-all duration-300 disabled:opacity-50"
              >
                {loading.submit ? "Procesando..." : "Registrar Descuento"}
              </button>
            </form>
            <div className="w-full flex flex-col">
              <p className="text-slate-500 font-semibold text-sm">
                ¿Necesitas la plantilla actualizada?
              </p>
              <button
                onClick={handleDownload}
                disabled={isLoading}
                className={`w-max mt-4 bg-emerald-600 text-white py-1 px-4 border rounded font-semibold shadow-md flex items-center transition-all duration-300 ${
                  isLoading
                    ? "!bg-white cursor-not-allowed hover:scale-100 border-slate-100"
                    : "hover:bg-emerald-700 hover:scale-[.98] border-slate-600"
                }`}
              >
                {isLoading ? (
                  <Loader text="Descargando..." fullScreen={false} />
                ) : (
                  <>
                    <Sheet size={16} className="mr-2 inline" />
                    Descargar Plantilla
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <hr className="border border-slate-200 my-10" />

        <div className="flex">
          <section className="w-1/4">
            <h3 className="text-slate-700 text-sm font-bold">
              Detalles del personal a descontar
            </h3>
            <p className="text-sm text-slate-500">
              <strong>
                <i>Todos</i>
              </strong>{" "}
              los campos son obligatorios.
            </p>
          </section>

          <form onSubmit={handleSubmit} className="w-3/4">
            <div className="grid grid-cols-4 gap-3">
              <Input
                required
                id="fechaGasto"
                name="fechaGasto"
                currentDate={true}
                label="Fecha del Gasto"
                type="date"
                value={formData.fechaGasto}
                onChange={handleInputChange}
              />
              <div>
                <Select
                  label="Tipo"
                  name="tipo"
                  id="tipo"
                  options={tipoOptions}
                  onChange={handleSelectChange}
                  value={formData.tipo}
                  disabled={loading.submit}
                />
              </div>

              <div>
                <Select
                  label="Proyecto"
                  name="proyecto"
                  id="proyecto"
                  options={options.projects}
                  onChange={handleSelectChange}
                  value={formData.proyecto}
                  disabled={!formData.tipo || loading.projects}
                />
              </div>

              <div>
                <Select
                  label="Cuenta"
                  name="cuenta"
                  id="cuenta"
                  options={options.accounts}
                  onChange={handleSelectChange}
                  value={formData.cuenta}
                  disabled={!formData.tipo || loading.accounts}
                />
              </div>

              <Input
                required
                type="text"
                id="factura"
                name="factura"
                value={formData.factura}
                onChange={handleInputChange}
                label="No. Factura o Vale"
                disabled={loading.submit}
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
                disabled={loading.submit}
              />

              {formData.tipo === "nomina" && (
                <div>
                  <Select
                    label="Responsable"
                    name="responsable"
                    id="responsable"
                    value={formData.responsable}
                    options={options.responsibles}
                    onChange={handleSelectChange}
                    disabled={!formData.proyecto || loading.responsibles}
                  />
                </div>
              )}

              {formData.tipo === "transportista" && (
                <div>
                  <Select
                    label="No. De Transporte"
                    name="transporte"
                    id="transporte"
                    value={formData.transporte}
                    options={options.transports}
                    onChange={handleSelectChange}
                    disabled={!formData.proyecto || loading.transports}
                  />
                </div>
              )}

              <Input
                required
                type="text"
                id="observacion"
                name="observacion"
                value={formData.observacion}
                onChange={handleInputChange}
                label="Observación"
                disabled={loading.submit}
              />
            </div>

            <div className="flex w-full items-center justify-end gap-5 mt-6">
              <button
                type="reset"
                className="bg-slate-600 hover:bg-slate-700 text-white py-1 px-4 rounded font-semibold shadow-md hover:shadow-none hover:scale-[.98] transition-all duration-300"
                disabled={loading.submit}
              >
                Borrar Formulario
              </button>
              <button
                type="submit"
                className="bg-red-600 hover:bg-red-700 text-white py-1 px-4 rounded font-semibold shadow-md hover:shadow-none hover:scale-[.98] transition-all duration-300 disabled:opacity-50"
                disabled={loading.submit}
              >
                {loading.submit ? "Procesando..." : "Registrar Descuento"}
              </button>
            </div>
          </form>
        </div>
      </section>
    </>
  );
};

export default DescuentosForm;
