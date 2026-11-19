<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        // Limites anti-abus (e-mails envoyés depuis le compte Mailjet, inscriptions, envois de fichiers).
        RateLimiter::for('invitations', fn (Request $r) => [
            Limit::perMinute(5)->by('inv-min:' . $r->user()?->id),
            Limit::perDay(50)->by('inv-day:' . $r->user()?->id),
        ]);
        RateLimiter::for('registrations', fn (Request $r) => [
            Limit::perMinute(3)->by('reg-min:' . $r->ip()),
            Limit::perDay(20)->by('reg-day:' . $r->ip()),
        ]);
        RateLimiter::for('uploads', fn (Request $r) => Limit::perMinute(30)->by('up:' . ($r->user()?->id ?: $r->ip())));
        RateLimiter::for('comments', fn (Request $r) => Limit::perMinute(20)->by('com:' . ($r->user()?->id ?: $r->ip())));
    }
}
