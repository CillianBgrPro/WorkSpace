import { Head, Link } from '@inertiajs/react';

const stats = [
    { value: '0+', label: 'Projets livrés' },
    { value: '0+',   label: 'Entreprises clientes' },
    { value: '100%',    label: 'Taux de satisfaction' },
    { value: '100%',    label: 'Gain de productivité' },
];

const features = [
    { icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                  stroke="currentColor" className="size-6">
                <path stroke-linecap="round" stroke-linejoin="round"
                      d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6"/>
            </svg>
        ),
        label: 'Tableau de bord', sub: 'Statistiques en temps réel', color: 'bg-indigo-600/20 text-indigo-400'
    },
    {
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}
                 stroke="currentColor" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round"
                      d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0 1 18 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3 1.5 1.5 3-3.75" />
            </svg>

        ),
        label: 'Gestion des tâches', sub: 'Kanban & vue liste',           color: 'bg-teal-600/20 text-teal-400' },
    {
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
            </svg>
        ),
        label: "Gestion d'équipe", sub: 'Rôles & permissions', color: 'bg-emerald-600/20 text-emerald-400'
    },
    { icon: (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                  stroke="currentColor" className="size-6">
                <path stroke-linecap="round" stroke-linejoin="round"
                      d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z"/>
            </svg>
        ), label: 'Suivi budgétaire', sub: 'Dépenses & rapports', color: 'bg-orange-600/20 text-orange-400'
    },
    {icon: (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                 stroke="currentColor" className="size-6">
                <path stroke-linecap="round" stroke-linejoin="round"
                      d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z"/>
            </svg>
        ),
        label: 'Calendrier', sub: 'Planification collaborative', color: 'bg-red-600/20 text-red-400'
    },
    {icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                 stroke="currentColor" className="size-6">
                <path stroke-linecap="round" stroke-linejoin="round"
                      d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636"/>
            </svg>

        ), label: 'Sans limites', sub: 'Projets illimités', color: 'bg-purple-600/20 text-purple-400'
    },
];

const testimonials = [
    {
        initials: 'SC',
        color: 'bg-indigo-500',
        quote: "WorkSpace a réduit nos délais de livraison de 40% en deux mois. Un outil indispensable.",
        name: 'Sophie Cazeneuve',
        role: 'Directrice produit, Nexify'
    },
    {
        initials: 'TM',
        color: 'bg-teal-500',
        quote: "La visibilité sur les budgets et les équipes est incomparable. Je recommande à 100%.",
        name: 'Thomas Mercier',
        role: 'CTO, DigitalWave'
    },
    {
        initials: 'LF',
        color: 'bg-emerald-500',
        quote: "L'interface est magnifique et vraiment intuitive. Mon équipe l'a adopté en un jour.",
        name: 'Laure Fontaine',
        role: 'Chef de projet, Arkéa' },
];

