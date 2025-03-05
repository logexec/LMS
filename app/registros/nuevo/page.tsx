"use client";
import React, { useState } from "react";
import ModalStatus from "../../components/ModalStatus";
import "./registro.component.css";
import DescuentosForm from "../../components/ingresos/DescuentosForm";
import GastosForm from "../../components/ingresos/GastosForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import IngresosForm from "@/app/components/ingresos/IngresosForm";

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
          <TabsTrigger value="income">Ingresos Especiales</TabsTrigger>
        </TabsList>

        <TabsContent value="discount">
          <DescuentosForm />
        </TabsContent>

        <TabsContent value="expense">
          <GastosForm />
        </TabsContent>

        <TabsContent value="income">
          <IngresosForm />
        </TabsContent>
      </Tabs>
      {/* TODO: Agregar notificaciones  */}
    </div>
  );
};

export default RegistroPage;
