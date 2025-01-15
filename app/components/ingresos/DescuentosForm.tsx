import React from "react";
import Input from "../Input";
import File from "../File";
import Select from "../Select";

const DescuentosForm = () => {
  const [formData, setFormData] = React.useState({
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
          <div className="w-3/4">
            <form>
              <div className="grid w-full max-w-xs items-center gap-1.5">
                <File
                  name="archivo"
                  label="Archivo"
                  accept=".xlsx, .xls, .csv"
                  buttonLabel="Cargar Información"
                />
              </div>
            </form>
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

          <form className="w-3/4">
            <div className="grid grid-cols-4 gap-3">
              <Input
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
                />
              </div>

              <Input
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
                />
              </div>
              <Input
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
                />
              </div>

              {/* Admin */}
              {formData.tipo === "nomina" &&
                formData.proyecto === "proyecto1" && (
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
              {formData.tipo === "nomina" &&
                formData.proyecto === "proyecto2" && (
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
                      <option value="responsable1">Damián Frutos</option>
                      <option value="responsable2">Jonathan Visconti</option>
                      <option value="etc">Otros Responsables de CNQT</option>
                    </select>
                  </div>
                )}

              {formData.tipo === "transportista" &&
                formData.proyecto === "proyecto2" && (
                  <div className="">
                    <label
                      className="block text-slate-700 text-sm font-bold mb-2"
                      htmlFor="transporte"
                    >
                      No. Transporte
                    </label>
                    <select
                      className="appearance-none border-b-2 shadow-sm border-slate-100 rounded w-full py-2 px-4 text-slate-700 leading-tight focus:outline-none focus:bg-white focus:border-sky-200  placeholder:text-slate-400"
                      id="transporte"
                      name="transporte"
                      value={formData.transporte}
                      onChange={handleSelectChange}
                    >
                      <option value="transporte1">ABC1234</option>
                      <option value="transporte2">PQR567</option>
                      <option value="etc">Otras Placas</option>
                    </select>
                  </div>
                )}
            </div>
          </form>
        </div>
      </section>
    </>
  );
};

export default DescuentosForm;
