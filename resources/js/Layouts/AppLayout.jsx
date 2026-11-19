import { useEffect, useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import {
    HomeIcon, CheckCircleIcon, UsersIcon, CalendarIcon, CurrencyEuroIcon,
    ChevronDoubleLeftIcon, ChevronDoubleRightIcon, ArrowRightOnRectangleIcon,
    FolderIcon, UserPlusIcon, DocumentIcon, Bars3Icon, XMarkIcon, MagnifyingGlassIcon,
    ChevronUpDownIcon, QuestionMarkCircleIcon,
} from '@heroicons/react/24/outline';
import {
    HomeIcon as HomeSolid, CheckCircleIcon as CheckSolid, CalendarIcon as CalendarSolid, CurrencyEuroIcon as EuroSolid,
} from '@heroicons/react/24/solid';
import CommandPalette, { openPaletteEvent } from '@/Components/CommandPalette';
import NotificationBell from '@/Components/NotificationBell';
import ShortcutsHelp from '@/Components/ShortcutsHelp';
import Avatar from '@/Components/ui/Avatar';
import Kbd, { modKey } from '@/Components/ui/Kbd';
import useHotkeys from '@/hooks/useHotkeys';

function isActive(currentUrl, href) {
    const path = currentUrl.split('?')[0];
    return path === href || path.startsWith(href + '/');
}

function NavItem({ item, collapsed, active }) {
    const Icon = item.icon;
    return (
        <Link
            href={item.href}
            title={collapsed ? item.label : undefined}
            aria-current={active ? 'page' : undefined}
            className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                active ? 'bg-white/10 text-white' : 'text-indigo-100/70 hover:bg-white/5 hover:text-white'
            } ${collapsed ? 'justify-center px-0' : ''}`}
        >
            <Icon className={`h-5 w-5 shrink-0 ${active ? 'text-indigo-300' : ''}`} aria-hidden="true" />
            {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
            {!collapsed && item.shortcut && (
                <span className="hidden text-[10px] font-medium tracking-widest text-white/30 group-hover:inline">{item.shortcut}</span>
            )}
        </Link>
    );
}

/** Contenu de la navigation, partagé entre la sidebar desktop et le tiroir mobile. */
function SidebarContent({ collapsed, activeProject, navItems, currentUrl, user, onToggle, onClose, onSearch, onHelp }) {
    return (
        <>
            {/* Marque */}
            <div className={`flex h-14 shrink-0 items-center px-4 ${collapsed ? 'justify-center' : 'justify-between'}`}>
                {!collapsed && (
                    <Link href="/projects" className="flex items-center gap-2 text-[15px] font-semibold tracking-tight text-white">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500 text-xs font-bold">W</span>
                        WorkSpace
                    </Link>
                )}
                {onToggle && (
                    <button
                        onClick={onToggle}
                        className="rounded-md p-1.5 text-white/50 transition hover:bg-white/10 hover:text-white"
                        aria-label={collapsed ? 'Déplier le menu' : 'Replier le menu'}
                        title={collapsed ? 'Déplier le menu' : 'Replier le menu'}
                    >
                        {collapsed ? <ChevronDoubleRightIcon className="h-4 w-4" /> : <ChevronDoubleLeftIcon className="h-4 w-4" />}
                    </button>
                )}
                {onClose && (
                    <button onClick={onClose} className="-mr-1 rounded-lg p-2 text-white/70 hover:bg-white/10" aria-label="Fermer le menu">
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                )}
            </div>

            {/* Projet actif → sélecteur */}
            <div className={`px-3 ${collapsed ? 'px-2' : ''}`}>
                <Link
                    href={route('projects.index')}
                    title={activeProject ? `${activeProject.name} — changer de projet` : 'Choisir un projet'}
                    className={`group flex items-center gap-2.5 rounded-lg border border-white/10 bg-white/5 p-2 transition hover:border-white/20 hover:bg-white/10 ${collapsed ? 'justify-center' : ''}`}
                >
                    <span
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-xs font-bold text-white"
                        style={{ backgroundColor: activeProject?.color ?? '#6366f1' }}
                    >
                        {activeProject ? activeProject.name.charAt(0).toUpperCase() : <FolderIcon className="h-4 w-4" />}
                    </span>
                    {!collapsed && (
                        <>
                            <span className="min-w-0 flex-1">
                                <span className="block text-[10px] font-medium uppercase tracking-wider text-white/40">Projet</span>
                                <span className="block truncate text-sm font-medium text-white">{activeProject?.name ?? 'Choisir un projet'}</span>
                            </span>
                            <ChevronUpDownIcon className="h-4 w-4 shrink-0 text-white/40 group-hover:text-white/70" />
                        </>
                    )}
                </Link>
            </div>

            {/* Recherche */}
            <div className={`px-3 pt-3 ${collapsed ? 'px-2' : ''}`}>
                <button
                    onClick={onSearch}
                    title={`Rechercher (${modKey} K)`}
                    className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-white/50 ring-1 ring-inset ring-white/10 transition hover:text-white/80 hover:ring-white/20 ${collapsed ? 'justify-center px-0' : ''}`}
                >
                    <MagnifyingGlassIcon className="h-4 w-4 shrink-0" />
                    {!collapsed && (
                        <>
                            <span className="flex-1 text-left">Rechercher…</span>
                            <span className="text-[11px] text-white/30">{modKey} K</span>
                        </>
                    )}
                </button>
            </div>

            <nav className="mt-3 flex-1 space-y-0.5 overflow-y-auto px-3" aria-label="Navigation principale">
                {navItems.map((item) => (
                    <NavItem key={item.href} item={item} collapsed={collapsed} active={isActive(currentUrl, item.href)} />
                ))}

                {activeProject && (
                    <>
                        {!collapsed && <p className="px-3 pb-1 pt-5 text-[10px] font-semibold uppercase tracking-wider text-white/30">Projet</p>}
                        <NavItem
                            item={{ href: `/projects/${activeProject.id}`, icon: UserPlusIcon, label: 'Membres' }}
                            collapsed={collapsed}
                            active={currentUrl.split('?')[0] === `/projects/${activeProject.id}`}
                        />
                    </>
                )}
            </nav>

            {/* Pied : aide + utilisateur */}
            <div className="space-y-1 border-t border-white/10 p-3">
                {onHelp && (
                    <button
                        onClick={onHelp}
                        title="Raccourcis clavier (?)"
                        className={`hidden w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/50 transition hover:bg-white/5 hover:text-white md:flex ${collapsed ? 'justify-center px-0' : ''}`}
                    >
                        <QuestionMarkCircleIcon className="h-5 w-5 shrink-0" />
                        {!collapsed && <span className="flex-1 text-left">Raccourcis clavier</span>}
                        {!collapsed && <span className="text-[11px] text-white/30">?</span>}
                    </button>
                )}
                <div className={`flex items-center gap-2.5 rounded-lg p-1 ${collapsed ? 'flex-col' : ''}`}>
                    <Link href={route('profile.edit')} title="Mon compte" className={`flex min-w-0 flex-1 items-center gap-2.5 rounded-lg p-1 transition hover:bg-white/5 ${collapsed ? 'justify-center' : ''}`}>
                        <Avatar name={user?.name ?? ''} size="md" className="ring-white/10" />
                        {!collapsed && (
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-white">{user?.name}</p>
                                <p className="truncate text-xs text-white/40">{user?.email}</p>
                            </div>
                        )}
                    </Link>
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        title="Se déconnecter"
                        aria-label="Se déconnecter"
                        className="rounded-md p-1.5 text-white/40 transition hover:bg-white/10 hover:text-white"
                    >
                        <ArrowRightOnRectangleIcon className="h-5 w-5" />
                    </Link>
                </div>
            </div>
        </>
    );
}

