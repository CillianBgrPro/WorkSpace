import { Link } from '@inertiajs/react';

const labels = {
    todo: 'Pas commencee',
    in_progress: 'En cours',
    done: 'Terminee',
    low: 'Faible',
    medium: 'Moyenne',
    high: 'Haute',
    critical: 'Critique',
};

export default function TaskCard({ task }) {
    return (
        <Link
            href={`/tasks/${task.id}`}
            className="block bg-white dark:bg-gray-800 p-4 rounded-xl shadow hover:shadow-md transition"
        >
            <div className="flex items-start justify-between gap-3">
                <h3 className="font-semibold text-gray-900 dark:text-white">{task.title}</h3>
                <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 dark:text-gray-200">
                    {labels[task.priority]}
                </span>
            </div>

            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                {task.description || 'Aucune description'}
            </p>

            <div className="mt-3 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>{labels[task.status]}</span>
                <span>{task.due_date ? `Deadline: ${task.due_date}` : 'Sans deadline'}</span>
            </div>
        </Link>
    );
}
