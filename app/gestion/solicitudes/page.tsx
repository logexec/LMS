"use client";

import { RequestsTable } from "@/app/registros/components/table/RequestsTable";
import { motion } from "motion/react";
import React from "react";

const page = () => {
  return (
    <motion.div
      initial={{ scale: 0.75 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0.75 }}
      transition={{ duration: 0.45 }}
      className="w-full h-full"
    >
      <RequestsTable mode="requests" type="discount" />
    </motion.div>
  );
  //TODO: Llega la informacion de lo que se ingresa en descuentos: Unicamente se aprueba o se elimina. No se puede modificar.
  //TODO: NO PERMITE DESCONTAR MESES PASADOS.
  //TODO: EN DETALLE MOSTRAR EL DESCUENTO
  //TODO: Revisar es pagar  (cambiar)
  //TODO: Rechazar: Cambia estado de descuento.
  //TODO: Mostrar unicamente si es que es que es pendiente
  //TODO: Aprueba: Cambia status.

  //TODO: WEBsockets para notificaciones cada que se ingresa una solicitud.
};

export default page;
//TODO: Unificar y seleccionar registro si es que es gasto o descuento
//TODO: Si es gasto, ID es G-XXX si es descuento, ID es D-XXX

//TODO: Cuentas: Habilitar separadamente para gastos y descuentos
