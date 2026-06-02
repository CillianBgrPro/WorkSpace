import { router } from '@inertiajs/react';

export default function TaskFilters({ filters }) {
    const applyFilter = (key, value) => {
        router.get('/tasks', { ...filters, [key]: value }, { preserveState: true, replace: true });
    };

    return (
        <div className="grid gap-3 md:grid-cols-4 bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
            <input
                type="text"
                value={filters.search ?? ''}
                onChange={(e) => applyFilter('search', e.target.value)}
                placeholder="Rechercher une tache..."
                className="rounded-lg border-gray-300 dark:bg-gray-700 dark:text-white"
            />

            <select
                value={filters.status ?? ''}
                onChange={(e) => applyFilter('status', e.target.value)}
                className="rounded-lg border-gray-300 dark:bg-gray-700 dark:text-white"
            >
                <option value="">Tous les etats</option>
                <option value="todo">Pas commencee</option>
                <option value="in_progress">En cours</option>
                <option value="done">Terminee</option>
            </select>

            <select
                value={filters.priority ?? ''}
                onChange={(e) => applyFilter('priority', e.target.value)}
                className="rounded-lg border-gray-300 dark:bg-gray-700 dark:text-white"
            >
                <option value="">Toutes les priorites</option>
                <option value="low">Faible</option>
                <option value="medium">Moyenne</option>
                <option value="high">Haute</option>
                <option value="critical">Critique</option>
            </select>

            <select
                value={filters.view ?? 'list'}
                onChange={(e) => applyFilter('view', e.target.value)}
                className="rounded-lg border-gray-300 dark:bg-gray-700 dark:text-white"
            >
                <option value="list">Vue liste</option>
                <option value="kanban">Vue kanban</option>
            </select>
        </div>
    );
}
