import React from "react";
import Input from "../Input";
import Select from "../Select";

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
            <Input
              label="Fecha del gasto"
              name="fechaGasto"
              id="fechaGasto"
              type="date"
              currentDate={true}
            />
          </div>

          <div className="w-1/4">
            <Select
              label="Tipo"
              name="tipo"
              id="tipo"
              options={[
                { label: "Nómina", value: "nomina" },
                { label: "Transportista", value: "transportista" },
              ]}
            />
          </div>
        </div>

        <hr className="border border-slate-200 my-10" />

        <div className="flex">
          <div className="w-1/4">
            <h3 className="text-red-900 text-sm font-bold">Más Detalles</h3>
            <p className="text-sm text-slate-500">Llena más detalles</p>
          </div>

          <div className="w-1/4 mr-5">
            <Input type="text" label="Usuario" name="username" id="username" />
          </div>

          <div className="w-1/4">
            <Input type="text" label="Empresa" name="company" id="company" />
          </div>
        </div>
      </section>
    </>
  );
};

export default GastosForm;
