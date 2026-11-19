import { useEffect, useMemo, useState } from 'react';
import { router } from '@inertiajs/react';
import { Combobox, ComboboxInput, ComboboxOption, ComboboxOptions, Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react';
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import {
    HomeIcon, CheckCircleIcon, UsersIcon, CalendarIcon, CurrencyEuroIcon, DocumentIcon,
    FolderIcon, PlusIcon, UserPlusIcon, ArrowDownTrayIcon, Squares2X2Icon, ListBulletIcon,
    ArrowRightOnRectangleIcon, ArrowsRightLeftIcon, UserCircleIcon,
} from '@heroicons/react/24/outline';
import { StatusBadge } from '@/Components/ui/Badge';
import Kbd from '@/Components/ui/Kbd';

// Recherche insensible aux accents et à la casse.
const norm = (s = '') => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

let cache = null;

export const openPaletteEvent = 'workspace:open-palette';
export const openPalette = () => window.dispatchEvent(new Event(openPaletteEvent));

export default function CommandPalette({ open, onClose, activeProject }) {
    const [query, setQuery] = useState('');
    const [data, setData] = useState(cache ?? { projects: [], tasks: [] });

    useEffect(() => {
        if (!open) return;
        setQuery('');
        // Rafraîchi à chaque ouverture ; l'ancien résultat s'affiche instantanément.
        fetch(route('palette'), { headers: { Accept: 'application/json' }, credentials: 'same-origin' })
            .then((r) => (r.ok ? r.json() : null))
            .then((json) => { if (json) { cache = json; setData(json); } })
            .catch(() => {});
    }, [open]);

    const go = (href) => { onClose(); router.visit(href); };

    const commands = useMemo(() => {
        const p = activeProject;
        const nav = [
            p && { id: 'nav-dash', group: 'Aller à', label: 'Dashboard', icon: HomeIcon, hint: 'G D', run: () => go(`/projects/${p.id}/dashboard`) },
            { id: 'nav-tasks', group: 'Aller à', label: 'Tâches', icon: CheckCircleIcon, hint: 'G T', run: () => go('/tasks') },
            { id: 'nav-kanban', group: 'Aller à', label: 'Tâches — vue kanban', icon: Squares2X2Icon, run: () => go('/tasks?view=kanban') },
            { id: 'nav-cal', group: 'Aller à', label: 'Calendrier', icon: CalendarIcon, hint: 'G C', run: () => go('/calendar') },
            { id: 'nav-budget', group: 'Aller à', label: 'Budget', icon: CurrencyEuroIcon, hint: 'G B', run: () => go('/budgets') },
            { id: 'nav-teams', group: 'Aller à', label: 'Équipes', icon: UsersIcon, hint: 'G E', run: () => go('/teams') },
            { id: 'nav-files', group: 'Aller à', label: 'Fichiers', icon: DocumentIcon, hint: 'G F', run: () => go('/project-files') },
            { id: 'nav-projects', group: 'Aller à', label: 'Tous mes projets', icon: FolderIcon, hint: 'G P', run: () => go('/projects') },
            { id: 'nav-profile', group: 'Aller à', label: 'Mon compte (profil, mot de passe, thème)', icon: UserCircleIcon, run: () => go('/profile') },
        ];
        const actions = [
            { id: 'new-task', group: 'Actions', label: 'Nouvelle tâche', icon: PlusIcon, hint: 'N', run: () => go('/tasks/create') },
            { id: 'new-event', group: 'Actions', label: 'Nouvel événement', icon: CalendarIcon, run: () => go('/calendar?new=1') },
            { id: 'new-budget', group: 'Actions', label: 'Nouveau budget', icon: CurrencyEuroIcon, run: () => go('/budgets/create') },
            { id: 'new-team', group: 'Actions', label: 'Nouvelle équipe', icon: UsersIcon, run: () => go('/teams/create') },
            p && { id: 'add-member', group: 'Actions', label: 'Inviter un membre au projet', icon: UserPlusIcon, run: () => go(`/projects/${p.id}?invite=1`) },
            { id: 'export-tasks', group: 'Actions', label: 'Exporter les tâches (CSV)', icon: ArrowDownTrayIcon, run: () => { onClose(); window.location.href = route('reports.tasks.csv'); } },
            { id: 'export-exp', group: 'Actions', label: 'Exporter les dépenses (CSV)', icon: ArrowDownTrayIcon, run: () => { onClose(); window.location.href = route('reports.expenses.csv'); } },
            { id: 'logout', group: 'Actions', label: 'Se déconnecter', icon: ArrowRightOnRectangleIcon, run: () => { onClose(); router.post(route('logout')); } },
        ];
        const projects = data.projects
            .filter((pr) => pr.id !== p?.id)
            .map((pr) => ({ id: `project-${pr.id}`, group: 'Changer de projet', label: pr.name, color: pr.color, icon: ArrowsRightLeftIcon, run: () => go(`/projects/${pr.id}/dashboard`) }));
        const tasks = data.tasks.map((t) => ({ id: `task-${t.id}`, group: 'Tâches', label: t.title, status: t.status, icon: ListBulletIcon, run: () => go(`/tasks/${t.id}`) }));
        return [...nav, ...actions, ...projects, ...tasks].filter(Boolean);
    }, [data, activeProject]);

    const results = useMemo(() => {
        const q = norm(query.trim());
        if (!q) {
            // Sans saisie : raccourcis utiles, pas la liste complète des tâches.
            return commands.filter((c) => c.group !== 'Tâches').slice(0, 14);
        }
        const words = q.split(/\s+/);
        return commands
            .filter((c) => words.every((w) => norm(`${c.label} ${c.group}`).includes(w)))
            .slice(0, 40);
    }, [query, commands]);

    const groups = useMemo(() => {
        const map = new Map();
        results.forEach((r) => { if (!map.has(r.group)) map.set(r.group, []); map.get(r.group).push(r); });
        return [...map.entries()];
    }, [results]);

    return (
        <Dialog open={open} onClose={onClose} className="relative z-[65]">
            <DialogBackdrop transition className="fixed inset-0 bg-gray-900/40 backdrop-blur-[2px] transition-opacity duration-150 data-[closed]:opacity-0" />
            <div className="fixed inset-0 overflow-y-auto p-3 pt-[12vh] sm:p-6 sm:pt-[15vh]">
                <DialogPanel
                    transition
                    className="mx-auto max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 transition duration-150 data-[closed]:scale-95 data-[closed]:opacity-0"
                >
                    <Combobox onChange={(item) => item?.run()}>
                        <div className="relative border-b border-gray-100">
                            <MagnifyingGlassIcon className="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                            <ComboboxInput
                                autoFocus
                                className="h-12 w-full border-0 bg-transparent pl-11 pr-4 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm"
                                placeholder="Rechercher une page, une tâche, un projet…"
                                onChange={(e) => setQuery(e.target.value)}
                                autoComplete="off"
                            />
                        </div>

                        {results.length > 0 ? (
                            <ComboboxOptions static className="max-h-[60vh] scroll-py-2 overflow-y-auto p-2">
                                {groups.map(([group, items]) => (
                                    <div key={group} className="mb-1">
                                        <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">{group}</p>
                                        {items.map((item) => (
                                            <ComboboxOption
                                                key={item.id}
                                                value={item}
                                                className="group flex cursor-pointer select-none items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 data-[focus]:bg-indigo-600 data-[focus]:text-white"
                                            >
                                                {item.color ? (
                                                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                                                ) : (
                                                    <item.icon className="h-5 w-5 shrink-0 text-gray-400 group-data-[focus]:text-white" aria-hidden="true" />
                                                )}
                                                <span className="flex-1 truncate">{item.label}</span>
                                                {item.status && <span className="group-data-[focus]:opacity-90"><StatusBadge status={item.status} /></span>}
                                                {item.hint && <span className="hidden text-xs text-gray-400 group-data-[focus]:text-indigo-100 sm:inline">{item.hint}</span>}
                                            </ComboboxOption>
                                        ))}
                                    </div>
                                ))}
                            </ComboboxOptions>
                        ) : (
                            <div className="px-6 py-10 text-center text-sm text-gray-500">
                                Aucun résultat pour « {query} ».
                            </div>
                        )}

                        <div className="hidden items-center gap-4 border-t border-gray-100 bg-gray-50 px-4 py-2.5 text-xs text-gray-500 sm:flex">
                            <span className="flex items-center gap-1"><Kbd>↑</Kbd><Kbd>↓</Kbd> naviguer</span>
                            <span className="flex items-center gap-1"><Kbd>↵</Kbd> ouvrir</span>
                            <span className="flex items-center gap-1"><Kbd>Échap</Kbd> fermer</span>
                            <span className="ml-auto flex items-center gap-1"><Kbd>?</Kbd> raccourcis</span>
                        </div>
                    </Combobox>
                </DialogPanel>
            </div>
        </Dialog>
    );
}
