import AppLayout from '@/Layouts/AppLayout';
import TaskCard from '@/Components/Tasks/TaskCard';
import TaskFilters from '@/Components/Tasks/TaskFilters';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowDownTrayIcon, PlusIcon } from '@heroicons/react/24/outline';

export default function TaskIndex({ tasks = [], filters = {}, canEdit = true }) {
    const columns = {
        todo: { title: 'À faire', items: tasks.filter((task) => task.status === 'todo') },
        in_progress: { title: 'En cours', items: tasks.filter((task) => task.status === 'in_progress' || task.status === 'doing') },
        done: { title: 'Terminée', items: tasks.filter((task) => task.status === 'done' || task.status === 'completed') },
    };

    const isKanban = filters.view === 'kanban';

    const handleStatusChange = (taskId, newStatus) => {
        router.patch(route('tasks.status', taskId), { status: newStatus }, {
            preserveScroll: true,
        });
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (e, targetStatus) => {
        e.preventDefault();
        const taskId = e.dataTransfer.getData('text/plain');
        if (taskId) {
            handleStatusChange(taskId, targetStatus);
        }
    };

    return (
        <AppLayout header="Tâches">
            <Head title="Tâches" />

            <div className="space-y-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-xl font-semibold dark:text-white">Gestion des tâches</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Organisez et suivez le travail de votre équipe.</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <a
                            href={route('reports.tasks.csv')}
                            className="inline-flex flex-1 sm:flex-none justify-center whitespace-nowrap items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                        >
                            <ArrowDownTrayIcon className="w-4 h-4" />
                            Export CSV
                        </a>

                        {canEdit && (
                            <Link
                                href="/tasks/create"
                                className="inline-flex flex-1 sm:flex-none justify-center whitespace-nowrap items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition shadow"
                            >
                                <PlusIcon className="w-4 h-4" />
                                Nouvelle tâche
                            </Link>
                        )}
                    </div>
                </div>

                <TaskFilters filters={filters} />

                {!isKanban ? (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {tasks.map((task) => (
                            <TaskCard key={task.id} task={task} />
                        ))}
                        {tasks.length === 0 && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">Aucune tâche trouvée.</p>
                        )}
                    </div>
                ) : (
                    <div className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:px-0 lg:grid lg:grid-cols-3 lg:gap-5 lg:overflow-visible">
                        {Object.entries(columns).map(([statusKey, column]) => (
                            <div
                                key={statusKey}
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, statusKey)}
                                className="w-[85%] shrink-0 snap-start sm:w-[60%] lg:w-auto bg-gray-100/80 dark:bg-gray-900/60 rounded-xl p-4 border border-gray-200/60 dark:border-gray-800 min-h-[240px] lg:min-h-[400px] flex flex-col"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                                        <span>{column.title}</span>
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-bold">
                                            {column.items.length}
                                        </span>
                                    </h3>
                                </div>

                                <div className="space-y-3 flex-1">
                                    {column.items.map((task) => (
                                        <div
                                            key={task.id}
                                            draggable={canEdit}
                                            onDragStart={(e) => e.dataTransfer.setData('text/plain', task.id)}
                                            className="group relative cursor-grab active:cursor-grabbing"
                                        >
                                            <TaskCard task={task} />

                                            {canEdit && (
                                                <div className="mt-2 flex gap-1 justify-end opacity-80 group-hover:opacity-100 transition">
                                                    {statusKey !== 'todo' && (
                                                        <button
                                                            onClick={() => handleStatusChange(task.id, 'todo')}
                                                            className="text-xs px-2 py-1 rounded bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 text-gray-700 dark:text-gray-300"
                                                        >
                                                            ← À faire
                                                        </button>
                                                    )}
                                                    {statusKey !== 'in_progress' && (
                                                        <button
                                                            onClick={() => handleStatusChange(task.id, 'in_progress')}
                                                            className="text-xs px-2 py-1 rounded bg-blue-100 dark:bg-blue-950 hover:bg-blue-200 text-blue-700 dark:text-blue-300"
                                                        >
                                                            En cours
                                                        </button>
                                                    )}
                                                    {statusKey !== 'done' && (
                                                        <button
                                                            onClick={() => handleStatusChange(task.id, 'done')}
                                                            className="text-xs px-2 py-1 rounded bg-emerald-100 dark:bg-emerald-950 hover:bg-emerald-200 text-emerald-700 dark:text-emerald-300"
                                                        >
                                                            Terminée →
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {column.items.length === 0 && (
                                        <div className="border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-lg p-6 text-center">
                                            <p className="text-xs text-gray-400">Déposez une tâche ici</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
