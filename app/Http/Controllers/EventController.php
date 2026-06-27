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
        $user = auth()->user();
        $teamIds = $user->teams()->pluck('teams.id')->toArray();

        // on recupere tous les events de l'user (ses propres + ceux ou il est invité + ceux de ses teams)
        $all_events = Event::with(['user', 'participants', 'teams'])->get();

        $events = [];

        foreach ($all_events as $event) {
            $isOwner = $event->user_id == $user->id;
            $isParticipant = $event->participants->contains('id', $user->id);
            $isInTeam = false;

            foreach ($event->teams as $team) {
                if (in_array($team->id, $teamIds)) {
                    $isInTeam = true;
                }
            }

            if ($isOwner || $isParticipant || $isInTeam) {
                $color = $event->color;
                if (!$color) {
                    if ($event->type == 'meeting') {
                        $color = '#7c3aed';
                    } elseif ($event->type == 'deadline') {
                        $color = '#dc2626';
                    } else {
                        $color = '#2563eb';
                    }
                }

                $events[] = [
                    'id'            => $event->id,
                    'title'         => $event->title,
                    'start'         => $event->start_at->toIso8601String(),
                    'end'           => $event->end_at ? $event->end_at->toIso8601String() : null,
                    'allDay'        => $event->all_day,
                    'color'         => $color,
                    'extendedProps' => [
                        'description'      => $event->description,
                        'type'             => $event->type,
                        'creator'          => $event->user->name,
                        'teams'            => $event->teams->pluck('name'),
                        'participants'     => $event->participants->pluck('name'),
                        'reminder'         => $event->reminder,
                        'reminder_minutes' => $event->reminder_minutes,
                    ],
                ];
            }
        }

        $users = User::select('id', 'name')->orderBy('name')->get();
        $teams = $user->teams()->select('teams.id', 'teams.name')->orderBy('name')->get();

        return Inertia::render('Calendar/Index', [
            'events' => $events,
            'users'  => $users,
            'teams'  => $teams,
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
            'end_at'           => 'nullable|date',
            'all_day'          => 'boolean',
            'reminder'         => 'boolean',
            'reminder_minutes' => 'nullable|integer',
            'participants'     => 'nullable|array',
            'participants.*'   => 'exists:users,id',
            'teams'            => 'nullable|array',
            'teams.*'          => 'exists:teams,id',
        ]);

        // verif que les teams appartiennent bien a l'user
        $userTeamIds = auth()->user()->teams()->pluck('teams.id')->toArray();
        if (!empty($data['teams'])) {
            foreach ($data['teams'] as $teamId) {
                if (!in_array($teamId, $userTeamIds)) {
                    abort(403);
                }
            }
        }

        $event = new Event();
        $event->user_id = auth()->id();
        $event->title = $data['title'];
        $event->description = $data['description'] ?? null;
        $event->type = $data['type'];
        $event->color = $data['color'] ?? null;
        $event->start_at = $data['start_at'];
        $event->end_at = $data['end_at'] ?? null;
        $event->all_day = $data['all_day'] ?? false;
        $event->reminder = $data['reminder'] ?? false;
        $event->reminder_minutes = $data['reminder_minutes'] ?? null;
        $event->save();

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
        if ($event->user_id != auth()->id()) {
            abort(403);
        }

        $data = $request->validate([
            'title'            => 'required|string|max:255',
            'description'      => 'nullable|string',
            'type'             => 'required|in:event,meeting,deadline',
            'color'            => 'nullable|string',
            'start_at'         => 'required|date',
            'end_at'           => 'nullable|date',
            'all_day'          => 'boolean',
            'reminder'         => 'boolean',
            'reminder_minutes' => 'nullable|integer',
            'participants'     => 'nullable|array',
            'participants.*'   => 'exists:users,id',
            'teams'            => 'nullable|array',
            'teams.*'          => 'exists:teams,id',
        ]);

        $userTeamIds = auth()->user()->teams()->pluck('teams.id')->toArray();
        if (!empty($data['teams'])) {
            foreach ($data['teams'] as $teamId) {
                if (!in_array($teamId, $userTeamIds)) {
                    abort(403);
                }
            }
        }

        $event->title = $data['title'];
        $event->description = $data['description'] ?? null;
        $event->type = $data['type'];
        $event->color = $data['color'] ?? null;
        $event->start_at = $data['start_at'];
        $event->end_at = $data['end_at'] ?? null;
        $event->all_day = $data['all_day'] ?? false;
        $event->reminder = $data['reminder'] ?? false;
        $event->reminder_minutes = $data['reminder_minutes'] ?? null;
        $event->save();

        $event->participants()->sync($data['participants'] ?? []);
        $event->teams()->sync($data['teams'] ?? []);

        return back()->with('success', 'Événement mis à jour.');
    }

    public function destroy(Request $request, Event $event)
    {
        if ($event->user_id != auth()->id()) {
            abort(403);
        }

        $event->delete();

        return back()->with('success', 'Événement supprimé.');
    }

    public function move(Request $request, Event $event)
    {
        if ($event->user_id != auth()->id()) {
            abort(403);
        }

        $data = $request->validate([
            'start_at' => 'required|date',
            'end_at'   => 'nullable|date',
        ]);

        $event->start_at = $data['start_at'];
        $event->end_at = $data['end_at'] ?? null;
        $event->save();

        return redirect()->back()->with('success', 'Événement déplacé.');
    }
}