<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProjectController extends Controller
{
    /**
     * Liste tous les projets de l'utilisateur connecté
     * (projets créés + projets où il est membre).
     */
    public function index()
    {
        $user = auth()->user();

        // Projets dont l'user est propriétaire
        $ownedProjects = Project::where('owner_id', $user->id)
            ->withCount('members')
            ->with(['owner:id,name'])
            ->get()
            ->map(fn($p) => array_merge($p->toArray(), ['user_role' => 'owner']));

        // Projets où l'user est membre (pas propriétaire)
        $memberProjects = $user->projects()
            ->where('owner_id', '!=', $user->id)
            ->withCount('members')
            ->with(['owner:id,name'])
            ->get()
            ->map(fn($p) => array_merge($p->toArray(), ['user_role' => $p->pivot->role]));

        $projects = $ownedProjects->concat($memberProjects)->sortByDesc('created_at')->values();

        return Inertia::render('Projects/Index', [
            'projects' => $projects,
        ]);
    }

    /**
     * Crée un nouveau projet et ajoute le créateur comme owner dans la table pivot.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string',
            'color'       => 'nullable|string|max:20',
        ]);

        $project = Project::create([
            'name'        => $data['name'],
            'description' => $data['description'] ?? null,
            'color'       => $data['color'] ?? '#6366f1',
            'owner_id'    => auth()->id(),
            'status'      => 'active',
        ]);

        // Ajouter le créateur comme owner dans le pivot
        $project->members()->attach(auth()->id(), ['role' => 'owner']);

        // Rediriger directement vers le dashboard du nouveau projet
        return redirect()->route('projects.dashboard', $project)->with('success', 'Projet créé avec succès.');
    }

    /**
     * Ouvre un projet : sync la session et redirige vers son dashboard.
     * Conservé comme fallback mais les liens pointent directement vers projects.dashboard.
     */
    public function select(Request $request, Project $project)
    {
        if (!$project->isMember(auth()->user())) {
            abort(403, 'Accès refusé à ce projet.');
        }

        return redirect()->route('projects.dashboard', $project);
    }

    /**
     * Supprime un projet (owner uniquement).
     */
    public function destroy(Request $request, Project $project)
    {
        if (!$project->isOwner(auth()->user())) {
            abort(403, 'Seul le propriétaire peut supprimer ce projet.');
        }

        // Effacer le projet actif de la session si c'est celui qu'on supprime
        if (session('active_project_id') == $project->id) {
            session()->forget(['active_project_id', 'active_project_name', 'active_project_color']);
        }

        $project->delete();

        return redirect()->route('projects.index')->with('success', 'Projet supprimé.');
    }

    /**
     * Ajoute un membre au projet par email.
     */
    public function addMember(Request $request, Project $project)
    {
        if (!$project->isOwner(auth()->user())) {
            abort(403, 'Seul le propriétaire peut ajouter des membres.');
        }

        $data = $request->validate([
            'email' => 'required|email|exists:users,email',
        ]);

        $user = User::where('email', $data['email'])->first();

        if ($project->isMember($user)) {
            return back()->withErrors(['email' => 'Cet utilisateur est déjà membre de ce projet.']);
        }

        $project->members()->attach($user->id, ['role' => 'member']);

        return back()->with('success', "{$user->name} a été ajouté au projet.");
    }

    /**
     * Retire un membre du projet (owner uniquement, ne peut pas retirer l'owner lui-même).
     */
    public function removeMember(Request $request, Project $project, User $user)
    {
        if (!$project->isOwner(auth()->user())) {
            abort(403, 'Seul le propriétaire peut retirer des membres.');
        }

        if ($project->owner_id === $user->id) {
            return back()->withErrors(['member' => 'Impossible de retirer le propriétaire du projet.']);
        }

        $project->members()->detach($user->id);

        return back()->with('success', "{$user->name} a été retiré du projet.");
    }

    /**
     * Affiche les détails d'un projet avec ses membres (pour la gestion).
     */
    public function show(Project $project)
    {
        if (!$project->isMember(auth()->user())) {
            abort(403);
        }

        $project->load(['owner:id,name,email', 'members:id,name,email']);

        return Inertia::render('Projects/Show', [
            'project' => array_merge($project->toArray(), [
                'is_owner' => $project->isOwner(auth()->user()),
            ]),
        ]);
    }
}
