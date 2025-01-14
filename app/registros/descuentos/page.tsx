import React from "react";

const page = () => {
  return (
    <div className="grid grid-rows-[auto_1fr] w-full h-full">
      <div className="flex flex-row justify-between px-5 items-center">
        <h1 className="title">Descuentos</h1>
      </div>
      <section className="w-full row-start-2 py-4 px-2">
        tabla de descuentos
      </section>
    </div>
  );
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
