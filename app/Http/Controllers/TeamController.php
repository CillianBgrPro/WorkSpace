<?php

namespace App\Http\Controllers;

use App\Http\Requests\AddTeamMemberRequest;
use App\Http\Requests\StoreTeamRequest;
use App\Http\Requests\UpdateTeamRequest;
use App\Models\Team;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TeamController extends Controller
{
    public function index(Request $request): Response
    {
        $teams = Team::withCount(['members'])->with('owner')->get();

        return Inertia::render('Teams/index', [
            'teams' => $teams,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Teams/Create');
    }

    public function store(StoreTeamRequest $request)
    {
        $team = Team::create([
            'name' => $request->name,
            'description' => $request->description,
            'owner_id' => $request->user()->id,
        ]);

        $team->members()->attach($request->user()->id, ['role' => 'admin']);

        return redirect()->route('teams.index')->with('success', 'Equipe creee avec succes.');
    }

    public function edit(Request $request, Team $team): Response
    {
        abort_unless($team->members()->where('user_id', $request->user()->id)->exists(), 403);

        $team->load(['members', 'owner']);

        return Inertia::render('Teams/Edit', [
            'team' => $team,
            'users' => User::select('id', 'name')->orderBy('name')->get(),
        ]);
    }

    public function update(UpdateTeamRequest $request, Team $team)
    {
        abort_unless($team->members()->where('user_id', $request->user()->id)->exists(), 403);

        $team->update($request->validated());

        return redirect()->route('teams.index')->with('success', 'Equipe mise a jour.');
    }

    public function destroy(Request $request, Team $team)
    {
        abort_unless($team->owner_id === $request->user()->id, 403);

        $team->delete();

        return redirect()->route('teams.index')->with('success', 'Equipe supprimee.');
    }

    public function addMember(AddTeamMemberRequest $request, Team $team)
    {
        abort_unless($team->members()->where('user_id', $request->user()->id)->exists(), 403);

        $team->members()->syncWithoutDetaching([
            $request->member_id => ['role' => $request->role],
        ]);

        return redirect()->back()->with('success', 'Membre ajoute.');
    }

    public function removeMember(Request $request, Team $team, User $user)
    {
        abort_unless($team->members()->where('user_id', $request->user()->id)->exists(), 403);

        $team->members()->detach($user->id);

        return redirect()->back()->with('success', 'Membre retire.');
    }
}
