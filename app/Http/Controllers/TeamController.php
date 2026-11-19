<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Team;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TeamController extends Controller
{
    /**
     * Récupère le projet actif en session et vérifie l'accès.
     */
    private function getActiveProject(): ?Project
    {
        $projectId = session('active_project_id');
        if (!$projectId) return null;
        $project = Project::find($projectId);
        if (!$project || !$project->isMember(auth()->user())) return null;
        return $project;
    }

    public function index(Request $request)
    {
        $project = $this->getActiveProject();
        if (!$project) {
            return redirect()->route('projects.index');
        }

        // Uniquement les équipes du projet actif
        $teams = Team::where('project_id', $project->id)
            ->withCount('members')
            ->with(['owner:id,name', 'members:id,name'])
            ->orderBy('name')
            ->get();

        return Inertia::render('Teams/index', [
            'teams' => $teams,
        ]);
    }

    public function create()
    {
        $project = $this->getActiveProject();
        if (!$project) {
            return redirect()->route('projects.index');
        }

        return Inertia::render('Teams/Create');
    }

    public function store(Request $request)
    {
        $project = $this->getActiveProject();
        if (!$project) {
            return redirect()->route('projects.index');
        }

        $data = $request->validate([
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $team = new Team();
        $team->name        = $data['name'];
        $team->description = $data['description'] ?? null;
        $team->owner_id    = auth()->id();
        $team->project_id  = $project->id;
        $team->save();

        // le créateur devient admin de sa team
        $team->members()->attach(auth()->id(), ['role' => 'admin']);

        // On enchaîne directement sur l'ajout des membres.
        return redirect()->route('teams.edit', $team)->with('success', 'Équipe créée. Ajoutez maintenant ses membres.');
    }

    public function edit(Request $request, Team $team)
    {
        $project = $this->getActiveProject();
        if (!$project || $team->project_id != $project->id) {
            abort(403);
        }

        $team->load(['members', 'owner']);

        // Seuls les membres du projet peuvent être ajoutés à une équipe du projet
        $users = $project->members()->select('users.id', 'users.name')->orderBy('users.name')->get();

        return Inertia::render('Teams/Edit', [
            'team'  => $team,
            'users' => $users,
        ]);
    }

    public function update(Request $request, Team $team)
    {
        $project = $this->getActiveProject();
        if (!$project || $team->project_id != $project->id) {
            abort(403);
        }

        $data = $request->validate([
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $team->name        = $data['name'];
        $team->description = $data['description'] ?? null;
        $team->save();

        return redirect()->route('teams.index')->with('success', 'Équipe mise à jour.');
    }

    public function destroy(Request $request, Team $team)
    {
        $project = $this->getActiveProject();
        if (!$project || $team->project_id != $project->id) {
            abort(403);
        }

        if ($team->owner_id != auth()->id()) {
            abort(403);
        }

        $team->delete();

        return redirect()->route('teams.index')->with('success', 'Équipe supprimée.');
    }

    public function addMember(Request $request, Team $team)
    {
        $project = $this->getActiveProject();
        if (!$project || $team->project_id != $project->id) {
            abort(403);
        }

        $data = $request->validate([
            'member_id' => 'required|exists:users,id',
            'role'      => 'required|string',
        ]);

        $team->members()->syncWithoutDetaching([
            $data['member_id'] => ['role' => $data['role']],
        ]);

        return redirect()->back()->with('success', 'Membre ajouté.');
    }

    public function removeMember(Request $request, Team $team, User $user)
    {
        $project = $this->getActiveProject();
        if (!$project || $team->project_id != $project->id) {
            abort(403);
        }

        $team->members()->detach($user->id);

        return redirect()->back()->with('success', 'Membre retiré.');
    }
}
