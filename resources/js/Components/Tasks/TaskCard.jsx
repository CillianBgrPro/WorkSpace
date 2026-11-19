import { Link } from '@inertiajs/react';
import { Bars3BottomLeftIcon, RectangleStackIcon } from '@heroicons/react/16/solid';
import { DueBadge, PriorityBadge } from '@/Components/ui/Badge';
import { AvatarStack } from '@/Components/ui/Avatar';
import { isDone, assigneesOf } from '@/lib/taskMeta';

/** Carte de tâche (kanban) : titre, priorité, échéance, assigné. */
export default function TaskCard({ task, dragging = false }) {
    const done = isDone(task.status);

    return (
        <Link
            href={`/tasks/${task.id}`}
            className={`block rounded-lg border bg-white p-3 shadow-sm transition hover:border-indigo-300 hover:shadow focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500 ${
                dragging ? 'rotate-1 border-indigo-300 opacity-60' : 'border-gray-200'
            }`}
        >
            <p className={`text-sm font-medium leading-snug ${done ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{task.title}</p>

            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                <PriorityBadge priority={task.priority} compact />
                {task.due_date && <DueBadge date={task.due_date} done={done} />}
                {task.description && (
                    <span title="Contient une description" className="text-gray-300">
                        <Bars3BottomLeftIcon className="h-3.5 w-3.5" />
                    </span>
                )}
                {task.subtasks_count > 0 && (
                    <span title={`${task.subtasks_count} sous-tâche(s)`} className="inline-flex items-center gap-0.5 text-xs text-gray-400">
                        <RectangleStackIcon className="h-3.5 w-3.5" />
                        {task.subtasks_count}
                    </span>
                )}
                <span className="ml-auto">
                    <AvatarStack names={assigneesOf(task).map((u) => u.name)} max={3} />
                </span>
            </div>
        </Link>
    );
}
