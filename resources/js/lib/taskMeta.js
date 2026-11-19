// Libellés et couleurs des statuts / priorités de tâches, en un seul endroit.

export const STATUSES = {
    todo: { label: 'À faire', dot: 'bg-gray-400', badge: 'bg-gray-100 text-gray-700 ring-gray-200' },
    in_progress: { label: 'En cours', dot: 'bg-blue-500', badge: 'bg-blue-50 text-blue-700 ring-blue-200' },
    done: { label: 'Terminée', dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
};

export const PRIORITIES = {
    low: { label: 'Faible', badge: 'bg-gray-50 text-gray-600 ring-gray-200', bars: 1, color: 'text-gray-400' },
    medium: { label: 'Moyenne', badge: 'bg-sky-50 text-sky-700 ring-sky-200', bars: 2, color: 'text-sky-500' },
    high: { label: 'Haute', badge: 'bg-amber-50 text-amber-700 ring-amber-200', bars: 3, color: 'text-amber-500' },
    critical: { label: 'Critique', badge: 'bg-rose-50 text-rose-700 ring-rose-200', bars: 4, color: 'text-rose-500' },
};

/** Ramène les anciens statuts (doing, completed) aux trois statuts actuels. */
export function normalizeStatus(status) {
    if (status === 'doing') return 'in_progress';
    if (status === 'completed') return 'done';
    return STATUSES[status] ? status : 'todo';
}

export const isDone = (status) => normalizeStatus(status) === 'done';

/** Personnes assignées : la liste multiple si présente, sinon l'assigné principal. */
export function assigneesOf(task) {
    if (task.assigned_users?.length) return task.assigned_users;
    return task.assignee ? [task.assignee] : [];
}
