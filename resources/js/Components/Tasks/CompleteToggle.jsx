import { router } from '@inertiajs/react';
import { CheckIcon } from '@heroicons/react/16/solid';
import { isDone } from '@/lib/taskMeta';

export function changeStatus(task, status, only = ['tasks', 'flash']) {
    router.patch(route('tasks.status', task.id), { status }, { preserveScroll: true, preserveState: true, only });
}

/** Case à cocher ronde : termine / rouvre une tâche en un clic. */
export function CompleteToggle({ task, disabled, only }) {
    const done = isDone(task.status);
    return (
        <button
            type="button"
            disabled={disabled}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); changeStatus(task, done ? 'todo' : 'done', only); }}
            aria-label={done ? 'Rouvrir la tâche' : 'Marquer comme terminée'}
            title={done ? 'Rouvrir' : 'Marquer comme terminée'}
            className={`relative z-10 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition disabled:cursor-default ${
                done ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-gray-300 text-transparent hover:border-emerald-500 hover:text-emerald-500'
            }`}
        >
            <CheckIcon className="h-3.5 w-3.5" />
        </button>
    );
}

