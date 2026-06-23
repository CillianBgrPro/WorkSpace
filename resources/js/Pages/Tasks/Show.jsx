import AppLayout from '@/Layouts/AppLayout';
import TaskAttachments from '@/Components/Tasks/TaskAttachments';
import TaskComments from '@/Components/Tasks/TaskComments';
import { Head, Link, router } from '@inertiajs/react';

export default function ShowTask({ task }) {
    const deleteTask = () => {
        if (confirm('Supprimer cette tache ?')) {
            router.delete(`/tasks/${task.id}`);
        }
    };

    return (
        <AppLayout header={task.title}>
            <Head title={task.title} />

            <div className="space-y-4">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow space-y-3">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Etat: {task.status}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Priorite: {task.priority}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Deadline: {task.due_date ?? 'Aucune'}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Assignee: {task.assignee?.name ?? 'Non attribuee'}
                    </p>

                    <div>
                        <h3 className="font-semibold dark:text-white">Description</h3>
                        <p className="text-gray-700 dark:text-gray-300">{task.description || '-'}</p>
                    </div>

                    <div>
                        <h3 className="font-semibold dark:text-white">Cahier des charges</h3>
                        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                            {task.specification || '-'}
                        </p>
                    </div>
                </div>

                {/* Pièces jointes */}
                <TaskAttachments task={task} />

                {/* Commentaires */}
                {/* Commentaires */}
                <TaskComments task={task} />

                {/* Sous-tâches */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
                    <h3 className="font-semibold dark:text-white mb-3">
                        Sous-taches ({task.subtasks?.length ?? 0})
                    </h3>

                    <div className="space-y-2">
                        {(task.subtasks ?? []).map((subtask) => (
                            <Link
                                key={subtask.id}
                                href={`/tasks/${subtask.id}`}
                                className="block p-3 rounded-lg border border-gray-200 dark:border-gray-700 dark:text-white"
                            >
                                {subtask.title}
                            </Link>
                        ))}

                        {(!task.subtasks || task.subtasks.length === 0) && (
                            <p className="text-sm text-gray-500">Aucune sous-tache.</p>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <Link href={`/tasks/${task.id}/edit`} className="px-4 py-2 rounded-lg bg-indigo-600 text-white">
                        Modifier
                    </Link>
                    <button onClick={deleteTask} className="px-4 py-2 rounded-lg bg-red-600 text-white">
                        Supprimer
                    </button>
                    <Link href="/tasks" className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800">
                        Retour
                    </Link>
                </div>
            </div>
        </AppLayout>
    );
}
