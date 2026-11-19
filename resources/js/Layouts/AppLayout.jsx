import { useEffect, useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import {
    HomeIcon, CheckCircleIcon, UsersIcon,
    CalendarIcon, CurrencyEuroIcon, ChevronLeftIcon,
    ChevronRightIcon, PowerIcon, FolderIcon, ArrowsRightLeftIcon,
    UserPlusIcon, DocumentIcon, Bars3Icon, XMarkIcon,
} from '@heroicons/react/24/outline';

function isActive(currentUrl, href) {
    const path = currentUrl.split('?')[0];
    return path === href || path.startsWith(href + '/');
}

/**
 * Contenu de la navigation, partagé entre la sidebar desktop et le tiroir mobile.
 */
function SidebarContent({ collapsed, activeProject, navItems, currentUrl, onToggle, onClose }) {
    return (
        <>
            <div className="flex items-center justify-between p-4 border-b border-white/10">
                {!collapsed && <span className="font-semibold text-lg">WorkSpace</span>}
                {onToggle && (
                    <button
                        onClick={onToggle}
                        className="p-1 rounded hover:bg-white/10"
                        aria-label={collapsed ? 'Déplier le menu' : 'Replier le menu'}
                    >
                        {collapsed ? <ChevronRightIcon className="w-5 h-5" /> : <ChevronLeftIcon className="w-5 h-5" />}
                    </button>
                )}
                {onClose && (
                    <button onClick={onClose} className="p-2 -m-1 rounded-lg hover:bg-white/10" aria-label="Fermer le menu">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                )}
            </div>

            {/* Projet actif */}
            {activeProject && (
                <div className={`border-b border-white/10 ${collapsed ? 'p-2' : 'p-3'}`}>
                    {!collapsed && (
                        <div className="flex items-center gap-2 mb-2">
                            <div
                                className="w-3 h-3 rounded-full flex-shrink-0"
                                style={{ backgroundColor: activeProject.color }}
                            />
                            <span className="text-xs text-gray-400 uppercase tracking-wide font-medium">Projet actif</span>
                        </div>
                    )}

                    {/* Nom du projet → changer de projet */}
                    <Link
                        href={route('projects.index')}
                        className={`flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/10 transition group ${collapsed ? 'justify-center' : ''}`}
                        title={collapsed ? activeProject.name : undefined}
                    >
                        <div
                            className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: activeProject.color + '30', border: `1px solid ${activeProject.color}60` }}
                        >
                            <FolderIcon className="w-3.5 h-3.5" style={{ color: activeProject.color }} />
                        </div>
                        {!collapsed && (
                            <>
                                <span className="text-sm text-white font-medium truncate flex-1">{activeProject.name}</span>
                                <ArrowsRightLeftIcon className="w-3.5 h-3.5 text-gray-400 group-hover:text-white transition md:opacity-0 md:group-hover:opacity-100" />
                            </>
                        )}
                    </Link>

                    {/* Lien gestion des membres */}
                    {!collapsed && (
                        <Link
                            href={route('projects.show', activeProject.id)}
                            className="flex items-center gap-2 px-2 py-1.5 mt-1 rounded-lg hover:bg-white/10 transition text-gray-300 hover:text-white group"
                        >
                            <UserPlusIcon className="w-3.5 h-3.5 flex-shrink-0" />
                            <span className="text-xs">Gérer les membres</span>
                        </Link>
                    )}
                </div>
            )}

            <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
                {navItems.map(({ href, icon: Icon, label }) => (
                    <Link
                        key={href}
                        href={href}
                        title={collapsed ? label : undefined}
                        className={`flex items-center gap-3 px-3 py-2.5 md:py-2 rounded-lg transition ${
                            isActive(currentUrl, href) ? 'bg-white/15 text-white' : 'hover:bg-white/10'
                        }`}
                    >
                        <Icon className="w-5 h-5 shrink-0" />
                        {!collapsed && <span className="text-sm">{label}</span>}
                    </Link>
                ))}
            </nav>

            {/* Projets (lien vers la liste) quand pas de projet actif */}
            {!activeProject && (
                <div className="p-2 border-t border-white/10">
                    <Link
                        href={route('projects.index')}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition"
                    >
                        <FolderIcon className="w-5 h-5 shrink-0" />
                        {!collapsed && <span className="text-sm">Mes projets</span>}
                    </Link>
                </div>
            )}

            <Link href="/logout" method="post" as="button" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition m-2">
                <PowerIcon className="w-5 h-5 shrink-0" />
                {!collapsed && <span className="text-sm">Déconnexion</span>}
            </Link>
        </>
    );
}

