import React, { ChangeEvent } from "react";
import { Sheet } from "lucide-react";
import File from "../File";
import Loader from "@/app/Loader";

interface ExcelUploadSectionProps {
  onFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onDownload: () => void;
  isLoading: boolean;
  isSubmitting: boolean;
}

const ExcelUpload: React.FC<ExcelUploadSectionProps> = ({
  onFileChange,
  onSubmit,
  onDownload,
  isLoading,
  isSubmitting,
}) => {
  return (
    <section className="flex flex-row">
      <div className="w-1/4">
        <h3 className="text-slate-700 text-sm font-bold">
          ¿Tienes información en Excel?
        </h3>
        <p className="text-sm text-slate-500">
          Por favor, carga tu archivo .xlsx, .xls o .csv.
        </p>
      </div>
      <div className="w-3/4 items-center">
        <div className="grid grid-cols-[auto_auto] w-full items-center gap-2">
          <form className="max-w-sm" onSubmit={onSubmit}>
            <File
              name="adjunto"
              label="Archivo"
              accept=".xlsx, .xls, .csv"
              variant="green"
              onChange={onFileChange}
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 bg-emerald-600 hover:bg-emerald-700 text-white py-1 px-4 rounded font-semibold shadow-md hover:shadow-none hover:scale-[.98] transition-all duration-300 disabled:opacity-50 w-full"
            >
              {isSubmitting ? "Procesando..." : "Registrar Descuento"}
            </button>
          </form>
          <div className="w-full flex flex-col">
            <p className="text-slate-500 font-semibold text-sm">
              ¿Necesitas la plantilla actualizada?
            </p>
            <button
              onClick={onDownload}
              disabled={isLoading}
              className={`w-max bg-emerald-600 text-white py-1 px-4 border rounded font-semibold shadow-md flex items-center transition-all duration-300 ${
                isLoading
                  ? "!bg-white cursor-not-allowed hover:scale-100 border-slate-100"
                  : "hover:bg-emerald-700 hover:scale-[.98] border-slate-600"
              }`}
            >
              {isLoading ? (
                <Loader text="Descargando..." fullScreen={false} />
              ) : (
                <>
                  <Sheet size={16} className="mr-2 inline" />
                  Descargar Plantilla
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExcelUpload;
