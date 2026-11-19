<?php

namespace App\Http\Controllers;

use App\Models\ProjectInvitation;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InvitationController extends Controller
{
    public function show(Request $request, string $token)
    {
        $invitation = ProjectInvitation::where('token', $token)->with(['project:id,name,color', 'inviter:id,name'])->first();

        if (!$invitation || !$invitation->isPending() || !$invitation->project) {
            return Inertia::render('Invitations/Show', ['state' => $invitation?->accepted_at ? 'used' : 'invalid']);
        }

        if ($user = $request->user()) {
            $invitation->acceptFor($user);
            session(['active_project_id' => $invitation->project_id]);

            return redirect()->route('projects.dashboard', $invitation->project_id)
                ->with('success', "Bienvenue dans « {$invitation->project->name} » !");
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
