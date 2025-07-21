<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;
use Laravel\Sanctum\Http\Controllers\CsrfCookieController;

use App\Http\Controllers\API\AccountController;
use App\Http\Controllers\API\AreaController;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\AuditLogController;
use App\Http\Controllers\API\DocumentGenerationController;
use App\Http\Controllers\API\InvoiceController;
use App\Http\Controllers\API\InvoiceImportController;
use App\Http\Controllers\API\LoanController;
use App\Http\Controllers\API\LoanImportController;
use App\Http\Controllers\API\MobileDataController;
use App\Http\Controllers\API\PermissionController;
use App\Http\Controllers\API\ProjectController;
use App\Http\Controllers\API\ReposicionController;
use App\Http\Controllers\API\RequestController;
use App\Http\Controllers\API\ResponsibleController;
use App\Http\Controllers\API\RoleController;
use App\Http\Controllers\API\ReportController;
use App\Http\Controllers\API\SriImportController;
use App\Http\Controllers\API\StatsController;
use App\Http\Controllers\TemplateController;
use App\Http\Controllers\API\TransportController;
use App\Http\Controllers\API\UserController;

/*
|--------------------------------------------------------------------------
| Public / Throttled (no auth)
|--------------------------------------------------------------------------
*/
Route::middleware('throttle:6,1')->group(function () {
    // (e.g. health checks, public info, etc.)
});

// Maintenance endpoint
Route::get('/serverstatus', function () {
    return response()->json([
        'under_maintenance' => app()->isDownForMaintenance() ? 'true' : 'false',
    ], app()->isDownForMaintenance() ? 503 : 200);
});

// Mobile‐only (JWT) endpoints
Route::prefix('mobile')
    ->withoutMiddleware('auth:sanctum')
    ->middleware(\App\Http\Middleware\VerifyEndpointJWT::class)
    ->group(function () {
        Route::get('/data', [MobileDataController::class, 'index']);
    });

// One-off data update
Route::get('/update-data', [RequestController::class, 'updateRequestsData']);

/*
|--------------------------------------------------------------------------
| Password reset (public)
|--------------------------------------------------------------------------
*/
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password',  [AuthController::class, 'resetPassword']);

/*
|--------------------------------------------------------------------------
| CSRF cookie
|--------------------------------------------------------------------------
*/
Route::middleware([
    // \App\Http\Middleware\Cors::class,
    \App\Http\Middleware\EncryptCookies::class,
    \Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse::class,
    \Illuminate\Session\Middleware\StartSession::class,
])->group(function () {
    Route::get('/sanctum/csrf-cookie', [CsrfCookieController::class, 'show']);
});

