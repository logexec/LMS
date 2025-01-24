"use server";
import Image from "next/image";
import Card from "./components/Card";
import Link from "next/link";
import Hr from "./components/Hr";
import { Inbox, Users, UsersRound } from "lucide-react";
import User from "./components/User";
import Personnel from "./components/Personnel";
import {
  PendingRequests,
  ApprovedRequests,
  RejectedRequests,
} from "./components/PendingRequests";
import Transport from "./components/Transport";

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
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 justify-evenly w-full">
        <Card>
          <Link href="/gestion/solicitudes" className="block mx-5">
            <h3 className="text-slate-500 font-semibold text-lg">
              Solicitudes
            </h3>
            <p className="text-slate-400 text-[0.65rem] font-normal">
              (Los números se actualizan mensualmente)
            </p>
            <Hr variant="red" />
            <div className="flex flex-col gap-3 mt-5 items-center">
              <div className="rounded-full bg-gray-100/70 object-contain border border-slate-400 p-[5px] overflow-hidden">
                <Inbox size={35} className="text-slate-400" />
              </div>
              <div className="flex flex-row gap-5 items-center flex-wrap justify-evenly">
                <span className="text-3xl font-semibold text-slate-800">
                  <PendingRequests />
                </span>
                <span className="text-3xl font-semibold text-emerald-600">
                  <ApprovedRequests />
                </span>
                <span className="text-3xl font-semibold text-red-600">
                  <RejectedRequests />
                </span>
              </div>
            </div>
            <p className="text-slate-400 text-sm font-normal mt-4">
              Haz clic para gestionar
            </p>
          </Link>
        </Card>
        <Card>
          <Link href="/usuarios" className="block px-3">
            <h3 className="text-slate-500 font-semibold text-lg">
              Usuarios de LMS
            </h3>
            <Hr variant="red" />
            <div className="flex gap-3 mt-5 items-center">
              <div className="rounded-full bg-gray-100/70 object-contain border border-slate-400 p-[5px] overflow-hidden">
                <UsersRound size={35} className="text-slate-400" />
              </div>
              <span className="text-3xl font-semibold text-slate-800 ml-5">
                <User />
                <span className="text-sm text-slate-400 font-normal ml-3">
                  Usuarios
                </span>
              </span>
            </div>
            <p className="text-slate-400 text-sm font-normal mt-4">
              Haz clic para administrar
            </p>
          </Link>
        </Card>
        <Card>
          <div className="block px-3">
            {/* Link */}
            <h3 className="text-slate-500 font-semibold text-lg">
              Personal de Logex
            </h3>
            <Hr variant="red" />
            <div className="flex gap-3 mt-5 items-center">
              <div className="rounded-full bg-gray-100/70 object-contain border border-slate-400 p-[5px] overflow-hidden">
                <Users size={35} className="text-slate-400" />
              </div>
              <span className="text-3xl font-semibold text-slate-800">
                <Personnel />
                <span className="text-sm text-slate-400 font-normal ml-3">
                  Empleados
                </span>
              </span>
            </div>
            {/* <p className="text-slate-400 text-sm font-normal mt-4 italic">
              (Información visual únicamente)
            </p> */}
          </div>
        </Card>

        <Card>
          <div className="block px-3">
            <h3 className="text-slate-500 font-semibold text-lg">
              Camiones activos de Logex
            </h3>
            <Hr variant="red" />
            <div className="flex gap-3 mt-5 items-center">
              <div className="rounded-full bg-gray-100/70 object-contain border border-slate-400 p-[5px] overflow-hidden">
                <Users size={35} className="text-slate-400" />
              </div>
              <span className="text-3xl font-semibold text-slate-800">
                <Transport />
                <span className="text-sm text-slate-400 font-normal ml-3">
                  Camiones
                </span>
              </span>
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
