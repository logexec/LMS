"use client";
import React, { useState } from "react";
import { createPortal } from "react-dom";
import Modal from "../components/ModalForm";
import { AiOutlineFileAdd } from "react-icons/ai";

const DescuentosPage: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const closeModal = () => setModalOpen(false);

  //TODO: Confirmar el registro. Lo mismo en gastos

  //TODO: Unicamente a activos, no cesantes.
  //TODO: Responsable: Persona a quien se descuenta

  return (
    <div className="grid grid-rows-[auto_1fr] w-full h-full">
      {modalOpen &&
        createPortal(
          <Modal
            title="Registrar nuevo descuento"
            type="descuento"
            isOpen={modalOpen}
            onClose={closeModal}
          />,
          document.body
        )}
      <div className="flex flex-row justify-between px-5 items-center">
        <h1 className="title">Registro de descuentos</h1>
        <button
          className="btn flex justify-center items-center gap-3"
          onClick={() => setModalOpen(true)}
        >
          <AiOutlineFileAdd />
          Registrar Descuento
        </button>
      </div>
      <section className="w-full row-start-2 py-4 px-2">
        Tabla de Gestion
      </section>
      {/* TODO: Al enviar solicitud, agrupa todos los registros filtrados, suma
      todos los valores y genera un registro de solicitud. (total y estado
      (pending default))  */}
      {/* TODO: Preguntar si esta seguro de enviar la
      solicitud.  */}
      {/* TODO: Agregar notificaciones: Si llega solicitud, que
      aparezca un numero junto al nombre del modulo  */}
      {/* TODO: Permitir carga
      masiva */}
    </div>
  );
};

export default DescuentosPage;
