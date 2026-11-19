<?php

namespace App\Console\Commands;

use App\Models\Event;
use App\Models\Task;
use App\Models\User;
use App\Notifications\WorkspaceNotification;
use Illuminate\Console\Command;

/**
 * Rappels automatiques (planifiés) :
 *  - événements : X minutes avant le début, aux participants ;
 *  - tâches : la veille de l'échéance, aux assignés (option --due).
 */
class SendReminders extends Command
{
    protected $signature = 'reminders:send {--due : Envoyer les rappels des tâches dont l\'échéance est demain}';

    protected $description = "Envoie les rappels d'événements et d'échéances";

    public function handle(): int
    {
        return $this->option('due') ? $this->dueTasks() : $this->events();
    }

    private function events(): int
    {
        $sent = 0;

        Event::where('reminder', true)
            ->whereNotNull('reminder_minutes')
            ->whereNull('reminder_sent_at')
            ->where('start_at', '>', now())
            ->where('start_at', '<=', now()->addDays(2))
            ->with(['participants', 'user'])
            ->get()
            ->filter(fn (Event $e) => $e->start_at->copy()->subMinutes($e->reminder_minutes)->lte(now()))
            ->each(function (Event $event) use (&$sent) {
                $people = $event->participants->push($event->user)->filter()->unique('id');
                $when = $event->all_day ? 'le ' . $event->start_at->translatedFormat('l j F') : 'à ' . $event->start_at->format('H\hi');
                foreach ($people as $user) {
                    $user->notify(new WorkspaceNotification(
                        type: 'event_reminder',
                        message: "Rappel : « {$event->title} » {$when}",
                        url: route('calendar.index'),
                        mail: true,
                        mailSubject: "Rappel : {$event->title}",
                    ));
                    $sent++;
                }
                $event->forceFill(['reminder_sent_at' => now()])->saveQuietly();
            });

        $this->info("{$sent} rappel(s) d'événement envoyé(s).");

        return self::SUCCESS;
    }

    private function dueTasks(): int
    {
        $tomorrow = now()->addDay()->toDateString();
        $sent = 0;

        Task::whereDate('due_date', $tomorrow)
            ->whereNotIn('status', ['done', 'completed'])
            ->where(fn ($q) => $q->whereNull('due_reminder_sent_on')->orWhere('due_reminder_sent_on', '!=', $tomorrow))
            ->with('assignedUsers', 'assignee', 'project:id,name')
            ->get()
            ->each(function (Task $task) use (&$sent, $tomorrow) {
                $people = $task->assignedUsers->push($task->assignee)->filter()->unique('id');
                foreach ($people as $user) {
                    $user->notify(new WorkspaceNotification(
                        type: 'due_soon',
                        message: "« {$task->title} » est à rendre demain",
                        url: route('tasks.show', $task),
                        mail: true,
                        mailSubject: "Échéance demain : {$task->title}",
                    ));
                    $sent++;
                }
                $task->forceFill(['due_reminder_sent_on' => $tomorrow])->saveQuietly();
            });

        $this->info("{$sent} rappel(s) d'échéance envoyé(s).");

        return self::SUCCESS;
    }
}