/*
|--------------------------------------------------------------------------
| API (stateful SPA) — all routes below share these middlewares
|--------------------------------------------------------------------------
*/
Route::middleware([
    // \App\Http\Middleware\Cors::class,
    \App\Http\Middleware\EncryptCookies::class,
    \Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse::class,
    \Illuminate\Session\Middleware\StartSession::class,
    \Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class,
    \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
    'throttle:60,1',
    \Illuminate\Routing\Middleware\SubstituteBindings::class,
])->group(function () {

    //––– Debugging (logs cookies/headers/session/user) –––
    Route::get('/debug', function (Request $request) {
        Log::debug('===== API DEBUG =====', [
            'cookies'       => $request->cookies->all(),
            'headers'       => $request->headers->all(),
            'session_id'    => session()->getId(),
            'session_token' => session()->token(),
            'user_id'       => auth()->user()?->id,
        ]);
        return response()->json([
            'ok'      => true,
            'cookies' => $request->cookies->all(),
        ]);
    });

    Route::post('/login', [AuthController::class, 'login']);

    //––– Authenticated SPA routes –––
    Route::middleware('auth:sanctum')->group(function () {
        // User profile & password
        Route::post('/logout',          [AuthController::class, 'logout']);
        Route::post('/change-password', [AuthController::class, 'changePassword']);
        Route::post('/refresh-token',   [AuthController::class, 'refresh']);
        Route::patch('/users/{user}',   [UserController::class, 'patch']);

        // Audit logs
        Route::get('/auditoria', [AuditLogController::class, 'index']);

        // Invoices & documents
        Route::post('/facturas/importar',  [InvoiceImportController::class, 'import']);
        Route::apiResource('/facturas',     InvoiceController::class);
        Route::post('/generate-documents',  [DocumentGenerationController::class, 'generate']);
        Route::get('/sri-documents-stats',  [StatsController::class, 'index']);
        Route::post('/reports/generate',    [ReportController::class, 'generate']);

        // Accounts, Transports, Responsibles
        Route::apiResource('/accounts',     AccountController::class);
        Route::apiResource('/transports',   TransportController::class);
        Route::apiResource('/responsibles', ResponsibleController::class);

        // Projects & project/users
        Route::prefix('projects')->group(function () {
            Route::apiResource('/', ProjectController::class);
            Route::get('/{id}/users', [ProjectController::class, 'getProjectUsers']);
            Route::post('/{id}/users', [ProjectController::class, 'assignUsers']);
        });

        // Areas
        Route::apiResource('/areas', AreaController::class);

        // Requests (incl. import, batch delete, upload discounts)
        Route::apiResource('/requests', RequestController::class);
        Route::post('/requests/import',        [RequestController::class, 'import']);
        Route::post('/requests/batch-delete',  [RequestController::class, 'batchDelete']);
        Route::post('/requests/upload-discounts', [RequestController::class, 'uploadDiscounts']);

        // Reposiciones (dentro de API)
        Route::apiResource('/reposiciones', ReposicionController::class)
            ->except('file');
        Route::get('/reposiciones/{id}/file', [ReposicionController::class, 'file']);

        // Loans & imports
        Route::post('/loans/import', [LoanImportController::class, 'import']);
        Route::apiResource('/loans',  LoanController::class);

        /*
        |--------------------------------------------------------------------------
        | Admin-only (role:admin,developer)
        |--------------------------------------------------------------------------
        */
        Route::middleware(['role:admin,developer'])->group(function () {
            // Users CRUD + assign permissions/projects
            Route::prefix('users')->group(function () {
                Route::get('/',   [UserController::class, 'index']);
                Route::post('/',  [UserController::class, 'store']);
                Route::get('/{user}',   [UserController::class, 'show']);
                Route::put('/{user}',   [UserController::class, 'update']);
                Route::delete('/{user}',[UserController::class, 'destroy']);
                Route::put('/{user}/permissions', [UserController::class, 'updatePermissions']);
                Route::get('/{user}/projects',     [UserController::class, 'getUserProjects']);
                Route::post('/{user}/projects',    [UserController::class, 'assignProjects']);
            });

            // Roles & their permissions
            Route::prefix('roles')->group(function () {
                Route::get('/',   [RoleController::class, 'index']);
                Route::post('/',  [RoleController::class, 'store']);
                Route::get('/{role}',   [RoleController::class, 'show']);
                Route::put('/{role}',   [RoleController::class, 'update']);
                Route::delete('/{role}',[RoleController::class, 'destroy']);
                Route::get('/{role}/permissions',   [RoleController::class, 'permissions']);
                Route::put('/{role}/permissions',   [RoleController::class, 'updatePermissions']);
            });

            // Permissions management
            Route::prefix('permissions')->group(function () {
                Route::get('/',   [PermissionController::class, 'index']);
                Route::post('/',  [PermissionController::class, 'store']);
                Route::get('/{permission}',   [PermissionController::class, 'show']);
                Route::put('/{permission}',   [PermissionController::class, 'update']);
                Route::delete('/{permission}',[PermissionController::class, 'destroy']);
                Route::post('/{permission}/assign-to-role', [PermissionController::class, 'assignToRole']);
            });

            // In-app registration (if still needed)
            Route::post('/register', [AuthController::class, 'register']);
        });

        /*
        |--------------------------------------------------------------------------
        | Fine-grained permission / role + permission
        |--------------------------------------------------------------------------
        | e.g. only admins with manage_system, or view_reports+generate_reports
        */
        Route::middleware(['permission:view_reports,generate_reports'])->group(function () {
            // ...
        });
        Route::middleware(['role:admin','permission:manage_system'])->group(function () {
            // ...
        });
    });
});

/*
|--------------------------------------------------------------------------
| Download templates & external imports (no ValidateApiToken)
|--------------------------------------------------------------------------
*/
Route::get('/download-discounts-template', [TemplateController::class, 'downloadDiscountsTemplate'])
     ->withoutMiddleware(\App\Http\Middleware\ValidateApiToken::class);

Route::get('/download-expenses-template',  [TemplateController::class, 'downloadExpensesTemplate'])
     ->withoutMiddleware(\App\Http\Middleware\ValidateApiToken::class);

// SRI TXT import
Route::post('/import-sri-txt', [SriImportController::class, 'uploadTxt']);
Route::get('/import-status/{path}', [SriImportController::class, 'status'])
     ->where('path', '.*');

// Latinium integration endpoints
Route::get('/latinium/accounts',             [InvoiceController::class, 'latiniumAccounts']);
Route::get('/latinium/projects',             [InvoiceController::class, 'latiniumProjects']);
Route::get('/latinium/centro-costo',         [InvoiceController::class, 'centroCosto']);
Route::patch('/latinium/proveedores',        [InvoiceController::class, 'actualizarProveedoresLatinium']);
Route::patch('/latinium/estado-contable',    [InvoiceController::class, 'actualizarEstadoContableLatinium']);

