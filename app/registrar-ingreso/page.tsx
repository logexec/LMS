"use client";
import React, { useState } from "react";
import ModalStatus from "../components/ModalStatus";
import "./registro.component.css";
import DescuentosForm from "../components/ingresos/DescuentosForm";
import GastosForm from "../components/ingresos/GastosForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const RegistroPage: React.FC = () => {
  const [modalStatus] = useState({
    isOpen: false,
    type: "success",
    text: "",
    suggestion: "",
  });

  return (
    <div className="grid grid-rows-[auto_auto_1fr] w-full h-full">
      {modalStatus.isOpen && (
        <ModalStatus
          success={modalStatus.type === "success"}
          error={modalStatus.type === "error"}
          text={modalStatus.text}
          suggestion={modalStatus.suggestion}
        />
      )}

      <Tabs defaultValue="discount">
        <TabsList>
          <TabsTrigger value="discount">Descuentos</TabsTrigger>
          <TabsTrigger value="expense">Gastos</TabsTrigger>
        </TabsList>

        <TabsContent value="discount">
          <DescuentosForm />
        </TabsContent>

        <TabsContent value="expense">
          <GastosForm />
        </TabsContent>
      </Tabs>

      {/* TODO: Al enviar solicitud, agrupa todos los registros filtrados, suma
      todos los valores y genera un registro de solicitud. (total y estado
      (pending default))  */}

      {/* TODO: Preguntar si esta seguro de enviar la solicitud.  */}

      {/* TODO: Agregar notificaciones: Si llega solicitud, que
      aparezca un numero junto al nombre del modulo  */}
    </div>
  );
};

export default RegistroPage;
