<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],
    'sendgrid' => [
        'api_key' => env('SENDGRID_API_KEY'),
    ],
    'sri' => [
        // URL del WSDL de autorización offline del SRI
        'wsdl'               => env(
            'SRI_WSDL',
            'https://cel.sri.gob.ec/comprobantes-electronicos-ws/AutorizacionComprobantesOffline?wsdl'
        ),

        // Opciones de cache para SoapClient
        // (WSDL_CACHE_NONE, WSDL_CACHE_DISK, WSDL_CACHE_MEMORY, WSDL_CACHE_BOTH)
        'cache_wsdl'         => env('SRI_CACHE_WSDL', WSDL_CACHE_NONE),

        // Habilita el trace para debug
        'trace'              => env('SRI_TRACE', true),

        // Timeout de conexión en segundos
        'connection_timeout' => env('SRI_TIMEOUT', 10),
    ],
];
