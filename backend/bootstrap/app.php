<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
        api: __DIR__ . '/../routes/api.php'
    )
    ->withMiddleware(function ($middleware) {
        // *** web middleware (solo aplica en web.php) ***
        $middleware->use([
            \App\Http\Middleware\Cors::class,
            \App\Http\Middleware\EncryptCookies::class,
            \Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse::class,
            \Illuminate\Session\Middleware\StartSession::class,
        ]);

        // *** api middleware (pipeline para /api/*) ***
        $middleware->api([
            \App\Http\Middleware\Cors::class,
            \Illuminate\Cookie\Middleware\EncryptCookies::class,
            \Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse::class,
            \Illuminate\Session\Middleware\StartSession::class,
            \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
            \Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class,
            'throttle:60,1',
            \Illuminate\Routing\Middleware\SubstituteBindings::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->render(function (\Exception $e, $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'message'   => $e instanceof MethodNotAllowedHttpException
                                    ? 'Método no permitido.'
                                    : $e->getMessage(),
                    'exception' => get_class($e),
                ], $e instanceof MethodNotAllowedHttpException ? 405 : 500);
            }
        });
    })
    ->withProviders([
        Laravel\Sanctum\SanctumServiceProvider::class,
    ])
    ->create();
