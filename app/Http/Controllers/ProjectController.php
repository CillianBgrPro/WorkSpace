<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\User;
use App\Models\ProjectInvitation;
use App\Notifications\ProjectInvitationNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;
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
     * Invite une personne par e-mail : ajout direct si elle a déjà un compte,
     * sinon e-mail d'invitation avec un lien pour créer son compte et rejoindre le projet.
     */
    public function addMember(Request $request, Project $project)
    {
        if (!$project->isAdmin(auth()->user())) {
            abort(403, 'Seuls le propriétaire et les administrateurs peuvent inviter.');
        }

        $data = $request->validate([
            'email' => 'required|email|max:255',
            'role'  => 'nullable|in:admin,editor,viewer',
        ], [
            'email.required' => "Indiquez l'adresse e-mail de la personne à inviter.",
            'email.email'    => "Cette adresse e-mail n'est pas valide.",
        ]);
        $email = strtolower(trim($data['email']));
        $role = $data['role'] ?? 'editor';

        $user = User::whereRaw('lower(email) = ?', [$email])->first();

        if ($user) {
            if ($project->isMember($user)) {
                return back()->withErrors(['email' => "{$user->name} fait déjà partie du projet."]);
            }
            $project->members()->attach($user->id, ['role' => $role]);
            $user->notify(new \App\Notifications\AddedToProjectNotification($project, auth()->user()));

            return back()->with('success', "{$user->name} a été ajouté au projet.");
        }

        $invitation = ProjectInvitation::issue($project, auth()->user(), $email, $role);
        Notification::route('mail', $email)->notify(new ProjectInvitationNotification($invitation));

        return back()->with('success', "Invitation envoyée à {$email}.");
    }

    /** Change le rôle d'un membre (pas celui du propriétaire). */
    public function updateMemberRole(Request $request, Project $project, User $user)
    {
        if (!$project->isAdmin(auth()->user()) || $project->owner_id === $user->id) {
            abort(403);
        }
        // Un administrateur ne peut pas promouvoir/rétrograder d'autres administrateurs : réservé au propriétaire.
        $current = $project->getMemberRole($user);
        $data = $request->validate(['role' => 'required|in:admin,editor,viewer']);
        if (!$project->isOwner(auth()->user()) && ($current === 'admin' || $data['role'] === 'admin')) {
            abort(403, 'Seul le propriétaire gère les administrateurs.');
        }

        $project->members()->updateExistingPivot($user->id, ['role' => $data['role']]);

        $labels = ['admin' => 'administrateur', 'editor' => 'éditeur', 'viewer' => 'lecteur'];

        return back()->with('success', "{$user->name} est maintenant {$labels[$data['role']]}.");
    }

    /**
     * Retire un membre du projet (propriétaire ou admin ; jamais le propriétaire lui-même).
     */
    public function removeMember(Request $request, Project $project, User $user)
    {
        $self = auth()->id() === $user->id;
        if (!$self && !$project->isAdmin(auth()->user())) {
            abort(403, 'Seuls le propriétaire et les administrateurs peuvent retirer des membres.');
        }

        if ($project->owner_id === $user->id) {
            return back()->withErrors(['member' => 'Impossible de retirer le propriétaire du projet.']);
        }
        if (!$self && !$project->isOwner(auth()->user()) && $project->getMemberRole($user) === 'admin') {
            abort(403, 'Seul le propriétaire peut retirer un administrateur.');
        }

        $project->members()->detach($user->id);

        if ($self) {
            session()->forget(['active_project_id', 'active_project_name', 'active_project_color']);

            return redirect()->route('projects.index')->with('success', "Vous avez quitté « {$project->name} ».");
        }

        return back()->with('success', "{$user->name} a été retiré du projet.");
    }

    public function resendInvitation(Project $project, ProjectInvitation $invitation)
    {
        abort_unless($project->isAdmin(auth()->user()) && $invitation->project_id === $project->id, 403);

        $invitation = ProjectInvitation::issue($project, auth()->user(), $invitation->email, $invitation->role);
        Notification::route('mail', $invitation->email)->notify(new ProjectInvitationNotification($invitation));

        return back()->with('success', "Invitation renvoyée à {$invitation->email}.");
    }

    public function cancelInvitation(Project $project, ProjectInvitation $invitation)
    {
        abort_unless($project->isAdmin(auth()->user()) && $invitation->project_id === $project->id, 403);

        $invitation->delete();

        return back()->with('success', 'Invitation annulée.');
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

        $canManage = $project->isAdmin(auth()->user());

        return Inertia::render('Projects/Show', [
            'project' => array_merge($project->toArray(), [
                'is_owner'   => $project->isOwner(auth()->user()),
                'can_manage' => $canManage,
                'my_role'    => $project->getMemberRole(auth()->user()),
            ]),
            'invitations' => $canManage
                ? ProjectInvitation::where('project_id', $project->id)->whereNull('accepted_at')
                    ->with('inviter:id,name')->latest()->get(['id', 'email', 'role', 'invited_by', 'expires_at', 'created_at'])
                : [],
        ]);
    }
}
