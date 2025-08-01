"use client";

import Link from "next/link";
import "./maintenance.css";
import { useEffect, useState } from "react";
import { CircleAlert, TriangleAlert } from "lucide-react";
import api from "@/services/axios";
import { useRouter } from "next/navigation";

const MaintenancePage = () => {
  const [attempts, setAttempts] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const router = useRouter();
  
  useEffect(() => {
    const returnToMainPage = async () => {
      try {
        const response = await api.get(
          `${process.env.NEXT_PUBLIC_API_URL}/serverstatus`
        );

        if (response.status === 503) {
          const data = response.data;
          setStatusMessage(data.responseText);
          setAttempts((prev) => prev + 1);
        } else if (response.status === 200) {
          router.push("/registros/nuevo");
        }
      } catch (error) {
        console.error(error);
        setStatusMessage("Error al conectar con el servidor");
      }
    };

    const timeout = setTimeout(returnToMainPage, 20000);
    return () => {
      clearTimeout(timeout);
    };
  }, [attempts, router]);

  return (
    <div className="maintenance_wrapper">
      <div className="maintenance">
        <div className="maintenance_contain">
          <h1 className="pp-infobox-title-prefix">
            {statusMessage && statusMessage}
          </h1>

          <svg
            width="234px"
            height="234px"
            viewBox="-210 -465 234 234"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
          >
            <desc>Created with Sketch.</desc>
            <defs></defs>
            <circle
              id="Oval-2"
              stroke="none"
              fill="#FBFBFB"
              fillRule="evenodd"
              cx="-93"
              cy="-348"
              r="117"
            ></circle>
            <g
              id="horizon"
              stroke="none"
              strokeWidth="1"
              fill="none"
              fillRule="evenodd"
              transform="translate(-176.000000, -304.000000)"
              opacity="0.300000012"
            >
              <rect
                id="Rectangle-2"
                fill="#6F6F68"
                x="81"
                y="0"
                width="43"
                height="3"
                rx="1.5"
              ></rect>
              <rect
                id="Rectangle-2-Copy-3"
                fill="#6F6F68"
                x="0"
                y="0"
                width="74"
                height="3"
                rx="1.5"
              ></rect>
              <rect
                id="Rectangle-2-Copy"
                fill="#6F6F68"
                x="126"
                y="0"
                width="19"
                height="3"
                rx="1.5"
              ></rect>
              <rect
                id="Rectangle-2-Copy-2"
                fill="#6F6F68"
                x="149"
                y="0"
                width="7"
                height="3"
                rx="1.5"
              ></rect>
            </g>
            <g
              id="Bricks"
              opacity="0.200000003"
              stroke="none"
              strokeWidth="1"
              fill="none"
              fillRule="evenodd"
              transform="translate(-175.000000, -342.000000) scale(1, -1) translate(175.000000, 342.000000) translate(-209.000000, -355.000000)"
            >
              <path
                d="M40,14 L40,24 L66,24 L66,14 L40,14 Z M68,12 L68,26 L38,26 L38,12 L68,12 Z"
                id="Rectangle-Copy"
                fill="#8B8B8B"
                fillRule="nonzero"
              ></path>
              <path
                d="M12,14 L12,24 L38,24 L38,14 L12,14 Z M40,12 L40,26 L10,26 L10,12 L40,12 Z"
                id="Rectangle-Copy-6"
                fill="#8B8B8B"
                fillRule="nonzero"
              ></path>
              <polygon
                id="Rectangle-Copy-2"
                fill="#8B8B8B"
                fillRule="nonzero"
                points="47 0 47 14 18 14 18 0"
              ></polygon>
              <polygon
                id="Path"
                fill="#C4C4C4"
                points="20 12 45 12 45 2 20 2"
              ></polygon>
              <path
                d="M1,25 L14.5,25"
                id="Line"
                stroke="#8B8B8B"
                strokeWidth="2"
                stroke-linecap="square"
                transform="translate(7.500000, 25.000000) scale(1, -1) translate(-7.500000, -25.000000) "
              ></path>
              <path
                d="M13,1 L18,1"
                id="Line-Copy-3"
                stroke="#8B8B8B"
                strokeWidth="2"
                stroke-linecap="square"
                transform="translate(15.500000, 1.000000) scale(1, -1) translate(-15.500000, -1.000000) "
              ></path>
            </g>
            <g
              id="Bricks-2"
              opacity="0.200000003"
              stroke="none"
              strokeWidth="1"
              fill="none"
              fillRule="evenodd"
              transform="translate(-57.000000, -415.000000)"
            >
              <g id="Group-3">
                <path
                  d="M30,14 L30,24 L56,24 L56,14 L30,14 Z M58,12 L58,26 L28,26 L28,12 L58,12 Z"
                  id="Rectangle-Copy"
                  fill="#8B8B8B"
                  fillRule="nonzero"
                ></path>
                <path
                  d="M2,14 L2,24 L28,24 L28,14 L2,14 Z M30,12 L30,26 L0,26 L0,12 L30,12 Z"
                  id="Rectangle-Copy-6"
                  fill="#8B8B8B"
                  fillRule="nonzero"
                ></path>
                <polygon
                  id="Rectangle-Copy-2"
                  fill="#8B8B8B"
                  fillRule="nonzero"
                  points="37 0 37 14 8 14 8 0"
                ></polygon>
                <polygon
                  id="Path"
                  fill="#C4C4C4"
                  points="10 12 35 12 35 2 10 2"
                ></polygon>
              </g>
              <path
                d="M38,1 L43,1"
                id="Line-Copy"
                stroke="#8B8B8B"
                strokeWidth="2"
                stroke-linecap="square"
                transform="translate(40.500000, 1.000000) scale(1, -1) translate(-40.500000, -1.000000) "
              ></path>
              <path
                d="M47,1 L52,1"
                id="Line-Copy-2"
                stroke="#8B8B8B"
                strokeWidth="2"
                stroke-linecap="square"
                transform="translate(49.500000, 1.000000) scale(1, -1) translate(-49.500000, -1.000000) "
              ></path>
            </g>
            <g
              id="fence"
              stroke="none"
              strokeWidth="1"
              fill="none"
              fillRule="evenodd"
              transform="translate(-147.000000, -404.000000)"
            >
              <g
                id="poles"
                transform="translate(12.000000, 38.000000)"
                fillRule="nonzero"
                fill="#6F6F68"
              >
                <rect
                  id="Rectangle-path"
                  x="0"
                  y="0"
                  width="10"
                  height="71.6269377"
                  rx="3"
                ></rect>
                <rect
                  id="Rectangle-path"
                  x="69"
                  y="0"
                  width="10"
                  height="71.6269377"
                  rx="3"
                ></rect>
              </g>
              <g id="segment-2" transform="translate(0.000000, 17.000000)">
                <path
                  d="M0,6.8128862 C0,3.49708416 2.68975003,0.804549772 5.99860389,0.804549772 L100.001396,0.804549772 C103.318818,0.804549772 106,3.48618161 106,6.8128862 L106,23.7591763 C106,27.0749784 103.31025,29.7675128 100.001396,29.7675128 L5.99860389,29.7675128 C2.68118237,29.7675128 0,27.0858809 0,23.7591763 L0,6.8128862 Z"
                  id="Rectangle-path"
                  fill="#6F6F68"
                  fillRule="nonzero"
                ></path>
                <path
                  d="M2,6.8128862 L2,23.7591763 C2,25.9813865 3.78582692,27.7675128 5.99860389,27.7675128 L100.001396,27.7675128 C102.205217,27.7675128 104,25.9708718 104,23.7591763 L104,6.8128862 C104,4.59067607 102.214173,2.80454977 100.001396,2.80454977 L5.99860389,2.80454977 C3.79478302,2.80454977 2,4.6011907 2,6.8128862 Z"
                  id="Path"
                  fill="#FFED00"
                ></path>
                <path
                  d="M85.8466051,1.80454977 L56.8376549,1.80454977 L82.8376549,28.7675127 L100.001396,28.7675127 C102.755457,28.7675127 105,26.4471073 105,23.5847421 L105,21.6673296 L85.8466051,1.80454977 L85.8466051,1.80454977 Z M25.7249566,1.80454977 L5.99860389,1.80454977 C4.17375532,1.80454977 2.5726066,2.8233066 1.69989566,4.34345103 L25.2516694,28.7675127 L51.7249566,28.7675127 L25.7249566,1.80454977 L25.7249566,1.80454977 Z"
                  id="path-3"
                  fill="#79796B"
                  fillRule="nonzero"
                ></path>
              </g>
              <g id="segment-1" transform="translate(0.000000, 57.000000)">
                <path
                  d="M0,6.8128862 C0,3.49708416 2.68975003,0.804549772 5.99860389,0.804549772 L100.001396,0.804549772 C103.318818,0.804549772 106,3.48618161 106,6.8128862 L106,23.7591763 C106,27.0749784 103.31025,29.7675128 100.001396,29.7675128 L5.99860389,29.7675128 C2.68118237,29.7675128 0,27.0858809 0,23.7591763 L0,6.8128862 Z"
                  id="Rectangle-path"
                  fill="#6F6F68"
                  fillRule="nonzero"
                ></path>
                <path
                  d="M2,6.8128862 L2,23.7591763 C2,25.9813865 3.78582692,27.7675128 5.99860389,27.7675128 L100.001396,27.7675128 C102.205217,27.7675128 104,25.9708718 104,23.7591763 L104,6.8128862 C104,4.59067607 102.214173,2.80454977 100.001396,2.80454977 L5.99860389,2.80454977 C3.79478302,2.80454977 2,4.6011907 2,6.8128862 Z"
                  id="Path"
                  fill="#FFED00"
                ></path>
                <path
                  d="M85.8466051,1.80454977 L56.8376549,1.80454977 L82.8376549,28.7675127 L100.001396,28.7675127 C102.755457,28.7675127 105,26.4471073 105,23.5847421 L105,21.6673296 L85.8466051,1.80454977 L85.8466051,1.80454977 Z M25.7249566,1.80454977 L5.99860389,1.80454977 C4.17375532,1.80454977 2.5726066,2.8233066 1.69989566,4.34345103 L25.2516694,28.7675127 L51.7249566,28.7675127 L25.7249566,1.80454977 L25.7249566,1.80454977 Z"
                  id="path-3"
                  fill="#79796B"
                  fillRule="nonzero"
                ></path>
              </g>
              <g id="Lights" transform="translate(6.000000, 0.000000)">
                <path
                  d="M0.00164046446,8.50455148 C0.000548334449,8.56302813 0,8.62162911 0,8.68035017 C0,14.1174425 4.70101013,18.5250767 10.5,18.5250767 C16.2989899,18.5250767 21,14.1174425 21,8.68035017 C21,8.62162911 20.9994517,8.56302813 20.9983595,8.50455148 C20.9882916,9.04362508 20.9320104,9.57213247 20.8330718,10.0867397 C19.9490021,5.48844839 15.6590024,2 10.5,2 C5.34099762,2 1.05099785,5.48844839 0.166928221,10.0867397 C0.0679895985,9.57213247 0.0117083886,9.04362508 0.00164046446,8.50455148 Z"
                  id="light1"
                  fill="#FF9813"
                ></path>
                <path
                  d="M0.166928221,11.6027134 C0.0572571141,11.0322836 0,10.4447744 0,9.84472656 C0,4.40763422 4.70101013,0 10.5,0 C16.2989899,0 21,4.40763422 21,9.84472656 C21,10.4447744 20.9427429,11.0322836 20.8330718,11.6027134 C19.9490021,7.00442216 15.6590024,3.51597377 10.5,3.51597377 C5.34099762,3.51597377 1.05099785,7.00442216 0.166928221,11.6027134 Z"
                  id="Combined-Shape-Copy"
                  fill="#75756B"
                ></path>
                <path
                  d="M69.0016405,7.50455148 C69.0005483,7.56302813 69,7.62162911 69,7.68035017 C69,13.1174425 73.7010101,17.5250767 79.5,17.5250767 C85.2989899,17.5250767 90,13.1174425 90,7.68035017 C90,7.62162911 89.9994517,7.56302813 89.9983595,7.50455148 C89.9882916,8.04362508 89.9320104,8.57213247 89.8330718,9.08673968 C88.9490021,4.48844839 84.6590024,1 79.5,1 C74.3409976,1 70.0509979,4.48844839 69.1669282,9.08673968 C69.0679896,8.57213247 69.0117084,8.04362508 69.0016405,7.50455148 Z"
                  id="light2"
                  fill="#FF9813"
                ></path>
                <path
                  d="M69.1669282,11.6027134 C69.0572571,11.0322836 69,10.4447744 69,9.84472656 C69,4.40763422 73.7010101,0 79.5,0 C85.2989899,0 90,4.40763422 90,9.84472656 C90,10.4447744 89.9427429,11.0322836 89.8330718,11.6027134 C88.9490021,7.00442216 84.6590024,3.51597377 79.5,3.51597377 C74.3409976,3.51597377 70.0509979,7.00442216 69.1669282,11.6027134 Z"
                  id="Combined-Shape-Copy-2"
                  fill="#75756B"
                ></path>
              </g>
            </g>
          </svg>

          {statusMessage !== "Error al conectar con el servidor" ? (
            <>
              <div className="rounded-md border border-amber-500/50 px-4 py-3 text-amber-600">
                <p className="text-lg font-serif">
                  <TriangleAlert
                    className="me-3 -mt-0.5 inline-flex opacity-60"
                    size={16}
                    aria-hidden="true"
                  />
                  El sistema LMS estará disponible de nuevo en breve. La página
                  se actualizará automáticamente cuando esté disponible
                </p>
              </div>
              <Link
                href={"/registros/nuevo"}
                className="text-blue-600 underline underline-offset-[5px] font-sans text-lg font-semibold mt-3 mb-6"
              >
                O bien, intenta regresar a la página principal manualmente
              </Link>

              <div className="pp-infobox-description">
                <p>
                  Nuestros desarrolladores están trabajando duro para actualizar
                  el sistema.
                </p>
                <p>
                  Por favor, espera unos minutos mientras hacemos las
                  correcciones.
                </p>
              </div>
            </>
          ) : (
            <div className="rounded-md border border-red-500/50 px-4 py-3 text-red-600">
              <p className="text-sm">
                <CircleAlert
                  className="me-3 -mt-0.5 inline-flex opacity-60"
                  size={16}
                  aria-hidden="true"
                />
                Por favor, contacta al departamento de sistemas, ocurrió un
                error en el servidor
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MaintenancePage;
