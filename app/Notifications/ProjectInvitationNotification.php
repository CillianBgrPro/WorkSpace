<?php

namespace App\Notifications;

use App\Models\ProjectInvitation;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ProjectInvitationNotification extends Notification
{
    use Queueable;

    public function __construct(public ProjectInvitation $invitation)
    {
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $project = $this->invitation->project;
        $inviter = $this->invitation->inviter?->name ?? 'Un membre';
        $roles = ['admin' => 'administrateur', 'editor' => 'éditeur', 'viewer' => 'lecteur'];

        return (new MailMessage)
            ->subject("{$inviter} vous invite sur « {$project->name} »")
            ->greeting('Bonjour,')
            ->line("{$inviter} vous invite à rejoindre le projet « {$project->name} » sur WorkSpace en tant que " . ($roles[$this->invitation->role] ?? 'membre') . '.')
            ->action('Rejoindre le projet', route('invitations.show', $this->invitation->token))
            ->line('Pas encore de compte ? Vous pourrez en créer un en quelques secondes (ou vous connecter avec Google).')
            ->line('Cette invitation est valable ' . ProjectInvitation::DAYS_VALID . ' jours.')
            ->salutation("À bientôt,\nL'équipe WorkSpace");
    }
}
