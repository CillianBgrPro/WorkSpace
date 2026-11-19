import { Head, router } from '@inertiajs/react';
import { TrashIcon, ArrowUturnLeftIcon, CheckCircleIcon, CurrencyEuroIcon, DocumentIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';
import AppLayout from '@/Layouts/AppLayout';
import PageHeader from '@/Components/ui/PageHeader';
import Button from '@/Components/ui/Button';
import EmptyState from '@/Components/ui/EmptyState';
import { confirmDelete } from '@/Components/ui/ConfirmDialog';
import { formatRelative, formatDate } from '@/lib/format';

const ICONS = {
    task: [CheckCircleIcon, 'bg-indigo-50 text-indigo-500'],
    budget: [CurrencyEuroIcon, 'bg-emerald-50 text-emerald-500'],
    file: [DocumentIcon, 'bg-sky-50 text-sky-500'],
    event: [CalendarDaysIcon, 'bg-violet-50 text-violet-500'],
};

export default function TrashIndex({ items = [], canEdit, canPurge, days }) {
    const restore = (item) => router.post(route('trash.restore', [item.type, item.id]), {}, { preserveScroll: true });
    const purge = async (item) => {
        if (await confirmDelete(`définitivement « ${item.label} »`, 'Il ne sera plus possible de le récupérer.')) {
            router.delete(route('trash.destroy', [item.type, item.id]), { preserveScroll: true });
        }
    };

    return (
        <AppLayout header="Corbeille">
            <Head title="Corbeille" />
            <PageHeader
                title="Corbeille"
                description={`Les éléments supprimés sont conservés ${days} jours, puis effacés automatiquement.`}
            />

            {items.length === 0 ? (
                <EmptyState icon={TrashIcon} title="La corbeille est vide" description="Les tâches, budgets, fichiers et événements supprimés apparaîtront ici." />
            ) : (
                <ul className="divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-sm">
                    {items.map((item) => {
                        const [Icon, tone] = ICONS[item.type];
                        const daysLeft = Math.max(0, Math.ceil((new Date(item.purge_at) - new Date()) / 86400000));
                        return (
                            <li key={`${item.type}-${item.id}`} className="flex flex-wrap items-center gap-3 px-4 py-3 sm:flex-nowrap">
                                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${tone}`}><Icon className="h-5 w-5" /></span>
                                <div className="min-w-0 flex-1 basis-[calc(100%-3rem)] sm:basis-0">
                                    <p className="truncate text-sm font-medium text-gray-900">{item.label}</p>
                                    <p className="truncate text-xs text-gray-500">
                                        {item.meta} · supprimé {formatRelative(item.deleted_at)}{item.deleted_by && ` par ${item.deleted_by}`}
                                        {' · '}
                                        <span className={daysLeft <= 3 ? 'text-rose-600' : ''} title={`Suppression définitive le ${formatDate(item.purge_at)}`}>
                                            {daysLeft > 0 ? `effacé dans ${daysLeft} j` : 'effacé cette nuit'}
                                        </span>
                                    </p>
                                </div>
                                <div className="ml-12 flex items-center gap-1 sm:ml-0">
                                    {canEdit && <Button size="sm" variant="secondary" icon={ArrowUturnLeftIcon} onClick={() => restore(item)}>Restaurer</Button>}
                                    {canPurge && (
                                        <button type="button" onClick={() => purge(item)} className="rounded-md p-1.5 text-gray-400 hover:bg-rose-50 hover:text-rose-600" title="Supprimer définitivement" aria-label={`Supprimer définitivement ${item.label}`}>
                                            <TrashIcon className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </AppLayout>
    );
}
