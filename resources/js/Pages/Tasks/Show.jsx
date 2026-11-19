import { Head, Link, router } from '@inertiajs/react';
import { PencilSquareIcon, TrashIcon, PlusIcon, RectangleStackIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import AppLayout from '@/Layouts/AppLayout';
import TaskAttachments from '@/Components/Tasks/TaskAttachments';
import TaskComments from '@/Components/Tasks/TaskComments';
import { CompleteToggle, changeStatus } from '@/Components/Tasks/CompleteToggle';
import PageHeader from '@/Components/ui/PageHeader';
import Button from '@/Components/ui/Button';
import { Card, CardHeader } from '@/Components/ui/Card';
import Avatar from '@/Components/ui/Avatar';
import { assigneesOf } from '@/lib/taskMeta';
import { StatusBadge, PriorityBadge, DueBadge, RecurrenceBadge } from '@/Components/ui/Badge';
import { confirmDelete } from '@/Components/ui/ConfirmDialog';
import { STATUSES, normalizeStatus, isDone } from '@/lib/taskMeta';
import { formatDate, formatRelative } from '@/lib/format';

function Property({ label, children }) {
    return (
        <div className="flex items-center justify-between gap-3 py-2.5">
            <dt className="whitespace-nowrap text-sm text-gray-500">{label}</dt>
            <dd className="min-w-0 text-right text-sm text-gray-900">{children}</dd>
        </div>
    );
}

export default function ShowTask({ task, canEdit = true, members = [] }) {
    const status = normalizeStatus(task.status);
    const done = isDone(task.status);

    const deleteTask = async () => {
        const subs = task.subtasks?.length ?? 0;
        if (await confirmDelete(`la tâche « ${task.title} »`, subs ? `Ses ${subs} sous-tâche(s) seront aussi supprimées. Cette action est définitive.` : undefined)) {
            router.delete(`/tasks/${task.id}`);
        }
    };

    return (
        <AppLayout header={task.title}>
            <Head title={task.title} />

            <PageHeader
                back={task.parent ? { href: `/tasks/${task.parent.id}`, label: task.parent.title } : { href: '/tasks', label: 'Tâches' }}
                title={<span className={done ? 'text-gray-400 line-through decoration-2' : ''}>{task.title}</span>}
                meta={
                    <>
                        <StatusBadge status={task.status} />
                        <PriorityBadge priority={task.priority} />
                        {task.due_date && <DueBadge date={task.due_date} done={done} />}
                        <RecurrenceBadge recurrence={task.recurrence} />
                    </>
                }
                actions={canEdit && (
                    <>
                        <Button variant="secondary" icon={TrashIcon} onClick={deleteTask} className="!text-rose-600">Supprimer</Button>
                        <Button href={`/tasks/${task.id}/edit`} icon={PencilSquareIcon}>Modifier</Button>
                    </>
                )}
            />

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
                <div className="min-w-0 space-y-5">
                    <Card>
                        <CardHeader title="Description" icon={DocumentTextIcon} />
                        {task.description
                            ? <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">{task.description}</p>
                            : <p className="text-sm italic text-gray-400">Aucune description.</p>}

                        {task.specification && (
                            <div className="mt-5 border-t border-gray-100 pt-5">
                                <h3 className="mb-2 text-sm font-semibold text-gray-900">Cahier des charges</h3>
                                <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">{task.specification}</p>
                            </div>
                        )}
                    </Card>

                    {/* Sous-tâches */}
                    <Card>
                        <CardHeader
                            title={`Sous-tâches${task.subtasks?.length ? ` · ${task.subtasks.filter((s) => isDone(s.status)).length}/${task.subtasks.length}` : ''}`}
                            icon={RectangleStackIcon}
                            actions={canEdit && (
                                <Button size="sm" variant="ghost" icon={PlusIcon} href={`/tasks/create?parent=${task.id}`}>Ajouter</Button>
                            )}
                        />
                        {task.subtasks?.length ? (
                            <ul className="-mx-2 divide-y divide-gray-100">
                                {task.subtasks.map((sub) => (
                                    <li key={sub.id} className="relative flex items-center gap-3 rounded-lg px-2 py-2.5 hover:bg-gray-50">
                                        <CompleteToggle task={sub} disabled={!canEdit} only={['task', 'flash']} />
                                        <Link href={`/tasks/${sub.id}`} className={`flex-1 truncate text-sm after:absolute after:inset-0 ${isDone(sub.status) ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                                            {sub.title}
                                        </Link>
                                        {sub.due_date && <DueBadge date={sub.due_date} done={isDone(sub.status)} />}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-gray-400">Découpez la tâche en étapes pour suivre son avancement.</p>
                        )}
                    </Card>

                    <TaskAttachments task={task} canEdit={canEdit} />
                    <TaskComments task={task} members={members} />
                </div>

                {/* Panneau de propriétés */}
                <div className="order-first space-y-5 lg:order-none lg:sticky lg:top-0 lg:self-start">
                    {canEdit && (
                        <Card>
                            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Statut</p>
                            <div className="grid grid-cols-3 gap-1 rounded-lg bg-gray-100 p-1" role="group" aria-label="Changer le statut">
                                {Object.entries(STATUSES).map(([key, s]) => (
                                    <button
                                        key={key}
                                        type="button"
                                        aria-pressed={status === key}
                                        onClick={() => status !== key && changeStatus(task, key, ['task', 'flash'])}
                                        className={`flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md px-1.5 py-1.5 text-xs font-medium transition ${
                                            status === key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'
                                        }`}
                                    >
                                        <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                                        {s.label}
                                    </button>
                                ))}
                            </div>
                        </Card>
                    )}

                    <Card>
                        <dl className="-my-2.5 divide-y divide-gray-100">
                            <Property label={assigneesOf(task).length > 1 ? 'Assignés' : 'Assignée à'}>
                                {assigneesOf(task).length ? (
                                    <span className="flex flex-col items-end gap-1">
                                        {assigneesOf(task).map((u) => (
                                            <span key={u.id} className="inline-flex items-center gap-2"><Avatar name={u.name} size="sm" />{u.name}</span>
                                        ))}
                                    </span>
                                ) : <span className="text-gray-400">Personne</span>}
                            </Property>
                            <Property label="Priorité"><PriorityBadge priority={task.priority} /></Property>
                            <Property label="Échéance">
                                {task.due_date ? formatDate(task.due_date, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : <span className="text-gray-400">Aucune</span>}
                            </Property>
                            {task.parent && (
                                <Property label="Tâche parente">
                                    <Link href={`/tasks/${task.parent.id}`} className="font-medium text-indigo-600 hover:underline">{task.parent.title}</Link>
                                </Property>
                            )}
                            {task.user && <Property label="Créée par">{task.user.name}</Property>}
                            <Property label="Créée"><span title={formatDate(task.created_at)}>{formatRelative(task.created_at)}</span></Property>
                            <Property label="Mise à jour"><span title={formatDate(task.updated_at)}>{formatRelative(task.updated_at)}</span></Property>
                        </dl>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
