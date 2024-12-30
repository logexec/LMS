import Image from "next/image";

const Home = () => {
  const subtractHours = (date: Date) => {
    const currentHour = date.getHours();
    if (currentHour < 8 || currentHour >= 16) {
      return 0; // Fuera del horario laboral (antes de las 8:00 o después de las 17:00)
    }

    let remainingHours = 16 - currentHour;
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

    let remainingMinutes = 60 - currentMinute;
    let remainingHours = 17 - currentHour;

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

  return (
    <div className="flex items-center justify-center flex-col gap-4 w-full h-full">
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
            ¡Lo lograste! Sobreviviste a otro día en el trabajo, ¡La jornada de
            hoy ha terminado! <span className="text-xl">🍻</span>🤣
          </span>
        ) : (
          <>
            {subtractHours(new Date(Date.now())) !== 1 ? "Quedan" : "Queda"}{" "}
            {subtractHours(new Date(Date.now()))}{" "}
            {subtractHours(new Date(Date.now())) !== 1 ? "horas" : "hora"} y{" "}
            {subtractMinutes(new Date(Date.now()))} minutos para que se termine
            la jornada, ¡&Aacute;nimo! <span className="text-3xl">🙌🏻</span>
          </>
        )}
      </p>
    </div>
  );
};

export default Home;
