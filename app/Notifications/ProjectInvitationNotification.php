<?php

namespace App\Notifications;

use App\Models\ProjectInvitation;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ProjectInvitationNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /** Retry si le serveur d'e-mails est momentanément indisponible. */
    public int $tries = 3;

    public array $backoff = [30, 120];

    /** La cloche est mise à jour tout de suite ; seul l'e-mail part en arrière-plan. */
    public function viaConnections(): array
    {
        return ['database' => 'sync'];
    }

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
