import React, { useEffect, useState } from "react";
import Input from "./Input";
import "./modal.component.css";
import Select from "./Select";

interface ModalProps {
  title: string;
  type: string;
  isOpen: boolean;
  onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ title, type, isOpen, onClose }) => {
  if (type)
    console.log(
      "Type se utiliza para ver a que api se manda el formulario",
      type
    );

  const [formData, setFormData] = useState({
    fecha_gasto: "",
    tipo: "",
    factura: "",
    valor: "",
    cuenta: "",
    proyecto: "",
    responsable: "",
    transporte: "",
    placa: "",
    observacion: "",
    adjunto: "",
    empresa: "",
    selected_tipo: "",
    campo_nomina: "",
  });

  // Estado para la validación del formulario
  const [isFormValid, setIsFormValid] = useState(false);

  // Opciones del segundo Select (Empresa) que dependen de la selección del primer Select (Tipo)
  const empresaOptions = {
    nomina: [
      { label: "Prebam", value: "prebam" },
      { label: "SERSUPPORT", value: "sersupport" },
    ],
    transportista: [
      { label: "Empresa A", value: "empresaA" },
      { label: "Empresa B", value: "empresaB" },
    ],
  };

  // Efecto para verificar si el formulario está completo
  useEffect(() => {
    const isComplete = Object.values(formData).every((value) => value !== "");
    setIsFormValid(isComplete);
  }, [formData]);

  // Manejo del cambio en los campos de entrada
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Manejo del cambio en el Select
  const handleSelectChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
    type: "tipo" | "empresa" | "proyecto"
  ) => {
    const { value } = e.target;

    if (type === "tipo") {
      setFormData((prevData) => ({
        ...prevData,
        tipo: value,
      }));
    } else if (type === "empresa") {
      setFormData((prevData) => ({
        ...prevData,
        empresa: value,
      }));
    } else if (type === "proyecto") {
      setFormData((prevData) => ({
        ...prevData,
        proyecto: value,
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300 ${
        isOpen ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className={`bg-white p-8 rounded-lg min-w-96 transition-transform duration-300 transform ${
          isOpen ? "scale-100" : "scale-95"
        }`}
      >
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        <form>
          <div className="grid grid-cols-4 gap-3 mb-5">
            <Input
              type="date"
              label="Fecha"
              name="fecha_gasto"
              id="fecha_gasto"
              required
              value={formData.fecha_gasto}
              onChange={handleInputChange}
            />
            <Select
              name="tipo"
              id="tipo"
              label="Tipo"
              options={[
                { label: "Nómina", value: "nomina" },
                { label: "Transportista", value: "transportista" },
              ]}
              value={formData.tipo}
              onChange={(e) => handleSelectChange(e, "tipo")}
            />
            <Input
              type="tel"
              label="No. Factura o Vale"
              name="factura"
              id="factura"
              required
              value={formData.factura}
              onChange={handleInputChange}
            />
            <Input
              type="number"
              label="Valor"
              name="valor"
              id="valor"
              required
              value={formData.valor}
              onChange={handleInputChange}
            />
            <Input
              type="text"
              label="Cuenta"
              name="cuenta"
              id="cuenta"
              required
              value={formData.cuenta}
              onChange={handleInputChange}
            />
            <Select
              name="proyecto"
              id="proyecto"
              label="Proyecto"
              options={[
                {
                  label: "ADMN",
                  value: "admn",
                },
                {
                  label: "CNQT",
                  value: "cnqt",
                },
              ]}
              value={formData.proyecto}
              onChange={(e) => handleSelectChange(e, "proyecto")}
            />
            <Input
              type="text"
              label="Responsable"
              name="responsable"
              id="responsable"
              required
              value={formData.responsable}
              onChange={handleInputChange}
            />
            {formData.tipo === "nomina" && (
              <Select
                name="empresa"
                id="empresa"
                label="Empresa"
                options={empresaOptions.nomina} // Usamos las opciones dependiendo del tipo seleccionado
                value={formData.empresa}
                onChange={(e) => handleSelectChange(e, "empresa")}
              />
            )}

            {formData.tipo === "transportista" && (
              <Select
                name="empresa"
                id="empresa"
                label="Empresa"
                options={empresaOptions.transportista} // Usamos las opciones dependiendo del tipo seleccionado
                value={formData.empresa}
                onChange={(e) => handleSelectChange(e, "empresa")}
              />
            )}

            {formData.tipo === "nomina" && (
              <Input
                type="text"
                label="Campo adicional para Nómina"
                name="campo_nomina"
                id="campo_nomina"
                required
                value={formData.campo_nomina || ""}
                onChange={handleInputChange}
              />
            )}

            <Input
              type="text"
              label="Transporte"
              name="transporte"
              id="transporte"
              required
              value={formData.transporte}
              onChange={handleInputChange}
            />
            <Input
              type="text"
              label="Placa"
              name="placa"
              id="placa"
              required
              value={formData.placa}
              onChange={handleInputChange}
            />
            <Input
              type="text"
              label="Observacion"
              name="observacion"
              id="observacion"
              required
              value={formData.observacion}
              onChange={handleInputChange}
            />
            <Input
              type="file"
              label="Adjunto"
              name="adjunto"
              id="adjunto"
              className="col-span-4 flex items-center justify-center"
              required
              value={formData.adjunto}
              onChange={handleInputChange}
            />
          </div>
          <button
            className={`btn btn-success float-start w-36 ${
              !isFormValid &&
              "opacity-50 cursor-not-allowed hover:pointer-events-none"
            }`}
            disabled={!isFormValid}
          >
            Registrar
          </button>
        </form>
        <button onClick={onClose} className="btn btn-negative float-end">
          Cancelar
        </button>
      </div>
    </div>
  );
};

export default Modal;
