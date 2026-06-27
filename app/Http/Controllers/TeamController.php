<?php

namespace App\Http\Controllers;

use App\Models\Team;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TeamController extends Controller
{
    public function index(Request $request)
    {
        // recupere toutes les teams avec le nb de membres
        $teams = Team::withCount(['members'])->with('owner')->get();

        return Inertia::render('Teams/index', [
            'teams' => $teams,
        ]);
    }

    public function create()
    {
        return Inertia::render('Teams/Create');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $team = new Team();
        $team->name = $data['name'];
        $team->description = $data['description'] ?? null;
        $team->owner_id = auth()->id();
        $team->save();

        // le createur devient admin de sa team
        $team->members()->attach(auth()->id(), ['role' => 'admin']);

        return redirect()->route('teams.index')->with('success', 'Equipe creee avec succes.');
    }

    public function edit(Request $request, Team $team)
    {
        // verif que l'user est bien membre
        $isMember = $team->members()->where('user_id', auth()->id())->exists();
        if (!$isMember) {
            abort(403);
        }

        $team->load(['members', 'owner']);
        $users = User::select('id', 'name')->orderBy('name')->get();

        return Inertia::render('Teams/Edit', [
            'team' => $team,
            'users' => $users,
        ]);
    }

    public function update(Request $request, Team $team)
    {
        $isMember = $team->members()->where('user_id', auth()->id())->exists();
        if (!$isMember) {
            abort(403);
        }

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $team->name = $data['name'];
        $team->description = $data['description'] ?? null;
        $team->save();

        return redirect()->route('teams.index')->with('success', 'Equipe mise a jour.');
    }

    public function destroy(Request $request, Team $team)
    {
        if ($team->owner_id != auth()->id()) {
            abort(403);
        }

        $team->delete();

        return redirect()->route('teams.index')->with('success', 'Equipe supprimee.');
    }

    public function addMember(Request $request, Team $team)
    {
        $isMember = $team->members()->where('user_id', auth()->id())->exists();
        if (!$isMember) {
            abort(403);
        }

        $data = $request->validate([
            'member_id' => 'required|exists:users,id',
            'role' => 'required|string',
        ]);

        $team->members()->syncWithoutDetaching([
            $data['member_id'] => ['role' => $data['role']],
        ]);

        return redirect()->back()->with('success', 'Membre ajoute.');
    }

    public function removeMember(Request $request, Team $team, User $user)
    {
        $isMember = $team->members()->where('user_id', auth()->id())->exists();
        if (!$isMember) {
            abort(403);
        }

        $team->members()->detach($user->id);

        return redirect()->back()->with('success', 'Membre retire.');
    }
}
