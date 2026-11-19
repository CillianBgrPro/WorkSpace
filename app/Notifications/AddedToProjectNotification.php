<?php

namespace App\Notifications;

use App\Models\Project;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AddedToProjectNotification extends Notification implements ShouldQueue
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

    public function __construct(public Project $project, public User $by)
    {
    }

    public function via(object $notifiable): array
    {
        return $notifiable->email_notifications ? ['database', 'mail'] : ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type'    => 'project_added',
            'message' => "{$this->by->name} vous a ajouté au projet « {$this->project->name} »",
            'url'     => route('projects.dashboard', $this->project),
            'actor'   => $this->by->name,
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("Vous avez rejoint « {$this->project->name} »")
            ->line("{$this->by->name} vous a ajouté au projet « {$this->project->name} » sur WorkSpace.")
            ->action('Ouvrir le projet', route('projects.dashboard', $this->project))
            ->salutation("À bientôt,\nL'équipe WorkSpace");
    }
}
