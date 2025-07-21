<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Services\ImportXMLFacturas;
use Illuminate\Http\Request;
use SoapClient;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Illuminate\Support\Facades\Log;

class InvoiceUploadController extends Controller
{
    /**
     * POST /api/facturas/importar-xml
     * Guarda los XML en storage/app/facturas y devuelve rutas.
     */
    public function uploadXml(Request $r)
    {
        $uploaded = $r->file('xml');
        $files    = is_array($uploaded) ? $uploaded : ($uploaded ? [$uploaded] : []);

        Log::info('uploadXml: XMLs recibidos', ['count' => count($files)]);

        $paths = [];
        foreach ($files as $f) {
            $rel     = $f->storeAs('facturas', $f->getClientOriginalName(), 'local');
            $paths[] = storage_path("app/{$rel}");
        }

        return response()->json(['paths' => $paths]);
    }

    /**
     * GET /api/facturas/importar-xml/stream?paths[]=…&paths[]=
     * SSE: procesa cada XML y emite progreso + resultado.
     */
    public function streamXml(Request $r): StreamedResponse
    {
        $paths     = $r->query('paths', []);
        $total     = count($paths);
        $summaries = [];
        $imp       = new ImportXMLFacturas;

        Log::info('streamXml: inicio', ['total_files' => $total]);

        return new StreamedResponse(function () use ($paths, $total, &$summaries, $imp) {
            while (ob_get_level() > 0) {
                ob_end_flush();
            }
            echo ":\n\n"; flush();

            foreach ($paths as $path) {
                $fileName = basename($path);
                $raw      = @file_get_contents($path);

                if ($raw === false) {
                    $summaries[] = ['imported' => 0, 'skipped' => 1];
                    echo "event: file_done\n", 'data:' . json_encode([
                        'file'     => $fileName,
                        'imported' => 0,
                        'skipped'  => 1,
                    ]) . "\n\n";
                    flush();
                    continue;
                }

                try {
                    $sum = $imp->importFromString($raw, function ($step, $of, $msg) use ($fileName) {
                        echo "event: progress\n", 'data:' . json_encode([
                            'file'    => $fileName,
                            'step'    => $step,
                            'of'      => $of,
                            'message' => $msg,
                        ]) . "\n\n";
                        flush();
                    });
                } catch (\Throwable $e) {
                    Log::error('Error importFromString XML', ['file'=>$fileName,'error'=>$e->getMessage()]);
                    $sum = ['imported'=>0,'skipped'=>1];
                }

                $summaries[] = $sum;
                echo "event: file_done\n", 'data:' . json_encode([
                    'file'     => $fileName,
                    'imported' => $sum['imported'],
                    'skipped'  => $sum['skipped'],
                ]) . "\n\n";
                flush();
            }

            echo "event: end\n", 'data:' . json_encode([
                'total_files' => $total,
                'imported'    => array_sum(array_column($summaries, 'imported')),
                'skipped'     => array_sum(array_column($summaries, 'skipped')),
            ]) . "\n\n";
            flush();
        }, 200, [
            'Content-Type'  => 'text/event-stream',
            'Cache-Control' => 'no-cache',
            'Connection'    => 'keep-alive',
        ]);
    }

    /**
     * POST /api/facturas/importar-txt
     * Guarda el TXT y devuelve su ruta absoluta.
     */
    public function uploadTxt(Request $r)
    {
        $file = $r->file('txt');
        Log::info('uploadTxt: TXT recibido', ['name' => $file->getClientOriginalName()]);
        $rel  = $file->storeAs('facturas', $file->getClientOriginalName(), 'local');
        return response()->json(['path' => storage_path("app/{$rel}")]);
    }

    /**
     * GET /api/facturas/importar-txt/stream?path=…
     * SSE: procesa cada línea (SOAP → XML → importFromString).
     */
    public function streamTxt(Request $r): StreamedResponse
    {
        $path       = $r->query('path');
        if (! file_exists($path)) {
            abort(404, 'Archivo no encontrado');
        }

        $lines      = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        $total      = count($lines);
        $summaries  = [];
        $imp        = new ImportXMLFacturas;
        $wsdl       = config('services.sri.wsdl');
        $cfg        = config('services.sri');
        $soap       = new SoapClient($wsdl, [
            'cache_wsdl'         => $cfg['cache_wsdl'],
            'trace'              => $cfg['trace'],
            'connection_timeout' => $cfg['connection_timeout'],
        ]);

        Log::info('streamTxt: inicio', ['total_lines' => $total]);

        return new StreamedResponse(function () use ($lines, $total, &$summaries, $imp, $soap) {
            while (ob_get_level() > 0) {
                ob_end_flush();
            }
            echo ":\n\n"; flush();

            foreach ($lines as $i => $line) {
                $cols  = preg_split('/\t+/', trim($line));
                $clave = $cols[4] ?? null;

                // 1) Emitir siempre file_done, incluso sin clave
                if (! $clave) {
                    $summaries[] = ['imported' => 0, 'skipped' => 1];
                    echo "event: file_done\n", 'data:' . json_encode([
                        'line'     => $i + 1,
                        'imported' => 0,
                        'skipped'  => 1,
                    ]) . "\n\n";
                    flush();
                    continue;
                }

                // 2) SOAP al SRI
                try {
                    $auth = $soap
                        ->autorizacionComprobante(['claveAccesoComprobante' => $clave])
                        ->RespuestaAutorizacionComprobante
                        ->autorizaciones
                        ->autorizacion ?? null;
                } catch (\Throwable $e) {
                    Log::warning('streamTxt SOAP error', ['clave'=>$clave,'error'=>$e->getMessage()]);
                    $auth = null;
                }

                // 3) Si no autorizado o sin comprobante
                if (! $auth || $auth->estado !== 'AUTORIZADO' || empty($auth->comprobante)) {
                    $summaries[] = ['imported' => 0, 'skipped' => 1];
                    echo "event: file_done\n", 'data:' . json_encode([
                        'clave'    => $clave,
                        'imported' => 0,
                        'skipped'  => 1,
                    ]) . "\n\n";
                    flush();
                    continue;
                }

                // 4) Procesar XML en memoria
                try {
                    $sum = $imp->importFromString($auth->comprobante, function($step,$of,$msg) use($clave){
                        echo "event: progress\n", 'data:' . json_encode([
                            'clave'   => $clave,
                            'step'    => $step,
                            'of'      => $of,
                            'message' => $msg,
                        ]) . "\n\n";
                        flush();
                    });
                } catch (\Throwable $e) {
                    Log::error('importFromString falló', ['clave'=>$clave,'error'=>$e->getMessage()]);
                    $sum = ['imported'=>0,'skipped'=>1];
                }

                $summaries[] = $sum;
                echo "event: file_done\n", 'data:' . json_encode([
                    'clave'    => $clave,
                    'imported' => $sum['imported'],
                    'skipped'  => $sum['skipped'],
                ]) . "\n\n";
                flush();
            }

            // 5) Evento final
            echo "event: end\n", 'data:' . json_encode([
                'total_files' => $total,
                'imported'    => array_sum(array_column($summaries,'imported')),
                'skipped'     => array_sum(array_column($summaries,'skipped')),
            ]) . "\n\n";
            flush();
        }, 200, [
            'Content-Type'  => 'text/event-stream',
            'Cache-Control' => 'no-cache',
            'Connection'    => 'keep-alive',
        ]);
    }
}
