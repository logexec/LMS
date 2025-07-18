<?php

namespace App\Services;

use Illuminate\Http\Request;

class AuthService
{
    public function getUser(Request $request)
    {
        $user = $request->user();
        if (! $user) {
            throw new \Exception("Usuario no autenticado.");
        }
        return $user;
    }
}
