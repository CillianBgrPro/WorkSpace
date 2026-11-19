<?php

namespace App\Http\Controllers;

use App\Models\ProjectInvitation;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InvitationController extends Controller
{
    public function accept(Request $request, string $token)
    {
        $invitation = ProjectInvitation::where('token', $token)->with('project')->first();
        abort_unless($invitation && $invitation->isPending() && $invitation->project, 404);

        $joined = $invitation->acceptFor($request->user());
        session(['active_project_id' => $invitation->project_id]);

        return redirect()->route('projects.dashboard', $invitation->project_id)
            ->with('success', $joined ? "Bienvenue dans « {$invitation->project->name} » !" : 'Vous faites déjà partie de ce projet.');
    }

    public function show(Request $request, string $token)
    {
        $invitation = ProjectInvitation::where('token', $token)->with(['project:id,name,color', 'inviter:id,name'])->first();

        if (!$invitation || !$invitation->isPending() || !$invitation->project) {
            return Inertia::render('Invitations/Show', ['state' => $invitation?->accepted_at ? 'used' : 'invalid']);
        }

        if ($user = $request->user()) {
            if ($invitation->project->isMember($user)) {
                return redirect()->route('projects.dashboard', $invitation->project_id)->with('success', 'Vous faites déjà partie de ce projet.');
            }

            // Connecté : on demande une confirmation (un simple lien ne doit pas faire rejoindre un projet).
            return Inertia::render('Invitations/Show', [
                'state'   => 'confirm',
                'token'   => $token,
                'project' => $invitation->project,
                'inviter' => $invitation->inviter?->name,
                'email'   => $invitation->email,
                'me'      => $user->only('name', 'email'),
            ]);
        }

        // Pas connecté : on garde l'invitation en session, acceptée automatiquement à la connexion.
        session(['invitation_token' => $token]);

        return Inertia::render('Invitations/Show', [
            'state'      => 'pending',
            'project'    => $invitation->project,
            'inviter'    => $invitation->inviter?->name,
            'email'      => $invitation->email,
            'hasAccount' => \App\Models\User::whereRaw('lower(email) = ?', [$invitation->email])->exists(),
        ]);
    }
}
