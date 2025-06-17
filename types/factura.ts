export interface ParsedFactura {
  claveAcceso: string
  fechaEmision: string
  razonSocialEmisor: string
  razonSocialComprador: string
  importeTotal: number
  archivoOriginal: string
  rawFile: File
}