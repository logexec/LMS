<?php

namespace App\Console\Commands;

use App\Models\Invoice;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class SyncEstadoContable extends Command
{
    protected $signature   = 'update:estado-contable';
    protected $description = 'Actualiza el estado contable de facturas en LMS.';

    public function handle()
    {
        $this->info('Sincronizando estado contable');

        $facturas = Invoice::where('contabilizado', 'PENDIENTE')->get();
        foreach ($facturas as $fac) {
            $conn = $fac->identificacion_comprador === '0992301066001'
                ? 'latinium_prebam'
                : 'latinium_sersupport';

            $existe = DB::connection($conn)
                ->table('Compra')
                ->where('AutFactura', $fac->clave_acceso)
                ->exists();

            if ($existe) {
                $fac->update(['contabilizado' => 'CONTABILIZADO']);
                $this->info("Factura {$fac->id} ⇒ CONTABILIZADO");
            }
        }

        $this->info('Sincronización completada.');
    }
}
