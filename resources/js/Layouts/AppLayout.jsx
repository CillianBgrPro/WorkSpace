import { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    HomeIcon, CheckCircleIcon, UsersIcon,
    CalendarIcon, CurrencyEuroIcon, ChevronLeftIcon,
    ChevronRightIcon, PowerIcon
} from '@heroicons/react/24/outline';

export default function AppLayout({ children, header }) {
    const [collapsed, setCollapsed] = useState(false);
    const { auth } = usePage().props;

    const navItems = [
        { href: '/dashboard', icon: HomeIcon, label: 'Dashboard' },
        { href: '/tasks', icon: CheckCircleIcon, label: 'Tâches' },
        { href: '/teams', icon: UsersIcon, label: 'Équipe' },
        { href: '/calendar', icon: CalendarIcon, label: 'Calendrier' },
        { href: '/budgets', icon: CurrencyEuroIcon, label: 'Budget' },
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

                <nav className="flex-1 p-2 space-y-1">
                    {navItems.map(({ href, icon: Icon, label }) => (
                        <Link key={href} href={href}
                            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition">
                            <Icon className="w-5 h-5 shrink-0" />
                            {!collapsed && <span className="text-sm">{label}</span>}
                        </Link>
                    ))}
                </nav>

                <Link href="/logout" method="post" as="button" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition">
                    <PowerIcon className="w-5 h-5 shrink-0" />
                    {!collapsed && <span className="text-sm">Déconnexion</span>}
                </Link>
            </aside>

            {/* Main */}
            <div className="flex flex-col flex-1 overflow-hidden">
                <header className="flex items-center px-6 py-3 bg-white border-b border-gray-200">
                    <h1 className="text-lg font-semibold text-gray-800">{header}</h1>
                </header>

                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
