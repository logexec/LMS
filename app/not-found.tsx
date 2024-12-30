"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";
import LogoSM from "@/public/images/logo_compact.png";

const NotFoundComponent = () => {
  const router = useRouter();
  return (
    <div className="fixed top-0 left-0 h-screen w-screen bg-black">
      <svg
        className="absolute top-[50%] left-[50%] -mt-[250px] -ml-[400px]"
        width="380px"
        height="500px"
        viewBox="0 0 837 1045"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g
          id="Page-1"
          stroke="none"
          strokeWidth="1"
          fill="none"
          fillRule="evenodd"
        >
          <path
            d="M353,9 L626.664028,170 L626.664028,487 L353,642 L79.3359724,487 L79.3359724,170 L353,9 Z"
            id="Polygon-1"
            stroke="#e53430" // Color de la linea (principal)
            strokeWidth="6"
          ></path>
          <path
            d="M78.5,529 L147,569.186414 L147,648.311216 L78.5,687 L10,648.311216 L10,569.186414 L78.5,529 Z"
            id="Polygon-2"
            stroke="#5c5e5d" // Color de la línea (Secundario)
            strokeWidth="6"
          ></path>
          <path
            d="M773,186 L827,217.538705 L827,279.636651 L773,310 L719,279.636651 L719,217.538705 L773,186 Z"
            id="Polygon-3"
            stroke="#b91c1c" // Principal mas oscuro
            strokeWidth="6"
          ></path>
          <path
            d="M639,529 L773,607.846761 L773,763.091627 L639,839 L505,763.091627 L505,607.846761 L639,529 Z"
            id="Polygon-4"
            stroke="#2c2c2c"
            strokeWidth="6"
          ></path>
          <path
            d="M281,801 L383,861.025276 L383,979.21169 L281,1037 L179,979.21169 L179,861.025276 L281,801 Z"
            id="Polygon-5"
            stroke="#ff1a1a"
            strokeWidth="6"
          ></path>
        </g>
      </svg>
      <div className="h-52 w-80 absolute top-[50%] left-[50%] -mt-60 md:-mt-[100px] -ml-48 sm:text-center md:ml-[50px] text-white font-light">
        <h1 className="text-8xl leading-[46px] mb-10 text-secondary font-bold">
          4<span className="text-[#b91c1c]">0</span>4
        </h1>
        <Image
          src={LogoSM.src}
          width={45}
          height={45}
          alt="LogeX logo"
          className="absolute right-4 top-7"
        />
        <p className="text-lg text-slate-200">Página no encontrada</p>
        <div>
          <div className="mt-10">
            <button
              onClick={() => router.back()}
              className="py-2 px-6 bg-[#b91c1c] text-white rounded text-lg transition-all duration-300 cursor-pointer mr-2 hover:bg-primary font-normal"
            >
              Regresar
            </button>
            <button
              onClick={() => router.push("/")}
              className="border rounded border-primary px-6 py-2 text-lg hover:bg-slate-800 hover:border-[#b91c1c] transition-all duration-300 font-normal"
            >
              Ir al inicio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundComponent;
