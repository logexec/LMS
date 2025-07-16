import { ParsedFactura } from '@/types/factura'

export async function parseFacturaXml(xmlString: string, fileName: string): Promise<ParsedFactura | null> {
  const cleanXml = xmlString.replace(/\r|\n|&#xd;|&#xD;/g, "").trim(); // Para normalizar el xml cuando viene con espacios, etc
  const parser = new DOMParser();
  const xml = parser.parseFromString(cleanXml, 'text/xml');

  let facturaRoot: Element | null = null
  let fechaAutorizacion = ''

  const comprobante = xml.querySelector('comprobante')

  if (comprobante) {
    const raw = comprobante.textContent?.trim()
    if (!raw) return null

    const inner = parser.parseFromString(raw, 'text/xml')
    facturaRoot = inner.querySelector('factura')
    fechaAutorizacion = xml.querySelector('fechaAutorizacion')?.textContent ?? ''
  } else {
    facturaRoot = xml.querySelector('factura')
  }

  if (!facturaRoot) return null

  const infoTributaria = facturaRoot.querySelector('infoTributaria')
  const infoFactura = facturaRoot.querySelector('infoFactura')

  if (!infoTributaria || !infoFactura) return null

  const getText = (tag: string, from: Element): string =>
    from.querySelector(tag)?.textContent?.trim() ?? ''

  return {
    claveAcceso: getText('claveAcceso', infoTributaria),
    fechaEmision: getText('fechaEmision', infoFactura) || fechaAutorizacion,
    razonSocialEmisor: getText('razonSocial', infoTributaria),
    razonSocialComprador: getText('razonSocialComprador', infoFactura),
    importeTotal: parseFloat(getText('importeTotal', infoFactura) || '0'),
    archivoOriginal: fileName,
    rawFile: new File([xmlString], fileName, { type: 'text/xml' }),
  }
}
