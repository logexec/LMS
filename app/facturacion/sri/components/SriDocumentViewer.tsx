import React from "react";
import ExtendedDocumentTable from "./ExtendedDocumentTable";

// This is a sample component to test the ExtendedDocumentTable
const SriDocumentViewer = () => {
  const documentData = {
    success: true,
    datosBasicos: {
      claveAcceso: "1234567890123456789012345678901234567890123456789",
      fechaEmision: "2025-05-01",
      tipoComprobante: "01",
      rucEmisor: "1792060346001",
      ambiente: "PRODUCCIÓN",
      serie: "001-001",
      secuencial: "000000123",
      establecimiento: "001",
      puntoEmision: "001",
      tipoEmision: "NORMAL",
      digitoVerificador: "1",
    },
    emisor: {
      success: true,
      ruc: "1792060346001",
      razonSocial: "CORPORACIÓN FAVORITA C.A.",
      nombreComercial: "SUPERMAXI",
      estado: "ACTIVO",
      claseSujeto: "ESPECIAL",
      tipoContribuyente: "SOCIEDAD",
      obligadoContabilidad: "SI",
      actividadEconomica:
        "VENTA AL POR MENOR EN COMERCIOS NO ESPECIALIZADOS CON PREDOMINIO DE LA VENTA DE ALIMENTOS, BEBIDAS O TABACO.",
      direccionMatriz: "AV. DE LAS AMÉRICAS S/N Y AV. RÍO COCA",
      telefonos: "022997500",
      email: "facturacion@favorita.com",
    },
    comprobante: {
      success: true,
      estado: "AUTORIZADO",
      numeroAutorizacion: "1234567890123456789012345678901234567890123456789",
      fechaAutorizacion: "2025-05-01T10:15:30",
      ambiente: "PRODUCCIÓN",
      comprobante: {
        infoTributaria: {
          razonSocial: "CORPORACIÓN FAVORITA C.A.",
          nombreComercial: "SUPERMAXI",
          ruc: "1792060346001",
          claveAcceso: "1234567890123456789012345678901234567890123456789",
          codDoc: "01",
          estab: "001",
          ptoEmi: "001",
          secuencial: "000000123",
          dirMatriz: "AV. DE LAS AMÉRICAS S/N Y AV. RÍO COCA",
        },
        infoFactura: {
          fechaEmision: "01/05/2025",
          razonSocialComprador: "PREBAM S.A.",
          identificacionComprador: "0992301066001",
          totalSinImpuestos: 100,
          totalDescuento: 0,
          importeTotal: 112,
          direccionComprador: "Guayaquil, Ecuador",
        },
        detalles: [
          {
            descripcion: "MANTEQUILLA SIN SAL 250G",
            cantidad: 2,
            precioUnitario: 3.5,
            descuento: 0,
            precioTotal: 7,
            codigoIVA: "2",
            valorIVA: 0.84,
          },
          {
            descripcion: "QUESO FRESCO 500G",
            cantidad: 1,
            precioUnitario: 5.2,
            descuento: 0,
            precioTotal: 5.2,
            codigoIVA: "2",
            valorIVA: 0.62,
          },
          {
            descripcion: "JAMON SERRANO 200G",
            cantidad: 2,
            precioUnitario: 12.5,
            descuento: 0,
            precioTotal: 25,
            codigoIVA: "2",
            valorIVA: 3,
          },
          {
            descripcion: "LECHE ENTERA 1L",
            cantidad: 12,
            precioUnitario: 1.25,
            descuento: 0,
            precioTotal: 15,
            codigoIVA: "2",
            valorIVA: 1.8,
          },
          {
            descripcion: "CAFE MOLIDO 500G",
            cantidad: 1,
            precioUnitario: 8.99,
            descuento: 0,
            precioTotal: 8.99,
            codigoIVA: "2",
            valorIVA: 1.08,
          },
          {
            descripcion: "PAN INTEGRAL UNIDAD",
            cantidad: 5,
            precioUnitario: 0.45,
            descuento: 0,
            precioTotal: 2.25,
            codigoIVA: "2",
            valorIVA: 0.27,
          },
          {
            descripcion: "MANZANAS RED DELICIOUS KG",
            cantidad: 2.5,
            precioUnitario: 2.3,
            descuento: 0,
            precioTotal: 5.75,
            codigoIVA: "2",
            valorIVA: 0.69,
          },
          {
            descripcion: "PAPEL HIGIÉNICO 12 ROLLOS",
            cantidad: 1,
            precioUnitario: 12.49,
            descuento: 0,
            precioTotal: 12.49,
            codigoIVA: "2",
            valorIVA: 1.5,
          },
          {
            descripcion: "JABÓN LÍQUIDO 1L",
            cantidad: 2,
            precioUnitario: 4.5,
            descuento: 0,
            precioTotal: 9,
            codigoIVA: "2",
            valorIVA: 1.08,
          },
          {
            descripcion: "DETERGENTE 2KG",
            cantidad: 1,
            precioUnitario: 9.32,
            descuento: 0,
            precioTotal: 9.32,
            codigoIVA: "2",
            valorIVA: 1.12,
          },
        ],
        impuestos: [
          {
            codigo: "2",
            codigoPorcentaje: "2",
            baseImponible: 100,
            valor: 12,
          },
        ],
        infoAdicional: {
          Teléfono: "042123456",
          Email: "prebam@ejemplo.com",
          Dirección: "Guayaquil, Ecuador",
          "Forma de Pago": "Crédito 30 días",
          Vendedor: "Juan Pérez",
          Observaciones: "Entrega en bodega principal",
        },
      },
      subtotal0: 0,
      subtotal12: 100,
      iva: 12,
    },
  };
  const [loading, setLoading] = React.useState(false);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">SRI Document Viewer</h1>
      <div className="flex justify-center mb-4">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded-md mr-2"
          onClick={() => setLoading(true)}
        >
          Simular Carga
        </button>
        <button
          className="px-4 py-2 bg-green-500 text-white rounded-md"
          onClick={() => setLoading(false)}
        >
          Detener Carga
        </button>
      </div>
      <ExtendedDocumentTable
        documentData={loading ? null : documentData}
        loading={loading}
      />
    </div>
  );
};

export default SriDocumentViewer;
