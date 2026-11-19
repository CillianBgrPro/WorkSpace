import { useEffect, useRef, useState } from 'react';
import { router } from '@inertiajs/react';
import { MagnifyingGlassIcon, XMarkIcon, ListBulletIcon, ViewColumnsIcon } from '@heroicons/react/20/solid';
import { Select } from '@/Components/ui/Field';
import Kbd from '@/Components/ui/Kbd';
import { STATUSES, PRIORITIES } from '@/lib/taskMeta';

function apply(filters, patch) {
    const next = { ...filters, ...patch };
    // URL propre : on retire les filtres vides et la vue par défaut.
    Object.keys(next).forEach((k) => { if (!next[k] || (k === 'view' && next[k] === 'list')) delete next[k]; });
    router.get('/tasks', next, { preserveState: true, preserveScroll: true, replace: true, only: ['tasks', 'filters'] });
}

export default function TaskFilters({ filters, count }) {
    const [search, setSearch] = useState(filters.search ?? '');
    const first = useRef(true);

    // Recherche « debounced » : une requête 250 ms après la dernière frappe, pas à chaque touche.
    useEffect(() => {
        if (first.current) { first.current = false; return; }
        const t = setTimeout(() => apply(filters, { search }), 250);
        return () => clearTimeout(t);
    }, [search]);

    const hasFilters = !!(filters.search || filters.status || filters.priority || filters.mine);
    const view = filters.view === 'kanban' ? 'kanban' : 'list';

    return (
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
            <div className="relative flex-1 xl:min-w-[16rem]">
                <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
                <input
                    type="search"
                    data-page-search
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Escape') { setSearch(''); e.currentTarget.blur(); } }}
                    placeholder="Rechercher une tâche…"
                    aria-label="Rechercher une tâche"
                    className="block w-full rounded-lg border-0 bg-white py-2 pl-9 pr-10 text-sm text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
                />
                {!search && <Kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 md:inline-flex">/</Kbd>}
            </div>

            <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
                <Select
                    value={filters.status ?? ''}
                    onChange={(e) => apply(filters, { status: e.target.value })}
                    aria-label="Filtrer par statut"
                    className="sm:w-40"
                >
                    <option value="">Tous les statuts</option>
                    {Object.entries(STATUSES).map(([k, s]) => <option key={k} value={k}>{s.label}</option>)}
                </Select>
                <Select
                    value={filters.priority ?? ''}
                    onChange={(e) => apply(filters, { priority: e.target.value })}
                    aria-label="Filtrer par priorité"
                    className="sm:w-40"
                >
                    <option value="">Toutes priorités</option>
                    {Object.entries(PRIORITIES).map(([k, p]) => <option key={k} value={k}>{p.label}</option>)}
                </Select>

                <button
                    type="button"
                    onClick={() => apply(filters, { mine: filters.mine ? null : '1' })}
                    aria-pressed={!!filters.mine}
                    className={`col-span-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium shadow-sm ring-1 ring-inset transition sm:col-span-1 ${
                        filters.mine ? 'bg-indigo-50 text-indigo-700 ring-indigo-300' : 'bg-white text-gray-700 ring-gray-300 hover:bg-gray-50'
                    }`}
                >
                    Mes tâches
                </button>

                {/* Bascule Liste / Kanban */}
                <div className="col-span-2 flex rounded-lg bg-gray-200/70 p-0.5 sm:col-span-1" role="group" aria-label="Affichage">
                    {[
                        ['list', 'Liste', ListBulletIcon],
                        ['kanban', 'Kanban', ViewColumnsIcon],
                    ].map(([key, label, Icon]) => (
                        <button
                            key={key}
                            type="button"
                            onClick={() => apply(filters, { view: key })}
                            aria-pressed={view === key}
                            className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition ${
                                view === key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'
                            }`}
                        >
                            <Icon className="h-4 w-4" />
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {hasFilters && (
                <div className="flex items-center gap-3 text-sm">
                    <span className="whitespace-nowrap text-gray-500">{count} résultat{count > 1 ? 's' : ''}</span>
                    <button
                        type="button"
                        onClick={() => { first.current = true; setSearch(''); apply({ view: filters.view }, {}); }}
                        className="inline-flex items-center gap-1 whitespace-nowrap font-medium text-indigo-600 hover:text-indigo-500"
                    >
                        <XMarkIcon className="h-4 w-4" />
                        Effacer les filtres
                    </button>
                </div>
            )}
        </div>
    );
}
