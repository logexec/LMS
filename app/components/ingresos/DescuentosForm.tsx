"use client";
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;

    if (files && files[0]) {
      setFormData((prevData) => ({
        ...prevData,
        [name]: files[0], // Guardamos el primer archivo seleccionado
      }));
    }
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
                  onChange={handleFileChange}
                />
              </div>
              <button
                type="submit"
                className="mt-4 bg-red-600 hover:bg-red-700 text-white py-1 px-4 rounded font-semibold shadow-md hover:shadow-none hover:scale-[.98] transition-all duration-300"
              >
                Registrar Descuento
              </button>
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
                id="factura"
                name="factura"
                value={formData.factura}
                onChange={handleInputChange}
                label="No. Factura o Vale"
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
              />

              {/* Admin */}
              {formData.tipo === "nomina" && formData.proyecto === "admn" && (
                <div className="">
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
                </div>
              )}

              {/* CNQT */}
              {formData.tipo === "nomina" && formData.proyecto === "cnqt" && (
                <div>
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
                </div>
              )}

              {formData.tipo === "transportista" &&
                formData.proyecto === "cnqt" && (
                  <div>
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
                  </div>
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
      </section>
    </>
  );
};

export default DescuentosForm;
