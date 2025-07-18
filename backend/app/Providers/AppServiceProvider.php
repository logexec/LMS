<?php
namespace App\Providers;

use App\Models\Invoice;
use App\Observers\InvoiceObserver;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        Schema::defaultStringLength(191);
        
        // IMPORTANTE: Configuración para Docker/proxy
        if ($this->app->environment('production')) {
            URL::forceScheme('https');
        }
        
        // Para Docker con nginx como proxy
        if (config('app.env') !== 'local') {
            $this->configureProxyHeaders();
        }
        
        Invoice::observe(InvoiceObserver::class);
    }
    
    /**
     * Configura headers de proxy para Docker
     */
    protected function configureProxyHeaders(): void
    {
        // Confía en proxies (nginx en Docker)
        request()->setTrustedProxies(
            ['127.0.0.1', '192.168.0.0/16', '172.16.0.0/12', '10.0.0.0/8'],
            \Illuminate\Http\Request::HEADER_X_FORWARDED_FOR |
            \Illuminate\Http\Request::HEADER_X_FORWARDED_HOST |
            \Illuminate\Http\Request::HEADER_X_FORWARDED_PORT |
            \Illuminate\Http\Request::HEADER_X_FORWARDED_PROTO
        );
    }
}