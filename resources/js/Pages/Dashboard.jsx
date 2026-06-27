import AppLayout from '@/Layouts/AppLayout';
import { Head } from '@inertiajs/react';
import TaskProgressChart from '@/Components/Dashboard/TaskProgressChart';

export default function Dashboard({ stats, recentActivities, upcomingDeadlines }) {
    return (
        <AppLayout header="Dashboard">
            <Head title="Dashboard" />
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">


                <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Tâches</h3>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalTasks}</p>
                    <div className="mt-4">
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Terminé: {stats.completedTasks}</div>

                        <TaskProgressChart completed={stats.completedTasks} remaining={stats.remainingTasks} />
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Budget</h3>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalBudget} €</p>
                    <div className="mt-4">
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Dépensé: {stats.spentBudget} €</div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div className="bg-green-600 h-2 rounded-full" style={{ width: `${stats.budgetProgress}%` }}></div>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Progression: {stats.budgetProgress}%</div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 flex items-center justify-center text-gray-500 dark:text-gray-400">À venir</div>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 flex items-center justify-center text-gray-500 dark:text-gray-400">À venir</div>
            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Activités récentes – Tâches</h3>
                    <ul className="space-y-2">
                        {recentActivities.tasks.map(task => {
                            const statusLabel = {
                                'todo': 'Pas commencer',
                                'in_progress': 'En cours',
                                'done': 'Terminé',
                                'completed': 'Terminé',
                            };
                            return (
                                <li key={task.id} className="flex justify-between text-sm text-gray-700 dark:text-gray-300">
                                    <span>{task.title}</span>
                                    <span className="font-medium">{statusLabel[task.status] ?? task.status}</span>
                                </li>
                            );
                        })}
                    </ul>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Activités récentes – Dépenses</h3>
                    <ul className="space-y-2">
                        {recentActivities.expenses.map(exp => (
                            <li key={exp.id} className="flex justify-between text-sm text-gray-700 dark:text-gray-300">
                                <span>{exp.description}</span>
                                <span className="font-medium">{exp.amount} €</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Prochaines échéances</h3>
                <ul className="space-y-2">
                    {upcomingDeadlines.map(dl => (
                        <li key={dl.id} className="flex justify-between text-sm text-gray-700 dark:text-gray-300">
                            <span>{dl.title}</span>
                            <span className="font-medium">{new Date(dl.deadline).toLocaleDateString()}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </AppLayout>
    );
}
