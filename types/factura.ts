export interface ParsedFactura {
  claveAcceso: string;
  fechaEmision: string;
  razonSocialEmisor: string;
  razonSocialComprador: string;
  importeTotal: number;
  archivoOriginal: string;
  rawFile: File;
}

export interface InvoiceDescription {
  id: number;
  descripcion: string;
}

export interface Factura {
  id: number;
  clave_acceso: string;

  // Emisor y Comprador
  ruc_emisor: string;
  razon_social_emisor: string;
  nombre_comercial_emisor: string | null;
  identificacion_comprador: string;
  razon_social_comprador: string;
  direccion_comprador: string | null;
  details: InvoiceDescription;
  descripcion?: InvoiceDescription;

  // Datos de factura
  estab: string;
  pto_emi: string;
  secuencial: string;
  invoice_serial: string;
  ambiente: string;
  fecha_emision: string | null;
  fecha_autorizacion: string | null;
  tipo_identificacion_comprador: string | null;
  cod_doc: string | null;

  // Valores económicos
  total_sin_impuestos: number;
  importe_total: number;
  iva: number | null;
  propina: number | null;
  moneda: string | null;
  forma_pago: string | null;
  placa: string | null;

  // Campos editables / de flujo
  mes: number;
  project: string | null;
  centro_costo: string | null;
  notas?: string | null;
  observacion: string | null;
  contabilizado: string | null;
  cuenta_contable: string | null;
  proveedor_latinium: string | null;
  nota_latinium: string | null;

  // Estado y referencias contables
  estado:
    | "ingresada"
    | "aprobada"
    | "en_contabilidad"
    | "contabilizada"
    | "pagada"
    | "actualizada"
    | "no_conta";
  numero_asiento: string | null;
  numero_transferencia: string | null;
  correo_pago: string | null;

  // Asociación y almacenamiento
  purchase_order_id: number | null;
  empresa: string | null;
  xml_path: string | null;
  pdf_path: string | null;

  // Timestamps y soft delete
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProyectoLatinium {
  value: string;
  label: string;
}