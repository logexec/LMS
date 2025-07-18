<?php
// app/Http/Middleware/Cors.php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class Cors
{
    public function handle(Request $request, Closure $next)
    {
        // 1) Definir orígenes permitidos
        $allowedOrigins = [
            'http://localhost:3000',
            'http://192.168.18.100:3000',
            'https://lms.logex.com.ec',
        ];

        $origin = $request->headers->get('Origin');
        $allowOrigin = in_array($origin, $allowedOrigins) 
            ? $origin 
            : $allowedOrigins[0];

        // 2) Cabeceras CORS comunes
        $headers = [
            'Access-Control-Allow-Origin'      => $allowOrigin,
            'Access-Control-Allow-Methods'     => 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
            'Access-Control-Allow-Headers'     => 'Content-Type, Accept, Authorization, X-Requested-With, X-XSRF-TOKEN',
            'Access-Control-Allow-Credentials' => 'true',
        ];

        // 3) Responder OPTIONS sin pasar por el resto
        if ($request->getMethod() === 'OPTIONS') {
            return response()->json('OK', 200, $headers);
        }

        // 4) En cualquiera otra petición, añadir cabeceras a la respuesta
        $response = $next($request);
        foreach ($headers as $key => $value) {
            $response->headers->set($key, $value);
        }

        return $response;
    }
}
