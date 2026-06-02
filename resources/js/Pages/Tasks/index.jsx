import AppLayout from '@/Layouts/AppLayout';
import TaskCard from '@/Components/Tasks/TaskCard';
import TaskFilters from '@/Components/Tasks/TaskFilters';
import { Head, Link } from '@inertiajs/react';

export default function TaskIndex({ tasks = [], filters = {} }) {
    const columns = {
        todo: { title: 'Pas commencee', items: tasks.filter((task) => task.status === 'todo') },
        in_progress: { title: 'En cours', items: tasks.filter((task) => task.status === 'in_progress') },
        done: { title: 'Terminee', items: tasks.filter((task) => task.status === 'done') },
    };

    const isKanban = filters.view === 'kanban';

    return (
        <AppLayout header="Taches">
            <Head title="Taches" />

            <div className="space-y-5">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold dark:text-white">Gestion des taches</h2>
                    <Link href="/tasks/create" className="px-4 py-2 rounded-lg bg-indigo-600 text-white">
                        Nouvelle tache
                    </Link>
                </div>

                <TaskFilters filters={filters} />

                {!isKanban ? (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {tasks.map((task) => (
                            <TaskCard key={task.id} task={task} />
                        ))}
                        {tasks.length === 0 && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">Aucune tache trouvee.</p>
                        )}
                    </div>
                ) : (
                    <div className="grid gap-4 lg:grid-cols-3">
                        {Object.entries(columns).map(([key, column]) => (
                            <div key={key} className="bg-gray-100 dark:bg-gray-900 rounded-xl p-3">
                                <h3 className="font-semibold mb-3 dark:text-white">{column.title}</h3>
                                <div className="space-y-3">
                                    {column.items.map((task) => (
                                        <TaskCard key={task.id} task={task} />
                                    ))}
                                    {column.items.length === 0 && (
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Aucune tache</p>
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
