<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Notification générique : toujours visible dans la cloche, envoyée aussi par e-mail
 * quand $mail est vrai et que l'utilisateur n'a pas désactivé les e-mails.
 */
class WorkspaceNotification extends Notification
{
    use Queueable;

    public function __construct(
        public string $type,
        public string $message,
        public string $url,
        public ?string $actor = null,
        public bool $mail = false,
        public ?string $mailSubject = null,
        public ?string $excerpt = null,
    ) {
    }

    public function via(object $notifiable): array
    {
        return $this->mail && ($notifiable->email_notifications ?? true) ? ['database', 'mail'] : ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return array_filter([
            'type'    => $this->type,
            'message' => $this->message,
            'url'     => $this->url,
            'actor'   => $this->actor,
            'excerpt' => $this->excerpt,
        ], fn ($v) => $v !== null);
    }

    public function toMail(object $notifiable): MailMessage
    {
        $mail = (new MailMessage)
            ->subject($this->mailSubject ?? $this->message)
            ->greeting('Bonjour ' . strtok($notifiable->name ?? '', ' ') . ',')
            ->line($this->message . '.');

        if ($this->excerpt) {
            $mail->line('« ' . $this->excerpt . ' »');
        }

        return $mail
            ->action('Ouvrir dans WorkSpace', $this->url)
            ->line('Vous pouvez désactiver ces e-mails dans Mon compte → Préférences.')
            ->salutation("À bientôt,\nL'équipe WorkSpace");
    }
}
