<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Support\Facades\Log;
use Throwable;

class Handler extends Exception
{
    public function render($request, Throwable $exception)
    {
        if ($exception instanceof \Illuminate\Session\TokenMismatchException) {
            Log::warning('❌ CSRF Token Mismatch!');
            Log::warning('X-XSRF-TOKEN: ' . $request->header('X-XSRF-TOKEN'));
            Log::warning('Session: ' . json_encode($request->session()->all()));
            Log::warning('Cookies: ' . json_encode($request->cookies->all()));
        }

        return parent::render($request, $exception);
    }
}
