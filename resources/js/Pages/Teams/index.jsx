import { Head, Link } from '@inertiajs/react';
import { PlusIcon, UsersIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import AppLayout from '@/Layouts/AppLayout';
import PageHeader from '@/Components/ui/PageHeader';
import Button from '@/Components/ui/Button';
import EmptyState from '@/Components/ui/EmptyState';
import { AvatarStack } from '@/Components/ui/Avatar';

export default function TeamIndex({ teams }) {
    return (
        <AppLayout header="Équipes">
            <Head title="Équipes" />

            <PageHeader
                title="Équipes"
                description="Regroupez les membres du projet par pôle pour les inviter d'un coup aux événements."
                actions={<Button href="/teams/create" icon={PlusIcon}>Nouvelle équipe</Button>}
            />

            {teams.length === 0 ? (
                <EmptyState
                    icon={UsersIcon}
                    title="Aucune équipe"
                    description="Créez une équipe (ex. « Front-end », « Design ») et ajoutez-y des membres du projet."
                    action={<Button href="/teams/create" icon={PlusIcon}>Créer une équipe</Button>}
                />
            ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {teams.map((team) => (
                        <Link
                            key={team.id}
                            href={`/teams/${team.id}/edit`}
                            className="group flex flex-col rounded-xl border border-gray-200/80 bg-white p-5 shadow-sm transition hover:border-gray-300 hover:shadow"
                        >
                            <div className="flex items-start gap-3">
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                                    <UsersIcon className="h-5 w-5" />
                                </span>
                                <div className="min-w-0 flex-1">
                                    <h2 className="truncate font-semibold text-gray-900 group-hover:text-indigo-700">{team.name}</h2>
                                    <p className="mt-0.5 line-clamp-2 text-sm text-gray-500">{team.description || 'Aucune description'}</p>
                                </div>
                                <ChevronRightIcon className="h-5 w-5 shrink-0 text-gray-300 transition group-hover:translate-x-0.5 group-hover:text-gray-500" />
                            </div>
                            <div className="mt-5 flex items-center justify-between">
                                {team.members?.length ? (
                                    <AvatarStack names={team.members.map((m) => m.name)} />
                                ) : (
                                    <span className="text-xs text-gray-400">Aucun membre</span>
                                )}
                                <span className="text-xs text-gray-500">
                                    {team.members_count} membre{team.members_count > 1 ? 's' : ''}
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </AppLayout>
    );
}
