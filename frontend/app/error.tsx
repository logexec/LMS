"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
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
      <body className="block h-screen w-screen items-center justify-center text-center">
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
          <div className="bg-white dark:bg-slate-900 h-full w-full flex flex-col items-center justify-center mx-auto">
            <AlertTriangle className="mx-auto text-amber-500 size-28" />
            <h2 className="text-4xl my-4 font-bold text-red-600">
              Se ha producido un error
            </h2>
            <p className="mt-8 text-lg">{error.message}</p>
          </div>
        )}
        <Button onClick={() => reset()} className="mt-6 text-xl">
          Reintentar
        </Button>
      </body>
    </html>
  );
}
