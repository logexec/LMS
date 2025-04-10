"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  // Puedes hacer parsing del mensaje para distinguir tipos de error
  const is403 = error.message.includes("403");

  return (
    <html>
      <body className="flex flex-col items-center justify-center h-screen text-center">
        {is403 ? (
          <>
            <h2 className="text-4xl font-bold text-red-600">
              403 - Acceso denegado
            </h2>
            <p className="mt-4 text-lg">
              No tienes permisos para acceder a esta página.
            </p>
          </>
        ) : (
          <>
            <h2 className="text-4xl font-bold text-red-600">
              Ha ocurrido un error
            </h2>
            <p className="mt-4 text-lg">{error.message}</p>
          </>
        )}
        <button
          onClick={() => reset()}
          className="mt-6 px-4 py-2 bg-gray-800 text-white rounded"
        >
          Reintentar
        </button>
      </body>
    </html>
  );
}
