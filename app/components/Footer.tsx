import React from "react";

const Footer: React.FC = () => {
  const months = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];
  const days = [
    "Domingo",
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
  ];

  return (
    <footer className="row-start-3 flex gap-6 p-2 flex-wrap items-center justify-evenly w-full bg-black text-white pointer-events-none select-none">
      <div className="flex items-center flex-wrap max-w-72 text-sm">
        <p className="font-light">
          LogeX &copy; {new Date().getFullYear()}. Todos los derechos
          reservados.
        </p>
      </div>
      <div className="flex items-center flex-wrap max-w-72 text-sm">
        <p className="font-light">
          {`${days[new Date().getDay()]}, ${new Date().getDate()} de ${
            months[new Date().getMonth()]
          } del ${new Date().getFullYear()}`}
        </p>
      </div>
    </footer>
  );
};

export default Footer;
