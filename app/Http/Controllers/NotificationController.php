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

        $url = $notification->data['url'] ?? route('projects.index');
        // Uniquement des redirections internes.
        if (!str_starts_with($url, config('app.url')) && !str_starts_with($url, '/')) {
            $url = route('projects.index');
        }

        return redirect()->to($url);
    }

    public function readAll(Request $request)
    {
        $request->user()->unreadNotifications->markAsRead();

        return response()->noContent();
    }
}
