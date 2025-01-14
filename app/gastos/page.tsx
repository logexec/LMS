"use client";
import React, { useState } from "react";
import { createPortal } from "react-dom";
import Modal from "../components/ModalForm";
import { AiOutlineFileAdd } from "react-icons/ai";

const GastosPage: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const closeModal = () => setModalOpen(false);

  return (
    <div className="grid grid-rows-[auto_1fr] w-full h-full">
      {modalOpen &&
        createPortal(
          <Modal
            title="Registrar nuevo gasto"
            type="gasto"
            isOpen={modalOpen}
            onClose={closeModal}
          />,
          document.body
        )}
      <div className="flex flex-row justify-between px-5 items-center">
        <h1 className="title">Registro de gastos</h1>
        <button
          className="btn flex justify-center items-center gap-3"
          onClick={() => setModalOpen(true)}
        >
          <AiOutlineFileAdd />
          Registrar Gasto
        </button>
      </div>
      <section className="w-full row-start-2 py-4 px-2">
        Tabla de Gastos
      </section>
    </div>
  );
};

export default GastosPage;
