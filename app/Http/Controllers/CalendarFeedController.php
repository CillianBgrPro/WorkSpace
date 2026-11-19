<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\Task;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Response;

/**
 * Flux iCal personnel (abonnement depuis Google Agenda, Apple Calendrier, Outlook…).
 * Accessible sans session : le jeton secret dans l'URL fait office d'authentification.
 */
class CalendarFeedController extends Controller
{
    public function __invoke(string $token): Response
    {
        $user = User::where('calendar_token', $token)->firstOrFail();
        $projectIds = $user->projects()->pluck('projects.id')
            ->merge($user->ownedProjects()->pluck('id'))->unique();

        $events = Event::whereIn('project_id', $projectIds)
            ->where(fn ($q) => $q->where('user_id', $user->id)
                ->orWhereHas('participants', fn ($p) => $p->where('users.id', $user->id)))
            ->where('start_at', '>=', now()->subMonths(3))
            ->with('project:id,name')
            ->get();

        $tasks = Task::whereIn('project_id', $projectIds)
            ->whereNotNull('due_date')
            ->whereNotIn('status', ['done', 'completed'])
            ->where(fn ($q) => $q->where('assignee_id', $user->id)
                ->orWhereHas('assignedUsers', fn ($a) => $a->where('users.id', $user->id)))
            ->with('project:id,name')
            ->get();

        $lines = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//WorkSpace//FR',
            'CALSCALE:GREGORIAN',
            'METHOD:PUBLISH',
            'X-WR-CALNAME:WorkSpace',
            'X-WR-TIMEZONE:' . config('app.timezone'),
            'REFRESH-INTERVAL;VALUE=DURATION:PT1H',
        ];

        $stamp = now()->utc()->format('Ymd\THis\Z');

        foreach ($events as $event) {
            $start = Carbon::parse($event->start_at);
            $end = $event->end_at ? Carbon::parse($event->end_at) : null;
            $lines[] = 'BEGIN:VEVENT';
            $lines[] = 'UID:event-' . $event->id . '@workspace.baugercillian.fr';
            $lines[] = 'DTSTAMP:' . $stamp;
            if ($event->all_day) {
                $lines[] = 'DTSTART;VALUE=DATE:' . $start->format('Ymd');
                $lines[] = 'DTEND;VALUE=DATE:' . ($end ?? $start)->copy()->addDay()->format('Ymd');
            } else {
                $lines[] = 'DTSTART:' . $start->copy()->utc()->format('Ymd\THis\Z');
                $lines[] = 'DTEND:' . ($end ?? $start->copy()->addHour())->copy()->utc()->format('Ymd\THis\Z');
            }
            $lines[] = 'SUMMARY:' . self::escape($event->title);
            if ($event->description) {
                $lines[] = 'DESCRIPTION:' . self::escape($event->description);
            }
            $lines[] = 'CATEGORIES:' . self::escape($event->project->name ?? 'WorkSpace');
            $lines[] = 'URL:' . route('calendar.index');
            if ($event->reminder && $event->reminder_minutes) {
                $lines[] = 'BEGIN:VALARM';
                $lines[] = 'ACTION:DISPLAY';
                $lines[] = 'DESCRIPTION:' . self::escape($event->title);
                $lines[] = 'TRIGGER:-PT' . (int) $event->reminder_minutes . 'M';
                $lines[] = 'END:VALARM';
            }
            $lines[] = 'END:VEVENT';
        }

        foreach ($tasks as $task) {
            $due = Carbon::parse($task->due_date);
            $lines[] = 'BEGIN:VEVENT';
            $lines[] = 'UID:task-' . $task->id . '@workspace.baugercillian.fr';
            $lines[] = 'DTSTAMP:' . $stamp;
            $lines[] = 'DTSTART;VALUE=DATE:' . $due->format('Ymd');
            $lines[] = 'DTEND;VALUE=DATE:' . $due->copy()->addDay()->format('Ymd');
            $lines[] = 'SUMMARY:' . self::escape('✓ ' . $task->title);
            $lines[] = 'DESCRIPTION:' . self::escape('Échéance de tâche · ' . ($task->project->name ?? ''));
            $lines[] = 'URL:' . route('tasks.show', $task);
            $lines[] = 'TRANSP:TRANSPARENT';
            $lines[] = 'END:VEVENT';
        }

        $lines[] = 'END:VCALENDAR';

        return response(implode("\r\n", array_map([self::class, 'fold'], $lines)) . "\r\n", 200, [
            'Content-Type'        => 'text/calendar; charset=utf-8',
            'Content-Disposition' => 'inline; filename="workspace.ics"',
            'Cache-Control'       => 'private, max-age=900',
        ]);
    }

    private static function escape(string $text): string
    {
        return str_replace(["\\", ';', ',', "\r\n", "\n"], ['\\\\', '\;', '\,', '\n', '\n'], $text);
    }

    /** Lignes iCal limitées à 75 octets (RFC 5545), coupées sans casser l'UTF-8. */
    private static function fold(string $line): string
    {
        $out = '';
        while (strlen($line) > 75) {
            $cut = 75;
            while ($cut > 0 && (ord($line[$cut]) & 0xC0) === 0x80) {
                $cut--;
            }
            $out .= substr($line, 0, $cut) . "\r\n ";
            $line = substr($line, $cut);
        }

        return $out . $line;
    }
}
