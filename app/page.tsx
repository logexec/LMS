import Image from "next/image";
import Card from "./components/Card";
import Link from "next/link";
import { TiUserOutline } from "react-icons/ti";
import Hr from "./components/Hr";

const subtractHours = (date: Date) => {
  const currentHour = date.getHours();
  if (currentHour < 8 || currentHour >= 16) {
    return 0; // Fuera del horario laboral (antes de las 8:00 o después de las 17:00)
  }

  const remainingHours = 16 - currentHour;

  if (remainingHours <= 0 || remainingHours > 9) {
    return 0; // Si la hora actual es exactamente 17:00 o más, mostrar 0
  }
  return remainingHours;
};

const subtractMinutes = (date: Date) => {
  const currentHour = date.getHours();
  const currentMinute = date.getMinutes();

  // Si estamos fuera del horario laboral, devuelve a 0 minutos
  if (currentHour < 8 || currentHour >= 17) {
    return 0;
  }

  const remainingMinutes = 60 - currentMinute;
  const remainingHours = 17 - currentHour;

  if (remainingHours === 0 && currentMinute >= 59) {
    return 0;
  }

  if (remainingHours === 0 && currentMinute === 0) {
    return 0;
  }

  return remainingMinutes;
};

const isShiftOver =
  subtractHours(new Date()) === 0 && subtractMinutes(new Date()) === 0;

const Home = () => {
  return (
    <div className="grid grid-rows-2 items-center">
      <section className="grid grid-cols-3 gap-5 justify-evenly w-full">
        <Card>
          <Link href="/usuarios" className="block px-3">
            <h3 className="text-slate-600 font-semibold text-xl">
              Usuarios de LMS
            </h3>
            <Hr variant="red" />
            <div className="flex gap-3 mt-5 items-center">
              <div className="rounded-full bg-gray-100 object-contain border border-slate-400">
                <TiUserOutline size={45} className="text-slate-400" />
              </div>
              <span className="text-3xl font-semibold text-slate-700 ml-5">
                15
              </span>
            </div>
            <p className="text-slate-400 text-sm font-normal mt-4">
              Haz clic para administrar
            </p>
          </Link>
        </Card>

        <Card>
          <Link href="/usuarios" className="block px-3">
            <h3 className="text-slate-600 font-semibold text-xl">
              Personal de Logex
            </h3>
            <Hr />
            <div className="flex flex-row gap-3 mt-5 items-center justify-evenly">
              <div className="rounded-full bg-gray-100 object-contain border border-slate-400">
                <TiUserOutline size={45} className="text-slate-400" />
              </div>
              <span className="text-3xl font-semibold text-slate-700">
                5516
              </span>
            </div>
            <p className="text-slate-400 text-sm font-normal mt-4">
              Haz clic para ver el personal
            </p>
          </Link>
        </Card>

        <Card>
          <Link href="/solicitudes" className="block mx-5">
            <h3 className="text-slate-600 font-semibold text-xl">
              Solicitudes Pendientes
            </h3>
            <Hr />
            <div className="flex flex-row gap-3 mt-5 items-center justify-evenly">
              <div className="rounded-full bg-gray-100 object-contain border border-slate-400">
                <TiUserOutline size={45} className="text-slate-400" />
              </div>
              <span className="text-3xl font-semibold text-slate-700">271</span>
            </div>
            <p className="text-slate-400 text-sm font-normal mt-4">
              Haz clic para gestionar
            </p>
          </Link>
        </Card>
      </section>

      <section className="mx-auto mt-24">
        <p className="text-lg">
          Bienvenido a{" "}
          <dfn
            title="Logex Management System"
            className="text-slate-950 underline text-base cursor-default"
          >
            LMS
          </dfn>
          , tu sistema amigable de gestión de{" "}
          <span className="text-[#e53430] font-extrabold tracking-normal text-lg italic">
            Log
          </span>
          <span className="text-[#5c5d5e] font-extrabold tracking-normal text-lg italic">
            eX
          </span>
        </p>
        <Image
          src="/images/logex_logo.png"
          alt="LogeX logo"
          width={180}
          height={38}
          priority
        />
        <p>
          {isShiftOver ? (
            <span>
              ¡Lo lograste! Sobreviviste a otro día en el trabajo, ¡La jornada
              de hoy ha terminado! <span className="text-xl">🍻</span>🤣
            </span>
          ) : (
            <>
              {subtractHours(new Date(Date.now())) !== 1 ? "Quedan" : "Queda"}{" "}
              {subtractHours(new Date(Date.now()))}{" "}
              {subtractHours(new Date(Date.now())) !== 1 ? "horas" : "hora"} y{" "}
              {subtractMinutes(new Date(Date.now()))} minutos para que se
              termine la jornada, ¡&Aacute;nimo!{" "}
              <span className="text-3xl">🙌🏻</span>
            </>
          )}
        </p>
      </section>
    </div>
  );
};

export default Home;