function readCollapsed() {
    try { return localStorage.getItem('ws.sidebar.collapsed') === '1'; } catch { return false; }
}

export default function AppLayout({ children, header }) {
    const [collapsed, setCollapsed] = useState(readCollapsed);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [paletteOpen, setPaletteOpen] = useState(false);
    const [helpOpen, setHelpOpen] = useState(false);
    const { url, props } = usePage();
    const user = props.auth?.user;
    const activeProject = props.activeProject ?? null;

    const dashboardHref = activeProject ? `/projects/${activeProject.id}/dashboard` : '/projects';

    const navItems = [
        { href: dashboardHref, icon: HomeIcon, activeIcon: HomeSolid, label: 'Dashboard', shortcut: 'G D' },
        { href: '/tasks', icon: CheckCircleIcon, activeIcon: CheckSolid, label: 'Tâches', shortcut: 'G T' },
        { href: '/calendar', icon: CalendarIcon, activeIcon: CalendarSolid, label: 'Calendrier', shortcut: 'G C' },
        { href: '/budgets', icon: CurrencyEuroIcon, activeIcon: EuroSolid, label: 'Budget', shortcut: 'G B' },
        { href: '/teams', icon: UsersIcon, label: 'Équipes', shortcut: 'G E' },
        { href: '/project-files', icon: DocumentIcon, label: 'Fichiers', shortcut: 'G F' },
    ];
    const tabItems = navItems.slice(0, 4);

    const toggleCollapsed = () => {
        setCollapsed((c) => {
            try { localStorage.setItem('ws.sidebar.collapsed', c ? '0' : '1'); } catch { /* stockage indisponible */ }
            return !c;
        });
    };

    useHotkeys({
        'mod+k': () => setPaletteOpen((o) => !o),
        // ⌘/Ctrl + Entrée : enregistre le formulaire en cours d'édition.
        'mod+Enter': () => document.activeElement?.closest('form')?.requestSubmit(),
        '?': () => setHelpOpen(true),
        n: () => activeProject?.can_edit !== false && router.visit('/tasks/create'),
        '/': () => document.querySelector('[data-page-search]')?.focus(),
        'g d': () => router.visit(dashboardHref),
        'g t': () => router.visit('/tasks'),
        'g c': () => router.visit('/calendar'),
        'g b': () => router.visit('/budgets'),
        'g e': () => router.visit('/teams'),
        'g f': () => router.visit('/project-files'),
        'g p': () => router.visit('/projects'),
    });

    useEffect(() => {
        const open = () => setPaletteOpen(true);
        window.addEventListener(openPaletteEvent, open);
        return () => window.removeEventListener(openPaletteEvent, open);
    }, []);

    // Ferme le tiroir mobile à chaque navigation.
    useEffect(() => router.on('navigate', () => setMobileOpen(false)), []);

    // Bloque le scroll de la page quand le tiroir est ouvert.
    useEffect(() => {
        document.body.style.overflow = mobileOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [mobileOpen]);

    const sidebarProps = { activeProject, navItems, currentUrl: url, user, onSearch: () => setPaletteOpen(true), onHelp: () => setHelpOpen(true) };

    return (
        <div className="flex h-dvh bg-gray-50">
            <a href="#contenu" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[80] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:shadow">
                Aller au contenu
            </a>

            {/* Sidebar desktop */}
            <aside className={`hidden shrink-0 flex-col bg-[#0f0a2e] transition-[width] duration-200 md:flex ${collapsed ? 'w-[68px]' : 'w-64'}`}>
                <SidebarContent {...sidebarProps} collapsed={collapsed} onToggle={toggleCollapsed} />
            </aside>

            {/* Tiroir mobile */}
            <div className={`fixed inset-0 z-50 md:hidden ${mobileOpen ? '' : 'pointer-events-none'}`} aria-hidden={!mobileOpen}>
                <div
                    className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${mobileOpen ? 'opacity-100' : 'opacity-0'}`}
                    onClick={() => setMobileOpen(false)}
                />
                <aside
                    className={`absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-[#0f0a2e] shadow-xl transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
                >
                    <SidebarContent {...sidebarProps} collapsed={false} onHelp={null} onClose={() => setMobileOpen(false)} onSearch={() => { setMobileOpen(false); setPaletteOpen(true); }} />
                </aside>
            </div>

            {/* Main */}
            <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
                <header className="flex h-14 shrink-0 items-center gap-3 border-b border-gray-200 bg-white/80 px-4 backdrop-blur md:px-6">
                    <button
                        onClick={() => setMobileOpen(true)}
                        className="-ml-1 rounded-lg p-1.5 text-gray-600 hover:bg-gray-100 md:hidden"
                        aria-label="Ouvrir le menu"
                    >
                        <Bars3Icon className="h-6 w-6" />
                    </button>

                    {/* Fil d'Ariane */}
                    <nav className="flex min-w-0 items-center gap-2 text-sm" aria-label="Fil d'Ariane">
                        {activeProject && (
                            <>
                                <Link href={dashboardHref} className="hidden max-w-[14rem] items-center gap-2 truncate font-medium text-gray-500 transition hover:text-gray-900 sm:flex">
                                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: activeProject.color }} />
                                    <span className="truncate">{activeProject.name}</span>
                                </Link>
                                <span className="hidden text-gray-300 sm:inline" aria-hidden="true">/</span>
                            </>
                        )}
                        <span className="truncate font-semibold text-gray-900">{header}</span>
                        {activeProject?.can_edit === false && (
                            <span className="shrink-0 rounded-md bg-amber-50 px-1.5 py-0.5 text-[11px] font-medium text-amber-700 ring-1 ring-inset ring-amber-200" title="Vous pouvez consulter ce projet mais pas le modifier">
                                Lecture seule
                            </span>
                        )}
                    </nav>

                    <div className="ml-auto flex items-center gap-1.5">
                        <NotificationBell />
                        <button
                            onClick={() => setPaletteOpen(true)}
                            className="hidden items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm text-gray-500 ring-1 ring-inset ring-gray-200 transition hover:text-gray-800 hover:ring-gray-300 lg:flex"
                        >
                            <MagnifyingGlassIcon className="h-4 w-4" />
                            <span className="pr-6">Rechercher…</span>
                            <Kbd>{modKey}</Kbd><Kbd>K</Kbd>
                        </button>
                        <button
                            onClick={() => setPaletteOpen(true)}
                            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800 lg:hidden"
                            aria-label="Rechercher"
                        >
                            <MagnifyingGlassIcon className="h-5 w-5" />
                        </button>
                    </div>
                </header>

                <main id="contenu" scroll-region="" className="flex-1 overflow-y-auto overflow-x-hidden">
                    <div className="mx-auto w-full max-w-7xl p-4 pb-24 md:p-6 lg:p-8">
                        {children}
                    </div>
                </main>

                {/* Barre d'onglets mobile */}
                <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden" aria-label="Navigation rapide">
                    <div className="grid grid-cols-5">
                        {tabItems.map(({ href, icon: Icon, activeIcon: ActiveIcon, label }) => {
                            const active = isActive(url, href);
                            const TabIcon = active && ActiveIcon ? ActiveIcon : Icon;
                            return (
                                <Link
                                    key={href}
                                    href={href}
                                    aria-current={active ? 'page' : undefined}
                                    className={`flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium ${active ? 'text-indigo-600' : 'text-gray-500'}`}
                                >
                                    <TabIcon className="h-6 w-6" />
                                    {label}
                                </Link>
                            );
                        })}
                        <button
                            onClick={() => setMobileOpen(true)}
                            className="flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium text-gray-500"
                        >
                            <Bars3Icon className="h-6 w-6" />
                            Plus
                        </button>
                    </div>
                </nav>
            </div>

            <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} activeProject={activeProject} />
            <ShortcutsHelp open={helpOpen} onClose={() => setHelpOpen(false)} />
        </div>
    );
}
