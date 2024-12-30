import Image from "next/image";
import Link from "next/link";
import { IoLocationOutline } from "react-icons/io5";

const Footer = () => {
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

  const isAuthenticated: boolean = true;

  if (!isAuthenticated) {
    return (
      <footer className="row-start-3 flex gap-6 p-2 flex-wrap items-center justify-evenly w-full bg-black text-white">
        <Link href="/">
          <Image
            aria-hidden
            src="/images/logo_transparent.png"
            alt="LogeX logo"
            width={180}
            height={38}
          />
        </Link>
        <div className="flex items-center flex-wrap max-w-72 text-sm">
          <div className="flex flex-row gap-2">
            <IoLocationOutline size={20} />
            <div className="flex flex-col">
              <h2 className="font-semibold">Quito</h2>
              <p className="font-light">
                Av. República del Salvador E9-10 y Av. Shyris, Edif. Onix, PH.
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center flex-wrap max-w-72 text-sm">
          <div className="flex flex-row gap-2">
            <IoLocationOutline size={20} />
            <div className="flex flex-col">
              <h2 className="font-semibold">Guayaquil</h2>
              <p className="font-light">
                Av. Juan Tanca Marnego y Ma. Piedad Castillo de Levi.
              </p>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="row-start-3 flex gap-6 p-2 flex-wrap items-center justify-evenly w-full bg-black text-white">
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
