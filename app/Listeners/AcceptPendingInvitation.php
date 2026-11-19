<?php

namespace App\Listeners;

use App\Models\ProjectInvitation;
use Illuminate\Auth\Events\Login;

/** À la connexion (mot de passe, inscription ou Google), accepte l'invitation ouverte avant. */
class AcceptPendingInvitation
{
    public function handle(Login $event): void
    {
        $token = session()->pull('invitation_token');
        if (!$token) {
            return;
        }

        $invitation = ProjectInvitation::where('token', $token)->first();

        // Le lien a été reçu sur cette adresse : elle est prouvée, inutile de la revérifier.
        if ($invitation && $invitation->isPending() && !$event->user->hasVerifiedEmail()
            && strcasecmp($invitation->email, $event->user->email) === 0) {
            $event->user->markEmailAsVerified();
        }
        if ($invitation && $invitation->isPending() && $invitation->project && $invitation->acceptFor($event->user)) {
            session([
                'active_project_id' => $invitation->project_id,
                'url.intended'      => route('projects.dashboard', $invitation->project_id),
            ]);
            session()->flash('success', "Bienvenue dans « {$invitation->project->name} » !");
        }
    }
}
