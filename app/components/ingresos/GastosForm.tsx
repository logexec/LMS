import React from "react";

const GastosForm = () => {
  return (
    <>
      <section className="container pt-10">
        <div className="flex">
          <div className="w-1/4">
            <h3 className="text-red-900 text-sm font-bold">Detalles gastos</h3>
            <p className="text-sm text-slate-500">
              <strong>
                <i>Todos</i>
              </strong>{" "}
              los campos son obligatorios.
            </p>
          </div>

          <div className="w-1/4 mr-5">
            <label
              className="block text-slate-700 text-sm font-bold mb-2"
              htmlFor="fechaGasto"
            >
              Fecha del gasto
            </label>
            <input
              className="appearance-none border-b-2 shadow-sm border-slate-100 rounded w-full py-2 px-4 text-slate-700 leading-tight focus:outline-none focus:bg-white focus:border-sky-200"
              id="fechaGasto"
              type="date"
            />
          </div>

          <div className="w-1/4">
            <label
              className="block text-slate-700 text-sm font-bold mb-2"
              htmlFor="tipo"
            >
              Tipo
            </label>
            <select
              className="appearance-none border-b-2 shadow-sm border-slate-100 rounded w-full py-2 px-4 text-slate-700 leading-tight focus:outline-none focus:bg-white focus:border-sky-200"
              id="tipo"
              name="tipo"
            >
              <option value="nomina">Nómina</option>
              <option value="transportista">Transportista</option>
            </select>
          </div>
        </div>

        <hr className="border border-slate-200 my-10" />

        <div className="flex">
          <div className="w-1/4">
            <h3 className="text-red-900 text-sm font-bold">Más Detalles</h3>
            <p className="text-sm text-slate-500">Llena más detalles</p>
          </div>

          <div className="w-1/4 mr-5">
            <label
              className="block text-slate-700 text-sm font-bold mb-2"
              htmlFor="username"
            >
              Usuario
            </label>
            <input
              className="appearance-none border-b-2 shadow-sm border-slate-100 rounded w-full py-2 px-4 text-slate-700 leading-tight focus:outline-none focus:bg-white focus:border-sky-500 placeholder:text-slate-400"
              id="username"
              type="text"
              placeholder="John Kenyon"
            />
          </div>

          <div className="w-1/4">
            <label
              className="block text-slate-700 text-sm font-bold mb-2"
              htmlFor="business"
            >
              Empresa
            </label>
            <input
              className="appearance-none border-b-2 shadow-sm border-slate-100 rounded w-full py-2 px-4 text-slate-700 leading-tight focus:outline-none focus:bg-white focus:border-sky-500 placeholder:text-slate-400"
              id="business"
              type="text"
              placeholder="Logex"
            />
          </div>
        </div>
      </section>
    </>
  );
};

export default GastosForm;
