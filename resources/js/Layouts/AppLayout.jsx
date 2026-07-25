import { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    HomeIcon, CheckCircleIcon, UsersIcon,
    CalendarIcon, CurrencyEuroIcon, ChevronLeftIcon,
    ChevronRightIcon, PowerIcon, FolderIcon, ArrowsRightLeftIcon,
    UserPlusIcon, DocumentIcon
} from '@heroicons/react/24/outline';

export default function AppLayout({ children, header }) {
    const [collapsed, setCollapsed] = useState(false);
    const { auth } = usePage().props;

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

    return (
        <div className="flex h-screen bg-gray-100">

            {/* Sidebar */}
            <aside className={`flex flex-col bg-[#0f0a2e] text-white transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                    {!collapsed && <span className="font-semibold text-lg">WorkSpace</span>}
                    <button onClick={() => setCollapsed(!collapsed)} className="p-1 rounded hover:bg-white/10">
                        {collapsed ? <ChevronRightIcon className="w-5 h-5" /> : <ChevronLeftIcon className="w-5 h-5" />}
                    </button>
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
                                    <ArrowsRightLeftIcon className="w-3.5 h-3.5 text-gray-400 group-hover:text-white transition opacity-0 group-hover:opacity-100" />
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

                <nav className="flex-1 p-2 space-y-1">
                    {navItems.map(({ href, icon: Icon, label }) => (
                        <Link key={href} href={href}
                            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition">
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
            </aside>

            {/* Main */}
            <div className="flex flex-col flex-1 overflow-hidden">
                <header className="flex items-center px-6 py-3 bg-white border-b border-gray-200">
                    <h1 className="text-lg font-semibold text-gray-800">{header}</h1>
                    {activeProject && (
                        <div className="ml-auto flex items-center gap-3">
                            {/* Bouton rapide Gérer les membres dans le header */}
                            <Link
                                href={route('projects.show', activeProject.id)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:text-gray-800 hover:border-gray-300 text-xs font-medium transition"
                            >
                                <UserPlusIcon className="w-3.5 h-3.5" />
                                Membres
                            </Link>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: activeProject.color }} />
                                <span className="text-sm text-gray-500">{activeProject.name}</span>
                            </div>
                        </div>
                    )}
                </header>

                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
