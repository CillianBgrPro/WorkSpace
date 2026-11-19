import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowDownTrayIcon, PlusIcon, CheckCircleIcon, ClockIcon, ExclamationTriangleIcon,
    CurrencyEuroIcon, CalendarDaysIcon, BoltIcon, UserPlusIcon, ArrowRightIcon, SparklesIcon,
} from '@heroicons/react/24/outline';
import AppLayout from '@/Layouts/AppLayout';
import PageHeader from '@/Components/ui/PageHeader';
import Button from '@/Components/ui/Button';
import { Card, CardHeader } from '@/Components/ui/Card';
import Avatar from '@/Components/ui/Avatar';
import { Badge, DueBadge, PriorityBadge } from '@/Components/ui/Badge';
import { CompleteToggle } from '@/Components/Tasks/CompleteToggle';
import { formatMoney, formatRelative, formatDateTime } from '@/lib/format';
import { isDone } from '@/lib/taskMeta';

const ROLES = {
    owner: { label: 'Propriétaire', className: 'bg-indigo-50 text-indigo-700 ring-indigo-200' },
    admin: { label: 'Administrateur', className: 'bg-violet-50 text-violet-700 ring-violet-200' },
    editor: { label: 'Éditeur', className: 'bg-sky-50 text-sky-700 ring-sky-200' },
    member: { label: 'Membre', className: 'bg-sky-50 text-sky-700 ring-sky-200' },
    viewer: { label: 'Lecteur', className: 'bg-gray-50 text-gray-600 ring-gray-200' },
};

function greeting() {
    const h = new Date().getHours();
    if (h < 5 || h >= 18) return 'Bonsoir';
    return 'Bonjour';
}

function Progress({ value, tone = 'indigo' }) {
    const colors = { indigo: 'bg-indigo-500', emerald: 'bg-emerald-500', amber: 'bg-amber-500', rose: 'bg-rose-500' };
    return (
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100" role="progressbar" aria-valuenow={Math.round(value)} aria-valuemin={0} aria-valuemax={100}>
            <div className={`h-full rounded-full transition-all duration-500 ${colors[tone]}`} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
        </div>
    );
}

