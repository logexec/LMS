import React from "react";

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

  return (
    <>
      <section className="container pt-10">
        <div className="flex w-full">
          <div className="w-1/4">
            <h3 className="text-red-900 text-sm font-bold">
              ¿Carga masiva de información?
            </h3>
            <p className="text-sm text-slate-500">
              Por favor, carga tu archivo xlsx, xls o csv.
            </p>
          </div>
          <div className="w-3/4">
            <form>
              <div className="grid w-full max-w-xs items-center gap-1.5">
                <label className="block text-slate-700 text-sm font-bold">
                  Archivo
                </label>
                <input
                  className="flex w-full rounded-md border border-red-300 border-input bg-white text-base text-gray-400 file:border-0 file:bg-red-600 file:text-white file:text-base file:font-medium file:text-center file:px-2 file:py-1"
                  type="file"
                  id="file"
                  accept=".xlsx, .xls, .csv"
                />
                <input
                  type="button"
                  className="p-0.5 rounded-md bg-red-600 hover:bg-red-700 text-white font-medium"
                  value="Cargar Datos"
                />
              </div>
            </form>
          </div>
        </div>

        <hr className="border border-slate-200 my-10" />

        <div className="flex">
          <section className="w-1/4">
            <h3 className="text-red-900 text-sm font-bold">
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
              <div className="">
                <label
                  className="block text-slate-700 text-sm font-bold mb-2"
                  htmlFor="fechaGasto"
                >
                  Fecha del gasto
                </label>
                <input
                  className="appearance-none border-b-2 shadow-sm border-slate-100 rounded w-full py-2 px-4 text-slate-700 leading-tight focus:outline-none focus:bg-white focus:border-sky-200  placeholder:text-slate-400"
                  id="fechaGasto"
                  type="date"
                  value={formData.fechaGasto}
                  onChange={handleInputChange}
                />
              </div>

              <div className="">
                <label
                  className="block text-slate-700 text-sm font-bold mb-2"
                  htmlFor="tipo"
                >
                  Tipo
                </label>
                <select
                  className="appearance-none border-b-2 shadow-sm border-slate-100 rounded w-full py-2 px-4 text-slate-700 leading-tight focus:outline-none focus:bg-white focus:border-sky-200  placeholder:text-slate-400"
                  id="tipo"
                  name="tipo"
                  value={formData.tipo}
                  onChange={handleSelectChange}
                >
                  <option value="nomina">Nómina</option>
                  <option value="transportista">Transportista</option>
                </select>
              </div>

              <div className="">
                <label
                  className="block text-slate-700 text-sm font-bold mb-2"
                  htmlFor="factura"
                >
                  No. Factura o Vale
                </label>
                <input
                  className="appearance-none border-b-2 shadow-sm border-slate-100 rounded w-full py-2 px-4 text-slate-700 leading-tight focus:outline-none focus:bg-white focus:border-sky-200  placeholder:text-slate-400"
                  type="number"
                  step="0.01"
                  id="factura"
                  name="factura"
                  value={formData.factura}
                  onChange={handleInputChange}
                  placeholder="1234.56"
                />
              </div>

              <div className="">
                <label
                  className="block text-slate-700 text-sm font-bold mb-2"
                  htmlFor="cuenta"
                >
                  Cuenta
                </label>
                <select
                  className="appearance-none border-b-2 shadow-sm border-slate-100 rounded w-full py-2 px-4 text-slate-700 leading-tight focus:outline-none focus:bg-white focus:border-sky-200  placeholder:text-slate-400"
                  id="cuenta"
                  name="cuenta"
                  value={formData.cuenta}
                  onChange={handleSelectChange}
                >
                  <option value="cuenta1">Agua Potable</option>
                  <option value="cuenta2">Alimentacion</option>
                  <option value="etc">Otras cuentas</option>
                </select>
              </div>

              <div className="">
                <label
                  className="block text-slate-700 text-sm font-bold mb-2"
                  htmlFor="valor"
                >
                  Valor
                </label>
                <input
                  className="appearance-none border-b-2 shadow-sm border-slate-100 rounded w-full py-2 px-4 text-slate-700 leading-tight focus:outline-none focus:bg-white focus:border-sky-200  placeholder:text-slate-400"
                  type="number"
                  step="0.01"
                  id="valor"
                  name="valor"
                  value={formData.valor}
                  onChange={handleInputChange}
                  placeholder="789.01"
                />
              </div>

              <div className="">
                <label
                  className="block text-slate-700 text-sm font-bold mb-2"
                  htmlFor="proyecto"
                >
                  Proyecto
                </label>
                <select
                  className="appearance-none border-b-2 shadow-sm border-slate-100 rounded w-full py-2 px-4 text-slate-700 leading-tight focus:outline-none focus:bg-white focus:border-sky-200  placeholder:text-slate-400"
                  id="proyecto"
                  name="proyecto"
                  value={formData.proyecto}
                  onChange={handleSelectChange}
                >
                  <option value="proyecto1">Admin</option>
                  <option value="proyecto2">CNQT</option>
                  <option value="etc">Otros Proyectos</option>
                </select>
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
