import React from "react";
import "./loader.component.css";
import Image from "next/image";

interface LoaderProps {
  fullScreen?: boolean;
}

const Loader: React.FC<LoaderProps> = ({ fullScreen }) => {
  return (
    <div
      className={`${
        fullScreen
          ? "min-h-screen min-w-screen w-screen h-screen bg-black/60 z-50 fixed top-0 left-0 flex flex-col items-center justify-center m-0 p-0"
          : "h-auto flex flex-col items-center justify-center"
      }`}
    >
      {fullScreen && (
        <>
          <div className="spinner" />
          <Image
            src="/images/logo_compact.png"
            alt="Loader"
            width={45}
            height={45}
            priority
            className="logo"
          />
        </>
      )}
      <p className="text">
        {fullScreen ? (
          "Cargando..."
        ) : (
          <span className="text-fade">Recibiendo información...</span>
        )}
      </p>
    </div>
  );
};

export default Loader;
