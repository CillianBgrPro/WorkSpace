import AppLayout from '@/Layouts/AppLayout';
import { Head } from '@inertiajs/react';
import TaskProgressChart from '@/Components/Dashboard/TaskProgressChart';
import { ArrowDownTrayIcon, ClockIcon, ShieldCheckIcon, UserIcon } from '@heroicons/react/24/outline';

export default function Dashboard({ stats, recentActivities, upcomingDeadlines, activeProject, activityLogs = [], userRole }) {
    const projectName = activeProject?.name ?? 'Dashboard';

    const roleBadges = {
        owner: { label: 'Propriétaire', bg: 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300' },
        admin: { label: 'Administrateur', bg: 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300' },
        editor: { label: 'Éditeur', bg: 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300' },
        viewer: { label: 'Lecteur', bg: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300' },
    };

    const currentBadge = roleBadges[userRole] || roleBadges.editor;

    return (
        <AppLayout header={`Dashboard — ${projectName}`}>
            <Head title={`Dashboard · ${projectName}`} />

            {/* Barre supérieure : Rôle & Exportation */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
                <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Votre rôle sur ce projet :</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${currentBadge.bg}`}>
                        <ShieldCheckIcon className="w-4 h-4" />
                        {currentBadge.label}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <a
                        href={route('reports.tasks.csv')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                    >
                        <ArrowDownTrayIcon className="w-3.5 h-3.5" />
                        Export Tâches (CSV)
                    </a>
                    <a
                        href={route('reports.expenses.csv')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                    >
                        <ArrowDownTrayIcon className="w-3.5 h-3.5" />
                        Export Budget (CSV)
                    </a>
                </div>
            </div>

            {/* Cartes de statistiques */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 sm:p-6">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Tâches</h3>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalTasks}</p>
                    <div className="mt-4">
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Terminées: {stats.completedTasks}</div>
                        <TaskProgressChart completed={stats.completedTasks} remaining={stats.remainingTasks} />
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 sm:p-6">
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

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 sm:p-6">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Reste à dépenser</h3>
                    <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{stats.remainingBudget} €</p>
                    <p className="text-xs text-gray-400 mt-4">Calculé par rapport au budget actif</p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 sm:p-6">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Prochaines Échéances</h3>
                    <p className="text-3xl font-bold text-amber-500">{upcomingDeadlines?.length ?? 0}</p>
                    <p className="text-xs text-gray-400 mt-4">Tâches à venir bientôt</p>
                </div>
            </div>

            {/* Grid 2 colonnes : Journal d'activité & Prochaines échéances */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">

                {/* Fil du journal d'activité (2 cols) */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow p-4 sm:p-6">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                        <ClockIcon className="w-5 h-5 text-indigo-500" />
                        Journal d'Activité Récente
                    </h3>

                    {activityLogs.length === 0 ? (
                        <p className="text-sm text-gray-500 dark:text-gray-400">Aucune activité enregistrée sur ce projet.</p>
                    ) : (
                        <div className="space-y-4">
                            {activityLogs.map(log => (
                                <div key={log.id} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/40 rounded-lg">
                                    <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold text-xs flex-shrink-0">
                                        {log.user ? log.user.name.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-gray-800 dark:text-gray-200">
                                            <span className="font-semibold text-gray-900 dark:text-white">{log.user ? log.user.name : 'Système'}</span>{' '}
                                            {log.description}
                                        </p>
                                        <span className="text-xs text-gray-400 mt-0.5 block">
                                            {new Date(log.created_at).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Prochaines échéances (1 col) */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 sm:p-6">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Échéances à venir</h3>
                    {upcomingDeadlines.length === 0 ? (
                        <p className="text-sm text-gray-500 dark:text-gray-400">Aucune échéance prévue.</p>
                    ) : (
                        <ul className="space-y-3">
                            {upcomingDeadlines.map(dl => (
                                <li key={dl.id} className="flex justify-between items-center text-sm p-2 rounded bg-gray-50 dark:bg-gray-700/30">
                                    <span className="font-medium text-gray-800 dark:text-gray-200">{dl.title}</span>
                                    <span className="text-xs px-2 py-1 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-semibold">
                                        {new Date(dl.due_date).toLocaleDateString()}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
