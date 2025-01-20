import React from "react";
import "./loader.component.css";
import Image from "next/image";

export default function loading() {
  return (
    <div
      className="min-h-screen min-w-screen w-screen h-screen bg-black/60 z-50 fixed top-0 left-0 flex flex-col items-center justify-center m-0 p-0"
    >
          <div className="spinner" />
          <Image
            src="/images/logo_compact.png"
            alt="Loader"
            width={45}
            height={45}
            priority
            className="logo"
          />
      <p className="text">
          CargandoING...
      </p>
    </div>
  );
};