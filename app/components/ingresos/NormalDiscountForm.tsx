import React, { ChangeEvent, FormEvent, useEffect } from "react";
import Input from "../Input";
import Select from "../Select";
import { LoadingState, OptionsState, NormalFormData } from "@/utils/types";
import Datalist from "../Datalist";

interface NormalDiscountFormProps {
  options: OptionsState;
  loading: LoadingState;
  onSubmit: (data: FormData) => Promise<void>;
}

const NormalDiscountForm: React.FC<NormalDiscountFormProps> = ({
  options,
  loading,
  onSubmit,
}) => {
  const [normalFormData, setNormalFormData] = React.useState<NormalFormData>({
    fechaGasto: new Date().toISOString().split("T")[0],
    tipo: "",
    factura: "",
    cuenta: "",
    valor: "",
    proyecto: "",
    responsable: "",
    transporte: "",
    adjunto: new Blob([]),
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

  // Efecto para cargar cuentas cuando cambia el tipo
  useEffect(() => {
    if (!normalFormData.tipo) return;

    const fetchAccounts = async () => {
      setLocalLoading((prev) => ({ ...prev, accounts: true }));
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/accounts/?account_type=${normalFormData.tipo}`,
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
  }, [normalFormData.tipo]);

  // Efecto para cargar responsables cuando cambia el proyecto
  useEffect(() => {
    if (!normalFormData.proyecto || !normalFormData.tipo) return;

    const fetchResponsibles = async () => {
      setLocalLoading((prev) => ({ ...prev, responsibles: true }));
      try {
        const response = await fetch(
          `${
            process.env.NEXT_PUBLIC_API_URL
          }/responsibles?proyecto=${normalFormData.proyecto.toUpperCase()}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        const response_test = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/test`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );
        console.log("response_test", response_test);

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
  }, [normalFormData.proyecto, normalFormData.tipo]);

  // Efecto para cargar transportes cuando el tipo es transportista
  useEffect(() => {
    if (normalFormData.tipo !== "transportista") return;

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
  }, [normalFormData.tipo]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNormalFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNormalFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    setNormalFormData((prev) => ({
      ...prev,
      adjunto: e.target.files![0],
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData();

    formData.append("type", "discount");
    formData.append("personnel_type", normalFormData.tipo);
    formData.append("request_date", normalFormData.fechaGasto);
    formData.append("invoice_number", normalFormData.factura);
    formData.append("account_id", normalFormData.cuenta);
    formData.append("amount", normalFormData.valor);
    formData.append("project", normalFormData.proyecto);
    formData.append("note", normalFormData.observacion);

    if (normalFormData.tipo === "nomina" && normalFormData.responsable) {
      formData.append("responsible_id", normalFormData.responsable);
    } else if (
      normalFormData.tipo === "transportista" &&
      normalFormData.transporte
    ) {
      formData.append("transport_id", normalFormData.transporte);
    }

    if (normalFormData.adjunto) {
      formData.append("attachment", normalFormData.adjunto);
    }

    await onSubmit(formData);

    setNormalFormData({
      fechaGasto: new Date().toISOString().split("T")[0],
      tipo: "",
      factura: "",
      cuenta: "",
      valor: "",
      proyecto: "",
      responsable: "",
      transporte: "",
      adjunto: new Blob([]),
      observacion: "",
    });
  };

  const isFormValid = (): boolean => {
    return Object.values(normalFormData).every(
      (value) => value !== "" || value !== null
    );
  };

  useEffect(() => {
    setFormValid(isFormValid());
  }, [handleInputChange, handleSelectChange, handleFileChange]);

  const tipoOptions = [
    { value: "nomina", label: "Nómina" },
    { value: "transportista", label: "Transportista" },
  ];

  return (
    <div className="flex w-full">
      <div className="w-1/4 mr-3">
        <h3 className="text-slate-700 text-sm font-bold">
          Detalles del personal a descontar
        </h3>
        <p className="text-sm text-slate-500">
          <strong>
            <i>Todos</i>
          </strong>{" "}
          los campos son obligatorios.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="w-3/4 ml-3">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          <Input
            required
            id="fechaGasto"
            name="fechaGasto"
            currentDate={true}
            label="Fecha del Gasto"
            type="date"
            value={normalFormData.fechaGasto}
            onChange={handleInputChange}
            allowPastDates={false}
          />

          <Select
            label="Tipo"
            name="tipo"
            id="tipo"
            required
            options={tipoOptions}
            onChange={handleSelectChange}
            value={normalFormData.tipo}
            disabled={localLoading.submit}
          />

          <Datalist
            label="Proyecto"
            name="proyecto"
            id="proyecto"
            required
            options={
              loading.projects
                ? [{ value: "0", label: "Cargando proyectos..." }]
                : options.projects
            }
            onChange={handleInputChange}
            value={normalFormData.proyecto}
            disabled={!normalFormData.tipo || loading.projects}
          />

          <Datalist
            label="Cuenta"
            name="cuenta"
            id="cuenta"
            required
            options={
              localLoading.accounts
                ? [{ value: "0", label: "Cargando cuentas..." }]
                : localOptions.accounts
            }
            onChange={handleInputChange}
            value={normalFormData.cuenta}
            disabled={!normalFormData.tipo || localLoading.accounts}
          />

          <Input
            required
            type="number"
            id="factura"
            name="factura"
            value={normalFormData.factura}
            onChange={handleInputChange}
            pattern="\d*"
            numericInput={true}
            label="No. Factura o Vale"
            disabled={localLoading.submit}
          />

          <Input
            required
            type="number"
            step="0.01"
            id="valor"
            numericInput={true}
            name="valor"
            value={normalFormData.valor}
            onChange={handleInputChange}
            label="Valor"
            disabled={localLoading.submit}
          />

          {normalFormData.tipo === "nomina" && (
            <div>
              <Datalist
                label="Responsable"
                name="responsable"
                id="responsable"
                required
                value={normalFormData.responsable}
                options={
                  !localOptions.responsibles.length
                    ? [
                        {
                          value: "0",
                          label: "No hay personal asociado a este proyecto.  ",
                          optionDisabled: true,
                          className: "normal-case",
                        },
                      ]
                    : localOptions.responsibles
                }
                onChange={handleInputChange}
                disabled={!normalFormData.proyecto || localLoading.responsibles}
              />
            </div>
          )}

          {normalFormData.tipo === "transportista" && (
            <div>
              <Datalist
                label="No. De Transporte"
                name="transporte"
                id="transporte"
                required
                value={normalFormData.transporte}
                options={
                  localLoading.transports
                    ? [{ value: "0", label: "Cargando vehículos..." }]
                    : localOptions.transports
                }
                onChange={handleInputChange}
                disabled={!normalFormData.proyecto || localLoading.transports}
              />
            </div>
          )}

          <Input
            required
            type="text"
            id="observacion"
            name="observacion"
            value={normalFormData.observacion}
            onChange={handleInputChange}
            label="Observación"
            disabled={loading.submit || localLoading.submit}
            containerClassName="xl:col-span-2"
          />

          <div className="-mt-2 lg:col-span-2 xl:col-span-4">
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

        <div className="flex flex-col md:flex-row w-full items-center md:justify-end gap-2 md:gap-5 mt-6">
          <button
            type="reset"
            className="bg-slate-600 hover:bg-slate-700 text-white py-1 px-4 rounded font-semibold shadow-md hover:shadow-none transition-all duration-300 w-full md:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading.submit || localLoading.submit || !formValid}
            onClick={() =>
              setNormalFormData({
                fechaGasto: new Date().toISOString().split("T")[0],
                tipo: "",
                factura: "",
                cuenta: "",
                valor: "",
                proyecto: "",
                responsable: "",
                transporte: "",
                adjunto: new Blob([]),
                observacion: "",
              })
            }
          >
            Borrar Formulario
          </button>
          <button
            type="submit"
            className="bg-red-600 hover:bg-red-700 text-white py-1 px-4 rounded font-semibold shadow-md hover:shadow-none transition-all duration-300 w-full md:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading.submit || localLoading.submit || !formValid}
          >
            {loading.submit ? "Procesando..." : "Registrar Descuento"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NormalDiscountForm;
