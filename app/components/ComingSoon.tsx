import React from "react";
import "./coming-soon.component.css";
import Image from "next/image";
import logo from "@/public/images/logex_logo.png";

const ComingSoon: React.FC = () => {
  return (
    <>
      <div className="p-0 m-0">
        <div className="truck">
          <div className="truck-mirror"></div>
          <div className="truck-mirror-front"></div>
          <div className="truck-top"></div>
          <div className="truck-middle">
            <div className="truck-glass-front"></div>
            <div className="truck-glass"></div>
            <div className="truck-glass-back"></div>
            <div className="truck-container object-contain relative">
              <Image
                width={512}
                height={512}
                src={logo.src}
                alt="LogeX Logo"
                className="p-1 mt-10 ml-10"
              />
            </div>
            <div className="truck-container-up"></div>
            <div className="truck-container-gift">
              <span className="absolute flex items-center justify-center text-center mx-auto top-10 left-[.85rem]">
                Sorpresa
              </span>
            </div>
          </div>
          <div className="truck-middle-bottom">
            <div className="light-front">
              <div className="light-blue-front"></div>
              <div className="light-orange"></div>
            </div>
            <div className="light-center">
              <div className="tank"></div>
              <div className="light-red-top"></div>
            </div>
          </div>
          <div className="truck-bottom">
            <div className="tyre movetyre-left"></div>
            <div className="tyre movetyre"></div>

            <div className="tyre"></div>
            <div className="tyre movetyre"></div>
            <div className="tyre"></div>
          </div>
        </div>
        <div className="road"></div>
      </div>
      <div className="flex w-full fixed bottom-64 items-center justify-start">
        <h3 className="text-red-600 text-6xl font-bold ml-[26rem]">
          Página en construcción.{" "}
          <span className="text-3xl text-slate-600 block">
            Pronto podrás disfrutar de más beneficios
          </span>
          <span className="text-slate-400 text-base block">
            Gracias por tu paciencia. :)
          </span>
        </h3>
      </div>
    </>
  );
};

export default ComingSoon;
