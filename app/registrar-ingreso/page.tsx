"use client";
import React, { useState } from "react";
import { Modal } from "../components/Modal";
import ModalStatus from "../components/ModalStatus";
import "./registro.component.css";
import DescuentosForm from "../components/ingresos/DescuentosForm";
import GastosForm from "../components/ingresos/GastosForm";
import { getProjects } from "../server/projects";

const RegistroPage: React.FC = () => {
  const [view, setView] = useState<"descuentos" | "gastos">("descuentos");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStatus, setModalStatus] = useState({
    isOpen: false,
    type: "success",
    text: "",
    suggestion: "",
  });

  const handleConfirmAction = () => {
    setIsModalOpen(false);

    // Simulación de llamada a la API
    const apiResponse = Math.random() > 0.5 ? 200 : 500; // Éxito o error aleatorio

    if (apiResponse === 200) {
      setModalStatus({
        isOpen: true,
        type: "success",
        text: "Solicitud enviada con éxito",
        suggestion: "",
      });
      setTimeout(() => {
        setModalStatus({ isOpen: false, type: "", text: "", suggestion: "" });
      }, 2500);
    } else {
      setModalStatus({
        isOpen: true,
        type: "error",
        text: "Error al enviar la solicitud.",
        suggestion: "Por favor, inténtalo nuevamente o contacta a soporte.",
      });
      // console.error("Error", error);
      setTimeout(() => {
        setModalStatus({ isOpen: false, type: "", text: "", suggestion: "" });
      }, 4000);
    }
  };

  //TODO: Descuentos son únicamente a activos, no cesantes.
  //TODO: Responsable: Persona a quien se descuenta

  return (
    <div className="grid grid-rows-[auto_auto_1fr] w-full h-full">
      <Modal isOpen={isModalOpen}>
        <div>
          <h2 className="text-lg font-bold">Confirmar acción</h2>
          <div className="h-[1px] w-full bg-slate-300 my-1" />
          <p className="my-4">
            ¿Estás seguro de que deseas enviar esta solicitud?
          </p>
          <div className="flex justify-end items-center space-x-4 mt-6">
            <button
              className="bg-slate-600 hover:bg-slate-700 text-white py-2 px-4 rounded"
              onClick={() => setIsModalOpen(false)}
            >
              Cancelar
            </button>
            <button
              className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
              onClick={handleConfirmAction}
            >
              Confirmar
            </button>
          </div>
        </div>
      </Modal>

      {modalStatus.isOpen && (
        <ModalStatus
          success={modalStatus.type === "success"}
          error={modalStatus.type === "error"}
          text={modalStatus.text}
          suggestion={modalStatus.suggestion}
        />
      )}

      {/* <div className="flex flex-row justify-between row-start-1 px-5 items-center">
        <h1 className="title">Registrar</h1>
      </div> */}
      <section className="w-full shadow rounded-lg bg-white row-start-2 p-5 flex gap-3">
        <div className="container" id="toggle">
          <div className="tabs">
            <input
              type="radio"
              id="descuentos"
              name="tabletoggle"
              value="descuentos"
              checked={view === "descuentos"}
              onChange={(e) =>
                setView(e.target.value as "descuentos" | "gastos")
              }
            />
            <label className="tab" htmlFor="descuentos">
              Descuento
            </label>
            <input
              type="radio"
              id="gastos"
              name="tabletoggle"
              value="gastos"
              checked={view === "gastos"}
              onChange={(e) =>
                setView(e.target.value as "descuentos" | "gastos")
              }
            />
            <label className="tab" htmlFor="gastos">
              Gasto
            </label>
            <span className="glider"></span>
          </div>
        </div>
      </section>
      <section className="w-full row-start-3 py-4 px-2">
        {view === "descuentos" && (
          <div>
            <DescuentosForm />
            {/* TODO: Quitar clase invisible */}
            <button
              className="text-red-600 hover:underline hover:text-red-700 block invisible"
              onClick={() => setIsModalOpen(true)}
            >
              Enviar solicitud
            </button>
          </div>
        )}
        {view === "gastos" && (
          <div>
            <GastosForm />
            {/* TODO: Quitar clase invisible */}
            <button
              className="text-red-600 hover:underline hover:text-red-700 block invisible"
              onClick={() => setIsModalOpen(true)}
            >
              Enviar solicitud
            </button>
          </div>
        )}
      </section>

      {/* TODO: Al enviar solicitud, agrupa todos los registros filtrados, suma
      todos los valores y genera un registro de solicitud. (total y estado
      (pending default))  */}

      {/* TODO: Preguntar si esta seguro de enviar la
      solicitud.  */}

      {/* TODO: Agregar notificaciones: Si llega solicitud, que
      aparezca un numero junto al nombre del modulo  */}
    </div>
  );
};

export default RegistroPage;
