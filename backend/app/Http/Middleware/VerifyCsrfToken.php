<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken as BaseVerifier;
use Illuminate\Support\Facades\Log;

class VerifyCsrfToken extends BaseVerifier
{
    /**
     * URIs que deben estar exentas de verificación CSRF.
     *
     * @var array<int,string>
     */
    protected $except = [
        // Para que funcione el endpoint de Sanctum que genera la cookie XSRF-TOKEN
        'sanctum/csrf-cookie',

        // Tus endpoints públicos de autenticación
        'api/login',
        'api/register',
        'api/refresh-token',

        // Otros que uses sin sesión (opcional):
        // 'api/forgot-password',
        // 'api/reset-password',
    ];

    /**
     * Handle an incoming request.
     */
    public function handle($request, Closure $next)
    {
        // —— logging diagnóstico ——
        Log::debug('[CSRF] Header X-XSRF-TOKEN:',  ['token' => $request->header('X-XSRF-TOKEN')]);
        Log::debug('[CSRF] Cookie XSRF-TOKEN:',      ['cookie' => $request->cookie('XSRF-TOKEN')]);
        Log::debug('[CSRF] Session ID:',             ['id' => session()->getId()]);

        try {
            return parent::handle($request, $next);
        } catch (\Symfony\Component\HttpKernel\Exception\HttpException $e) {
            Log::error('[CSRF] TokenMismatchException:', [
                'message' => $e->getMessage(),
                'stack'   => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }
}
