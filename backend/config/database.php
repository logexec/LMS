<?php

return [
    'default' => env('DB_CONNECTION', 'lms_backend'),
    'connections' => [
        'lms_local' => [
            'driver' => 'mysql',
            'host' => env('DB_LOCAL_HOST', '127.0.0.1'),
            'port' => env('DB_LOCAL_PORT', '3306'),
            'database' => env('DB_LOCAL_DATABASE', 'lms_staging'),
            'username' => env('DB_LOCAL_USERNAME', 'root'),
            'password' => env('DB_LOCAL_PASSWORD', ''),
            'charset' => 'utf8mb4',
            'collation' => 'utf8mb4_unicode_ci',
            'prefix' => '',
            'strict' => true,
            'engine' => null,
        ],
        'lms_backend' => [
            'driver' => 'mysql',
            'host' => env('DB_HOST', 'sgt.logex.com.ec'),
            'port' => env('DB_PORT', '3306'),
            'database' => env('DB_DATABASE', 'lms_backend'),
            'username' => env('DB_USERNAME', 'restrella'),
            'password' => env('DB_PASSWORD', 'LogeX-?2028*'),
            'charset' => 'utf8mb4',
            'collation' => 'utf8mb4_unicode_ci',
            'prefix' => '',
            'strict' => true,
            'engine' => null,
        ],
        'sistema_onix' => [ // Conexión adicional para sistema_onix
            'driver' => 'mysql',
            'host' => env('ONIX_DB_HOST', 'sgt.logex.com.ec'),
            'port' => env('ONIX_DB_PORT', '3306'),
            'database' => env('ONIX_DB_DATABASE', 'sistema_onix'),
            'username' => env('ONIX_DB_USERNAME', 'restrella'),
            'password' => env('ONIX_DB_PASSWORD', 'LogeX-?2028*'),
            'charset' => 'utf8mb4',
            'collation' => 'utf8mb4_unicode_ci',
            'prefix' => '',
            'strict' => true,
            'engine' => null,
        ],
        'tms1' => [ // Conexión adicional para tms
            'driver' => 'mysql',
            'host' => env('TMS_DB_HOST', 'tms1.logex.com.ec'),
            'port' => env('TMS_DB_PORT', '3306'),
            'database' => env('TMS_DB_DATABASE', 'tms1'),
            'username' => env('TMS_DB_USERNAME', 'restrella'),
            'password' => env('TMS_DB_PASSWORD', 'LogeX2026*+'),
            'charset' => 'utf8mb4',
            'collation' => 'utf8mb4_unicode_ci',
            'prefix' => '',
            'strict' => true,
            'engine' => null,
        ],
        'latinium' => [ // Conexión adicional para LATINIUM
            'driver' => 'sqlsrv',
            'host' => '192.168.0.182,49776;Encrypt=no;TrustServerCertificate=yes',
            'port' => env('LATINIUM_DB_PORT', '49776'),
            'database' => env('LATINIUM_DB_DATABASE', 'SERSUPPORT2021'),
            'username' => env('LATINIUM_DB_USERNAME', 'readerlx'),
            'password' => env('LATINIUM_DB_PASSWORD', 'Logex3090+'),
            'charset' => 'utf8mb4',
            'collation' => 'utf8mb4_unicode_ci',
            'prefix'   => '',
            'options'  => [],
        ],
        'latinium_prebam' => [
            'driver'                  => 'sqlsrv',
            'host'                    => env('LATINIUM_PREBAM_DB_HOST', '192.168.0.182'),
            'port'                    => env('LATINIUM_PREBAM_DB_PORT', '49776'),
            'database'                => env('LATINIUM_PREBAM_DB_DATABASE', 'PREBAM2021'),
            'username'                => env('LATINIUM_PREBAM_DB_USERNAME', 'readerlx'),
            'password'                => env('LATINIUM_PREBAM_DB_PASSWORD', 'Logex3090+'),
            'charset'                 => 'utf8',
            'prefix'                  => '',
            'encrypt'                 => env('LATINIUM_PREBAM_DB_ENCRYPT', 'no'),
            'trust_server_certificate' => env('LATINIUM_PREBAM_DB_TRUST_SERVER_CERTIFICATE', 'yes'),
        ],
        'latinium_sersupport' => [
            'driver'                  => 'sqlsrv',
            'host'                    => env('LATINIUM_SERSUPPORT_DB_HOST', '192.168.0.182'),
            'port'                    => env('LATINIUM_SERSUPPORT_DB_PORT', '49776'),
            'database'                => env('LATINIUM_SERSUPPORT_DB_DATABASE', 'SERSUPPORT2021'),
            'username'                => env('LATINIUM_SERSUPPORT_DB_USERNAME', 'readerlx'),
            'password'                => env('LATINIUM_SERSUPPORT_DB_PASSWORD', 'Logex3090+'),
            'charset'                 => 'utf8',
            'prefix'                  => '',
            'encrypt'                 => env('LATINIUM_SERSUPPORT_DB_ENCRYPT', 'no'),
            'trust_server_certificate' => env('LATINIUM_SERSUPPORT_DB_TRUST_SERVER_CERTIFICATE', 'yes'),
        ],
    ],
    'migrations' => [
        'table' => 'migrations',
        'update_date_on_publish' => true,
    ],
];
