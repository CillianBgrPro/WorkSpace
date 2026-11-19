<?php

namespace App\Notifications;

use App\Models\Project;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AddedToProjectNotification extends Notification
{
    use Queueable;

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
