<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
            \App\Http\Middleware\SecurityHeaders::class,
        ]);

        $middleware->alias([
            'project.editor' => \App\Http\Middleware\EnsureCanEditProject::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Alerte e-mail en production (voir App\Support\ErrorAlert).
        $exceptions->report(fn (Throwable $e) => \App\Support\ErrorAlert::send($e));
    })->create();
