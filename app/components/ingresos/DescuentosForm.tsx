"use client";
import React, { useState, useEffect } from "react";
import { Sheet } from "lucide-react";
import Loader from "@/app/Loader";
import ModalStatus from "../ModalStatus";
import File from "../File";
import { Card } from "@/components/ui/card";
import {
  LoadingState,
  OptionsState,
  NormalRequestData,
  MassiveRequestData,
} from "@/utils/types";
import NormalDiscountForm from "./NormalDiscountForm";
import MassDiscountForm from "./MassDiscountForm";

const DescuentosForm = () => {
  const [loading, setLoading] = useState<LoadingState>({
    submit: false,
    projects: false,
    responsibles: false,
    transports: false,
    accounts: false,
    areas: false,
  });

  const [options, setOptions] = useState<OptionsState>({
    projects: [],
    responsibles: [],
    transports: [],
    accounts: [],
    areas: [],
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Fetch de datos iniciales
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading((prev) => ({ ...prev, projects: true, areas: true }));
      try {
        // Fetch proyectos
        const projectsRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/projects`,
          {
            credentials: "include",
          }
        );

        if (!projectsRes.ok) throw new Error("Error al cargar proyectos");

        const projectsData = await projectsRes.json();

        // Fetch áreas
        const areasRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/areas`,
          {
            credentials: "include",
          }
        );

        if (!areasRes.ok) throw new Error("Error al cargar áreas");

        const areasData = await areasRes.json();

        setOptions((prev) => ({
          ...prev,
          projects: projectsData.map((project: any) => ({
            label: project.name,
            value: project.name,
          })),
          areas: areasData.map((area: any) => ({
            label: area.name,
            value: area.id,
          })),
        }));
      } catch (error) {
        setError("Error al cargar datos iniciales");
      } finally {
        setLoading((prev) => ({ ...prev, projects: false, areas: false }));
      }
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const handleExcelUpload = async (file: File) => {
    setLoading((prev) => ({ ...prev, submit: true }));
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/upload-discounts`,
        {
          method: "POST",
          body: formData,
          credentials: "include",
        }
      );

      if (!response.ok) throw new Error("Error al procesar el archivo");

      setSuccess("Archivo procesado correctamente");
    } catch (error) {
      setError("Error al procesar el archivo");
    } finally {
      setLoading((prev) => ({ ...prev, submit: false }));
    }
  };

  const handleDownloadTemplate = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/download-excel-template`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!response.ok) throw new Error("Error al descargar la plantilla");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "Plantilla Descuentos Masivos | LogeX.xlsx";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setError("Error al descargar la plantilla");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleNormalSubmit = async (formData: FormData) => {
    setLoading((prev) => ({ ...prev, submit: true }));
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/requests`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || "Error al crear el descuento");
      }

      setSuccess("Descuento registrado con éxito");
    } catch (error) {
      console.error("Error details:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Error al procesar el descuento"
      );
    } finally {
      setLoading((prev) => ({ ...prev, submit: false }));
    }
  };

  const handleMassSubmit = async (data: MassiveRequestData) => {
    setLoading((prev) => ({ ...prev, submit: true }));
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/massive-requests`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(data),
        }
      );

      if (!response.ok)
        throw new Error("Error al crear los descuentos masivos");
      setSuccess("Descuentos masivos registrados con éxito");
    } catch (error) {
      setError("Error al procesar los descuentos masivos");
    } finally {
      setLoading((prev) => ({ ...prev, submit: false }));
    }
  };

  return (
    <>
      {error && <ModalStatus error text={error} />}
      {success && <ModalStatus success text={success} />}

      <section className="container pt-10">
        {/* Sección de carga de Excel */}
        <Card className="p-6 mb-8">
          <div className="flex w-full">
            <div className="w-1/4 mr-2">
              <h3 className="text-slate-700 text-sm font-bold">
                ¿Tienes información en Excel?
              </h3>
              <p className="text-sm text-slate-500">
                Por favor, carga tu archivo .xlsx, .xls o .csv.
              </p>
            </div>
            <div className="w-3/4 items-center ml-2">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 w-full items-center gap-2 lg:gap-16 xl:gap-24 3xl:gap-36">
                <form
                  className="max-w-md col-span-1 md:col-span-2"
                  onSubmit={(e) => e.preventDefault()}
                >
                  <File
                    name="adjunto"
                    label="Archivo"
                    accept=".xlsx, .xls, .csv"
                    variant="green"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      if (e.target.files?.[0]) {
                        handleExcelUpload(e.target.files[0]);
                      }
                    }}
                  />
                  <button
                    type="submit"
                    disabled={loading.submit}
                    className="mt-2 bg-emerald-600 hover:bg-emerald-700 text-white py-1 px-4 rounded font-semibold shadow-md hover:shadow-none hover:scale-[.98] transition-all duration-300 disabled:opacity-50 w-full"
                  >
                    {loading.submit ? "Procesando..." : "Registrar Descuento"}
                  </button>
                </form>
                <div className="w-full flex flex-col col-span-1 md:col-span-2 lg:col-start-3">
                  <p className="text-slate-500 font-semibold text-sm">
                    ¿Necesitas la plantilla actualizada?
                  </p>
                  <button
                    onClick={handleDownloadTemplate}
                    disabled={isDownloading}
                    className={`w-max mt-4 bg-emerald-600 text-white py-1 px-4 border rounded font-semibold shadow-md flex items-center transition-all duration-300 ${
                      isDownloading
                        ? "!bg-white cursor-not-allowed hover:scale-100 border-slate-100"
                        : "hover:bg-emerald-700 hover:scale-[.98] border-slate-600"
                    }`}
                  >
                    {isDownloading ? (
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
          </div>
        </Card>

        {/* Formulario de Descuento Normal */}
        <Card className="p-6 mb-8">
          <NormalDiscountForm
            options={options}
            loading={loading}
            onSubmit={handleNormalSubmit}
          />
        </Card>

        {/* Formulario de Descuento Masivo */}
        <Card className="p-6">
          <MassDiscountForm
            options={options}
            loading={loading}
            onSubmit={handleMassSubmit}
          />
        </Card>
      </section>
    </>
  );
};

export default DescuentosForm;
