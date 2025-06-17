"use client";

import { XmlDropzone } from "@/app/components/facturas/XmlDropzone";
import { useState } from "react";
import { ParsedFactura } from "@/types/factura";
import { enviarFacturas } from "./actions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { XmlFacturaTable } from "@/app/components/facturas/XmlFacturarTable";

export default function Client() {
  const [facturas, setFacturas] = useState<ParsedFactura[]>([]);

  return (
    <div className="space-y-4">
      <XmlDropzone onChange={(facturas) => setFacturas(facturas)} />

      {facturas.length > 0 && (
        <>
          <XmlFacturaTable data={facturas} />
          <Button
            onClick={async () => {
              const toastId = toast.loading("Importando facturas...");
              try {
                const result = await enviarFacturas(
                  facturas.map((f) => f.rawFile)
                );
                toast.dismiss(toastId);

                if (result.errors.length) {
                  result.errors.forEach((err) => {
                    const nombre = err.file
                      .replace(/^.*Factura-/, "")
                      .replace(/\.\w+$/, "");
                    toast.warning(
                      `Hay errores en la factura ${nombre}:\n${err.error}`,
                      { duration: 8000 }
                    );
                  });
                }

                if (result.imported.length > 0) {
                  toast.success(
                    `✓ ${result.imported.length} facturas importadas correctamente`
                  );
                }
              } catch (err) {
                toast.error("No se pudieron importar las facturas.");
                console.error(err);
              }
            }}
            className="mt-4"
          >
            Guardar facturas en el sistema
          </Button>
        </>
      )}
    </div>
  );
}
