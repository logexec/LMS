<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful;
use Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
        api: __DIR__ . '/../routes/api.php'
    )
    ->withMiddleware(function ($middleware) {
        // *** Middleware "web" ***
        $middleware->use([
            \App\Http\Middleware\Cors::class,
            \App\Http\Middleware\EncryptCookies::class,
            \Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse::class,
            \Illuminate\Session\Middleware\StartSession::class,
        ]);

        // *** Middleware "api" ***
        $middleware->api([
            \App\Http\Middleware\Cors::class,
            \App\Http\Middleware\EncryptCookies::class,
            \Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse::class,
            \Illuminate\Session\Middleware\StartSession::class,
            \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
            'throttle:60,1',
            \Illuminate\Routing\Middleware\SubstituteBindings::class,
            \Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class,

        ]);
    })->withExceptions(function (Exceptions $exceptions) {
        $exceptions->render(function (\Exception $e, $request) {
            if ($request->is('api/*')) {
                if ($e instanceof MethodNotAllowedHttpException) {
                    return response()->json([
                        'message' => 'Método no permitido para esta ruta.',
                        'exception' => get_class($e),
                    ], 405);
                }
                return response()->json([
                    'message' => $e->getMessage(),
                    'exception' => get_class($e),
                ], 500);
            }
        });
    })->withProviders([
        Laravel\Sanctum\SanctumServiceProvider::class,
    ])->create();
