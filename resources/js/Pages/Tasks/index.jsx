import { useRef, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowDownTrayIcon, PlusIcon, CheckCircleIcon, FunnelIcon } from '@heroicons/react/24/outline';
import AppLayout from '@/Layouts/AppLayout';
import TaskCard from '@/Components/Tasks/TaskCard';
import TaskFilters from '@/Components/Tasks/TaskFilters';
import PageHeader from '@/Components/ui/PageHeader';
import Button from '@/Components/ui/Button';
import EmptyState from '@/Components/ui/EmptyState';
import { AvatarStack } from '@/Components/ui/Avatar';
import { StatusBadge, PriorityBadge, DueBadge, RecurrenceBadge } from '@/Components/ui/Badge';
import { STATUSES, normalizeStatus, isDone, assigneesOf } from '@/lib/taskMeta';
import { toast } from '@/Components/ui/Toaster';
import { changeStatus, CompleteToggle } from '@/Components/Tasks/CompleteToggle';

const COLUMN_ORDER = ['todo', 'in_progress', 'done'];

function TaskRow({ task, canEdit }) {
    const done = isDone(task.status);
    return (
        <li className="group relative flex items-center gap-3 px-4 py-3 transition hover:bg-gray-50">
            <CompleteToggle task={task} disabled={!canEdit} />
            <div className="min-w-0 flex-1">
                <Link href={`/tasks/${task.id}`} className="block truncate text-sm font-medium text-gray-900 after:absolute after:inset-0 focus:outline-none focus-visible:underline">
                    <span className={done ? 'text-gray-400 line-through' : ''}>{task.title}</span>
                    {task.recurrence && <span className="ml-1.5 inline-flex align-middle"><RecurrenceBadge recurrence={task.recurrence} compact /></span>}
                </Link>
                {/* Méta sur mobile */}
                <div className="mt-1 flex flex-wrap items-center gap-1.5 sm:hidden">
                    <StatusBadge status={task.status} />
                    {task.due_date && <DueBadge date={task.due_date} done={done} />}
                </div>
            </div>
            <div className="hidden w-28 sm:block"><StatusBadge status={task.status} /></div>
            <div className="hidden w-28 md:block"><PriorityBadge priority={task.priority} /></div>
            <div className="hidden w-36 sm:block">{task.due_date ? <DueBadge date={task.due_date} done={done} /> : <span className="text-xs text-gray-300">—</span>}</div>
            <div className="flex w-16 justify-end">
                {assigneesOf(task).length
                    ? <AvatarStack names={assigneesOf(task).map((u) => u.name)} max={3} />
                    : <span className="h-6 w-6 rounded-full border border-dashed border-gray-300" title="Non assignée" />}
            </div>
        </li>
    );
}

/** Ajout rapide en bas d'une colonne kanban : un titre, Entrée, c'est créé. */
function QuickAdd({ status }) {
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [saving, setSaving] = useState(false);
    const inputRef = useRef(null);

    const submit = (e) => {
        e.preventDefault();
        if (!title.trim()) return;
        setSaving(true);
        router.post('/tasks', { title: title.trim(), status, priority: 'medium', quick: true }, {
            preserveScroll: true,
            preserveState: true,
            only: ['tasks', 'flash'],
            onSuccess: () => { setTitle(''); setTimeout(() => inputRef.current?.focus(), 0); },
            onError: (errors) => toast.error(errors.title ?? 'Impossible de créer la tâche.'),
            onFinish: () => setSaving(false),
        });
    };

    if (!open) {
        return (
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-gray-500 transition hover:bg-white hover:text-gray-800"
            >
                <PlusIcon className="h-4 w-4" />
                Ajouter une tâche
            </button>
        );
    }

    return (
        <form onSubmit={submit}>
            <input
                ref={inputRef}
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() => { if (!title) setOpen(false); }}
                onKeyDown={(e) => { if (e.key === 'Escape') { setTitle(''); setOpen(false); } }}
                readOnly={saving}
                placeholder="Titre de la tâche…"
                aria-label="Titre de la nouvelle tâche"
                className="block w-full rounded-lg border-0 bg-white px-3 py-2 text-sm shadow-sm ring-1 ring-inset ring-indigo-300 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600"
            />
            <p className="mt-1 px-1 text-[11px] text-gray-400">Entrée pour créer · Échap pour annuler</p>
        </form>
    );
}