function Kpi({ icon: Icon, label, value, sub, href, tone = 'gray', children }) {
    const tones = {
        gray: 'bg-gray-100 text-gray-600',
        indigo: 'bg-indigo-50 text-indigo-600',
        blue: 'bg-blue-50 text-blue-600',
        rose: 'bg-rose-50 text-rose-600',
        emerald: 'bg-emerald-50 text-emerald-600',
        amber: 'bg-amber-50 text-amber-600',
    };
    const Tag = href ? Link : 'div';
    return (
        <Tag href={href} className={`group block rounded-xl border border-gray-200/80 bg-white p-4 shadow-sm transition ${href ? 'hover:border-gray-300 hover:shadow' : ''}`}>
            <div className="flex items-center gap-2.5">
                <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${tones[tone]}`}>
                    <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                </span>
                <span className="text-sm font-medium text-gray-500">{label}</span>
                {href && <ArrowRightIcon className="ml-auto h-4 w-4 text-gray-300 transition group-hover:translate-x-0.5 group-hover:text-gray-500" />}
            </div>
            <p className="mt-3 text-2xl font-semibold tracking-tight text-gray-900">{value}</p>
            {sub && <p className="mt-0.5 text-xs text-gray-500">{sub}</p>}
            {children && <div className="mt-3">{children}</div>}
        </Tag>
    );
}

export default function Dashboard({ stats, myTasks = [], upcomingDeadlines = [], activeProject, activityLogs = [], userRole }) {
    const user = usePage().props.auth?.user;
    const firstName = user?.name?.split(' ')[0] ?? '';
    const role = ROLES[userRole] ?? ROLES.member;
    const canEdit = ['owner', 'admin', 'editor'].includes(userRole);
    const todayRaw = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
    const today = todayRaw.charAt(0).toUpperCase() + todayRaw.slice(1);
    const budgetTone = stats.budgetProgress >= 100 ? 'rose' : stats.budgetProgress >= 80 ? 'amber' : 'emerald';
    const refresh = ['myTasks', 'stats', 'upcomingDeadlines', 'activityLogs', 'flash'];

    return (
        <AppLayout header="Dashboard">
            <Head title={`Dashboard · ${activeProject?.name ?? ''}`} />

            <PageHeader
                title={`${greeting()} ${firstName}`}
                description={today}
                meta={<Badge className={role.className}>{role.label}</Badge>}
                actions={canEdit && <Button href="/tasks/create" icon={PlusIcon}>Nouvelle tâche</Button>}
            />

            {/* Indicateurs */}
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
                <Kpi
                    icon={CheckCircleIcon}
                    tone="emerald"
                    label="Avancement"
                    value={`${Math.round(stats.taskProgress)} %`}
                    sub={`${stats.completedTasks} / ${stats.totalTasks} tâches terminées`}
                    href="/tasks"
                >
                    <Progress value={stats.taskProgress} tone="emerald" />
                </Kpi>
                <Kpi icon={ClockIcon} tone="blue" label="En cours" value={stats.inProgressTasks} sub={`${stats.remainingTasks} tâche${stats.remainingTasks > 1 ? 's' : ''} restante${stats.remainingTasks > 1 ? 's' : ''}`} href="/tasks?status=in_progress" />
                <Kpi
                    icon={ExclamationTriangleIcon}
                    tone={stats.overdueTasks > 0 ? 'rose' : 'gray'}
                    label="En retard"
                    value={stats.overdueTasks}
                    sub={stats.overdueTasks > 0 ? 'À traiter en priorité' : 'Tout est dans les temps'}
                    href="/tasks"
                />
                {stats.hasBudget ? (
                    <Kpi icon={CurrencyEuroIcon} tone={budgetTone} label="Budget" value={formatMoney(stats.remainingBudget, { decimals: 0 })} sub={`restants · ${Math.round(stats.budgetProgress)} % consommé`} href="/budgets">
                        <Progress value={stats.budgetProgress} tone={budgetTone} />
                    </Kpi>
                ) : (
                    <Kpi icon={CurrencyEuroIcon} label="Budget" value="—" sub="Aucun budget actif" href="/budgets/create" />
                )}
            </div>

            <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
                <div className="min-w-0 space-y-5">
                    {/* Mes tâches */}
                    <Card>
                        <CardHeader
                            title="Mes tâches"
                            description="Assignées à vous, par échéance"
                            actions={<Button size="sm" variant="ghost" href="/tasks" iconRight={ArrowRightIcon}>Tout voir</Button>}
                        />
                        {myTasks.length ? (
                            <ul className="-mx-2 divide-y divide-gray-100">
                                {myTasks.map((task) => (
                                    <li key={task.id} className="relative flex items-center gap-3 rounded-lg px-2 py-2.5 hover:bg-gray-50">
                                        <CompleteToggle task={task} disabled={!canEdit} only={refresh} />
                                        <Link href={`/tasks/${task.id}`} className={`min-w-0 flex-1 truncate text-sm font-medium after:absolute after:inset-0 ${isDone(task.status) ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                                            {task.title}
                                        </Link>
                                        <PriorityBadge priority={task.priority} compact />
                                        {task.due_date && <DueBadge date={task.due_date} />}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="flex items-center gap-3 rounded-lg bg-emerald-50/60 px-4 py-4 text-sm text-emerald-800">
                                <SparklesIcon className="h-5 w-5 shrink-0 text-emerald-500" />
                                Rien ne vous est assigné en ce moment. Profitez-en pour avancer sur le reste du projet.
                            </div>
                        )}
                    </Card>

                    {/* Activité */}
                    <Card>
                        <CardHeader title="Activité récente" icon={BoltIcon} />
                        {activityLogs.length === 0 ? (
                            <p className="text-sm text-gray-400">Les actions de l'équipe (tâches créées, statuts, dépenses…) apparaîtront ici.</p>
                        ) : (
                            <ol className="relative space-y-4 before:absolute before:bottom-2 before:left-[15px] before:top-2 before:w-px before:bg-gray-100">
                                {activityLogs.map((log) => (
                                    <li key={log.id} className="relative flex items-start gap-3">
                                        <Avatar name={log.user?.name ?? 'Système'} size="md" />
                                        <div className="min-w-0 flex-1 pt-1">
                                            <p className="text-sm text-gray-700">
                                                <span className="font-semibold text-gray-900">{log.user?.name ?? 'Système'}</span> {log.description}
                                            </p>
                                            <time className="text-xs text-gray-400" title={formatDateTime(log.created_at)}>{formatRelative(log.created_at)}</time>
                                        </div>
                                    </li>
                                ))}
                            </ol>
                        )}
                    </Card>
                </div>

                <div className="space-y-5">
                    {/* Échéances */}
                    <Card>
                        <CardHeader title="Échéances à venir" icon={CalendarDaysIcon} />
                        {upcomingDeadlines.length === 0 ? (
                            <p className="text-sm text-gray-400">Aucune échéance prévue.</p>
                        ) : (
                            <ul className="-mx-2 space-y-0.5">
                                {upcomingDeadlines.map((dl) => (
                                    <li key={dl.id}>
                                        <Link href={`/tasks/${dl.id}`} className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm hover:bg-gray-50">
                                            <span className="min-w-0 flex-1 truncate text-gray-800">{dl.title}</span>
                                            <DueBadge date={dl.due_date} />
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </Card>

                    {/* Actions rapides */}
                    <Card>
                        <CardHeader title="Actions rapides" />
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                canEdit && ['/tasks/create', PlusIcon, 'Tâche'],
                                ['/calendar?new=1', CalendarDaysIcon, 'Événement'],
                                ['/budgets', CurrencyEuroIcon, 'Dépense'],
                                activeProject && [`/projects/${activeProject.id}?invite=1`, UserPlusIcon, 'Inviter'],
                            ].filter(Boolean).map(([href, Icon, label]) => (
                                <Link key={label} href={href} className="flex flex-col items-center gap-1.5 rounded-lg border border-gray-200 px-2 py-3 text-xs font-medium text-gray-600 transition hover:border-indigo-200 hover:bg-indigo-50/50 hover:text-indigo-700">
                                    <Icon className="h-5 w-5" />
                                    {label}
                                </Link>
                            ))}
                        </div>
                        <div className="mt-4 flex flex-col gap-1 border-t border-gray-100 pt-3">
                            <a href={route('reports.tasks.csv')} className="flex items-center gap-2 rounded-md px-1 py-1 text-sm text-gray-500 hover:text-gray-900">
                                <ArrowDownTrayIcon className="h-4 w-4" /> Exporter les tâches (CSV)
                            </a>
                            <a href={route('reports.expenses.csv')} className="flex items-center gap-2 rounded-md px-1 py-1 text-sm text-gray-500 hover:text-gray-900">
                                <ArrowDownTrayIcon className="h-4 w-4" /> Exporter les dépenses (CSV)
                            </a>
                        </div>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
