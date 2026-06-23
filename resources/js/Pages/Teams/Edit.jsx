import AppLayout from '@/Layouts/AppLayout';
import { Head, router, useForm } from '@inertiajs/react';

export default function TeamEdit({ team, users }) {
    const { data, setData, put, processing, errors } = useForm({
        name: team.name,
        description: team.description || '',
        member_id: '',
        role: 'collaborateur',
    });

    const updateTeam = (e) => {
        e.preventDefault();
        put(`/teams/${team.id}`);
    };

    const addMember = (e) => {
        e.preventDefault();
        router.post(`/teams/${team.id}/members`, {
            member_id: data.member_id,
            role: data.role,
        });
    };

    return (
        <AppLayout header={`Equipe: ${team.name}`}>
            <Head title={team.name} />

            <div className="grid gap-4 lg:grid-cols-2">
                <form onSubmit={updateTeam} className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
                    <h3 className="text-lg font-semibold dark:text-white">Modifier l'equipe</h3>

                    <div>
                        <label className="block text-sm font-medium mb-1 dark:text-white">Nom</label>
                        <input
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className="w-full rounded-lg border-gray-300 dark:bg-gray-700 dark:text-white"
                        />
                        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 dark:text-white">Description</label>
                        <textarea
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            className="w-full rounded-lg border-gray-300 dark:bg-gray-700 dark:text-white"
                            rows={4}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
                    >
                        Enregistrer
                    </button>
                </form>

                <div className="space-y-4">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
                        <h3 className="text-lg font-semibold dark:text-white">Membres</h3>
                        <div className="mt-4 space-y-3">
                            {team.members.map((member) => (
                                <div key={member.id} className="flex items-center justify-between gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                                    <div>
                                        <p className="font-medium dark:text-white">{member.name}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{member.pivot.role}</p>
                                    </div>
                                </div>
                            ))}

                            {team.members.length === 0 && (
                                <p className="text-sm text-gray-500 dark:text-gray-400">Aucun membre ajoute.</p>
                            )}
                        </div>
                    </div>

                    <form onSubmit={addMember} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow space-y-4">
                        <h3 className="text-lg font-semibold dark:text-white">Ajouter un membre</h3>

                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-white">Collaborateur</label>
                            <select
                                value={data.member_id}
                                onChange={(e) => setData('member_id', e.target.value)}
                                className="w-full rounded-lg border-gray-300 dark:bg-gray-700 dark:text-white"
                            >
                                <option value="">Choisir un utilisateur</option>
                                {users.map((user) => (
                                    <option key={user.id} value={user.id}>{user.name}</option>
                                ))}
                            </select>
                            {errors.member_id && <p className="text-red-500 text-sm mt-1">{errors.member_id}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-white">Role</label>
                            <select
                                value={data.role}
                                onChange={(e) => setData('role', e.target.value)}
                                className="w-full rounded-lg border-gray-300 dark:bg-gray-700 dark:text-white"
                            >
                                <option value="admin">Administrateur</option>
                                <option value="chef_projet">Chef de projet</option>
                                <option value="collaborateur">Collaborateur</option>
                            </select>
                            {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
                        >
                            Ajouter
                        </button>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
