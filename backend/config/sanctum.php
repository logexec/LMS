<?php

use Laravel\Sanctum\Sanctum;

return [
    'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', '10.120.1.20:3000')),
    'guards' => [
        'api' => [
            'driver' => 'token',
            'provider' => 'users',
            'hash' => false,
        ]
    ],
    'expiration' => 60 * 10, //10 horas
    'token_prefix' => env('SANCTUM_TOKEN_PREFIX', ''),
    'middleware' => [
        'authenticate_session' => Laravel\Sanctum\Http\Middleware\AuthenticateSession::class,
        'encrypt_cookies' => Illuminate\Cookie\Middleware\EncryptCookies::class,
        'validate_csrf_token' => App\Http\Middleware\ValidateCsrfToken::class,
        'verify_csrf_token' => \App\Http\Middleware\VerifyCsrfToken::class,
    ],

];
