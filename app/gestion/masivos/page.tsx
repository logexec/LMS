"use client";
import Hr from "@/app/components/Hr";
import Input from "@/app/components/Input";
import React, { useState } from "react";
import Select from "@/app/components/Select";
import {
  admnUsers,
  areas,
  cnqtUsers,
  cuentasMasivas,
  proyectos,
} from "@/utils/constants";
import { GiPayMoney } from "react-icons/gi";
import UsersTable from "@/app/components/UsersTable";

const MasivosPage = () => {
  const [formData, setFormData] = useState({
    fecha_gasto: "",
    tipo: "",
    numeroFactura: "",
    cuenta: "",
    valorTotal: "",
    proyecto: "",
    area: "",
    adjunto: "",
    pago: "",
    observacion: "",
  });

  const tipoOptions = [{ label: "Nómina", value: "nomina" }];
  const pagoOptions = [{ label: "Faltantes", value: "faltantes" }];

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
    <div className="w-full h-full">
      <div className="grid grid-rows-[auto_auto] gap-2 p-2">
        <div className="row-start-1">
          <h3 className="text-slate-600 text-xl">
            Registro Masivo de Descuentos
          </h3>
          <div className="my-2">
            <Hr />
          </div>
          <div className="w-full mx-1 p-5 bg-white shadow rounded-xl my-3">
            <form className="lg:grid grid-cols-4 gap-5">
              <Input
                type="date"
                label="Fecha del Gasto"
                name="expenseDate"
                id="expenseDate"
                onChange={handleInputChange}
                className="my-4 lg:my-0"
              />
              <Select
                name="type"
                id="type"
                label="Tipo"
                options={tipoOptions}
                onChange={handleSelectChange}
                value={formData.tipo}
                className="my-4 lg:my-0"
              />
              <Input
                type="number"
                name="numeroFactura"
                id="numeroFactura"
                label="No. Factura o Vale"
                onChange={handleInputChange}
                className="my-4 lg:my-0"
              />
              <Input
                type="number"
                name="valorTotal"
                id="valorTotal"
                label="Valor Total"
                onChange={handleInputChange}
                className="my-4 lg:my-0"
              />
              <Select
                name="cuenta"
                id="cuenta"
                label="Cuenta"
                options={cuentasMasivas}
                onChange={handleSelectChange}
                value={formData.cuenta}
                className="my-4 lg:my-0"
              />
              <Select
                name="proyecto"
                id="proyecto"
                label="Proyecto"
                options={proyectos}
                onChange={handleSelectChange}
                value={formData.proyecto}
                className="my-4 lg:my-0"
              />
              <Select
                name="area"
                id="area"
                label="Área"
                options={areas}
                onChange={handleSelectChange}
                value={formData.area}
                className="my-4 lg:my-0"
              />
              <Select
                name="pago"
                id="pago"
                label="Pago"
                options={pagoOptions}
                onChange={handleSelectChange}
                value={formData.pago}
                className="my-4 lg:my-0"
              />
              <Input
                type="text"
                name="observacion"
                id="observacion"
                label="Observación"
                onChange={handleInputChange}
                className="my-4 lg:my-0 col-span-4"
              />
              <button
                type="submit"
                className="btn col-span-4 w-96 mx-auto flex items-center justify-center gap-4"
              >
                <GiPayMoney className="size-6" />
                Registrar Descuento Masivo
              </button>
            </form>
          </div>
        </div>
        <div className="row-start-2 mt-2">
          <h3 className="text-slate-600 text-xl">
            Personal para Descuento Masivo
          </h3>
          <div className="my-4">
            <Hr />
          </div>
          {formData.proyecto === "admn" && <UsersTable nodes={admnUsers} />}
          {formData.proyecto === "cnqt" && <UsersTable nodes={cnqtUsers} />}
        </div>
      </div>
    </div>
  );
};

export default MasivosPage;
