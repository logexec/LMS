import React, { useState } from "react";
import Input from "../Input";
import Select from "../Select";
import Hr from "../Hr";

const GastosForm = () => {
  const [formData, setFormData] = useState({
    fechaGasto: "",
    tipo: "",
    factura: "",
    cuenta: "",
    valor: "",
    proyecto: "",
    responsable: "",
    transporte: "",
    adjunto: "",
    observacion: "",
  });

  const tipoOptions = [
    {
      value: "nomina",
      label: "Nómina",
    },
    {
      value: "transportista",
      label: "Transportista",
    },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const presupuesto: number = 1234567.89;

  return (
    <>
      <section className="container pt-10">
        <div className="flex">
          <div className="w-1/4">
            <h3 className="text-slate-700 text-sm font-bold">
              Detalles gastos
            </h3>
            <p className="text-sm text-slate-500">
              <strong>
                <i>Todos</i>
              </strong>{" "}
              los campos son obligatorios.
            </p>
          </div>

          <form className="w-3/4 mr-5">
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
              <div className="">
                <Select
                  label="Tipo"
                  name="tipo"
                  id="tipo"
                  options={tipoOptions}
                  onChange={handleSelectChange}
                />
              </div>

              <Input
                required
                type="number"
                step="0.01"
                id="factura"
                name="factura"
                value={formData.factura}
                onChange={handleInputChange}
                label="No. Factura o Vale"
              />

              <div className="">
                <Select
                  label="Cuenta"
                  name="cuenta"
                  id="cuenta"
                  options={[
                    { label: "Agua Potable", value: "agua" },
                    { label: "Alimentación", value: "alimentacion" },
                  ]}
                  onChange={handleSelectChange}
                />
              </div>
              <Input
                required
                type="number"
                step="0.01"
                id="valor"
                name="valor"
                value={formData.valor}
                onChange={handleInputChange}
                label="Valor"
              />

              <div className="">
                <Select
                  label="Proyecto"
                  name="proyecto"
                  id="proyecto"
                  options={[
                    { label: "ADMN", value: "admn" },
                    { label: "CNQT", value: "cnqt" },
                  ]}
                  onChange={handleSelectChange}
                />
              </div>

              {/* Admin */}
              {formData.tipo === "nomina" && formData.proyecto === "admn" && (
                <div className="">
                  <label
                    className="block text-slate-700 text-sm font-bold mb-2"
                    htmlFor="responsable"
                  >
                    Responsable
                  </label>
                  <select
                    className="appearance-none border-b-2 shadow-sm border-slate-100 rounded w-full py-2 px-4 text-slate-700 leading-tight focus:outline-none focus:bg-white focus:border-sky-200  placeholder:text-slate-400"
                    id="responsable"
                    name="responsable"
                    value={formData.responsable}
                    onChange={handleSelectChange}
                  >
                    <option value="responsable1">John Kenyon</option>
                    <option value="responsable2">Ricardo Estrella</option>
                    <option value="etc">Otros Responsables de Admin</option>
                  </select>
                </div>
              )}

              {/* CNQT */}
              {formData.tipo === "nomina" && formData.proyecto === "cnqt" && (
                <Select
                  label="Responsable"
                  name="responsable"
                  id="responsable"
                  options={[
                    { label: "Ricardo Estrella", value: "ricardo" },
                    { label: "Damián Frutos", value: "damian" },
                  ]}
                  onChange={handleSelectChange}
                />
              )}

              {formData.tipo === "transportista" &&
                formData.proyecto === "cnqt" && (
                  <Select
                    label="No. De Transporte"
                    name="transporte"
                    id="transporte"
                    options={[
                      { label: "ABC-1234", value: "abc1234" },
                      { label: "DEF-5678", value: "def5678" },
                    ]}
                    onChange={handleSelectChange}
                  />
                )}
            </div>
            <div className="flex w-full items-center justify-end gap-5">
              <button
                type="reset"
                className="bg-slate-600 hover:bg-slate-700 text-white py-1 px-4 rounded font-semibold shadow-md hover:shadow-none hover:scale-[.98] transition-all duration-300"
              >
                Borrar Formulario
              </button>
              <button
                type="submit"
                className="bg-red-600 hover:bg-red-700 text-white py-1 px-4 rounded font-semibold shadow-md hover:shadow-none hover:scale-[.98] transition-all duration-300"
              >
                Registrar Descuento
              </button>
            </div>
          </form>
        </div>
        <br />
        <Hr />
        <div className="flex mt-2 mb-8 bg-slate-100 rounded-lg w-max mx-auto py-3 px-10">
          <p className="text-slate-500/90 text-lg font-semibold">
            Saldo Disponible del Presupuesto Mensual:
          </p>
          <div className="ml-3 text-xl text-slate-600 font-semibold">
            <span className="text-red-400">$ </span>
            {presupuesto.toFixed(2)}
          </div>
        </div>

        {/* <Hr />
        <div className="flex mt-2">
          <div className="w-1/4">
            <h3 className="text-red-900 text-sm font-bold">Más Detalles</h3>
            <p className="text-sm text-slate-500">Llena más detalles</p>
          </div>

          <div className="w-1/4 mr-5">
            <Input
            required type="text" label="Usuario" name="username" id="username" />
          </div>

          <div className="w-1/4">
            <Input
            required type="text" label="Empresa" name="company" id="company" />
          </div>
        </div> */}
      </section>
    </>
  );
};

export default GastosForm;