export default function Welcome({ auth }) {
    return (
        <>
            <Head title="Accueil" />
            <div className="min-h-screen bg-[#0d0d1a] text-white">

                {/* Navbar */}
                <nav className="flex items-center justify-between px-8 py-5 max-w-7xl mx-auto">
                    <div className="flex items-center gap-3">
                        <span className="font-bold text-lg">WorkSpace</span>
                    </div>
                    <div className="flex items-center gap-3">
                        {auth.user ? (
                            <Link href={route('dashboard')} className="bg-indigo-600 hover:bg-indigo-700 px-5 py-2 rounded-lg text-sm font-medium transition">
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link href={route('login')} className="border border-white/20 hover:border-white/40 px-5 py-2 rounded-lg text-sm font-medium transition">
                                    Se connecter
                                </Link>
                                <Link href={route('register')} className="bg-indigo-600 hover:bg-indigo-700 px-5 py-2 rounded-lg text-sm font-medium transition">
                                    Commencer gratuitement
                                </Link>
                            </>
                        )}
                    </div>
                </nav>

                {/* Hero */}
                <section className="text-center px-6 pt-20 pb-16 max-w-4xl mx-auto">
                    <div className="inline-flex items-center gap-2 border border-white/10 bg-white/5 text-sm px-4 py-1.5 rounded-full mb-8 text-white/70">
                        <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                        Plateforme de gestion de projet tout-en-un
                    </div>
                    <h1 className="text-6xl font-extrabold leading-tight mb-6">
                        Gérez vos projets<br />
                        <span className="bg-gradient-to-r from-indigo-400 to-teal-400 bg-clip-text text-transparent">
                            avec WorkSpace.
                        </span>
                    </h1>
                    <p className="text-white/50 text-lg max-w-2xl mx-auto mb-10">
                        Tableau de bord analytique, gestion d'équipe, suivi budgétaire et calendrier collaboratif — tout ce dont vous avez besoin pour livrer plus vite.
                    </p>
                    <div className="flex items-center justify-center gap-4 mb-6">
                        <Link href={route('register')} className="bg-indigo-600 hover:bg-indigo-700 px-7 py-3.5 rounded-xl font-semibold transition flex items-center gap-2">
                            Démarrer gratuitement →
                        </Link>
                        <Link href={route('login')} className="border border-white/20 hover:border-white/40 bg-white/5 px-7 py-3.5 rounded-xl font-semibold transition">
                            J'ai déjà un compte
                        </Link>
                    </div>
                </section>

                {/* Stats */}
                <section className="max-w-5xl mx-auto px-6 pb-24">
                    <div className="grid grid-cols-2 lg:grid-cols-4 border border-white/10 rounded-2xl overflow-hidden">
                        {stats.map(({ value, label }, i) => (
                            <div key={label} className={`p-8 text-center ${i < stats.length - 1 ? 'border-r border-white/10' : ''} bg-white/5`}>
                                <p className="text-4xl font-extrabold mb-1">{value}</p>
                                <p className="text-white/40 text-sm">{label}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Features */}
                <section className="max-w-5xl mx-auto px-6 pb-24 text-center">
                    <div className="inline-flex items-center gap-2 border border-white/10 bg-white/5 text-sm px-4 py-1.5 rounded-full mb-6 text-white/70">
                        ✦ Tout en un seul outil
                    </div>
                    <h2 className="text-4xl font-extrabold mb-2">5 modules pour piloter</h2>
                    <p className="text-white/40 text-3xl font-extrabold mb-12">chaque aspect de vos projets</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {features.map(({ icon, label, sub, color }) => (
                            <div key={label} className="bg-white/5 border border-white/10 rounded-2xl p-6 text-left hover:bg-white/10 hover:scale-105 transition duration-300">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl mb-4 ${color}`}>
                                    {icon}
                                </div>
                                <p className="font-semibold text-white mb-1">{label}</p>
                                <p className="text-white/40 text-sm">{sub}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Testimonials */}

                <section className="max-w-5xl mx-auto px-6 pb-24 text-center">

                    <div className="flex justify-center gap-1 text-yellow-400 text-xl mb-4">

                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                        </svg>

                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                        </svg>

                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                        </svg>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                        </svg>

                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                        </svg>

                    </div>
                    <h2 className="text-3xl font-extrabold mb-12">Ils nous font confiance</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        {testimonials.map(({ initials, color, quote, name, role }) => (

                            <div key={name} className="bg-white/5 border border-white/10 rounded-2xl p-6 text-left">
                                <div className="flex gap-1 text-yellow-400 mb-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="size-4">
                                        <path fillRule="evenodd" d="M8 1.75a.75.75 0 0 1 .692.462l1.41 3.393 3.664.293a.75.75 0 0 1 .428 1.317l-2.791 2.39.853 3.575a.75.75 0 0 1-1.12.814L7.998 12.08l-3.135 1.915a.75.75 0 0 1-1.12-.814l.852-3.574-2.79-2.39a.75.75 0 0 1 .427-1.318l3.663-.293 1.41-3.393A.75.75 0 0 1 8 1.75Z" clipRule="evenodd" />
                                    </svg>

                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="size-4">
                                        <path fillRule="evenodd" d="M8 1.75a.75.75 0 0 1 .692.462l1.41 3.393 3.664.293a.75.75 0 0 1 .428 1.317l-2.791 2.39.853 3.575a.75.75 0 0 1-1.12.814L7.998 12.08l-3.135 1.915a.75.75 0 0 1-1.12-.814l.852-3.574-2.79-2.39a.75.75 0 0 1 .427-1.318l3.663-.293 1.41-3.393A.75.75 0 0 1 8 1.75Z" clipRule="evenodd" />
                                    </svg>

                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="size-4">
                                        <path fillRule="evenodd" d="M8 1.75a.75.75 0 0 1 .692.462l1.41 3.393 3.664.293a.75.75 0 0 1 .428 1.317l-2.791 2.39.853 3.575a.75.75 0 0 1-1.12.814L7.998 12.08l-3.135 1.915a.75.75 0 0 1-1.12-.814l.852-3.574-2.79-2.39a.75.75 0 0 1 .427-1.318l3.663-.293 1.41-3.393A.75.75 0 0 1 8 1.75Z" clipRule="evenodd" />
                                    </svg>

                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="size-4">
                                        <path fillRule="evenodd" d="M8 1.75a.75.75 0 0 1 .692.462l1.41 3.393 3.664.293a.75.75 0 0 1 .428 1.317l-2.791 2.39.853 3.575a.75.75 0 0 1-1.12.814L7.998 12.08l-3.135 1.915a.75.75 0 0 1-1.12-.814l.852-3.574-2.79-2.39a.75.75 0 0 1 .427-1.318l3.663-.293 1.41-3.393A.75.75 0 0 1 8 1.75Z" clipRule="evenodd" />
                                    </svg>

                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="size-4">
                                        <path fillRule="evenodd" d="M8 1.75a.75.75 0 0 1 .692.462l1.41 3.393 3.664.293a.75.75 0 0 1 .428 1.317l-2.791 2.39.853 3.575a.75.75 0 0 1-1.12.814L7.998 12.08l-3.135 1.915a.75.75 0 0 1-1.12-.814l.852-3.574-2.79-2.39a.75.75 0 0 1 .427-1.318l3.663-.293 1.41-3.393A.75.75 0 0 1 8 1.75Z" clipRule="evenodd" />
                                    </svg>

                                </div>
                                <p className="text-white/70 text-sm italic mb-6">"{quote}"</p>
                                <div className="flex items-center gap-3">
                                    <div className={`w-9 h-9 rounded-full ${color} flex items-center justify-center text-xs font-bold`}>
                                        {initials}
                                    </div>
                                    <div>
                                        <p className="text-white text-sm font-semibold">{name}</p>
                                        <p className="text-white/40 text-xs">{role}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* CTA */}
                <section className="max-w-3xl mx-auto px-6 pb-24">
                    <div className="bg-gradient-to-br from-indigo-900/60 to-purple-900/40 border border-indigo-500/20 rounded-3xl p-16 text-center">
                        <h2 className="text-4xl font-extrabold mb-4">Prêt à transformer<br />votre gestion de projet ?</h2>
                        <p className="text-white/50 mb-8 max-w-md mx-auto">
                            Rejoignez plus de 0 entreprises qui font confiance à WorkSpace pour livrer leurs projets dans les délais et le budget.
                        </p>
                        <div className="flex items-center justify-center gap-4">
                            <Link href={route('register')} className="bg-indigo-600 hover:bg-indigo-700 px-7 py-3.5 rounded-xl font-semibold transition flex items-center gap-2">
                                Créer mon compte gratuitement →
                            </Link>
                            <Link href={route('login')} className="border border-white/20 hover:border-white/40 bg-white/5 px-7 py-3.5 rounded-xl font-semibold transition">
                                Se connecter
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <span className="font-bold text-lg">WorkSpace</span>
                <footer className="border-t border-white/10 px-8 py-6 max-w-7xl mx-auto flex items-center justify-between text-white/30 text-sm">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-lg">WorkSpace</span>
                        © 2026. Tous droits réservés.
                    </div>
                    <div className="flex gap-6">
                        <a href="#" className="hover:text-white/60 transition">Confidentialité</a>
                        <a href="#" className="hover:text-white/60 transition">CGU</a>
                        <a href="#" className="hover:text-white/60 transition">Contact</a>
                    </div>
                </footer>

            </div>
        </>
    );
}
