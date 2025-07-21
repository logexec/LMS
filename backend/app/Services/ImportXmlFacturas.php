<?php

namespace App\Services;

use App\Models\Invoice;
use App\Models\InvoiceDetail;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Log;
use SimpleXMLElement;
use Exception;

class ImportXMLFacturas
{
    /**
     * Importa un XML crudo (string) y notifica progreso.
     *
     * @param  string   $rawXml  El contenido XML completo.
     * @param  callable $cb      function(int $step, int $total, string $message)
     * @return array             ['imported'=>int, 'skipped'=>int]
     */
    public function importFromString(string $rawXml, callable $cb): array
    {
        $processed = 0;
        $total     = 1;
        $imported  = 0;
        $skipped   = 0;

        // 1) Parséo de XML
        try {
            $xml = new SimpleXMLElement($rawXml);
            if ($xml->getName() === 'autorizacion' && isset($xml->comprobante)) {
                $xml = new SimpleXMLElement((string) $xml->comprobante);
            }
        } catch (Exception $e) {
            Log::error("XML inválido al parsear", ['error' => $e->getMessage()]);
            $cb(++$processed, $total, "XML inválido, omito");
            return ['imported' => 0, 'skipped' => 1];
        }

        // 2) Armado de datos de cabecera
        $hd = [
            'clave_acceso'            => (string)$xml->infoTributaria->claveAcceso,
            'ruc_emisor'              => (string)$xml->infoTributaria->ruc,
            'razon_social_emisor'     => (string)$xml->infoTributaria->razonSocial,
            'nombre_comercial_emisor' => (string)$xml->infoTributaria->nombreComercial,
            'identificacion_comprador'=> (string)$xml->infoFactura->identificacionComprador,
            'razon_social_comprador'  => (string)$xml->infoFactura->razonSocialComprador,
            'direccion_comprador'     => (string)$xml->infoFactura->dirEstablecimiento,
            'estab'                   => (string)$xml->infoTributaria->estab,
            'pto_emi'                 => (string)$xml->infoTributaria->ptoEmi,
            'secuencial'              => (string)$xml->infoTributaria->secuencial,
            'invoice_serial'          => sprintf(
                '%s-%s-%s',
                $xml->infoTributaria->estab,
                $xml->infoTributaria->ptoEmi,
                $xml->infoTributaria->secuencial
            ),
            'ambiente'                => (string)$xml->infoTributaria->ambiente,
            'tipo_emision'            => (string)$xml->infoTributaria->tipoEmision,
        ];

        // ➤ fecha_emision (DD/MM/YYYY → YYYY-MM-DD)
        $fechaRaw = trim((string)($xml->infoFactura->fechaEmision ?? ''));
        if ($fechaRaw !== '') {
            try {
                $hd['fecha_emision'] = Carbon::createFromFormat('d/m/Y', $fechaRaw)
                                             ->startOfDay();
            } catch (Exception $e) {
                Log::warning("Formato fecha_emision inválido", ['raw' => $fechaRaw]);
                $hd['fecha_emision'] = null;
            }
        } else {
            $hd['fecha_emision'] = null;
        }

        // ➤ fecha_autorizacion (si existe)
        $authRaw = trim((string)($xml->infoTributaria->fechaAutorizacion ?? ''));
        if ($authRaw !== '') {
            try {
                $hd['fecha_autorizacion'] = Carbon::createFromFormat('d/m/Y', $authRaw)
                                                   ->startOfDay();
            } catch (Exception $e) {
                Log::warning("Formato fecha_autorizacion inválido", ['raw' => $authRaw]);
                $hd['fecha_autorizacion'] = null;
            }
        } else {
            $hd['fecha_autorizacion'] = null;
        }

        // ➤ resto de campos
        $hd += [
            'tipo_identificacion_comprador'=> (string)$xml->infoFactura->tipoIdentificacionComprador,
            'cod_doc'                       => (string)$xml->infoTributaria->codDoc,
            'total_sin_impuestos'           => (float)$xml->infoFactura->totalSinImpuestos,
            'total_descuento'               => (float)($xml->infoFactura->totalDescuento ?? 0),
            'importe_total'                 => (float)$xml->infoFactura->importeTotal,
            'iva'                           => (float)($xml->infoFactura->iva ?? 0),
            'propina'                       => (float)($xml->infoFactura->propina ?? 0),
            'moneda'                        => (string)($xml->infoFactura->moneda ?? null),
            'forma_pago'                    => (string)($xml->infoFactura->pagos->pago->formaPago ?? null),
            'mes'                           => $hd['fecha_emision']
                                                 ? $hd['fecha_emision']->month
                                                 : null,
            'project'                       => null,
            'centro_costo'                  => null,
            'notas'                         => null,
            'observacion'                   => null,
            'contabilizado'                 => 'PENDIENTE',
            'cuenta_contable'               => null,
            'proveedor_latinium'            => null,
            'nota_latinium'                 => null,
            'estado'                        => 'ingresada',
            'estado_latinium'               => 'pendiente',
            'numero_asiento'                => null,
            'numero_transferencia'          => null,
            'correo_pago'                   => null,
            'purchase_order_id'             => null,
            'empresa'                       => ((string)$xml->infoFactura->identificacionComprador === '0992301066001')
                                                ? 'PREBAM'
                                                : 'SERSUPPORT',
            'xml_path'                      => null,
            'pdf_path'                      => null,
        ];

        // 3) Duplicado?
        if (Invoice::where('clave_acceso', $hd['clave_acceso'])->exists()) {
            $cb(++$processed, $total, "Duplicada, omito");
            return ['imported' => 0, 'skipped' => 1];
        }

        // 4) Insertar factura + detalles
        DB::transaction(function () use (&$processed, $total, $hd, $xml, $cb) {
            $inv = Invoice::create($hd);
            $cb(++$processed, $total, "Factura importada");

            $rows = [];
            foreach ($xml->detalles->detalle as $d) {
                $rows[] = [
                    'invoice_id'                => $inv->id,
                    'codigo_principal'          => (string)$d->codigoPrincipal,
                    'codigo_auxiliar'           => (string)($d->codigoAuxiliar ?? null),
                    'descripcion'               => (string)$d->descripcion,
                    'cantidad'                  => (int)$d->cantidad,
                    'precio_unitario'           => (float)$d->precioUnitario,
                    'descuento'                 => (float)$d->descuento,
                    'precio_total_sin_impuesto' => (float)$d->precioTotalSinImpuesto,
                    'cod_impuesto'              => (string)($d->impuestos->impuesto->codigo ?? null),
                    'cod_porcentaje'            => (string)($d->impuestos->impuesto->codigoPorcentaje ?? null),
                    'tarifa'                    => (float)($d->impuestos->impuesto->tarifa ?? null),
                    'base_imponible_impuestos'  => (float)($d->impuestos->impuesto->baseImponible ?? null),
                    'valor_impuestos'           => (float)($d->impuestos->impuesto->valor ?? null),
                    'created_at'                => now(),
                    'updated_at'                => now(),
                ];
            }
            InvoiceDetail::insert($rows);
        });

        // 5) Sincronizar estado contable
        Artisan::call('update:estado-contable');

        return ['imported' => 1, 'skipped' => 0];
    }
}
