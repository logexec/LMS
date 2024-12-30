import Link from "next/link";
import React from "react";
import { IoLogInOutline } from "react-icons/io5";

const Navigation = () => {
  const user = {
    name: "Ricardo",
    lastName: "Estrella",
    role: ["admin", "superuser"],
  };
  const isAuthenticated: boolean = true;

  const formatMinutes = (minutes: number) => {
    if (minutes < 10) {
      return `0${minutes}`;
    }
    return minutes;
  };
  return (
    <nav className="row-start-1 flex gap-6 py-2 flex-wrap items-center justify-between px-5 w-full bg-black text-white">
      <div className="flex flex-row">
        <span className="text-normal">¡Bienvenido, &nbsp;</span>
        <span className="text-semibold">{user.name}!</span>
        <span>&nbsp;&nbsp;|&nbsp;&nbsp;</span>
        <p className="text-normal text-white font-base">
          {new Date().getHours()}{" "}
          <span className="animate-pulse duration-500 text-white">:</span>{" "}
          {formatMinutes(new Date().getMinutes())}
        </p>
      </div>

      {isAuthenticated && (
        <div className="flex items-center gap-2 text-white hover:text-red-600 transition-all duration-300">
          <Link href="/" className="flex items-center gap-2">
            <IoLogInOutline size={20} />
            <span>Salir</span>
          </Link>
        </div>
      )}
      {!isAuthenticated && (
        <div
          className={`flex items-center gap-2 text-white hover:text-red-600 transition-all duration-300`}
        >
          <Link href="/" className="flex items-center gap-2">
            <IoLogInOutline size={20} />
            <span>Identifícate</span>
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
