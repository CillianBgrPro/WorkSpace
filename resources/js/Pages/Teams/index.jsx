import AppLayout from '@/Layouts/AppLayout';
import { Head, Link } from '@inertiajs/react';

export default function TeamIndex({ teams }) {
    return (
        <AppLayout header="Equipes">
            <Head title="Equipes" />

            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-semibold dark:text-white">Gestion des equipes</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Créer et organiser vos collaborateurs.</p>
                </div>
                <Link href="/teams/create" className="px-4 py-2 rounded-lg bg-indigo-600 text-white">
                    Nouvelle equipe
                </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {teams.map((team) => (
                    <div key={team.id} className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <h3 className="text-lg font-semibold dark:text-white">{team.name}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{team.description || 'Aucune description'}</p>
                            </div>
                            <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 dark:text-gray-200">
                                {team.members_count} membres
                            </span>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <span>Proprietaire: {team.owner.name}</span>
                        </div>

                        <div className="mt-5 flex gap-2 flex-wrap">
                            <Link href={`/teams/${team.id}/edit`} className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-200">
                                Gerer
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </AppLayout>
    );
}
