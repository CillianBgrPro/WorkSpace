import { useMemo } from 'react';
import { Head, Link } from '@inertiajs/react';
import { SparklesIcon } from '@heroicons/react/24/outline';
import AppLayout from '@/Layouts/AppLayout';
import PageHeader from '@/Components/ui/PageHeader';
import EmptyState from '@/Components/ui/EmptyState';
import { DueBadge, PriorityBadge, RecurrenceBadge, StatusBadge } from '@/Components/ui/Badge';
import { CompleteToggle } from '@/Components/Tasks/CompleteToggle';
import { dueInfo } from '@/lib/format';

const GROUPS = [
    ['overdue', 'En retard', 'text-rose-600'],
    ['today', "Aujourd'hui", 'text-amber-600'],
    ['week', 'Cette semaine', 'text-gray-900'],
    ['later', 'Plus tard', 'text-gray-900'],
    ['none', 'Sans échéance', 'text-gray-500'],
];

function groupOf(task) {
    const info = dueInfo(task.due_date);
    if (!info) return 'none';
    if (info.days < 0) return 'overdue';
    if (info.days === 0) return 'today';
    if (info.days < 7) return 'week';
    return 'later';
}

/** Toutes mes tâches ouvertes, tous projets confondus, regroupées par urgence. */
export default function MyTasks({ tasks = [] }) {
    const groups = useMemo(() => {
        const map = Object.fromEntries(GROUPS.map(([k]) => [k, []]));
        tasks.forEach((t) => map[groupOf(t)].push(t));
        return map;
    }, [tasks]);

    const projectCount = new Set(tasks.map((t) => t.project_id)).size;

    return (
        <AppLayout header="Mes tâches">
            <Head title="Mes tâches" />
            <PageHeader
                title="Mes tâches"
                description={tasks.length
                    ? `${tasks.length} tâche${tasks.length > 1 ? 's' : ''} à traiter sur ${projectCount} projet${projectCount > 1 ? 's' : ''}`
                    : 'Toutes les tâches qui vous sont assignées, tous projets confondus.'}
            />

            {tasks.length === 0 ? (
                <EmptyState icon={SparklesIcon} title="Rien à faire pour l'instant" description="Les tâches qu'on vous assigne, dans n'importe quel projet, apparaîtront ici." />
            ) : (
                <div className="space-y-6">
                    {GROUPS.filter(([k]) => groups[k].length).map(([key, label, tone]) => (
                        <section key={key}>
                            <h2 className={`mb-2 flex items-center gap-2 text-sm font-semibold ${tone}`}>
                                {label}
                                <span className="rounded-full bg-gray-100 px-1.5 text-xs font-medium text-gray-500">{groups[key].length}</span>
                            </h2>
                            <ul className="divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-sm">
                                {groups[key].map((task) => (
                                    <li key={task.id} className="relative flex items-center gap-3 px-4 py-3 hover:bg-gray-50">
                                        <CompleteToggle task={task} only={['tasks', 'flash']} />
                                        <div className="min-w-0 flex-1">
                                            <Link href={`/tasks/${task.id}`} className="block truncate text-sm font-medium text-gray-900 after:absolute after:inset-0">
                                                {task.title}
                                            </Link>
                                            <span className="mt-0.5 flex items-center gap-1.5 text-xs text-gray-500">
                                                <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: task.project?.color ?? '#6366f1' }} />
                                                <span className="truncate">{task.project?.name}</span>
                                            </span>
                                        </div>
                                        <span className="hidden sm:inline-flex"><StatusBadge status={task.status} /></span>
                                        <RecurrenceBadge recurrence={task.recurrence} compact />
                                        <PriorityBadge priority={task.priority} compact />
                                        {task.due_date && <DueBadge date={task.due_date} />}
                                    </li>
                                ))}
                            </ul>
                        </section>
                    ))}
                </div>
            )}
        </AppLayout>
    );
}
