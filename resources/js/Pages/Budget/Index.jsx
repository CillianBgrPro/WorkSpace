import { Head, Link } from '@inertiajs/react';
import { ArrowDownTrayIcon, PlusIcon, CurrencyEuroIcon } from '@heroicons/react/24/outline';
import { ExclamationTriangleIcon } from '@heroicons/react/16/solid';
import AppLayout from '@/Layouts/AppLayout';
import PageHeader from '@/Components/ui/PageHeader';
import Button from '@/Components/ui/Button';
import EmptyState from '@/Components/ui/EmptyState';
import { Badge } from '@/Components/ui/Badge';
import { formatMoney, formatShortDate } from '@/lib/format';

export function budgetTone(budget) {
    if (budget.percentage_consumed >= 100) return { bar: 'bg-rose-500', text: 'text-rose-600', label: 'Dépassé', badge: 'bg-rose-50 text-rose-700 ring-rose-200' };
    if (budget.percentage_consumed >= budget.alert_threshold) return { bar: 'bg-amber-500', text: 'text-amber-600', label: 'Seuil atteint', badge: 'bg-amber-50 text-amber-700 ring-amber-200' };
    return { bar: 'bg-emerald-500', text: 'text-emerald-600', label: null, badge: '' };
}

function BudgetCard({ budget }) {
    const tone = budgetTone(budget);
    const archived = budget.status === 'archived';

    return (
        <Link
            href={`/budgets/${budget.id}`}
            className={`group block rounded-xl border border-gray-200/80 bg-white p-5 shadow-sm transition hover:border-gray-300 hover:shadow ${archived ? 'opacity-70' : ''}`}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <h2 className="truncate font-semibold text-gray-900 group-hover:text-indigo-700">{budget.name}</h2>
                    <p className="mt-0.5 text-xs text-gray-500">
                        {formatShortDate(budget.start_date)}
                        {budget.end_date ? ` → ${formatShortDate(budget.end_date)}` : ' · sans date de fin'}
                    </p>
                </div>
                <div className="flex shrink-0 gap-1.5">
                    {archived && <Badge>Archivé</Badge>}
                    {tone.label && (
                        <Badge className={tone.badge}>
                            <ExclamationTriangleIcon className="h-3 w-3" />
                            {tone.label}
                        </Badge>
                    )}
                </div>
            </div>

            <div className="mt-4 flex items-baseline justify-between gap-2">
                <p className="text-2xl font-semibold tracking-tight text-gray-900">{formatMoney(budget.remaining_budget, { decimals: 0 })}</p>
                <p className="text-xs text-gray-500">restants sur {formatMoney(budget.amount, { decimals: 0 })}</p>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-100">
                <div className={`h-full rounded-full ${tone.bar}`} style={{ width: `${Math.min(budget.percentage_consumed, 100)}%` }} />
            </div>
            <p className="mt-1.5 text-xs text-gray-500">
                <span className={`font-medium ${tone.text}`}>{budget.percentage_consumed.toFixed(0)} %</span> consommé · {formatMoney(budget.total_expenses)} dépensés
            </p>
        </Link>
    );
}

export default function BudgetIndex({ budgets }) {
    const active = budgets.filter((b) => b.status !== 'archived');
    const archived = budgets.filter((b) => b.status === 'archived');

    return (
        <AppLayout header="Budget">
            <Head title="Budget" />

            <PageHeader
                title="Budget"
                description="Suivez vos enveloppes et vos dépenses en temps réel."
                actions={
                    <>
                        <Button variant="secondary" href={route('reports.expenses.csv')} external icon={ArrowDownTrayIcon}>Exporter</Button>
                        <Button href="/budgets/create" icon={PlusIcon}>Nouveau budget</Button>
                    </>
                }
            />

            {budgets.length === 0 ? (
                <EmptyState
                    icon={CurrencyEuroIcon}
                    title="Aucun budget pour ce projet"
                    description="Créez une enveloppe pour suivre les dépenses et être alerté avant de la dépasser."
                    action={<Button href="/budgets/create" icon={PlusIcon}>Créer un budget</Button>}
                />
            ) : (
                <div className="space-y-8">
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {active.map((b) => <BudgetCard key={b.id} budget={b} />)}
                    </div>
                    {archived.length > 0 && (
                        <section>
                            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Archivés · {archived.length}</h2>
                            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                {archived.map((b) => <BudgetCard key={b.id} budget={b} />)}
                            </div>
                        </section>
                    )}
                </div>
            )}
        </AppLayout>
    );
}
