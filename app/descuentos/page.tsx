"use client";
import React, { useState } from "react";
import { createPortal } from "react-dom";
import Modal from "../components/Modal";
import Table from "../components/Table";
import { descuentosData } from "@/utils/dummyData";

const page = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const closeModal = () => setModalOpen(false);

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
        <button className="btn btn-negative" onClick={() => setModalOpen(true)}>
          Registrar descuento
        </button>
      </div>
      <section className="w-full row-start-2 py-4 px-2">
        <Table nodes={descuentosData} type="descuentos" />
      </section>
    </div>
  );
};

export default page;
