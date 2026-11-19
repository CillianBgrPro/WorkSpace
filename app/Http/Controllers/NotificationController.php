<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $items = $request->user()->notifications()->latest()->limit(30)->get()
            ->map(fn ($n) => [
                'id'         => $n->id,
                'read'       => $n->read_at !== null,
                'created_at' => $n->created_at,
                ...$n->data,
            ]);

        return response()->json([
            'items'  => $items,
            'unread' => $request->user()->unreadNotifications()->count(),
        ]);
    }

    /** Ouvre la notification : la marque lue puis redirige vers sa cible. */
    public function open(Request $request, string $id): RedirectResponse
    {
        $notification = $request->user()->notifications()->findOrFail($id);
        $notification->markAsRead();

        // Uniquement des redirections internes : on ne garde que le chemin, jamais un autre domaine.
        $parts = parse_url($notification->data['url'] ?? '') ?: [];
        $sameHost = !isset($parts['host']) || strcasecmp($parts['host'], parse_url(config('app.url'), PHP_URL_HOST)) === 0;
        $path = $parts['path'] ?? '';
        $url = $sameHost && str_starts_with($path, '/') && !str_starts_with($path, '//')
            ? $path . (isset($parts['query']) ? '?' . $parts['query'] : '') . (isset($parts['fragment']) ? '#' . $parts['fragment'] : '')
            : route('projects.index', absolute: false);

        return redirect()->to($url);
    }

    public function readAll(Request $request)
    {
        $request->user()->unreadNotifications->markAsRead();

        return response()->noContent();
    }
}
