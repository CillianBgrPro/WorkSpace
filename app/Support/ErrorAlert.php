<?php

namespace App\Support;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Throwable;

/**
 * Alerte e-mail quand une erreur serveur survient en production.
 * Limité à 1 e-mail par erreur et par heure, 20 par jour au total.
 */
class ErrorAlert
{
    /** Erreurs provoquées par l'utilisateur, déjà gérées proprement : inutile d'alerter. */
    private const IGNORED = [
        \Laravel\Socialite\Two\InvalidStateException::class,
    ];

    public static function send(Throwable $e): void
    {
        $to = config('services.error_alerts.email');
        if (!$to || !app()->environment('production') || in_array($e::class, self::IGNORED, true)) {
            return;
        }

        try {
            $signature = sha1($e::class . $e->getFile() . $e->getLine());
            if (!Cache::add("error-alert:{$signature}", true, now()->addHour())) {
                return;
            }
            $dayKey = 'error-alert:count:' . now()->toDateString();
            Cache::add($dayKey, 0, now()->endOfDay());
            if (Cache::increment($dayKey) > 20) {
                return;
            }

            $request = request();
            $body = implode("\n", [
                'Une erreur est survenue sur ' . config('app.url'),
                '',
                $e::class . ' : ' . Str::limit($e->getMessage(), 500),
                'Fichier : ' . str_replace(base_path() . '/', '', $e->getFile()) . ':' . $e->getLine(),
                'URL : ' . ($request ? $request->method() . ' ' . $request->fullUrl() : 'console'),
                'Utilisateur : ' . (auth()->id() ? '#' . auth()->id() : 'invité'),
                'Date : ' . now()->format('d/m/Y H:i:s'),
                '',
                'Trace :',
                Str::limit($e->getTraceAsString(), 4000),
                '',
                "Les erreurs identiques ne sont pas renvoyées pendant une heure. Détails complets : storage/logs/laravel.log",
            ]);

            // Envoi direct (pas de file d'attente : l'erreur peut justement venir de la base).
            Mail::to($to)->send(new \App\Mail\ErrorAlertMail(
                '[WorkSpace] Erreur : ' . Str::limit(class_basename($e) . ' — ' . $e->getMessage(), 120),
                $body,
            ));
        } catch (Throwable) {
            // Une alerte ne doit jamais provoquer d'autre erreur.
        }
    }
}
