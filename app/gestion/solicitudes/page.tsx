import ComingSoon from "@/app/components/ComingSoon";
import React from "react";

const page = () => {
  return <ComingSoon />;
  //TODO: Llega la informacion de lo que se ingresa en descuentos: Unicamente se aprueba o se elimina. No se puede modificar.
  //TODO: NO PERMITE DESCONTAR MESES PASADOS.
  //TODO: EN DETALLE MOSTRAR EL DESCUENTO
  //TODO: Revisar es aprobar  (cambiar)
  //TODO: Rechazar: Cambia estado de descuento. Mostrar unicamente si es que es que es pendiente
  //TODO: Aprueba: Cambia status.

  //TODO: WEBsockets para notificaciones cada que se ingresa una solicitud.
};

export default page;
//TODO: Unificar y seleccionar registro si es que es gasto o descuento
//TODO: Si es gasto, ID es G-XXX si es descuento, ID es D-XXX

//TODO: Cuentas: Habilitar separadamente para gastos y descuentos
