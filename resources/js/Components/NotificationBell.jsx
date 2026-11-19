import { useEffect, useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import { BellIcon } from '@heroicons/react/24/outline';
import {
    UserPlusIcon, ChatBubbleLeftEllipsisIcon, AtSymbolIcon, ClockIcon, CalendarDaysIcon, FolderPlusIcon,
} from '@heroicons/react/20/solid';
import { Spinner } from '@/Components/ui/Button';
import { formatRelative } from '@/lib/format';

const ICONS = {
    task_assigned: [UserPlusIcon, 'bg-indigo-100 text-indigo-600'],
    comment: [ChatBubbleLeftEllipsisIcon, 'bg-sky-100 text-sky-600'],
    mention: [AtSymbolIcon, 'bg-violet-100 text-violet-600'],
    due_soon: [ClockIcon, 'bg-amber-100 text-amber-600'],
    event_reminder: [CalendarDaysIcon, 'bg-emerald-100 text-emerald-600'],
    project_added: [FolderPlusIcon, 'bg-indigo-100 text-indigo-600'],
};

function Panel({ close }) {
    const [state, setState] = useState({ loading: true, items: [] });

    useEffect(() => {
        fetch(route('notifications.index'), { headers: { Accept: 'application/json' }, credentials: 'same-origin' })
            .then((r) => r.json())
            .then((json) => setState({ loading: false, items: json.items }))
            .catch(() => setState({ loading: false, items: [] }));
    }, []);

    const readAll = async () => {
        await fetch(route('notifications.read-all'), {
            method: 'POST',
            credentials: 'same-origin',
            headers: { 'X-XSRF-TOKEN': decodeURIComponent(document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] ?? ''), Accept: 'application/json' },
        });
        setState((s) => ({ ...s, items: s.items.map((i) => ({ ...i, read: true })) }));
        router.reload({ only: ['unreadNotifications'] });
    };

    const open = (item) => { close(); router.visit(route('notifications.open', item.id)); };
    const hasUnread = state.items.some((i) => !i.read);

    return (
        <div className="flex max-h-[70vh] flex-col">
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                <h2 className="text-sm font-semibold text-gray-900">Notifications</h2>
                {hasUnread && (
                    <button type="button" onClick={readAll} className="text-xs font-medium text-indigo-600 hover:text-indigo-500">Tout marquer comme lu</button>
                )}
            </div>
            <div className="overflow-y-auto">
                {state.loading ? (
                    <div className="flex justify-center py-10"><Spinner className="h-5 w-5 text-gray-400" /></div>
                ) : state.items.length === 0 ? (
                    <div className="px-6 py-10 text-center">
                        <BellIcon className="mx-auto h-8 w-8 text-gray-300" />
                        <p className="mt-2 text-sm font-medium text-gray-900">Rien de neuf</p>
                        <p className="mt-0.5 text-xs text-gray-500">Assignations, mentions et rappels apparaîtront ici.</p>
                    </div>
                ) : (
                    <ul className="divide-y divide-gray-50">
                        {state.items.map((item) => {
                            const [Icon, tone] = ICONS[item.type] ?? ICONS.comment;
                            return (
                                <li key={item.id}>
                                    <button type="button" onClick={() => open(item)} className={`flex w-full gap-3 px-4 py-3 text-left transition hover:bg-gray-50 ${item.read ? '' : 'bg-indigo-50/40'}`}>
                                        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${tone}`}><Icon className="h-4 w-4" /></span>
                                        <span className="min-w-0 flex-1">
                                            <span className={`block text-sm ${item.read ? 'text-gray-600' : 'font-medium text-gray-900'}`}>{item.message}</span>
                                            {item.excerpt && <span className="mt-0.5 block truncate text-xs text-gray-500">« {item.excerpt} »</span>}
                                            <span className="mt-0.5 block text-xs text-gray-400">{formatRelative(item.created_at)}</span>
                                        </span>
                                        {!item.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-indigo-500" aria-label="Non lue" />}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
}

export default function NotificationBell() {
    const unread = usePage().props.unreadNotifications ?? 0;

    // Rafraîchit le compteur toutes les minutes tant que l'onglet est visible.
    useEffect(() => {
        const t = setInterval(() => {
            if (document.visibilityState === 'visible') router.reload({ only: ['unreadNotifications'] });
        }, 60000);
        return () => clearInterval(t);
    }, []);

    return (
        <Popover className="relative">
            <PopoverButton
                className="relative rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                aria-label={unread ? `Notifications (${unread} non lues)` : 'Notifications'}
            >
                <BellIcon className="h-5 w-5" />
                {unread > 0 && (
                    <span className="absolute right-1 top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">
                        {unread > 9 ? '9+' : unread}
                    </span>
                )}
            </PopoverButton>
            <PopoverPanel
                transition
                anchor={{ to: 'bottom end', gap: 8 }}
                className="z-[55] w-96 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl bg-white shadow-xl ring-1 ring-black/5 transition duration-150 data-[closed]:translate-y-1 data-[closed]:opacity-0"
            >
                {({ close }) => <Panel close={close} />}
            </PopoverPanel>
        </Popover>
    );
}
