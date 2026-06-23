<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\Team;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EventController extends Controller
{

    public function index(Request $request)
    {

        $teamIds = $request->user()->teams()->pluck('teams.id');

        $events = Event::query()
            ->where(function ($q) use ($request, $teamIds) {
                $q->where('user_id', $request->user()->id)
                  ->orWhereHas('participants', fn($q) => $q->where('users.id', $request->user()->id))
                  ->orWhereHas('teams', fn($q) => $q->whereIn('teams.id', $teamIds->toArray()));
            })
            ->with(['user:id,name', 'participants:id,name', 'teams:id,name'])
            ->get()
            ->map(fn($event) => [
                'id'              => $event->id,
                'title'           => $event->title,
                'start'           => $event->start_at->toIso8601String(),
                'end'             => $event->end_at?->toIso8601String(),
                'allDay'          => $event->all_day,
                'color'           => $event->color ?? $this->typeColor($event->type),
                'extendedProps'   => [
                    'description'      => $event->description,
                    'type'             => $event->type,
                    'creator'          => $event->user->name,
                    'teams'            => $event->teams->pluck('name'),
                    'participants'     => $event->participants->pluck('name'),
                    'reminder'         => $event->reminder,
                    'reminder_minutes' => $event->reminder_minutes,
                ],
            ]);

        return Inertia::render('Calendar/Index', [
            'events' => $events,
            'users'  => User::select('id', 'name')->orderBy('name')->get(),
            'teams'  => $request->user()->teams()->select('teams.id', 'teams.name')->orderBy('name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title'            => 'required|string|max:255',
            'description'      => 'nullable|string',
            'type'             => 'required|in:event,meeting,deadline',
            'color'            => 'nullable|string',
            'start_at'         => 'required|date',
            'end_at'           => 'nullable|date|after_or_equal:start_at',
            'all_day'          => 'boolean',
            'reminder'         => 'boolean',
            'reminder_minutes' => 'nullable|integer',
            'participants'     => 'nullable|array',
            'participants.*'   => 'exists:users,id',
            'teams'            => 'nullable|array',
            'teams.*'          => 'exists:teams,id',
        ]);

        $userTeamIds = $request->user()->teams()->pluck('teams.id')->toArray();
        if (!empty($data['teams'])) {
            foreach ($data['teams'] as $teamId) {
                abort_unless(in_array($teamId, $userTeamIds), 403);
            }
        }

        $event = Event::create(collect($data)->except(['teams', 'participants'])->merge(['user_id' => $request->user()->id])->toArray());

        if (!empty($data['participants'])) {
            $event->participants()->sync($data['participants']);
        }

        if (!empty($data['teams'])) {
            $event->teams()->sync($data['teams']);
        }

        return back()->with('success', 'Événement créé.');
    }

    public function update(Request $request, Event $event)
    {
        abort_unless($event->user_id === $request->user()->id, 403);

        $data = $request->validate([
            'title'            => 'required|string|max:255',
            'description'      => 'nullable|string',
            'type'             => 'required|in:event,meeting,deadline',
            'color'            => 'nullable|string',
            'start_at'         => 'required|date',
            'end_at'           => 'nullable|date|after_or_equal:start_at',
            'all_day'          => 'boolean',
            'reminder'         => 'boolean',
            'reminder_minutes' => 'nullable|integer',
            'participants'     => 'nullable|array',
            'participants.*'   => 'exists:users,id',
            'teams'            => 'nullable|array',
            'teams.*'          => 'exists:teams,id',
        ]);

        $userTeamIds = $request->user()->teams()->pluck('teams.id')->toArray();
        if (!empty($data['teams'])) {
            foreach ($data['teams'] as $teamId) {
                abort_unless(in_array($teamId, $userTeamIds), 403);
            }
        }

        $event->update(collect($data)->except(['teams', 'participants'])->toArray());
        $event->participants()->sync($data['participants'] ?? []);
        $event->teams()->sync($data['teams'] ?? []);

        return back()->with('success', 'Événement mis à jour.');
    }

    public function destroy(Request $request, Event $event)
    {
        abort_unless($event->user_id === $request->user()->id, 403);
        $event->delete();

        return back()->with('success', 'Événement supprimé.');
    }


    public function move(Request $request, Event $event)
    {
        abort_unless($event->user_id === $request->user()->id, 403);

        $data = $request->validate([
            'start_at' => 'required|date',
            'end_at'   => 'nullable|date',
        ]);

        $event->update($data);

        return redirect()->back()->with('success', 'Événement déplacé.');
    }

    private function typeColor(string $type): string
    {
        return match($type) {
            'meeting'  => '#7c3aed',
            'deadline' => '#dc2626',
            default    => '#2563eb',
        };
    }
}