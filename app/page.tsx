"use server";
import Image from "next/image";
import Card from "./components/Card";
import Link from "next/link";
import Hr from "./components/Hr";
import User from "./components/User";
import Personnel from "./components/Personnel";
import Transport from "./components/Transport";
import {
  PendingRequests,
  ApprovedRequests,
  RejectedRequests,
} from "./components/Requests";

const subtractHours = (date: Date) => {
  const currentHour = date.getHours();
  if (currentHour < 8 || currentHour >= 16) {
    return 0;
  }
  const remainingHours = 16 - currentHour;
  if (remainingHours <= 0 || remainingHours > 9) {
    return 0;
  }
  return remainingHours;
};

const subtractMinutes = (date: Date) => {
  const currentHour = date.getHours();
  const currentMinute = date.getMinutes();

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

const Home = async () => {
  return (
    <div className="grid grid-rows-2 items-center">
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 justify-evenly w-full">
        <Card>
          <Link href="/gestion/solicitudes" className="block mx-5">
            <h3 className="text-slate-500 font-semibold text-base">
              Solicitudes
            </h3>
            <p className="text-slate-400 text-xs font-normal">
              (Los números se inicializan mensualmente)
            </p>
            <Hr variant="red" />
            <div className="flex flex-col md:flex-row gap-3 mt-5 items-center">
              <div className="flex flex-row gap-5 items-center flex-wrap justify-evenly">
                <span className="text-3xl font-semibold">
                  <PendingRequests />
                </span>
                <span className="text-3xl font-semibold">
                  <ApprovedRequests />
                </span>
                <span className="text-3xl font-semibold">
                  <RejectedRequests />
                </span>
              </div>
            </div>
          </Link>
        </Card>
        <Card>
          <Link href="/usuarios" className="block px-3">
            <h3 className="text-slate-500 font-semibold text-base">
              Usuarios de LMS
            </h3>
            <p className="opacity-0 text-xs font-normal">
              (Los números se actualizan diariamente)
            </p>
            <Hr variant="red" />
            <div className="flex gap-3 mt-5 items-center">
              <User />
            </div>
          </Link>
        </Card>
        <Card>
          <div className="block px-3">
            <h3 className="text-slate-500 font-semibold text-base">
              Personal activo de Logex
            </h3>
            <p className="opacity-0 text-xs font-normal">
              (Los números se actualizan diariamente)
            </p>
            <Hr variant="red" />
            <div className="flex gap-3 mt-5 items-center">
              <Personnel />
            </div>
          </div>
        </Card>

        <Card>
          <div className="block px-3">
            <h3 className="text-slate-500 font-semibold text-base">
              Camiones activos de Logex
            </h3>
            <p className="opacity-0 text-xs font-normal">
              (Los números se actualizan diariamente)
            </p>
            <Hr variant="red" />
            <div className="flex gap-3 mt-5 items-center">
              <Transport />
            </div>
            {/* <p className="text-slate-400 text-sm font-normal mt-4 italic">
              (Información visual únicamente)
            </p> */}
          </div>
        </Card>
      </section>

      <section className="mx-auto mt-24 flex flex-col text-center items-center justify-center">
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
