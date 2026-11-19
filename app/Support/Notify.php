<?php

namespace App\Support;

use App\Models\Task;
use App\Models\TaskComment;
use App\Models\User;
use App\Notifications\WorkspaceNotification;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

/** Points d'entrée uniques pour les notifications métier. */
class Notify
{
    /** Personnes nouvellement assignées à une tâche (hors auteur de l'action). */
    public static function taskAssigned(Task $task, iterable $userIds, User $by): void
    {
        User::whereIn('id', collect($userIds)->reject(fn ($id) => (int) $id === $by->id))->get()
            ->each(fn (User $u) => $u->notify(new WorkspaceNotification(
                type: 'task_assigned',
                message: "{$by->name} vous a assigné « {$task->title} »",
                url: route('tasks.show', $task),
                actor: $by->name,
                mail: true,
                mailSubject: "Nouvelle tâche : {$task->title}",
            )));
    }

    /** Membres du projet mentionnés avec @Prénom Nom (ou @Prénom s'il est unique). */
    public static function mentionedIn(string $body, Collection $members): Collection
    {
        $text = Str::lower($body);

        return $members->filter(function (User $m) use ($text, $members) {
            if (str_contains($text, '@' . Str::lower($m->name))) {
                return true;
            }
            $first = Str::lower(strtok($m->name, ' '));
            $unique = $members->filter(fn ($o) => Str::lower(strtok($o->name, ' ')) === $first)->count() === 1;

            return $unique && preg_match('/@' . preg_quote($first, '/') . '(?![\p{L}\p{N}])/u', $text);
        });
    }

    /** Nouveau commentaire : mentions + personnes concernées par la tâche. */
    public static function commentAdded(TaskComment $comment, User $by): void
    {
        $task = $comment->task;
        $members = $task->project->members()->get()->push($task->project->owner)->filter()->unique('id');
        $excerpt = Str::limit($comment->body, 140);
        $url = route('tasks.show', $task) . '#commentaires';

        $mentioned = self::mentionedIn($comment->body, $members)->reject(fn ($u) => $u->id === $by->id);
        $mentioned->each(fn (User $u) => $u->notify(new WorkspaceNotification(
            type: 'mention',
            message: "{$by->name} vous a mentionné dans « {$task->title} »",
            url: $url,
            actor: $by->name,
            mail: true,
            excerpt: $excerpt,
        )));

        // Créateur et assignés de la tâche, sauf l'auteur et ceux déjà notifiés par la mention.
        $concerned = collect([$task->user_id, $task->assignee_id])
            ->merge($task->assignedUsers()->pluck('users.id'))
            ->filter()->unique()
            ->reject(fn ($id) => $id === $by->id || $mentioned->contains('id', $id));

        User::whereIn('id', $concerned)->get()->each(fn (User $u) => $u->notify(new WorkspaceNotification(
            type: 'comment',
            message: "{$by->name} a commenté « {$task->title} »",
            url: $url,
            actor: $by->name,
            excerpt: $excerpt,
        )));
    }
}
