"use client";
import React, { useState } from "react";
import { createPortal } from "react-dom";
import Modal from "../components/Modal";
import Table from "../components/Table";
import { gastosData } from "@/utils/dummyData";

const IngresosEspecialesPage: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const closeModal = () => setModalOpen(false);

  return (
    <div className="grid grid-rows-[auto_1fr] w-full h-full">
      {modalOpen &&
        createPortal(
          <Modal
            title="Registrar nuevo ingreso"
            type="ingresos"
            isOpen={modalOpen}
            onClose={closeModal}
          />,
          document.body
        )}
      <div className="flex flex-row justify-between px-5 items-center">
        <h1 className="title">Ingresos Registrados</h1>
        <button className="btn btn-negative" onClick={() => setModalOpen(true)}>
          Registrar Ingreso
        </button>
      </div>
      <section className="w-full row-start-2 py-4 px-2">
        <Table nodes={gastosData} type="ingresos" />
      </section>
    </div>
  );
};

export default IngresosEspecialesPage;