function Kanban({ tasks, canEdit }) {
    const [dragId, setDragId] = useState(null);
    const [overCol, setOverCol] = useState(null);
    const [overTask, setOverTask] = useState(null); // carte au-dessus de laquelle on insère

    const columns = COLUMN_ORDER.map((key) => ({
        key,
        ...STATUSES[key],
        items: tasks.filter((t) => normalizeStatus(t.status) === key),
    }));

    // Dépôt : on enregistre l'ordre complet de la colonne cible (et le changement de statut).
    const drop = (e, key) => {
        e.preventDefault();
        const id = Number(e.dataTransfer.getData('text/plain'));
        const before = overTask;
        setOverCol(null);
        setOverTask(null);
        setDragId(null);
        if (!id) return;

        const column = columns.find((c) => c.key === key).items.map((t) => t.id).filter((tid) => tid !== id);
        const at = before ? column.indexOf(before) : -1;
        column.splice(at === -1 ? column.length : at, 0, id);

        const task = tasks.find((t) => t.id === id);
        const unchanged = normalizeStatus(task?.status) === key && column.join() === columns.find((c) => c.key === key).items.map((t) => t.id).join();
        if (unchanged) return;

        router.patch(route('tasks.reorder'), { status: key, ids: column }, { preserveScroll: true, preserveState: true, only: ['tasks', 'flash'] });
    };

    return (
        <div className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:px-0 lg:grid lg:grid-cols-3 lg:overflow-visible">
            {columns.map((col) => (
                <section
                    key={col.key}
                    aria-label={col.label}
                    onDragOver={(e) => { if (canEdit) { e.preventDefault(); setOverCol(col.key); } }}
                    onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) { setOverCol(null); setOverTask(null); } }}
                    onDrop={(e) => drop(e, col.key)}
                    className={`flex w-[85%] shrink-0 snap-start flex-col rounded-xl p-2.5 transition sm:w-[60%] lg:w-auto ${
                        overCol === col.key ? 'bg-indigo-50 ring-2 ring-indigo-200' : 'bg-gray-100'
                    }`}
                >
                    <header className="flex items-center gap-2 px-1.5 pb-2.5 pt-1">
                        <span className={`h-2 w-2 rounded-full ${col.dot}`} />
                        <h2 className="text-sm font-semibold text-gray-700">{col.label}</h2>
                        <span className="rounded-full bg-white px-1.5 text-xs font-medium text-gray-500">{col.items.length}</span>
                    </header>

                    <div className="flex min-h-[3rem] flex-1 flex-col gap-2">
                        {col.items.map((task) => (
                            <div
                                key={task.id}
                                draggable={canEdit}
                                onDragStart={(e) => { e.dataTransfer.setData('text/plain', String(task.id)); e.dataTransfer.effectAllowed = 'move'; setDragId(task.id); }}
                                onDragEnd={() => { setDragId(null); setOverTask(null); }}
                                onDragOver={(e) => {
                                    if (!canEdit || task.id === dragId) return;
                                    const r = e.currentTarget.getBoundingClientRect();
                                    // Moitié haute : avant cette carte ; moitié basse : avant la suivante.
                                    const next = col.items[col.items.indexOf(task) + 1];
                                    setOverTask(e.clientY < r.top + r.height / 2 ? task.id : next?.id ?? null);
                                }}
                                className={`relative ${canEdit ? 'cursor-grab active:cursor-grabbing' : ''}`}
                            >
                                {dragId && overCol === col.key && overTask === task.id && dragId !== task.id && (
                                    <span className="pointer-events-none absolute -top-1.5 left-0 right-0 h-0.5 rounded-full bg-indigo-500" aria-hidden="true" />
                                )}
                                <TaskCard task={task} dragging={dragId === task.id} />
                                {/* Sur écran tactile, pas de glisser-déposer : boutons de déplacement. */}
                                {canEdit && (
                                    <div className="mt-1 flex justify-end gap-1 lg:hidden">
                                        {COLUMN_ORDER.filter((k) => k !== col.key).map((k) => (
                                            <button
                                                key={k}
                                                type="button"
                                                onClick={() => changeStatus(task, k)}
                                                className="rounded-md bg-white px-2 py-1 text-[11px] font-medium text-gray-600 ring-1 ring-gray-200"
                                            >
                                                → {STATUSES[k].label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                        {col.items.length === 0 && (
                            <p className="rounded-lg border border-dashed border-gray-300 px-3 py-5 text-center text-xs text-gray-400">
                                {canEdit ? 'Glissez une tâche ici' : 'Aucune tâche'}
                            </p>
                        )}
                    </div>

                    {canEdit && <div className="mt-2"><QuickAdd status={col.key} /></div>}
                </section>
            ))}
        </div>
    );
}

export default function TaskIndex({ tasks = [], filters = {}, canEdit = true }) {
    const isKanban = filters.view === 'kanban';
    const hasFilters = !!(filters.search || filters.status || filters.priority || filters.mine);
    const openCount = tasks.filter((t) => !isDone(t.status)).length;

    return (
        <AppLayout header="Tâches">
            <Head title="Tâches" />

            <PageHeader
                title="Tâches"
                description={tasks.length ? `${openCount} à traiter · ${tasks.length - openCount} terminée${tasks.length - openCount > 1 ? 's' : ''}` : 'Organisez et suivez le travail de votre équipe.'}
                actions={
                    <>
                        <Button variant="secondary" href={route('reports.tasks.csv')} external icon={ArrowDownTrayIcon}>Exporter</Button>
                        {canEdit && <Button href="/tasks/create" icon={PlusIcon} title="Raccourci : N">Nouvelle tâche</Button>}
                    </>
                }
            />

            <div className="space-y-4">
                <TaskFilters filters={filters} count={tasks.length} />

                {tasks.length === 0 && !isKanban ? (
                    hasFilters ? (
                        <EmptyState icon={FunnelIcon} title="Aucune tâche ne correspond" description="Essayez d'autres mots-clés ou retirez des filtres." />
                    ) : (
                        <EmptyState
                            icon={CheckCircleIcon}
                            title="Aucune tâche pour l'instant"
                            description="Créez la première tâche du projet pour commencer à suivre l'avancement."
                            action={canEdit && <Button href="/tasks/create" icon={PlusIcon}>Créer une tâche</Button>}
                        />
                    )
                ) : isKanban ? (
                    <Kanban tasks={tasks} canEdit={canEdit} />
                ) : (
                    <div className="overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-sm">
                        <div className="hidden items-center gap-3 border-b border-gray-100 bg-gray-50/60 px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400 sm:flex">
                            <span className="w-5" />
                            <span className="flex-1">Tâche</span>
                            <span className="w-28">Statut</span>
                            <span className="hidden w-28 md:block">Priorité</span>
                            <span className="w-36">Échéance</span>
                            <span className="w-16 text-right">Assignés</span>
                        </div>
                        <ul className="divide-y divide-gray-100">
                            {tasks.map((task) => <TaskRow key={task.id} task={task} canEdit={canEdit} />)}
                        </ul>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