// Invoice PDF routes
Route::get('/invoices/{invoice}/pdf',  [InvoiceController::class, 'pdf']);
Route::get('/invoices/{invoice}/view', [InvoiceController::class, 'viewPdf']);




Route::post('/debug-login', function (\Illuminate\Http\Request $request) {
    return response()->json([
        'headers' => $request->headers->all(),
        'cookies' => $request->cookies->all(),
        'session' => $request->session()->all(),
        'token_valid' => $request->hasValidCsrfToken(),
    ]);
});


/**
 * =======================================
 * **************  Legacy  ***************
 * =======================================
 */

// use App\Http\Controllers\API\AccountController;
// use App\Http\Controllers\API\AuthController;
// use App\Http\Controllers\API\LoanImportController;
// use App\Http\Controllers\API\ProjectController;
// use App\Http\Controllers\API\RequestController;
// use App\Http\Controllers\API\ResponsibleController;
// use App\Http\Controllers\API\StatsController;
// use App\Http\Controllers\API\TransportController;
// use App\Http\Controllers\API\UserController;
// use App\Http\Controllers\API\AreaController;
// use App\Http\Controllers\API\AuditLogController;
// use App\Http\Controllers\API\DocumentGenerationController;
// use App\Http\Controllers\API\InvoiceController;
// use App\Http\Controllers\API\InvoiceImportController;
// use App\Http\Controllers\API\LoanController;
// use App\Http\Controllers\API\MobileDataController;
// use App\Http\Controllers\API\PermissionController;
// use App\Http\Controllers\API\ReportController;
// use App\Http\Controllers\API\ReposicionController;
// use App\Http\Controllers\API\RoleController;
// use App\Http\Controllers\API\SriImportController;
// use App\Http\Controllers\TemplateController;
// use App\Models\SriRequest;
// use Illuminate\Support\Facades\Route;

// Route::middleware(['throttle:6,1'])->group(function () {
//     // Rutas públicas con throttle para evitar brute force attacks
// });

// Route::prefix('mobile')
//     ->withoutMiddleware(['api']) // Remove todos los middlewares del grupo 'api'
//     ->middleware(\App\Http\Middleware\VerifyEndpointJWT::class) // Aplica solo VerifyEndpointJWT
//     ->group(function () {
//         Route::get('/data', [MobileDataController::class, 'index']);
//     });
// // Para actualizar la data subida previamente con UUIDs
// Route::get('/update-data', [RequestController::class, 'updateRequestsData']);



// Route::get('/debug', function () {
//     return response()->json([
//         'scheme' => request()->getScheme(),
//         'secure' => request()->secure(),
//         'headers' => request()->headers->all()
//     ]);
// });


// Route::get('/serverstatus', function () {
//     if (app()->isDownForMaintenance()) {
//         return response()->json(["under_maintenance" => "true", "responseText" => "¡Estamos en mantenimiento!"], 503);
//     }
//     return response()->json(["under_maintenance" => "false"], 200);
// });

// Route::post('/login', [AuthController::class, 'login']);
// Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
// Route::post('/reset-password', [AuthController::class, 'resetPassword']);

// Route::get('/download-discounts-template', [TemplateController::class, 'downloadDiscountsTemplate'])
//     ->withoutMiddleware([\App\Http\Middleware\ValidateApiToken::class])->middleware(\App\Http\Middleware\HandleCors::class);
// // Descargar plantilla de excel descuentos y both
// Route::get('/download-expenses-template', [TemplateController::class, 'downloadExpensesTemplate'])
//     ->withoutMiddleware([\App\Http\Middleware\ValidateApiToken::class])->middleware(\App\Http\Middleware\HandleCors::class);


// // Importa el txt
// Route::post('/import-sri-txt', [SriImportController::class, 'uploadTxt']);
// Route::get('/import-status/{path}', [SriImportController::class, 'status'])->where('path', '.*');

// Route::get('/latinium/accounts',     [InvoiceController::class, 'latiniumAccounts']);
// Route::get('/latinium/projects', [InvoiceController::class, 'latiniumProjects']);
// Route::get('/latinium/centro-costo', [InvoiceController::class, 'centroCosto']);
// Route::patch('/latinium/proveedores', [InvoiceController::class, 'actualizarProveedoresLatinium']);
// Route::patch('/latinium/estado-contable', [InvoiceController::class, 'actualizarEstadoContableLatinium']);

// Route::get('invoices/{invoice}/pdf', [InvoiceController::class, 'pdf']);
// Route::get('invoices/{invoice}/view', [InvoiceController::class, 'viewPdf']);