export default function AppLayout({ children, header }) {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const { url } = usePage();

    // Récupérer le projet actif depuis les props Inertia partagées
    const activeProject = usePage().props.activeProject ?? null;

    const dashboardHref = activeProject
        ? `/projects/${activeProject.id}/dashboard`
        : '/projects';

    const navItems = [
        { href: dashboardHref, icon: HomeIcon, label: 'Dashboard' },
        { href: '/tasks', icon: CheckCircleIcon, label: 'Tâches' },
        { href: '/teams', icon: UsersIcon, label: 'Équipe' },
        { href: '/calendar', icon: CalendarIcon, label: 'Calendrier' },
        { href: '/budgets', icon: CurrencyEuroIcon, label: 'Budget' },
        { href: '/project-files', icon: DocumentIcon, label: 'Fichiers' },
    ];

    // Onglets de la barre du bas (mobile) : les 4 principaux + « Menu ».
    const tabItems = navItems.filter((item) => ['Dashboard', 'Tâches', 'Calendrier', 'Budget'].includes(item.label));

    // Ferme le tiroir mobile à chaque navigation.
    useEffect(() => router.on('navigate', () => setMobileOpen(false)), []);

    // Bloque le scroll de la page quand le tiroir est ouvert.
    useEffect(() => {
        document.body.style.overflow = mobileOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [mobileOpen]);

    return (
        <div className="flex h-dvh bg-gray-100">

            {/* Sidebar desktop */}
            <aside className={`hidden md:flex flex-col bg-[#0f0a2e] text-white transition-all duration-300 shrink-0 ${collapsed ? 'w-16' : 'w-64'}`}>
                <SidebarContent
                    collapsed={collapsed}
                    activeProject={activeProject}
                    navItems={navItems}
                    currentUrl={url}
                    onToggle={() => setCollapsed(!collapsed)}
                />
            </aside>

            {/* Tiroir mobile */}
            <div className={`md:hidden fixed inset-0 z-50 ${mobileOpen ? '' : 'pointer-events-none'}`} aria-hidden={!mobileOpen}>
                <div
                    className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${mobileOpen ? 'opacity-100' : 'opacity-0'}`}
                    onClick={() => setMobileOpen(false)}
                />
                <aside
                    className={`absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-[#0f0a2e] text-white shadow-xl transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
                >
                    <SidebarContent
                        collapsed={false}
                        activeProject={activeProject}
                        navItems={navItems}
                        currentUrl={url}
                        onClose={() => setMobileOpen(false)}
                    />
                </aside>
            </div>

            {/* Main */}
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                <header className="flex items-center gap-3 px-4 md:px-6 py-3 bg-white border-b border-gray-200">
                    <button
                        onClick={() => setMobileOpen(true)}
                        className="md:hidden -ml-1 p-1.5 rounded-lg text-gray-600 hover:bg-gray-100"
                        aria-label="Ouvrir le menu"
                    >
                        <Bars3Icon className="w-6 h-6" />
                    </button>
                    <h1 className="text-base md:text-lg font-semibold text-gray-800 truncate min-w-0">{header}</h1>
                    {activeProject && (
                        <div className="ml-auto flex items-center gap-3 shrink-0">
                            {/* Bouton rapide Gérer les membres dans le header */}
                            <Link
                                href={route('projects.show', activeProject.id)}
                                className="flex items-center gap-1.5 p-2 md:px-3 md:py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:text-gray-800 hover:border-gray-300 text-xs font-medium transition"
                                aria-label="Membres"
                            >
                                <UserPlusIcon className="w-4 h-4 md:w-3.5 md:h-3.5" />
                                <span className="hidden md:inline">Membres</span>
                            </Link>
                            <div className="hidden sm:flex items-center gap-2 max-w-[12rem]">
                                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: activeProject.color }} />
                                <span className="text-sm text-gray-500 truncate">{activeProject.name}</span>
                            </div>
                        </div>
                    )}
                </header>

                <main scroll-region="" className="flex-1 overflow-y-auto overflow-x-hidden p-4 pb-24 md:p-6">
                    {children}
                </main>

                {/* Barre d'onglets mobile */}
                <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-200 pb-[env(safe-area-inset-bottom)]">
                    <div className="grid grid-cols-5">
                        {tabItems.map(({ href, icon: Icon, label }) => {
                            const active = isActive(url, href);
                            return (
                                <Link
                                    key={href}
                                    href={href}
                                    className={`flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium ${active ? 'text-indigo-600' : 'text-gray-500'}`}
                                >
                                    <Icon className="w-6 h-6" />
                                    {label}
                                </Link>
                            );
                        })}
                        <button
                            onClick={() => setMobileOpen(true)}
                            className="flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium text-gray-500"
                        >
                            <Bars3Icon className="w-6 h-6" />
                            Menu
                        </button>
                    </div>
                </nav>
            </div>
        </div>
    );
}