// // Rutas protegidas por autenticación
// Route::middleware(['verify.jwt'])->group(function () {
//     // Rutas generales para usuarios autenticados
//     Route::post('/logout', [AuthController::class, 'logout']);
//     Route::post('/change-password', [AuthController::class, 'changePassword']);
//     Route::post('/refresh-token', [AuthController::class, 'refresh']);
//     Route::patch('/users/{user}', [UserController::class, 'patch']);

//     //Rutas para auditorias de XML:
//     Route::get('/auditoria', [AuditLogController::class, 'index']);

//     // Para facturacion
//     Route::post('/facturas/importar', [InvoiceImportController::class, 'import']);
//     Route::apiResource('/facturas', InvoiceController::class);

//     //Para el Job del archivo txt para facturas SRI
//     // Route::get('/import-status/{path}', [SriImportController::class, 'status'])->where('path', '.*');

//     // Rutas para documentos SRI
//     Route::post('/generate-documents', [DocumentGenerationController::class, 'generate']);
//     Route::get('/sri-documents-stats', [StatsController::class, 'index']);
//     Route::post('/reports/generate', [ReportController::class, 'generate']);

//     Route::apiResource('/accounts', AccountController::class);
//     Route::apiResource('/transports', TransportController::class);
//     Route::apiResource('/responsibles', ResponsibleController::class);
//     Route::get('/vehicles', [TransportController::class, 'index']);


//     Route::prefix('projects')->group(function () {
//         Route::apiResource('/', ProjectController::class);
//         Route::get('/{id}/users', [ProjectController::class, 'getProjectUsers']);
//         Route::post('/{id}/users', [ProjectController::class, 'assignUsers']);
//     });

//     // Route::get('/download-excel-template', [TemplateController::class, 'downloadTemplate']);
//     Route::apiResource('/areas', AreaController::class);

//     Route::apiResource('/requests', RequestController::class);
//     Route::post('/requests/upload-discounts', [RequestController::class, 'uploadDiscounts']);

//     // Generar reposiciones
//     Route::apiResource('/reposiciones', ReposicionController::class)->except('file');
//     Route::get('/reposiciones/{id}/file', [ReposicionController::class, 'file']);

//     // Importar desde Excel
//     Route::post('/requests/import', [RequestController::class, 'import']);

//     // Eliminar mútiples
//     Route::post('/requests/batch-delete', [RequestController::class, 'batchDelete']);

//     // Rutas para importación de préstamos
//     Route::post('/loans/import', [LoanImportController::class, 'import']);


//     // Préstamos
//     Route::apiResource('/loans', LoanController::class);

//     // Rutas solo para administradores
//     Route::middleware(['role:admin,developer'])->group(function () {
//         Route::prefix('users')->group(function () {
//             Route::get('/', [UserController::class, 'index']);
//             Route::post('/', [UserController::class, 'store']);
//             Route::get('/{user}', [UserController::class, 'show']);
//             Route::put('/{user}', [UserController::class, 'update']);
//             Route::delete('/{user}', [UserController::class, 'destroy']);

//             //Permisos
//             Route::put('/{user}/permissions', [UserController::class, 'updatePermissions']);

//             //Proyectos
//             Route::get('/{user}/projects', [UserController::class, 'getUserProjects']);
//             Route::post('/{user}/projects', [UserController::class, 'assignProjects']);
//         });

//         // Rutas de Roles
//         Route::prefix('roles')->group(function () {
//             Route::get('/', [RoleController::class, 'index']);
//             Route::post('/', [RoleController::class, 'store']);
//             Route::get('/{role}', [RoleController::class, 'show']);
//             Route::put('/{role}', [RoleController::class, 'update']);
//             Route::delete('/{role}', [RoleController::class, 'destroy']);
//             Route::get('/{role}/permissions', [RoleController::class, 'permissions']);
//             Route::put('/{role}/permissions', [RoleController::class, 'updatePermissions']);
//         });

//         // Rutas de Permisos
//         Route::prefix('permissions')->group(function () {
//             Route::get('/', [PermissionController::class, 'index']);
//             Route::post('/', [PermissionController::class, 'store']);
//             Route::get('/{permission}', [PermissionController::class, 'show']);
//             Route::put('/{permission}', [PermissionController::class, 'update']);
//             Route::delete('/{permission}', [PermissionController::class, 'destroy']);
//             Route::post('/{permission}/assign-to-role', [PermissionController::class, 'assignToRole']);
//         });

//         Route::post('/register', [AuthController::class, 'register']);
//     });

//     // Rutas que requieren múltiples permisos
//     Route::middleware(['permission:view_reports,generate_reports'])->group(function () {});

//     // Rutas que requieren rol específico Y permiso específico
//     Route::middleware(['role:admin', 'permission:manage_system'])->group(function () {
//         // Rutas de configuración del sistema
//     });
// });

// // Al final de api.php, captura todas las peticiones OPTIONS
// Route::options('{any}', function () {
//     return response('', 200);
// })->where('any', '.*');
